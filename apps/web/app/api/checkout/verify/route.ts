import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { verifyRazorpayPayment } from "@/lib/payments/razorpayServer";
import type { CheckoutVerifyRequestBody, CheckoutVerifyResponse } from "@/lib/payments/types";

// Writes Purchase rows on a verified payment — never cache or statically
// collect this route.
export const dynamic = "force-dynamic";

/**
 * Client-side, synchronous confirmation for one-time Store purchases —
 * mirrors app/api/razorpay/verify-payment's already-working pattern (same
 * verifyRazorpayPayment HMAC check) instead of leaving confirmation solely
 * to the async webhook (app/api/webhook/payment), which can be delayed or
 * never arrive at all (e.g. a misconfigured merchant domain). Called
 * directly from Razorpay's own success handler in StoreCheckoutDialog.tsx,
 * with the poll loop kept only as a secondary fallback.
 */
export async function POST(request: Request) {
  let body: Partial<CheckoutVerifyRequestBody>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<CheckoutVerifyResponse>({ verified: false, mock: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json<CheckoutVerifyResponse>(
      { verified: false, mock: false, error: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required." },
      { status: 400 }
    );
  }

  const result = verifyRazorpayPayment({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!result.verified) {
    return NextResponse.json<CheckoutVerifyResponse>({ verified: false, mock: result.mock, error: result.error }, { status: 400 });
  }

  // Purchases to mark PAID are re-derived from the verified order id, never
  // trusted from the client's own purchaseIds list — same lookup the
  // webhook uses, so a validly-signed payment can only ever confirm the
  // purchases it actually paid for.
  const purchases = await prisma.purchase.findMany({ where: { razorpayOrderId: razorpay_order_id } });
  if (purchases.length === 0) {
    return NextResponse.json<CheckoutVerifyResponse>(
      { verified: false, mock: result.mock, error: "No purchases found for this order." },
      { status: 404 }
    );
  }

  for (const purchase of purchases) {
    // Idempotent — a retried verify call (or one racing the webhook) must
    // never double-increment promo usage.
    if (purchase.status === "PAID") continue;

    await prisma.$transaction([
      prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: "PAID", razorpayPaymentId: razorpay_payment_id },
      }),
      ...(purchase.promoCodeId
        ? [prisma.promoCode.update({ where: { id: purchase.promoCodeId }, data: { usageCount: { increment: 1 } } })]
        : []),
    ]);
  }

  return NextResponse.json<CheckoutVerifyResponse>({ verified: true, mock: result.mock, purchaseIds: purchases.map((p) => p.id) });
}
