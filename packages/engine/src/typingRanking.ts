/**
 * Pure ranking for a typing leaderboard — mirrors sprintRanking.ts's
 * shape. The caller supplies every attempt scoped to one exam (and
 * whatever time window it wants) and gets back ranks computed fresh each
 * call, so the leaderboard is never a stale materialized view.
 */

export interface TypingAttemptRankInput {
  id: string;
  netSpeedWpm: number;
  accuracyPercent: number;
}

export interface RankedTypingAttempt {
  id: string;
  /** 1-based — lower is better. */
  rank: number;
}

/** Higher net speed wins; a tie is broken by higher accuracy. */
function compareAttempts(a: TypingAttemptRankInput, b: TypingAttemptRankInput): number {
  if (b.netSpeedWpm !== a.netSpeedWpm) return b.netSpeedWpm - a.netSpeedWpm;
  return b.accuracyPercent - a.accuracyPercent;
}

export function rankTypingAttempts(attempts: TypingAttemptRankInput[]): RankedTypingAttempt[] {
  const sorted = [...attempts].sort(compareAttempts);
  return sorted.map((attempt, index) => ({ id: attempt.id, rank: index + 1 }));
}
