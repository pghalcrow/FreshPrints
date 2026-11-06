// Page views are bucketed by calendar day in the business's time zone.

const TIME_ZONE = process.env.SITE_TIME_ZONE || 'America/Los_Angeles';

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Epoch milliseconds -> "YYYY-MM-DD" in the site's time zone.
export function dayOf(epochMs) {
  return formatter.format(new Date(epochMs));
}

export function partitionKey(day) {
  return `D#${day}`;
}

// Actions (phone clicks, file uploads) live in their own partition per day.
export function eventPartitionKey(day) {
  return `E#${day}`;
}

export function isDay(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

// Inclusive list of "YYYY-MM-DD" strings from `from` to `to`.
export function daysBetween(from, to) {
  const days = [];
  const end = Date.parse(`${to}T00:00:00Z`);
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= end; t += 86_400_000) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
}
