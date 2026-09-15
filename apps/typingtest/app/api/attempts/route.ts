import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";
import { checkTypingPassageAccess, evaluateTypingAttempt } from "@vedicneev/engine";

import { getAuthenticatedUserId } from "@/lib/supabase/server";

/**
 * Submits a completed typing attempt. Grading (Gross/Net speed, Full/Half
 * mistakes) always happens here, server-side, from the passage's own
 * stored content vs the submitted typedText — the client (TypingArena)
 * never computes or sends a score, only the raw transcript + timing, so a
 * tampered client can't inflate a result.
 */
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.passageId !== "string" ||
    typeof body.typedText !== "string" ||
    typeof body.timeTakenSeconds !== "number"
  ) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const backspaceCount = typeof body.backspaceCount === "number" ? body.backspaceCount : 0;

  const passage = await prisma.typingPassage.findUnique({ where: { id: body.passageId } });
  if (!passage || !passage.isActive) {
    return NextResponse.json({ error: "Passage not found." }, { status: 404 });
  }

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
    return NextResponse.json(
      { error: "Today's free passage limit is used up — upgrade to Pro for unlimited attempts.", reason: access.reason },
      { status: 403 }
    );
  }

  const result = evaluateTypingAttempt(passage.content, body.typedText, body.timeTakenSeconds);

  const attempt = await prisma.typingAttempt.create({
    data: {
      userId,
      examId: passage.examId,
      passageId: passage.id,
      typedText: body.typedText,
      grossSpeedWpm: result.grossSpeedWpm,
      netSpeedWpm: result.netSpeedWpm,
      accuracyPercent: result.accuracyPercent,
      fullMistakes: result.fullMistakes,
      halfMistakes: result.halfMistakes,
      keyDepressions: result.keyDepressions,
      backspaceCount,
      timeTakenSeconds: body.timeTakenSeconds,
    },
  });

  return NextResponse.json({ attemptId: attempt.id, result });
}
