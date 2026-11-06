// Authenticated admin API (Cognito JWT checked by API Gateway before this runs).
//   GET    /stats?from=YYYY-MM-DD&to=YYYY-MM-DD
//   GET    /users
//   POST   /users                 { email }
//   POST   /users/{id}/{action}   action: disable | enable | reset | resend
//   DELETE /users/{id}

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminResetUserPasswordCommand,
  AdminUserGlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { daysBetween, eventPartitionKey, isDay, partitionKey } from './lib/days.mjs';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const cognito = new CognitoIdentityProviderClient({});
const TABLE = process.env.TABLE_NAME;
const USER_POOL_ID = process.env.USER_POOL_ID;
const MAX_RANGE_DAYS = 400;
const SAN_DIEGO_METRO = '825'; // Nielsen DMA code for the San Diego TV market (county-wide)
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

export async function handler(event) {
  const method = event.requestContext?.http?.method;
  const route = event.routeKey || '';
  const claims = event.requestContext?.authorizer?.jwt?.claims || {};

  try {
    if (route === 'GET /stats') return json(200, await getStats(event.queryStringParameters || {}));
    if (route === 'GET /users') return json(200, { users: await listUsers(), me: claims.username });
    if (route === 'POST /users') return json(201, await createUser(parseBody(event)));
    if (route === 'POST /users/{id}/{action}') {
      return json(200, await userAction(event.pathParameters.id, event.pathParameters.action, claims));
    }
    if (route === 'DELETE /users/{id}') return json(200, await deleteUser(event.pathParameters.id, claims));
    return json(404, { message: `No route for ${method} ${event.rawPath}` });
  } catch (err) {
    if (err.statusCode) return json(err.statusCode, { message: err.message });
    const known = COGNITO_ERRORS[err.name];
    if (known) return json(known[0], { message: known[1] });
    console.error('api error', err);
    return json(500, { message: 'Something went wrong. Please try again.' });
  }
}

const COGNITO_ERRORS = {
  UsernameExistsException: [409, 'An account with that email already exists.'],
  UserNotFoundException: [404, 'That user no longer exists.'],
  InvalidParameterException: [400, 'That request was not valid. Check the email address and try again.'],
  NotAuthorizedException: [400, 'That action is not allowed for this user.'],
  LimitExceededException: [429, 'Too many requests. Please wait a few minutes and try again.'],
  TooManyRequestsException: [429, 'Too many requests. Please wait a few minutes and try again.'],
};

// ---------------- Stats ----------------

