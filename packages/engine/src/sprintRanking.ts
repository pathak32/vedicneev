/**
 * Pure ranking/badge logic for National Sprints. No I/O — the caller (the
 * leaderboard route) supplies every submission's score/time and gets back
 * ranks and badges computed fresh each call, so a mid-window leaderboard
 * (more submissions arriving by the minute) never serves a stale rank.
 */

export type SprintBadge = "GOLD" | "SILVER" | "BRONZE" | null;

/** Top-percentile cutoffs for each badge, inclusive — e.g. GOLD: top 1% by rank. */
export const SPRINT_BADGE_THRESHOLDS: Record<Exclude<SprintBadge, null>, number> = {
  GOLD: 1,
  SILVER: 5,
  BRONZE: 15,
};

export interface SprintSubmissionInput {
  id: string;
  totalScore: number;
  timeTakenSeconds: number;
}

export interface RankedSprintSubmission {
  id: string;
  /** 1-based — lower is better. */
  rank: number;
  badge: SprintBadge;
}

/** Higher score wins; a tie is broken by whoever finished faster. */
function compareSubmissions(a: SprintSubmissionInput, b: SprintSubmissionInput): number {
  if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
  return a.timeTakenSeconds - b.timeTakenSeconds;
}

export function computeSprintBadge(rank: number, totalParticipants: number): SprintBadge {
  if (totalParticipants <= 0) return null;
  const percentile = (rank / totalParticipants) * 100;
  if (percentile <= SPRINT_BADGE_THRESHOLDS.GOLD) return "GOLD";
  if (percentile <= SPRINT_BADGE_THRESHOLDS.SILVER) return "SILVER";
  if (percentile <= SPRINT_BADGE_THRESHOLDS.BRONZE) return "BRONZE";
  return null;
}

/** Ranks a full set of submissions (typically already scoped to one sprint, or one sprint + one state) and assigns each a badge based on its rank among this exact list. */
export function rankSprintSubmissions(submissions: SprintSubmissionInput[]): RankedSprintSubmission[] {
  const sorted = [...submissions].sort(compareSubmissions);
  const total = sorted.length;
  return sorted.map((s, i) => {
    const rank = i + 1;
    return { id: s.id, rank, badge: computeSprintBadge(rank, total) };
  });
}
