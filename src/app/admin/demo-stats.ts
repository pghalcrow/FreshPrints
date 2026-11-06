import { Ranked, Stats } from './admin-api.service';

// Generated sample data for previewing the dashboard on localhost.
// Never sent anywhere and never shown on the live site. Numbers are seeded by
// date, so the same range always shows the same data.

const PAGES: { path: string; title: string; weight: number }[] = [
  { path: '/', title: 'Fresh Prints | Same-Day & Emergency Printing in San Diego', weight: 30 },
  { path: '/upload', title: 'Upload Print Files | Fresh Prints San Diego', weight: 12 },
  { path: '/postcards', title: 'Postcard Printing San Diego | Fresh Prints', weight: 9 },
  { path: '/flyers', title: 'Flyer Printing San Diego | Fresh Prints', weight: 8 },
  { path: '/stickers', title: 'Sticker Printing San Diego | Fresh Prints', weight: 7 },
  { path: '/labels', title: 'Label Printing San Diego | Fresh Prints', weight: 6 },
  { path: '/faq', title: 'Printing FAQ | Fresh Prints San Diego', weight: 5 },
  { path: '/booklets', title: 'Booklet Printing San Diego | Fresh Prints', weight: 5 },
  { path: '/about', title: 'About Fresh Prints | San Diego Printing', weight: 4 },
  { path: '/catalogs', title: 'Catalog Printing San Diego | Fresh Prints', weight: 4 },
  { path: '/packaging', title: 'Packaging Printing San Diego | Fresh Prints', weight: 4 },
  { path: '/sleeves', title: 'Sleeve Printing San Diego | Fresh Prints', weight: 3 },
  { path: '/kearny-postcards', title: 'Kearny Mesa Postcards | Fresh Prints', weight: 3 }
];

const DEVICES = { Desktop: 52, Mobile: 41, Tablet: 7 };
const BROWSERS = { Chrome: 48, Safari: 33, Edge: 9, Firefox: 4, 'Samsung Internet': 3, 'Facebook app': 3 };
const SYSTEMS = { Windows: 38, iOS: 30, macOS: 14, Android: 13, iPadOS: 4, Linux: 1 };
const CITIES = {
  'San Diego, CA': 46,
  'Chula Vista, CA': 7,
  'El Cajon, CA': 5,
  'Escondido, CA': 4,
  'Oceanside, CA': 4,
  'La Mesa, CA': 3,
  'Los Angeles, CA': 6,
  'Irvine, CA': 3,
  'Phoenix, AZ': 2,
  'Tijuana, Mexico': 2
};
const SAN_DIEGO_CITIES = ['San Diego, CA', 'Chula Vista, CA', 'El Cajon, CA', 'Escondido, CA', 'Oceanside, CA', 'La Mesa, CA'];
const REGIONS = { California: 88, Arizona: 3, Mexico: 2, Texas: 2, Nevada: 1, 'New York': 1 };
const REFERRERS = {
  'Direct / unknown': 41,
  'google.com': 37,
  'bing.com': 6,
  'facebook.com': 5,
  'chatgpt.com': 4,
  'yelp.com': 3,
  'instagram.com': 2,
  'duckduckgo.com': 2
};

