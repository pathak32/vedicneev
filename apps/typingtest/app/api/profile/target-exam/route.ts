import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedUserId } from "@/lib/supabase/server";

const MAX_CUSTOM_NAME_LENGTH = 100;

/** Returns the signed-in candidate's declared target exam (catalog or free-text), or null if they haven't picked one yet. */
export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const profile = await prisma.typingCandidateProfile.findUnique({
    where: { userId },
    include: { targetExam: true },
  });

  return NextResponse.json({
    targetExam: profile?.targetExam ?? null,
    customTargetExamName: profile?.customTargetExamName ?? null,
  });
}

/**
 * Sets (or clears) the candidate's active target exam — either a catalog
 * exam (targetExamId) or a free-text name for an exam not in the catalog /
 * general practice (customTargetExamName). Exactly one of the two, ever;
 * setting one always clears the other. Upserts rather than requiring a
 * prior row, matching TypingSubscription's "no row yet" convention
 * elsewhere in this app.
 */
export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const hasExamId = body.targetExamId !== null && body.targetExamId !== undefined;
  const hasCustomName = typeof body.customTargetExamName === "string" && body.customTargetExamName.trim().length > 0;

  if (hasExamId && hasCustomName) {
    return NextResponse.json({ error: "Provide either a catalog exam or a custom name, not both." }, { status: 400 });
  }

  let targetExamId: string | null = null;
  let customTargetExamName: string | null = null;

  if (hasExamId) {
    if (typeof body.targetExamId !== "string") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const exam = await prisma.typingExam.findUnique({ where: { id: body.targetExamId } });
    if (!exam || !exam.isActive) {
      return NextResponse.json({ error: "That exam isn't available." }, { status: 404 });
    }
    targetExamId = body.targetExamId;
  } else if (hasCustomName) {
    const trimmed = body.customTargetExamName.trim();
    if (trimmed.length > MAX_CUSTOM_NAME_LENGTH) {
      return NextResponse.json({ error: `Keep it under ${MAX_CUSTOM_NAME_LENGTH} characters.` }, { status: 400 });
    }
    customTargetExamName = trimmed;
  }
  // Else: both absent/null — clears the target exam entirely (both fields null).

  const profile = await prisma.typingCandidateProfile.upsert({
    where: { userId },
    create: { userId, targetExamId, customTargetExamName },
    update: { targetExamId, customTargetExamName },
    include: { targetExam: true },
  });

  return NextResponse.json({ targetExam: profile.targetExam, customTargetExamName: profile.customTargetExamName });
}
