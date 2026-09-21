import { NextResponse } from "next/server";
import { PLAN_CONFIG, type EntitlementExamType, type PaidPlanId } from "@vedicneev/engine";

import { createSupabaseServerClient, isSupabaseAuthConfigured, toAppPhone } from "@vedicneev/auth";

import { createRazorpayOrder } from "@/lib/payments/razorpayServer";

// API routes are request-handling code, never prerenderable — force dynamic
// so the build never attempts to collect static page data for it.
export const dynamic = "force-dynamic";

const PAID_PLANS: PaidPlanId[] = ["EXAM_PASS", "VEDIC_ALL_ACCESS"];

interface CreateOrderBody {
  planId?: string;
  targetExam?: string;
  /** Same demo-mode trust boundary verify-payment already uses: trusted only when Supabase auth isn't configured. */
  phone?: string;
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

  // Best-effort phone, embedded as Razorpay order/payment notes — the
  // webhook's only way to identify who paid when it has to create the
  // Subscription itself (verify-payment's client call never arrived). Never
  // required: a failure to resolve one just means that safety net can't
  // fire for this particular order, not that checkout is blocked.
  let phoneForNotes: string | null = null;
  if (isSupabaseAuthConfigured()) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    if (authUser?.phone) phoneForNotes = toAppPhone(authUser.phone);
  } else if (body.phone) {
    phoneForNotes = body.phone;
  }

  try {
    const order = await createRazorpayOrder({
      amountInr: plan.priceInr,
      receipt: `${planId}_${Date.now()}`,
      notes: {
        kind: "subscription",
        planId,
        targetExam: body.targetExam ?? "",
        ...(phoneForNotes ? { phone: phoneForNotes } : {}),
      },
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
