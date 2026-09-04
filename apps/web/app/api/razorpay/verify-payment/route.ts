import { NextResponse } from "next/server";
import { prisma, type Subscription } from "@vedicneev/db";
import { PLAN_CONFIG, SUBSCRIPTION_VALIDITY_MS, type EntitlementExamType, type PaidPlanId } from "@vedicneev/engine";

import { verifyRazorpayPayment } from "@/lib/payments/razorpayServer";
import type { VerifyPaymentRequestBody, VerifyPaymentResponse } from "@/lib/payments/types";

// Writes a Subscription row on a verified payment — never cache or
// statically collect this route.
export const dynamic = "force-dynamic";

const PAID_PLANS: PaidPlanId[] = ["EXAM_PASS", "VEDIC_ALL_ACCESS"];

export async function POST(request: Request) {
  let body: Partial<VerifyPaymentRequestBody>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<VerifyPaymentResponse>(
      { verified: false, mock: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, phone, planId, targetExam } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json<VerifyPaymentResponse>(
      { verified: false, mock: false, error: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required." },
      { status: 400 }
    );
  }
  if (!phone) {
    return NextResponse.json<VerifyPaymentResponse>(
      { verified: false, mock: false, error: "phone is required to attach the subscription to a user." },
      { status: 400 }
    );
  }
  if (!planId || !PAID_PLANS.includes(planId)) {
    return NextResponse.json<VerifyPaymentResponse>(
      { verified: false, mock: false, error: "planId must be EXAM_PASS or VEDIC_ALL_ACCESS." },
      { status: 400 }
    );
  }

  // Signature check runs the same way whether or not real Razorpay keys are
  // configured — verifyRazorpayPayment's mock branch (order id prefixed
  // "order_mock_") is what "handles mock mode gracefully" here: an unpaid
  // real order can never verify, but a correctly-shaped mock payload does,
  // and either way nothing below runs unless `verified` is actually true.
  const result = verifyRazorpayPayment({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!result.verified) {
    return NextResponse.json<VerifyPaymentResponse>(
      { verified: false, mock: result.mock, error: result.error },
      { status: 400 }
    );
  }

  try {
    // Best-effort idempotency guard against a retried verify call
    // re-submitting the same payment — razorpayPaymentId has no unique
    // constraint in the schema, so this is an optimistic check, not a
    // DB-enforced one.
    const existing = await prisma.subscription.findFirst({ where: { razorpayPaymentId: razorpay_payment_id } });
    if (existing) {
      return NextResponse.json<VerifyPaymentResponse>({
        verified: true,
        mock: result.mock,
        subscription: toVerifiedSubscription(existing),
      });
    }

    // Same phone-keyed upsert apps/web/app/api/auth/sync/route.ts already
    // uses at sign-in — repeated here (not just looked up) so a payment can
    // never fail purely because that fire-and-forget sync call silently
    // failed earlier (see the catch around it in useAuthStore.ts).
    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone, phoneVerifiedAt: new Date(), role: "PARENT" },
    });

    // Price is derived server-side from PLAN_CONFIG, never trusted from the
    // client, so a tampered request body can't buy a plan for less.
    const plan = PLAN_CONFIG[planId];
    const validUntil = new Date(Date.now() + SUBSCRIPTION_VALIDITY_MS);

    const subscription = await prisma.subscription.create({
      data: {
        parentId: user.id,
        plan: planId,
        targetExam: (targetExam as EntitlementExamType | null) ?? null,
        status: "ACTIVE",
        amountPaid: plan.priceInr,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        validUntil,
      },
    });

    return NextResponse.json<VerifyPaymentResponse>({
      verified: true,
      mock: result.mock,
      subscription: toVerifiedSubscription(subscription),
    });
  } catch (error) {
    console.error("Subscription persistence error:", error);
    const message = error instanceof Error ? error.message : "Failed to save the subscription.";
    // The payment itself already verified above — a write failure here is a
    // server-side data problem, not an invalid/fraudulent payment, so this
    // stays a 500 rather than reusing the 400 "not verified" shape.
    return NextResponse.json<VerifyPaymentResponse>({ verified: true, mock: result.mock, error: message }, { status: 500 });
  }
}

/** This route only ever creates/looks up EXAM_PASS or VEDIC_ALL_ACCESS rows (guarded by the PAID_PLANS check above), so narrowing Prisma's wider SubscriptionPlan enum (which also has FREE_EXPLORER) down to PaidPlanId here is safe. */
function toVerifiedSubscription(row: Subscription) {
  return {
    id: row.id,
    parentId: row.parentId,
    plan: row.plan as PaidPlanId,
    targetExam: row.targetExam as EntitlementExamType | null,
    amountPaid: row.amountPaid,
    razorpayOrderId: row.razorpayOrderId ?? "",
    razorpayPaymentId: row.razorpayPaymentId ?? "",
    validUntil: (row.validUntil ?? new Date()).toISOString(),
  };
}
