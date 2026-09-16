import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@vedicneev/db";
import { Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import { getAuthenticatedUserId } from "@/lib/supabase/server";
import { localize } from "@/lib/localize";
import { TargetExamBanner } from "@/components/profile/TargetExamBanner";
import { StreakBadge } from "@/components/profile/StreakBadge";
import { WeakKeyHeatmapCard } from "@/components/profile/WeakKeyHeatmapCard";
import { PracticeModeSelector } from "@/components/PracticeModeSelector";
import { T } from "@/components/T";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?next=/dashboard");

  const [attempts, candidateProfile, activeExams] = await Promise.all([
    prisma.typingAttempt.findMany({
      where: { userId },
      include: { exam: true },
      orderBy: { completedAt: "desc" },
      take: 25,
    }),
    prisma.typingCandidateProfile.findUnique({ where: { userId }, include: { targetExam: true } }),
    prisma.typingExam.findMany({
      where: { isActive: true },
      select: { id: true, name: true, organization: true },
      orderBy: { organization: "asc" },
    }),
  ]);

  const bestNetSpeed = attempts.reduce((max, a) => Math.max(max, a.netSpeedWpm), 0);
  const avgAccuracy =
    attempts.length > 0 ? attempts.reduce((sum, a) => sum + a.accuracyPercent, 0) / attempts.length : 0;

  return (
    <div className="container flex flex-col gap-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">
        <T k="dashboardTitle" />
      </h1>

      <TargetExamBanner
        exams={activeExams}
        currentExam={candidateProfile?.targetExam ?? null}
        currentCustomName={candidateProfile?.customTargetExamName ?? null}
      />

      <StreakBadge
        currentStreak={candidateProfile?.currentStreak ?? 0}
        longestStreak={candidateProfile?.longestStreak ?? 0}
      />

      <PracticeModeSelector />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{attempts.length}</div>
            <div className="text-sm text-muted-foreground">
              <T k="dashboardAttempts" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{Math.round(bestNetSpeed)} wpm</div>
            <div className="text-sm text-muted-foreground">
              <T k="dashboardBestSpeed" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{Math.round(avgAccuracy)}%</div>
            <div className="text-sm text-muted-foreground">
              <T k="dashboardAvgAccuracy" />
            </div>
          </CardContent>
        </Card>
      </div>

      <WeakKeyHeatmapCard />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <T k="dashboardRecentAttempts" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border p-0">
          {attempts.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No attempts yet — <Link href="/" className="text-primary underline-offset-2 hover:underline">browse the catalog</Link> to
              take your first test.
            </p>
          ) : (
            attempts.map((attempt) => (
              <Link
                key={attempt.id}
                href={`/results/${attempt.id}`}
                className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-muted/40"
              >
                <div>
                  <div className="font-medium text-foreground">
                    {attempt.exam ? localize(attempt.exam.name) : "Custom Text Practice"}
                  </div>
                  <div className="text-muted-foreground">{attempt.completedAt.toLocaleString()}</div>
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
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
