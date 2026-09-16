/**
 * Deterministic "Today's Passage" selection for an exam's practice pool —
 * pure, no I/O, so the same exam yields the same passage for every
 * candidate on a given calendar day (UTC). Replaces a plain random pick:
 * besides giving the catalog something to badge as "Today's Passage," it
 * also makes an exam's leaderboard fairer, since attempts compared against
 * each other were typed against the same source text that day rather than
 * whichever one a random draw happened to give each candidate.
 */

function dayOfYearUtc(date: Date): number {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
  const startOfDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((startOfDay - startOfYear) / 86_400_000);
}

/** Picks one passage deterministically for `date` (defaults to now) — same exam + same day always yields the same passage, cycling through the pool as days pass. */
export function pickDailyPassage<T>(passages: T[], date: Date = new Date()): T | null {
  if (passages.length === 0) return null;
  const index = dayOfYearUtc(date) % passages.length;
  return passages[index]!;
}
