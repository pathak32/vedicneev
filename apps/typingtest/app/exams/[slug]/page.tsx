import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import { localize } from "@/lib/localize";

export const dynamic = "force-dynamic";

export default async function ExamDetailPage({ params }: { params: { slug: string } }) {
  const exam = await prisma.typingExam.findUnique({
    where: { slug: params.slug },
    include: { _count: { select: { passages: { where: { isActive: true } } } } },
  });
  if (!exam || !exam.isActive) notFound();

  return (
    <div className="container flex max-w-2xl flex-col gap-6 py-10">
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit">
          {exam.organization}
        </Badge>
        <h1 className="text-3xl font-bold text-foreground">{localize(exam.name)}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Rules</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <div className="font-semibold text-foreground">{Math.round(exam.durationSeconds / 60)} min</div>
            <div className="text-muted-foreground">Duration</div>
          </div>
          <div>
            <div className="font-semibold text-foreground">{exam.language}</div>
            <div className="text-muted-foreground">Language</div>
          </div>
          <div>
            <div className="font-semibold text-foreground">{exam.layout}</div>
            <div className="text-muted-foreground">Keyboard layout</div>
          </div>
          <div>
            <div className="font-semibold text-foreground">
              {exam.backspacePolicy === "DISABLED" ? "Disabled" : "Allowed (penalized)"}
            </div>
            <div className="text-muted-foreground">Backspace</div>
          </div>
          <div>
            <div className="font-semibold text-foreground">{exam.totalKeyDepressionsRequired}</div>
            <div className="text-muted-foreground">Target key depressions</div>
          </div>
          <div>
            <div className="font-semibold text-foreground">{exam.difficulty}</div>
            <div className="text-muted-foreground">Difficulty</div>
          </div>
        </CardContent>
      </Card>

      {exam._count.passages > 0 ? (
        <Button asChild size="lg">
          <Link href={`/exams/${exam.slug}/test`}>Start Test</Link>
        </Button>
      ) : (
        <>
          <Button size="lg" disabled>
            Start Test
          </Button>
          <p className="text-sm text-muted-foreground">No passages published for this exam yet.</p>
        </>
      )}

      <Link href={`/leaderboard/${exam.slug}`} className="text-sm text-primary underline-offset-2 hover:underline">
        View leaderboard →
      </Link>
    </div>
  );
}
