import { createHmac, randomBytes, timingSafeEqual } from "crypto";

import type { PaidPlanId } from "@vedicneev/engine";

/**
 * Server-side Razorpay helpers, used only by the API routes under
 * app/api/razorpay/. No real RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are
 * configured in this project — every call here runs the mock branch,
 * which is clearly tagged `mock: true` end to end. The real-credentials
 * branches implement Razorpay's actual documented order-creation and
 * HMAC-SHA256 signature-verification scheme, so wiring up real keys later
 * is a drop-in change (set the two env vars — no code changes needed).
 */

function getServerCredentials(): { keyId: string; keySecret: string } | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? { keyId, keySecret } : null;
}

export interface CreateOrderInput {
  planId: PaidPlanId;
  amountInr: number;
  receipt: string;
}

export interface CreateOrderResult {
  mock: boolean;
  orderId: string;
  /** Amount in paise (Razorpay's convention), matching the real order API. */
  amount: number;
  currency: "INR";
  /** Public key id the client checkout needs; null in mock mode. */
  keyId: string | null;
}

export async function createRazorpayOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const amountPaise = Math.round(input.amountInr * 100);
  const credentials = getServerCredentials();

  if (!credentials) {
    return {
      mock: true,
      orderId: `order_mock_${randomBytes(8).toString("hex")}`,
      amount: amountPaise,
      currency: "INR",
      keyId: null,
    };
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt: input.receipt }),
  });

  if (!response.ok) {
    throw new Error(`Razorpay order creation failed (${response.status}): ${await response.text()}`);
  }

  const order = (await response.json()) as { id: string; amount: number };
  return { mock: false, orderId: order.id, amount: order.amount, currency: "INR", keyId: credentials.keyId };
}

export interface VerifyPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  mock: boolean;
  error?: string;
}

export function verifyRazorpayPayment(input: VerifyPaymentInput): VerifyPaymentResult {
  // A mock order (id prefixed by create-order above) never has a real
  // signature — accept only the exact payload shape the mock checkout
  // flow produces, so this branch can't be tricked into "verifying" an
  // arbitrary client-supplied payload.
  if (input.orderId.startsWith("order_mock_")) {
    const isValidMockPayload =
      input.paymentId.startsWith("pay_mock_") && input.signature === "mock_signature";
    return isValidMockPayload
      ? { verified: true, mock: true }
      : { verified: false, mock: true, error: "Invalid mock payment payload." };
  }

  const credentials = getServerCredentials();
  if (!credentials) {
    return { verified: false, mock: false, error: "Razorpay is not configured on the server." };
  }

  const expectedSignature = createHmac("sha256", credentials.keySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "utf8");
  const actual = Buffer.from(input.signature, "utf8");
  const verified = expected.length === actual.length && timingSafeEqual(expected, actual);

  return verified ? { verified: true, mock: false } : { verified: false, mock: false, error: "Signature mismatch." };
}
