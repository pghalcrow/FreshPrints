// Public endpoint: POST /collect
// Receives page view ("v"), time-on-page ("e") and action ("x") events from the website.
// The body is JSON sent as text/plain via navigator.sendBeacon (no CORS preflight).
// No cookies are used and no IP address is stored. Requests arrive through CloudFront,
// which adds the visitor's approximate location as headers; only those names are kept.

import { DynamoDBClient, ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { isBot, parseUserAgent } from './lib/ua.mjs';
import { dayOf, eventPartitionKey, partitionKey } from './lib/days.mjs';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME;
const RETENTION_DAYS = Number(process.env.RETENTION_DAYS || 396);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);

const MAX_ENGAGED_MS = 30 * 60 * 1000; // ignore tabs left open for hours
const MAX_CLOCK_SKEW_MS = 36 * 60 * 60 * 1000;
const ID_PATTERN = /^[a-z0-9]{8,32}$/i;
const ACTIONS = ['phone_click', 'file_upload'];

const done = { statusCode: 204 };

export async function handler(event) {
  try {
    const headers = event.headers || {};
    const origin = headers.origin || '';
    if (origin && !ALLOWED_ORIGINS.includes(origin)) return done;

    const ua = headers['user-agent'] || '';
    if (isBot(ua)) return done;

    const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || '';
    if (raw.length > 4096) return done;
    const body = JSON.parse(raw || '{}');

    const id = String(body.id || '');
    const ts = Number(body.ts);
    if (!ID_PATTERN.test(id) || !Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_CLOCK_SKEW_MS) return done;

    const key = { pk: partitionKey(dayOf(ts)), sk: id };

    if (body.t === 'v') {
      await recordView(key, ts, body, ua, headers);
    } else if (body.t === 'e') {
      await recordEngagement(key, body);
    } else if (body.t === 'x') {
      await recordAction({ pk: eventPartitionKey(dayOf(ts)), sk: id }, ts, body);
    }
  } catch (err) {
    if (!(err instanceof ConditionalCheckFailedException) && !(err instanceof SyntaxError)) {
      console.error('collect error', err);
    }
  }
  return done;
}

async function recordView(key, ts, body, ua, headers) {
  const path = cleanPath(body.p);
  const visitId = String(body.vid || '');
  if (!path || !ID_PATTERN.test(visitId)) return;

  const { browser, os, device } = parseUserAgent(ua, {
    touch: body.tch === true,
    screenWidth: Number(body.w) || 0,
  });

  await db.send(new PutCommand({
    TableName: TABLE,
    Item: {
      ...key,
      ts,
      path,
      title: cleanText(body.ti, 150),
      ref: referrerDomain(body.r),
      vid: visitId,
      nv: body.nv === true, // first page of the visit
      browser,
      os,
      device,
      ...locationOf(headers),
      d: 0,
      expiresAt: Math.floor(ts / 1000) + RETENTION_DAYS * 86_400,
    },
    ConditionExpression: 'attribute_not_exists(pk)',
  }));
}

async function recordAction(key, ts, body) {
  const name = String(body.n || '');
  const path = cleanPath(body.p);
  if (!ACTIONS.includes(name) || !path) return;

  await db.send(new PutCommand({
    TableName: TABLE,
    Item: {
      ...key,
      ts,
      name,
      path,
      vid: ID_PATTERN.test(String(body.vid || '')) ? String(body.vid) : '',
      expiresAt: Math.floor(ts / 1000) + RETENTION_DAYS * 86_400,
    },
    ConditionExpression: 'attribute_not_exists(pk)',
  }));
}

async function recordEngagement(key, body) {
  const engagedMs = Math.min(Math.max(Math.round(Number(body.d) || 0), 0), MAX_ENGAGED_MS);
  if (!engagedMs) return;

  // Engagement is reported cumulatively; keep the largest value seen.
  await db.send(new UpdateCommand({
    TableName: TABLE,
    Key: key,
    UpdateExpression: 'SET d = :d',
    ConditionExpression: 'attribute_exists(pk) AND d < :d',
    ExpressionAttributeValues: { ':d': engagedMs },
  }));
}

// Approximate location from CloudFront's IP lookup. Missing when the request
// didn't come through CloudFront or the IP couldn't be placed.
function locationOf(headers) {
  const header = (name) => {
    const raw = headers[`cloudfront-viewer-${name}`];
    if (!raw) return '';
    try {
      return cleanText(decodeURIComponent(raw), 80);
    } catch {
      return cleanText(raw, 80);
    }
  };
  const location = {
    country: header('country').toUpperCase().slice(0, 2),
    region: header('country-region-name'),
    regionCode: header('country-region').toUpperCase().slice(0, 3),
    city: header('city'),
    metro: header('metro-code').replace(/\D/g, '').slice(0, 4),
  };
  return Object.fromEntries(Object.entries(location).filter(([, v]) => v));
}

function cleanPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/')) return '';
  const path = value.split(/[?#]/)[0].slice(0, 200);
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

function cleanText(value, max) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

// Store only the referring site's domain, and only for other sites.
function referrerDomain(value) {
  if (typeof value !== 'string' || !value) return '';
  try {
    const host = new URL(value).hostname.replace(/^www\./, '').toLowerCase();
    return host === 'realfreshprints.com' ? '' : host.slice(0, 100);
  } catch {
    return '';
  }
}
