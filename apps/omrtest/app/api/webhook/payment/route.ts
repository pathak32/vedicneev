import { NextResponse } from "next/server";
import type { PaidInstituteTier } from "@vedicneev/engine";

import { applyInstituteCreditTopup, applyInstituteSubscriptionPayment } from "@/lib/payments/instituteBillingService";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpayServer";

// Razorpay calls this server-to-server with no user session at all —
// authenticated purely by the signature, never by cookies/auth. Never
// cache or statically collect this route. Registered in the Razorpay
// dashboard as its own endpoint (https://omrtest.vedicneev.com/api/webhook/
// payment), separate from apps/web's — each app is its own Vercel Project
// with its own RAZORPAY_WEBHOOK_SECRET.
export const dynamic = "force-dynamic";

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
  const notes = entity?.notes;

  if (!orderId) {
    return NextResponse.json({ error: "Missing payload.payment.entity.order_id." }, { status: 400 });
  }

  // verifyRazorpayWebhookSignature's mock branch accepts any unsigned call
  // when RAZORPAY_WEBHOOK_SECRET isn't configured — meant only for the
  // billing page's own "Simulate Successful Payment" button hitting this
  // route directly in local/demo dev, never a real order. Guard against a
  // misconfiguration (real RAZORPAY_KEY_ID/SECRET set, but the webhook
  // secret forgotten) by refusing to act on a non-mock order id while
  // running unsigned.
  if (verification.mock && !orderId.startsWith("order_mock_")) {
    return NextResponse.json({ error: "Unsigned webhook calls may only reference mock orders." }, { status: 400 });
  }

  // Reads the REAL Razorpay-echoed notes (tamper-proof — this is exactly
  // what create-order sent Razorpay, not anything a client body could
  // forge), so this path is the authoritative one; verify-payment's
  // client-supplied kind/tier/topupId is a same-shaped but client-trusting
  // fast path for the common case where the tab stays open.
  if (body.event === "payment.captured" && paymentId && notes) {
    if (notes.kind === "institute_subscription" && notes.instituteId && notes.tier) {
      await applyInstituteSubscriptionPayment({
        instituteId: notes.instituteId,
        tier: notes.tier as PaidInstituteTier,
        orderId,
        paymentId,
      });
    } else if (notes.kind === "institute_credit_topup" && notes.instituteId && notes.topupId) {
      await applyInstituteCreditTopup({
        instituteId: notes.instituteId,
        topupId: notes.topupId,
        orderId,
        paymentId,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
