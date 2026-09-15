import { notFound, redirect } from "next/navigation";
import { prisma } from "@vedicneev/db";
import { checkTypingPassageAccess } from "@vedicneev/engine";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import { getAuthenticatedUserId } from "@/lib/supabase/server";
import { TypingArena } from "@/components/typing/TypingArena";

export const dynamic = "force-dynamic";

export default async function TypingTestPage({ params }: { params: { slug: string } }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect(`/login?next=${encodeURIComponent(`/exams/${params.slug}/test`)}`);

  const exam = await prisma.typingExam.findUnique({ where: { slug: params.slug } });
  if (!exam || !exam.isActive) notFound();

  const passages = await prisma.typingPassage.findMany({ where: { examId: exam.id, isActive: true } });
  if (passages.length === 0) notFound();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [subscription, freePassagesUsedToday] = await Promise.all([
    prisma.typingSubscription.findUnique({ where: { userId } }),
    prisma.typingAttempt.count({ where: { userId, completedAt: { gte: todayStart } } }),
  ]);

  const access = checkTypingPassageAccess(
    subscription
      ? {
          plan: subscription.plan,
          status: subscription.status,
          validUntil: subscription.validUntil ? subscription.validUntil.getTime() : null,
        }
      : null,
    freePassagesUsedToday
  );

  if (!access.allowed) {
    return (
      <div className="container flex max-w-lg flex-col gap-4 py-16 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Daily free limit reached</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              You&apos;ve used today&apos;s free passages. Upgrade to Pro for unlimited daily attempts, or come back
              tomorrow.
            </p>
            <Button asChild>
              <a href="/dashboard">Back to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passage = passages[Math.floor(Math.random() * passages.length)]!;

  return (
    <TypingArena
      examSlug={exam.slug}
      attemptEndpoint="/api/attempts"
      passageId={passage.id}
      passageText={passage.content}
      durationSeconds={exam.durationSeconds}
      backspacePolicy={exam.backspacePolicy}
      layout={exam.layout}
    />
  );
}
