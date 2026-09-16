import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedUserId } from "@/lib/supabase/server";

/** Returns the signed-in candidate's declared target exam, or null if they haven't picked one yet. */
export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const profile = await prisma.typingCandidateProfile.findUnique({
    where: { userId },
    include: { targetExam: true },
  });

  return NextResponse.json({ targetExam: profile?.targetExam ?? null });
}

/**
 * Sets (or clears, with targetExamId: null) the candidate's active target
 * exam. Upserts rather than requiring a prior row, matching
 * TypingSubscription's "no row yet" convention elsewhere in this app.
 */
export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || (body.targetExamId !== null && typeof body.targetExamId !== "string")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.targetExamId !== null) {
    const exam = await prisma.typingExam.findUnique({ where: { id: body.targetExamId } });
    if (!exam || !exam.isActive) {
      return NextResponse.json({ error: "That exam isn't available." }, { status: 404 });
    }
  }

  const profile = await prisma.typingCandidateProfile.upsert({
    where: { userId },
    create: { userId, targetExamId: body.targetExamId },
    update: { targetExamId: body.targetExamId },
    include: { targetExam: true },
  });

  return NextResponse.json({ targetExam: profile.targetExam });
}
