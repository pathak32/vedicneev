import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedUserId } from "@/lib/supabase/server";

interface AnswerInput {
  questionId: string;
  selectedIndex: number;
  responseMs: number;
}

/**
 * Grades and saves the "Typing Speed & Logic" quiz for one attempt.
 * correctIndex is never sent to the client (see LogicQuiz.tsx) — this
 * route is the only place it's read, joined against the candidate's
 * submitted {questionId, selectedIndex} pairs.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const attempt = await prisma.typingAttempt.findUnique({ where: { id: params.id } });
  if (!attempt || attempt.userId !== userId) {
    return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const answers = body.answers as AnswerInput[];

  const questions = await prisma.typingLogicQuestion.findMany({
    where: { id: { in: answers.map((a) => a.questionId) } },
  });
  const questionById = new Map(questions.map((q) => [q.id, q]));

  let correctCount = 0;
  let totalResponseMs = 0;
  for (const answer of answers) {
    const question = questionById.get(answer.questionId);
    if (question && question.correctIndex === answer.selectedIndex) correctCount++;
    totalResponseMs += answer.responseMs;
  }
  const avgResponseMs = answers.length > 0 ? totalResponseMs / answers.length : 0;
  const logicScore = answers.length > 0 ? (correctCount / answers.length) * 100 : 0;

  const logicAttempt = await prisma.typingLogicAttempt.upsert({
    where: { typingAttemptId: attempt.id },
    create: {
      typingAttemptId: attempt.id,
      questionsAnswered: answers.length,
      correctCount,
      avgResponseMs,
      logicScore,
    },
    update: { questionsAnswered: answers.length, correctCount, avgResponseMs, logicScore },
  });

  return NextResponse.json({ logicAttempt });
}
