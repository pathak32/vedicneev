import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@vedicneev/db";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import { getAuthenticatedUserId } from "@/lib/supabase/server";
import { localize } from "@/lib/localize";
import { ResultSummary } from "@/components/typing/ResultSummary";

export const dynamic = "force-dynamic";

export default async function ResultPage({ params }: { params: { attemptId: string } }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect(`/login?next=${encodeURIComponent(`/results/${params.attemptId}`)}`);

  const attempt = await prisma.typingAttempt.findUnique({
    where: { id: params.attemptId },
    include: { exam: true, logicAttempt: true },
  });
  if (!attempt || attempt.userId !== userId) notFound();

  return (
    <div className="container flex max-w-2xl flex-col gap-6 py-10">
      <div>
        <p className="text-sm text-muted-foreground">{attempt.exam.organization}</p>
        <h1 className="text-2xl font-bold text-foreground">{localize(attempt.exam.name)}</h1>
      </div>

      <ResultSummary
        grossSpeedWpm={attempt.grossSpeedWpm}
        netSpeedWpm={attempt.netSpeedWpm}
        accuracyPercent={attempt.accuracyPercent}
        fullMistakes={attempt.fullMistakes}
        halfMistakes={attempt.halfMistakes}
        keyDepressions={attempt.keyDepressions}
        backspaceCount={attempt.backspaceCount}
        timeTakenSeconds={attempt.timeTakenSeconds}
      />

      {attempt.logicAttempt ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Typing Speed &amp; Logic — Quiz Result</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xl font-bold text-foreground">
                {attempt.logicAttempt.correctCount}/{attempt.logicAttempt.questionsAnswered}
              </div>
              <div className="text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{Math.round(attempt.logicAttempt.logicScore)}%</div>
              <div className="text-muted-foreground">Logic Score</div>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{Math.round(attempt.logicAttempt.avgResponseMs)}ms</div>
              <div className="text-muted-foreground">Avg Response</div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button asChild size="lg">
          <Link href={`/exams/${attempt.exam.slug}/logic?attemptId=${attempt.id}`}>
            Try the Typing Speed &amp; Logic Challenge
          </Link>
        </Button>
      )}

      <div className="flex gap-4 text-sm">
        <Link href={`/leaderboard/${attempt.exam.slug}`} className="text-primary underline-offset-2 hover:underline">
          View leaderboard →
        </Link>
        <Link href="/dashboard" className="text-primary underline-offset-2 hover:underline">
          Dashboard →
        </Link>
      </div>
    </div>
  );
}
