import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";
import { rankSprintSubmissions } from "@vedicneev/engine";

// Ranks/badges are computed live from whatever SprintSubmission rows exist
// right now — never persisted — so a mid-window leaderboard can't go stale
// as more students submit. Passing ?state=<name> re-ranks within that
// state's own subset (a genuine state-wise rank, not just a filtered view
// of the all-India one); omitting it ranks all-India.
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { sprintId: string } }) {
  const { searchParams } = new URL(request.url);
  const stateFilter = searchParams.get("state")?.trim() || undefined;

  const registrations = await prisma.sprintRegistration.findMany({
    where: {
      sprintId: params.sprintId,
      ...(stateFilter ? { state: stateFilter } : {}),
      submission: { isNot: null },
    },
    include: { submission: true },
  });

  const withSubmission = registrations.filter(
    (r): r is typeof r & { submission: NonNullable<typeof r.submission> } => r.submission !== null
  );

  const ranked = rankSprintSubmissions(
    withSubmission.map((r) => ({
      id: r.submission.id,
      totalScore: r.submission.totalScore,
      timeTakenSeconds: r.submission.timeTakenSeconds,
    }))
  );
  const rankBySubmissionId = new Map(ranked.map((r) => [r.id, r]));

  const rows = withSubmission
    .map((r) => {
      const rank = rankBySubmissionId.get(r.submission.id)!;
      return {
        registrationId: r.id,
        participantName: r.participantName,
        state: r.state,
        totalScore: r.submission.totalScore,
        maxScore: r.submission.maxScore,
        timeTakenSeconds: r.submission.timeTakenSeconds,
        rank: rank.rank,
        badge: rank.badge,
      };
    })
    .sort((a, b) => a.rank - b.rank);

  return NextResponse.json({ rows, totalParticipants: rows.length, stateFilter: stateFilter ?? null });
}
