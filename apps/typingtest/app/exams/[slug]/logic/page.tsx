import { notFound, redirect } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedUserId } from "@/lib/supabase/server";
import { localize, localizeArray } from "@/lib/localize";
import { LogicQuiz } from "@/components/typing/LogicQuiz";

export const dynamic = "force-dynamic";

const LOGIC_QUIZ_LENGTH = 5;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export default async function LogicQuizPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { attemptId?: string };
}) {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect(`/login?next=${encodeURIComponent(`/exams/${params.slug}/logic?attemptId=${searchParams.attemptId ?? ""}`)}`);

  const attemptId = searchParams.attemptId;
  if (!attemptId) notFound();

  const attempt = await prisma.typingAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== userId) notFound();

  const pool = await prisma.typingLogicQuestion.findMany({ where: { isActive: true } });
  if (pool.length === 0) {
    return (
      <div className="container flex max-w-lg flex-col gap-4 py-16 text-center text-muted-foreground">
        No logic quiz questions are published yet.
      </div>
    );
  }

  const questions = shuffle(pool)
    .slice(0, LOGIC_QUIZ_LENGTH)
    .map((q) => ({
      id: q.id,
      prompt: localize(q.prompt),
      options: localizeArray(q.options),
    }));

  return <LogicQuiz attemptId={attempt.id} questions={questions} />;
}
