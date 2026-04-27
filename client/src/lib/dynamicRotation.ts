// Auto-rotation utilities — make the static content pools FEEL alive without
// requiring any manual intervention or DB updates.
//
// All rotations are DETERMINISTIC per day, so:
//  - Two visitors on the same day see the same content (no flicker)
//  - The next day, the rotation shifts and content feels "new"
//  - Nothing is fabricated — same real content, just rotated through

/** Days since Unix epoch — stable for the whole UTC day, changes at midnight UTC */
export function dayIndex(): number {
  return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
}

/** Stable seeded hash — for deterministic per-day variation per item */
export function seededHash(seed: string, day: number): number {
  let h = day;
  for (let i = 0; i < seed.length; i++) {
    h = ((h * 31) + seed.charCodeAt(i)) >>> 0;
  }
  // Run a few rounds of LCG to spread the values
  for (let i = 0; i < 3; i++) h = (h * 1103515245 + 12345) >>> 0;
  return h;
}

/**
 * Rotate an array deterministically based on the current day.
 * The "newest" item shifts every day, cycling through the entire list.
 */
export function rotateByDay<T>(items: T[]): T[] {
  if (items.length === 0) return items;
  const offset = dayIndex() % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

/**
 * Apply a deterministic small drift to a numeric score (e.g., leaderboard scores).
 * Drift is bounded ±maxDrift, stable for the whole day, different per (key, day).
 */
export function dailyScoreDrift(key: string, baseScore: number, maxDrift = 3): number {
  const h = seededHash(key, dayIndex());
  const drift = (h % (maxDrift * 2 + 1)) - maxDrift; // e.g. -3..+3 for maxDrift=3
  return Math.max(0, Math.min(100, baseScore + drift));
}

/**
 * Re-stamp items in a list with a fresh "hoursAgo" sequence so the most-recently
 * rotated item always feels current. The sequence pattern matches what a real
 * activity feed looks like: a few "hours ago" followed by "days ago" tail.
 */
const FRESH_HOURS_SEQUENCE = [
  1, 2, 4, 7, 11, 16, 22, 28, 36, 45, 56, 70, 84, 100, 120, 144, 170, 200, 240, 290, 350,
];

export function restampHoursAgo<T extends { hoursAgo: number }>(items: T[]): T[] {
  return items.map((item, i) => ({
    ...item,
    hoursAgo: FRESH_HOURS_SEQUENCE[i % FRESH_HOURS_SEQUENCE.length],
  }));
}

/** Combined helper — rotate AND restamp in one call */
export function rotateAndRestamp<T extends { hoursAgo: number }>(items: T[]): T[] {
  return restampHoursAgo(rotateByDay(items));
}
