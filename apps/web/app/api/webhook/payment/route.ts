import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpayServer";

// Razorpay calls this server-to-server with no user session at all —
// authenticated purely by the signature, never by cookies/auth. Never
// cache or statically collect this route.
export const dynamic = "force-dynamic";

interface RazorpayWebhookPayload {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
      };
    };
  };
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
    // Not necessarily an error — Razorpay retries webhook deliveries, and
    // this order id may belong to a purchase this app never created (e.g.
    // a stray test event). Acknowledge so Razorpay stops retrying.
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
