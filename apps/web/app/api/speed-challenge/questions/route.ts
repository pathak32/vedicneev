import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

export const dynamic = "force-dynamic";

const QUESTIONS_PER_RUN = 8;

/** Fisher-Yates — used instead of `.sort(() => Math.random() - 0.5)`, which biases toward certain orderings. */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/**
 * Public, unauthenticated — the homepage's SpeedChallengeWidget fetches
 * this on "Start Speed Challenge Now". Questions are entirely DB-driven
 * (managed at /admin/speed-challenge); this route never hardcodes content.
 */
export async function GET() {
  const questions = await prisma.speedChallengeQuestion.findMany({
    where: { isActive: true },
    select: { id: true, question: true, options: true, correct: true, topic: true },
  });

  if (questions.length === 0) {
    return NextResponse.json({ success: false, error: "No active Speed Challenge questions." }, { status: 404 });
  }

  const selected = shuffle(questions).slice(0, QUESTIONS_PER_RUN);
  return NextResponse.json({ success: true, questions: selected });
}
