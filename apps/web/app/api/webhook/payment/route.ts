import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";
import { PLAN_CONFIG, SUBSCRIPTION_VALIDITY_MS, type EntitlementExamType, type PaidPlanId } from "@vedicneev/engine";

import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpayServer";

// Razorpay calls this server-to-server with no user session at all —
// authenticated purely by the signature, never by cookies/auth. Never
// cache or statically collect this route.
export const dynamic = "force-dynamic";

const PAID_PLANS: PaidPlanId[] = ["EXAM_PASS", "VEDIC_ALL_ACCESS"];

interface RazorpayWebhookPayload {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        /** Echoed straight from the order's own notes — see createRazorpayOrder's notes param. */
        notes?: Record<string, string>;
      };
    };
  };
}

/**
 * The Subscription-path safety net app/api/razorpay/verify-payment has
 * never had: that route only ever gets called by the client's own
 * `handler` callback, so a browser closed/reloaded between Razorpay
 * confirming payment and that fetch completing leaves the Subscription row
 * never created, with no other channel that would ever create it. This
 * webhook delivery is that other channel — server-to-server, so it fires
 * regardless of what happens to the customer's tab. It only acts on orders
 * create-order tagged `notes.kind === "subscription"` (a storefront
 * Purchase-backed order is handled by the existing purchases branch below,
 * and is never double-processed here since Purchase rows for that
 * order_id would already have matched first).
 */
async function createSubscriptionFromWebhookNotes(
  notes: Record<string, string>,
  paymentId: string | undefined,
  orderId: string
): Promise<void> {
  const planId = notes.planId as PaidPlanId | undefined;
  if (!planId || !PAID_PLANS.includes(planId)) return;

  // Idempotent against Razorpay's documented at-least-once redelivery, and
  // against verify-payment's own client-side call having already won the
  // race and created this exact row first.
  if (paymentId) {
    const existing = await prisma.subscription.findFirst({ where: { razorpayPaymentId: paymentId } });
    if (existing) return;
  }

  const phone = notes.phone;
  if (!phone) return; // Nothing to attach the subscription to — see create-order's own comment on this being best-effort.

  const dbUser = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone, phoneVerifiedAt: new Date(), role: "PARENT" },
  });

  const plan = PLAN_CONFIG[planId];
  await prisma.subscription.create({
    data: {
      parentId: dbUser.id,
      plan: planId,
      targetExam: (notes.targetExam || null) as EntitlementExamType | null,
      status: "ACTIVE",
      amountPaid: plan.priceInr,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId ?? null,
      validUntil: new Date(Date.now() + SUBSCRIPTION_VALIDITY_MS),
    },
  });
}

export async function POST(request: Request) {
  // Signature verification needs the exact raw bytes Razorpay signed —
  // read as text first, parse JSON only after that's done.
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-razorpay-signature");

  const verification = verifyRazorpayWebhookSignature(rawBody, signatureHeader);
  if (!verification.verified) {
    return NextResponse.json({ error: verification.error ?? "Invalid signature." }, { status: 400 });
  }

  let body: RazorpayWebhookPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const entity = body.payload?.payment?.entity;
  const orderId = entity?.order_id;
  const paymentId = entity?.id;
  if (!orderId) {
    return NextResponse.json({ error: "Missing payload.payment.entity.order_id." }, { status: 400 });
  }

  // verifyRazorpayWebhookSignature's mock branch accepts any unsigned call
  // when RAZORPAY_WEBHOOK_SECRET isn't configured — that's meant only for
  // the storefront's own "Simulate Successful Payment" button hitting this
  // route directly in local/demo dev, never a real order. Guard against a
  // misconfiguration (real RAZORPAY_KEY_ID/SECRET set, but the webhook
  // secret forgotten) by refusing to act on a non-mock order id while
  // running unsigned.
  if (verification.mock && !orderId.startsWith("order_mock_")) {
    return NextResponse.json({ error: "Unsigned webhook calls may only reference mock orders." }, { status: 400 });
  }

  const purchases = await prisma.purchase.findMany({ where: { razorpayOrderId: orderId } });
  if (purchases.length === 0) {
    // Not a storefront order — either a subscription-plan order (see
    // create-order's notes) that verify-payment's client call hasn't
    // reached yet, or a stray/test event. Acknowledge so Razorpay stops
    // retrying either way; the subscription branch below is a no-op for
    // anything that isn't tagged notes.kind === "subscription".
    if (body.event === "payment.captured" && entity?.notes?.kind === "subscription") {
      await createSubscriptionFromWebhookNotes(entity.notes, paymentId, orderId);
    }
    return NextResponse.json({ ok: true, note: "No matching purchase(s) for this order." });
  }

  if (body.event === "payment.captured") {
    for (const purchase of purchases) {
      // Idempotent: a retried webhook delivery (Razorpay's documented
      // at-least-once behavior) must never double-increment promo usage.
      if (purchase.status === "PAID") continue;

      await prisma.$transaction([
        prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: "PAID", razorpayPaymentId: paymentId ?? null },
        }),
        ...(purchase.promoCodeId
          ? [prisma.promoCode.update({ where: { id: purchase.promoCodeId }, data: { usageCount: { increment: 1 } } })]
          : []),
      ]);
    }
  } else if (body.event === "payment.failed") {
    await prisma.purchase.updateMany({
      where: { razorpayOrderId: orderId, status: { not: "PAID" } },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ ok: true });
}
