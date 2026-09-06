/**
 * Pure day-unlock logic for the 30-Day Daily Live Mock Sprint
 * (LIVE_BOOTCAMP product). No I/O, no knowledge of Prisma or Razorpay —
 * safe to unit test and reuse from any layer, matching entitlements.ts's
 * convention.
 *
 * Day 1 unlocks immediately at `startedAt` (instant gratification on
 * purchase/first-open); day N (N >= 2) unlocks once IST local time passes
 * BOOTCAMP_UNLOCK_HOUR_IST on the (N-1)th calendar day after the start day.
 */

export const BOOTCAMP_TOTAL_DAYS = 30;
export const BOOTCAMP_UNLOCK_HOUR_IST = 6;

const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Epoch ms of IST midnight on the calendar day (IST) that `epochMs` falls on. */
function istMidnight(epochMs: number): number {
  const shifted = epochMs + IST_OFFSET_MS;
  const d = new Date(shifted);
  const utcMidnightOfShifted = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return utcMidnightOfShifted - IST_OFFSET_MS;
}

export interface BootcampProgress {
  /** 1-based index of the highest day unlocked so far, capped at BOOTCAMP_TOTAL_DAYS. */
  unlockedThroughDay: number;
  isComplete: boolean;
}

export function getBootcampProgress(startedAt: number, now: number = Date.now()): BootcampProgress {
  const startMidnight = istMidnight(startedAt);

  let unlockedThroughDay = 1;
  for (let day = 2; day <= BOOTCAMP_TOTAL_DAYS; day++) {
    const unlockAt = startMidnight + (day - 1) * DAY_MS + BOOTCAMP_UNLOCK_HOUR_IST * 60 * 60 * 1000;
    if (now >= unlockAt) unlockedThroughDay = day;
    else break;
  }

  return { unlockedThroughDay, isComplete: unlockedThroughDay >= BOOTCAMP_TOTAL_DAYS };
}
