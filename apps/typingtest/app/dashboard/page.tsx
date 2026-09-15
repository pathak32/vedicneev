import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@vedicneev/db";
import { Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import { getAuthenticatedUserId } from "@/lib/supabase/server";
import { localize } from "@/lib/localize";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?next=/dashboard");

  const attempts = await prisma.typingAttempt.findMany({
    where: { userId },
    include: { exam: true },
    orderBy: { completedAt: "desc" },
    take: 25,
  });

  const bestNetSpeed = attempts.reduce((max, a) => Math.max(max, a.netSpeedWpm), 0);
  const avgAccuracy =
    attempts.length > 0 ? attempts.reduce((sum, a) => sum + a.accuracyPercent, 0) / attempts.length : 0;

  return (
    <div className="container flex flex-col gap-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">Your Typing History</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{attempts.length}</div>
            <div className="text-sm text-muted-foreground">Attempts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{Math.round(bestNetSpeed)} wpm</div>
            <div className="text-sm text-muted-foreground">Best Net Speed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{Math.round(avgAccuracy)}%</div>
            <div className="text-sm text-muted-foreground">Average Accuracy</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Attempts</CardTitle>
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
                  <div className="font-medium text-foreground">{localize(attempt.exam.name)}</div>
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
