import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";
import { checkTypingPassageAccess, evaluateTypingAttempt } from "@vedicneev/engine";

import { getAuthenticatedUserId } from "@/lib/supabase/server";

/** Same-day / yesterday / older-or-never streak update, applied in place on the candidate's profile row after any attempt (catalog or custom) is graded. */
function nextStreak(
  current: { currentStreak: number; longestStreak: number; lastAttemptDate: Date | null },
  now: Date
): { currentStreak: number; longestStreak: number; lastAttemptDate: Date } {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (current.lastAttemptDate) {
    const last = new Date(current.lastAttemptDate);
    last.setHours(0, 0, 0, 0);
    const dayDiff = Math.round((today.getTime() - last.getTime()) / 86_400_000);
    if (dayDiff === 0) return { ...current, lastAttemptDate: today };
    if (dayDiff === 1) {
      const currentStreak = current.currentStreak + 1;
      return { currentStreak, longestStreak: Math.max(current.longestStreak, currentStreak), lastAttemptDate: today };
    }
  }

  return { currentStreak: 1, longestStreak: Math.max(current.longestStreak, 1), lastAttemptDate: today };
}

/**
 * Submits a completed typing attempt — either a catalog passage
 * (passageId) or a Custom Text Practice passage (customPassageText); the
 * request supplies exactly one. Grading (Gross/Net speed, Full/Half
 * mistakes) always happens here, server-side, from the stored/submitted
 * target text vs the submitted typedText — the client (TypingArena) never
 * computes or sends a score, only the raw transcript + timing, so a
 * tampered client can't inflate a result.
 */
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.typedText !== "string" || typeof body.timeTakenSeconds !== "number") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const backspaceCount = typeof body.backspaceCount === "number" ? body.backspaceCount : 0;

  let targetText: string;
  let passage: { id: string; examId: string } | null = null;

  if (typeof body.passageId === "string") {
    const found = await prisma.typingPassage.findUnique({ where: { id: body.passageId } });
    if (!found || !found.isActive) {
      return NextResponse.json({ error: "Passage not found." }, { status: 404 });
    }
    targetText = found.content;
    passage = { id: found.id, examId: found.examId };
  } else if (typeof body.customPassageText === "string" && body.customPassageText.trim().length > 0) {
    targetText = body.customPassageText;
  } else {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [subscription, freePassagesUsedToday] = await Promise.all([
    prisma.typingSubscription.findUnique({ where: { userId } }),
    // Custom Text Practice counts toward the same daily free-tier limit as
    // catalog passages — otherwise it would be an unlimited-practice
    // loophole around the paywall.
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

  const result = evaluateTypingAttempt(targetText, body.typedText, body.timeTakenSeconds);

  const now = new Date();
  const attempt = await prisma.typingAttempt.create({
    data: {
      userId,
      examId: passage?.examId,
      passageId: passage?.id,
      customPassageText: passage ? undefined : targetText,
      typedText: body.typedText,
      grossSpeedWpm: result.grossSpeedWpm,
      netSpeedWpm: result.netSpeedWpm,
      accuracyPercent: result.accuracyPercent,
      fullMistakes: result.fullMistakes,
      halfMistakes: result.halfMistakes,
      keyDepressions: result.keyDepressions,
      backspaceCount,
      timeTakenSeconds: body.timeTakenSeconds,
      completedAt: now,
    },
  });

  const existingProfile = await prisma.typingCandidateProfile.findUnique({ where: { userId } });
  const streak = nextStreak(
    existingProfile ?? { currentStreak: 0, longestStreak: 0, lastAttemptDate: null },
    now
  );
  await prisma.typingCandidateProfile.upsert({
    where: { userId },
    create: { userId, ...streak },
    update: streak,
  });

  return NextResponse.json({ attemptId: attempt.id, result });
}
