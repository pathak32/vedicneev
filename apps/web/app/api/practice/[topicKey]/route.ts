import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";
import { checkPracticeAccess, type ParentSubscription } from "@vedicneev/engine";

import { createSupabaseServerClient, isSupabaseAuthConfigured, toAppPhone } from "@vedicneev/auth";

import { generateTopicPracticeSession, getTopicSampleQuestions } from "@/lib/exam/topicPracticeService";

export const dynamic = "force-dynamic";

/**
 * The real, server-side subscription lookup POST below enforces — reads
 * the same Subscription row GET /api/subscription/status does, mapped to
 * the ParentSubscription shape checkPracticeAccess expects. Returns null
 * (never active) for a caller we can't identify at all, which
 * checkPracticeAccess already treats as "no free tier, must upgrade" —
 * exactly right for a guest.
 */
async function resolveSubscriptionForRequest(phone: string | null): Promise<ParentSubscription | null> {
  let parentId: string | null = null;

  if (isSupabaseAuthConfigured()) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    if (authUser?.phone) {
      const dbUser = await prisma.user.findUnique({ where: { phone: toAppPhone(authUser.phone) }, select: { id: true } });
      parentId = dbUser?.id ?? null;
    }
  } else if (phone) {
    const dbUser = await prisma.user.findUnique({ where: { phone }, select: { id: true } });
    parentId = dbUser?.id ?? null;
  }

  if (!parentId) return null;

  const subscription = await prisma.subscription.findFirst({
    where: { parentId },
    orderBy: { createdAt: "desc" },
  });
  if (!subscription) return null;

  return {
    plan: subscription.plan,
    // A Subscription's targetExam is only ever set for EXAM_PASS, always to
    // one of engine's EntitlementExamType values in practice — Prisma's
    // wider ExamType (which also has DPS/OTHER) is narrowed the same way
    // verify-payment's own toVerifiedSubscription already does.
    targetExam: subscription.targetExam as ParentSubscription["targetExam"],
    status: subscription.status,
    validUntil: subscription.validUntil ? subscription.validUntil.getTime() : null,
  };
}

/**
 * Up to 3 sample questions (one per difficulty) for the pre-auth preview
 * shown before the Timed/Untimed picker — see getTopicSampleQuestions.
 * No auth check by design: this is exactly the content that's meant to
 * be visible before a visitor commits to signing in.
 */
export async function GET(_request: Request, { params }: { params: { topicKey: string } }) {
  const result = await getTopicSampleQuestions(params.topicKey);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json({ success: true, questions: result.questions });
}

/**
 * Assembles a single-topic practice session on demand — see
 * apps/web/src/lib/exam/topicPracticeService.ts for the real logic.
 * Free Practice requires an active Exam Pass or All-Access subscription
 * (see checkPracticeAccess) — the client (app/practice/[topicKey]/page.tsx)
 * already gates the "Start Practice" button on this, but that's a UI
 * nicety only; this was the actual enforcement gap, since nothing stopped
 * a direct POST here from a guest or an expired-subscription account.
 */
export async function POST(request: Request, { params }: { params: { topicKey: string } }) {
  let phone: string | null = null;
  try {
    const body = await request.json();
    phone = typeof body?.phone === "string" ? body.phone : null;
  } catch {
    // No body at all is fine — resolveSubscriptionForRequest falls back to
    // the Supabase session (if configured) or treats the caller as a guest.
  }

  const subscription = await resolveSubscriptionForRequest(phone);
  const access = checkPracticeAccess(subscription);
  if (!access.allowed) {
    return NextResponse.json(
      { error: "An active Exam Pass or Vedic All-Access subscription is required for Free Practice.", access },
      { status: 403 }
    );
  }

  const untimedParam = new URL(request.url).searchParams.get("untimed");
  const untimed = untimedParam === null ? undefined : untimedParam !== "false";
  const result = await generateTopicPracticeSession(params.topicKey, { untimed });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true, session: result.session });
}