export function demoStats(from: string, to: string): Stats {
  const days = daysBetween(from, to);

  const daily = days.map((day) => {
    const rand = rng(day);
    const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
    const base = weekday === 0 || weekday === 6 ? 9 : 26;
    const trend = 1 + (Date.parse(day) - Date.parse('2026-01-01')) / (365 * 86_400_000) * 0.3;
    const visits = Math.max(1, Math.round(base * trend * (0.7 + rand() * 0.6)));
    const pageViews = Math.round(visits * (1.6 + rand() * 0.9));
    const phoneClicks = Math.round(visits * (0.03 + rand() * 0.05));
    const fileUploads = Math.round(visits * (0.01 + rand() * 0.04));
    return { day, visits, pageViews, phoneClicks, fileUploads };
  });

  const visits = sum(daily.map((d) => d.visits));
  const pageViews = sum(daily.map((d) => d.pageViews));
  const rand = rng(`${from}:${to}`);

  const totalWeight = sum(PAGES.map((p) => p.weight));
  const pages = PAGES.map((p) => {
    const views = Math.max(1, Math.round((pageViews * p.weight) / totalWeight * (0.85 + rand() * 0.3)));
    return {
      path: p.path,
      title: p.title,
      views,
      visitors: Math.max(1, Math.round(views * (0.7 + rand() * 0.2))),
      entrances: Math.round(views * (p.path === '/' ? 0.55 : 0.25 + rand() * 0.2)),
      avgTimeSec: p.path === '/upload' ? 95 + rand() * 40 : 25 + rand() * 50
    };
  }).sort((a, b) => b.views - a.views);

  const avgTimeOnPageSec = 44 + rand() * 12;
  const pagesPerVisit = visits ? pageViews / visits : 0;

  return {
    from,
    to,
    totals: {
      pageViews,
      visits,
      avgTimeOnPageSec,
      avgVisitDurationSec: avgTimeOnPageSec * pagesPerVisit,
      pagesPerVisit,
      singlePageVisitRate: 0.38 + rand() * 0.1,
      phoneClicks: sum(daily.map((d) => d.phoneClicks)),
      fileUploads: sum(daily.map((d) => d.fileUploads))
    },
    phoneClicksByPage: split(sum(daily.map((d) => d.phoneClicks)), { '/': 44, '/upload': 14, '/postcards': 10, '/flyers': 9, '/about': 8, '/faq': 7, '/stickers': 5 }, rand),
    daily,
    pages,
    devices: split(visits, DEVICES, rand),
    browsers: split(visits, BROWSERS, rand),
    operatingSystems: split(visits, SYSTEMS, rand),
    referrers: split(visits, REFERRERS, rand),
    ...demoLocations(visits, rand),
    recent: recentViews(to, Math.min(50, pageViews), rand)
  };
}

function recentViews(day: string, count: number, rand: () => number) {
  const end = Math.min(Date.now(), Date.parse(`${day}T23:59:00-08:00`));
  const names = (o: Record<string, number>) => Object.keys(o);
  let ts = end;
  return Array.from({ length: count }, () => {
    ts -= Math.round((3 + rand() * 40) * 60_000);
    const device = pick(names(DEVICES), rand);
    const os = device === 'Desktop' ? pick(['Windows', 'Windows', 'macOS'], rand) : device === 'Tablet' ? 'iPadOS' : pick(['iOS', 'Android'], rand);
    const browser = os === 'iOS' || os === 'iPadOS' || os === 'macOS' ? pick(['Safari', 'Safari', 'Chrome'], rand) : pick(['Chrome', 'Chrome', 'Edge'], rand);
    const page = weightedPick(PAGES, rand);
    return { ts, path: page.path, browser, os, device, timeSec: Math.round(5 + rand() * 120), ref: '', location: weightedPick(Object.entries(CITIES).map(([name, weight]) => ({ name, weight })), rand).name };
  });
}

function demoLocations(visits: number, rand: () => number) {
  const located = Math.round(visits * 0.96);
  const cities = split(located, CITIES, rand);
  return {
    locations: {
      locatedVisits: located,
      sanDiegoVisits: sum(cities.filter((c) => SAN_DIEGO_CITIES.includes(c.name)).map((c) => c.count)),
      cities,
      regions: split(located, REGIONS, rand),
      countries: split(located, { 'United States': 97, Mexico: 2, Canada: 1 }, rand)
    }
  };
}

// Split a total across categories by weight, with a little noise; counts sum to the total.
function split(total: number, weights: Record<string, number>, rand: () => number): Ranked[] {
  const entries = Object.entries(weights).map(([name, w]) => [name, w * (0.85 + rand() * 0.3)] as const);
  const weightSum = sum(entries.map(([, w]) => w));
  const rows = entries.map(([name, w]) => ({ name, count: Math.floor((total * w) / weightSum) }));
  rows[0].count += total - sum(rows.map((r) => r.count));
  return rows.filter((r) => r.count > 0).sort((a, b) => b.count - a.count);
}

function weightedPick<T extends { weight: number }>(items: T[], rand: () => number): T {
  let r = rand() * sum(items.map((i) => i.weight));
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[0];
}

function pick<T>(items: T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)];
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function daysBetween(from: string, to: string): string[] {
  const days: string[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += 86_400_000) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
}

// Small seeded random number generator (mulberry32).
function rng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