async function getStats({ from, to }) {
  if (!isDay(from) || !isDay(to) || from > to) throw httpError(400, 'from and to must be dates (YYYY-MM-DD), from <= to.');
  const days = daysBetween(from, to);
  if (days.length > MAX_RANGE_DAYS) throw httpError(400, `Choose a range of ${MAX_RANGE_DAYS} days or less.`);

  const perDay = await mapLimit(days, 10, async (day) => {
    const [items, actions] = await Promise.all([queryDay(day), queryActions(day)]);
    return { day, items, actions };
  });
  const views = perDay.flatMap((d) => d.items);
  const actions = perDay.flatMap((d) => d.actions);
  const phoneClicks = actions.filter((a) => a.name === 'phone_click');
  const fileUploads = actions.filter((a) => a.name === 'file_upload');
  const phoneClickPages = new Map();
  for (const a of phoneClicks) increment(phoneClickPages, a.path);

  const visits = new Map(); // vid -> { views, engagedMs, first }
  const pages = new Map();
  const browsers = new Map();
  const systems = new Map();
  const devices = new Map();
  const referrers = new Map();
  const cities = new Map();
  const regions = new Map();
  const countries = new Map();
  let locatedVisits = 0;
  let sanDiegoVisits = 0;

  for (const v of views) {
    let visit = visits.get(v.vid);
    if (!visit) {
      visit = { views: 0, engagedMs: 0, first: v };
      visits.set(v.vid, visit);
    }
    visit.views += 1;
    visit.engagedMs += v.d || 0;
    if (v.ts < visit.first.ts) visit.first = v;

    let page = pages.get(v.path);
    if (!page) {
      page = { path: v.path, title: v.title || '', views: 0, visitors: new Set(), engagedMs: 0, timed: 0, entrances: 0 };
      pages.set(v.path, page);
    }
    page.views += 1;
    page.visitors.add(v.vid);
    if (v.d > 0) {
      page.engagedMs += v.d;
      page.timed += 1;
    }
    if (v.title) page.title = v.title;
  }

  // Technology and traffic sources are counted once per visit.
  for (const visit of visits.values()) {
    const v = visit.first;
    increment(browsers, v.browser);
    increment(systems, v.os);
    increment(devices, v.device);
    increment(referrers, v.ref || 'Direct / unknown');
    if (v.country) {
      locatedVisits += 1;
      if (v.metro === SAN_DIEGO_METRO) sanDiegoVisits += 1;
      increment(countries, countryName(v.country));
      increment(regions, v.country === 'US' ? v.region || v.regionCode || 'Unknown' : countryName(v.country));
      increment(cities, cityLabel(v));
    }
    const landing = pages.get(v.path);
    if (landing) landing.entrances += 1;
  }

  const timedViews = views.filter((v) => v.d > 0);
  const singlePageVisits = [...visits.values()].filter((v) => v.views === 1).length;

  return {
    from,
    to,
    totals: {
      pageViews: views.length,
      visits: visits.size,
      avgTimeOnPageSec: average(timedViews.map((v) => v.d)) / 1000,
      avgVisitDurationSec: average([...visits.values()].map((v) => v.engagedMs)) / 1000,
      pagesPerVisit: visits.size ? views.length / visits.size : 0,
      singlePageVisitRate: visits.size ? singlePageVisits / visits.size : 0,
      phoneClicks: phoneClicks.length,
      fileUploads: fileUploads.length,
    },
    phoneClicksByPage: ranked(phoneClickPages),
    daily: perDay.map(({ day, items, actions: dayActions }) => ({
      day,
      pageViews: items.length,
      visits: new Set(items.map((v) => v.vid)).size,
      phoneClicks: dayActions.filter((a) => a.name === 'phone_click').length,
      fileUploads: dayActions.filter((a) => a.name === 'file_upload').length,
    })),
    pages: [...pages.values()]
      .map((p) => ({
        path: p.path,
        title: p.title,
        views: p.views,
        visitors: p.visitors.size,
        entrances: p.entrances,
        avgTimeSec: p.timed ? p.engagedMs / p.timed / 1000 : 0,
      }))
      .sort((a, b) => b.views - a.views),
    browsers: ranked(browsers),
    operatingSystems: ranked(systems),
    devices: ranked(devices),
    referrers: ranked(referrers),
    locations: {
      locatedVisits,
      sanDiegoVisits,
      cities: ranked(cities),
      regions: ranked(regions),
      countries: ranked(countries),
    },
    recent: views
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 50)
      .map((v) => ({
        ts: v.ts,
        path: v.path,
        browser: v.browser,
        os: v.os,
        device: v.device,
        timeSec: (v.d || 0) / 1000,
        ref: v.ref || '',
        location: v.country ? cityLabel(v) : '',
      })),
  };
}

async function queryDay(day) {
  const items = [];
  let ExclusiveStartKey;
  do {
    const page = await db.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': partitionKey(day) },
      ProjectionExpression: 'ts, #p, title, #r, vid, browser, os, device, d, #co, #rg, #rc, #ci, #me',
      ExpressionAttributeNames: {
        '#p': 'path',
        '#r': 'ref',
        '#co': 'country',
        '#rg': 'region',
        '#rc': 'regionCode',
        '#ci': 'city',
        '#me': 'metro',
      },
      ExclusiveStartKey,
    }));
    items.push(...page.Items);
    ExclusiveStartKey = page.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

