import { notFound, redirect } from "next/navigation";
import { prisma } from "@vedicneev/db";
import { rankTypingAttempts } from "@vedicneev/engine";
import { Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import { getAuthenticatedUserId } from "@/lib/supabase/server";
import { localize } from "@/lib/localize";

export const dynamic = "force-dynamic";

/** Masks a raw 10-digit phone down to a leaderboard-safe display name when the candidate hasn't set one. */
function displayName(name: string | null, phone: string): string {
  if (name) return name;
  return `Candidate ${phone.slice(-4)}`;
}

export default async function LeaderboardPage({ params }: { params: { slug: string } }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect(`/login?next=${encodeURIComponent(`/leaderboard/${params.slug}`)}`);

  const exam = await prisma.typingExam.findUnique({ where: { slug: params.slug } });
  if (!exam) notFound();

  const attempts = await prisma.typingAttempt.findMany({
    where: { examId: exam.id },
    include: { user: { select: { name: true, phone: true } } },
    orderBy: [{ netSpeedWpm: "desc" }, { accuracyPercent: "desc" }],
    take: 20,
  });

  const ranked = rankTypingAttempts(attempts.map((a) => ({ id: a.id, netSpeedWpm: a.netSpeedWpm, accuracyPercent: a.accuracyPercent })));
  const rankById = new Map(ranked.map((r) => [r.id, r.rank]));

  return (
    <div className="container flex max-w-2xl flex-col gap-6 py-10">
      <div>
        <p className="text-sm text-muted-foreground">{exam.organization}</p>
        <h1 className="text-2xl font-bold text-foreground">{localize(exam.name)} — Leaderboard</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Candidates</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border p-0">
          {attempts.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No attempts recorded for this exam yet.</p>
          ) : (
            attempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                    {rankById.get(attempt.id)}
                  </span>
                  <span className="font-medium text-foreground">{displayName(attempt.user.name, attempt.user.phone)}</span>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <div className="font-semibold text-foreground">{Math.round(attempt.netSpeedWpm)} wpm</div>
                    <div className="text-xs text-muted-foreground">Net Speed</div>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{Math.round(attempt.accuracyPercent)}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
