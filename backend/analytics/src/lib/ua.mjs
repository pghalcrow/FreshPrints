// Minimal user-agent parsing: browser, operating system and device type.
// Order matters: many browsers include "Chrome" and "Safari" in their UA string.

const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|scrape|fetch|headless|lighthouse|pagespeed|pingdom|uptime|monitor|python|curl|wget|httpclient|okhttp|axios|node-fetch|go-http|java\/|phantom|puppeteer|playwright|selenium|facebookexternalhit|embedly|quora link|vkshare|whatsapp|telegram|discord|slack/i;

export function isBot(ua) {
  return !ua || BOT_PATTERN.test(ua);
}

const BROWSERS = [
  ['Facebook app', /FBAN|FBAV|FB_IAB/],
  ['Instagram app', /Instagram/],
  ['Edge', /Edg(?:e|A|iOS)?\//],
  ['Opera', /OPR\/|Opera/],
  ['Samsung Internet', /SamsungBrowser\//],
  ['Firefox', /Firefox\/|FxiOS\//],
  ['Chrome', /Chrome\/|CriOS\//],
  ['Safari', /Version\/[\d.]+.*Safari\//],
  ['Safari', /\((?:iPhone|iPad|iPod).*AppleWebKit\//], // other iOS in-app web views
];

const SYSTEMS = [
  ['iOS', /iPhone|iPod/],
  ['iPadOS', /iPad/],
  ['Android', /Android/],
  ['Windows', /Windows/],
  ['ChromeOS', /CrOS/],
  ['macOS', /Mac OS X|Macintosh/],
  ['Linux', /Linux/],
];

export function parseUserAgent(ua = '', { touch = false, screenWidth = 0 } = {}) {
  const browser = (BROWSERS.find(([, re]) => re.test(ua)) || ['Other'])[0];
  let os = (SYSTEMS.find(([, re]) => re.test(ua)) || ['Other'])[0];

  let device = 'Desktop';
  if (/iPad|Tablet|PlayBook|Silk|Kindle/i.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) {
    device = 'Tablet';
  } else if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) {
    device = 'Mobile';
  }

  // iPads report themselves as Macs; the touch screen gives them away.
  if (os === 'macOS' && touch) {
    os = 'iPadOS';
    device = 'Tablet';
  }

  // Fall back to screen width for unusual mobile browsers.
  if (device === 'Desktop' && touch && screenWidth > 0 && screenWidth < 768) {
    device = 'Mobile';
  }

  return { browser, os, device };
}