function countryName(code) {
  try {
    return countryNames.of(code) || code;
  } catch {
    return code;
  }
}

// "San Diego, CA" in the US, "Toronto, Canada" elsewhere.
function cityLabel(v) {
  const place = v.country === 'US' ? v.regionCode || v.region : countryName(v.country);
  if (!v.city) return v.country === 'US' ? `${v.region || v.regionCode || 'Unknown'} (city unknown)` : place;
  return place ? `${v.city}, ${place}` : v.city;
}

async function queryActions(day) {
  const items = [];
  let ExclusiveStartKey;
  do {
    const page = await db.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': eventPartitionKey(day) },
      ProjectionExpression: 'ts, #n, #p',
      ExpressionAttributeNames: { '#n': 'name', '#p': 'path' },
      ExclusiveStartKey,
    }));
    items.push(...page.Items);
    ExclusiveStartKey = page.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

function increment(map, key) {
  map.set(key || 'Other', (map.get(key || 'Other') || 0) + 1);
}

function ranked(map) {
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

function average(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

// ---------------- Users ----------------

async function listUsers() {
  const users = [];
  let PaginationToken;
  do {
    const page = await cognito.send(new ListUsersCommand({ UserPoolId: USER_POOL_ID, Limit: 60, PaginationToken }));
    users.push(...page.Users);
    PaginationToken = page.PaginationToken;
  } while (PaginationToken);

  return users
    .map((u) => ({
      id: u.Username,
      email: u.Attributes?.find((a) => a.Name === 'email')?.Value || '',
      status: u.UserStatus,
      enabled: u.Enabled,
      created: u.UserCreateDate,
    }))
    .sort((a, b) => a.email.localeCompare(b.email));
}

async function createUser({ email }) {
  email = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw httpError(400, 'Enter a valid email address.');

  await cognito.send(new AdminCreateUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
    ],
    DesiredDeliveryMediums: ['EMAIL'],
  }));
  return { message: `Invitation sent to ${email}.` };
}

async function userAction(id, action, claims) {
  const params = { UserPoolId: USER_POOL_ID, Username: id };

  switch (action) {
    case 'disable':
      assertNotSelf(id, claims, 'disable');
      await cognito.send(new AdminDisableUserCommand(params));
      await cognito.send(new AdminUserGlobalSignOutCommand(params));
      return { message: 'User disabled and signed out.' };
    case 'enable':
      await cognito.send(new AdminEnableUserCommand(params));
      return { message: 'User enabled.' };
    case 'reset':
      await cognito.send(new AdminResetUserPasswordCommand(params));
      return { message: 'Password reset email sent. They will set a new password with the emailed code.' };
    case 'resend':
      await cognito.send(new AdminCreateUserCommand({ ...params, MessageAction: 'RESEND', DesiredDeliveryMediums: ['EMAIL'] }));
      return { message: 'Invitation re-sent.' };
    default:
      throw httpError(400, 'Unknown action.');
  }
}

async function deleteUser(id, claims) {
  assertNotSelf(id, claims, 'delete');
  await cognito.send(new AdminDeleteUserCommand({ UserPoolId: USER_POOL_ID, Username: id }));
  return { message: 'User deleted.' };
}

function assertNotSelf(id, claims, verb) {
  if (id === claims.username || id === claims.sub) throw httpError(400, `You can't ${verb} your own account.`);
}

// ---------------- Helpers ----------------

function parseBody(event) {
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body;
    return JSON.parse(raw || '{}');
  } catch {
    throw httpError(400, 'Invalid JSON body.');
  }
}

function httpError(statusCode, message) {
  return Object.assign(new Error(message), { statusCode });
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    body: JSON.stringify(body),
  };
}
