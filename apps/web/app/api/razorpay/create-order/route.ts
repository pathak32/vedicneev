import { NextResponse } from "next/server";
import { PLAN_CONFIG, type EntitlementExamType, type PaidPlanId } from "@vedicneev/engine";

import { createRazorpayOrder } from "@/lib/payments/razorpayServer";

// API routes are request-handling code, never prerenderable — force dynamic
// so the build never attempts to collect static page data for it.
export const dynamic = "force-dynamic";

const PAID_PLANS: PaidPlanId[] = ["EXAM_PASS", "VEDIC_ALL_ACCESS"];

interface CreateOrderBody {
  planId?: string;
  targetExam?: string;
}

export async function POST(request: Request) {
  let body: CreateOrderBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const planId = body.planId as PaidPlanId | undefined;
  if (!planId || !PAID_PLANS.includes(planId)) {
    return NextResponse.json({ error: "planId must be EXAM_PASS or VEDIC_ALL_ACCESS." }, { status: 400 });
  }
  if (planId === "EXAM_PASS" && !body.targetExam) {
    return NextResponse.json({ error: "targetExam is required for EXAM_PASS." }, { status: 400 });
  }

  const plan = PLAN_CONFIG[planId];

  try {
    const order = await createRazorpayOrder({
      planId,
      amountInr: plan.priceInr,
      receipt: `${planId}_${Date.now()}`,
    });

    return NextResponse.json({
      ...order,
      planId,
      targetExam: (body.targetExam as EntitlementExamType | undefined) ?? null,
      amountInr: plan.priceInr,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order." },
      { status: 502 }
    );
  }
}
