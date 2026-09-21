import { NextResponse } from "next/server";
import { CREDIT_TOPUP_BUNDLES, INSTITUTE_TIER_CONFIG, type PaidInstituteTier } from "@vedicneev/engine";

import { getInstituteSession } from "@/lib/institute/session";
import { applyInstituteCreditTopup, applyInstituteSubscriptionPayment } from "@/lib/payments/instituteBillingService";
import { verifyRazorpayPayment } from "@/lib/payments/razorpayServer";

// Writes billing state on a verified payment — never cache or statically collect this route.
export const dynamic = "force-dynamic";

interface VerifyPaymentBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  kind?: "subscription" | "credit_topup";
  tier?: string;
  topupId?: string;
}

export async function POST(request: Request) {
  const session = await getInstituteSession();
  if (!session) return NextResponse.json({ verified: false, error: "Not authenticated." }, { status: 401 });

  let body: VerifyPaymentBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ verified: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, kind, tier, topupId } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { verified: false, error: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required." },
      { status: 400 }
    );
  }

  // Signature check runs the same way whether or not real Razorpay keys are
  // configured — verifyRazorpayPayment's mock branch (order id prefixed
  // "order_mock_") is what handles mock mode here: an unpaid real order can
  // never verify, but a correctly-shaped mock payload does, and either way
  // nothing below runs unless `verified` is actually true.
  const result = verifyRazorpayPayment({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!result.verified) {
    return NextResponse.json({ verified: false, mock: result.mock, error: result.error }, { status: 400 });
  }

  try {
    if (kind === "subscription") {
      const tierValue = tier as PaidInstituteTier | undefined;
      if (!tierValue || !(tierValue in INSTITUTE_TIER_CONFIG)) {
        return NextResponse.json({ verified: false, error: "tier must be STARTER or GROWTH." }, { status: 400 });
      }
      await applyInstituteSubscriptionPayment({
        instituteId: session.institute.id,
        tier: tierValue,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return NextResponse.json({ verified: true, mock: result.mock, kind: "subscription", tier: tierValue });
    }

    if (kind === "credit_topup") {
      if (!topupId || !(topupId in CREDIT_TOPUP_BUNDLES)) {
        return NextResponse.json({ verified: false, error: "Invalid topupId." }, { status: 400 });
      }
      await applyInstituteCreditTopup({
        instituteId: session.institute.id,
        topupId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return NextResponse.json({ verified: true, mock: result.mock, kind: "credit_topup", topupId });
    }

    return NextResponse.json({ verified: false, error: "kind must be 'subscription' or 'credit_topup'." }, { status: 400 });
  } catch (error) {
    console.error("Institute billing persistence error:", error);
    // The payment itself already verified above — a write failure here is a
    // server-side data problem, not an invalid/fraudulent payment, so this
    // stays a 500 (the webhook remains the safety net that'll retry
    // applying it) rather than reusing the 400 "not verified" shape.
    const message = error instanceof Error ? error.message : "Failed to save the payment.";
    return NextResponse.json({ verified: true, mock: result.mock, error: message }, { status: 500 });
  }
}
