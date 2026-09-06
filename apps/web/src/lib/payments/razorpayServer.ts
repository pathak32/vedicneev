import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * Server-side Razorpay helpers, used by every API route under app/api/
 * that takes a payment (subscriptions under app/api/razorpay/, one-time
 * product purchases under app/api/checkout and app/api/webhook/payment).
 * No real RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are configured in this
 * project — every call here runs the mock branch, which is clearly tagged
 * `mock: true` end to end. The real-credentials branches implement
 * Razorpay's actual documented order-creation and HMAC-SHA256
 * signature-verification scheme, so wiring up real keys later is a
 * drop-in change (set the env vars — no code changes needed).
 */

function getServerCredentials(): { keyId: string; keySecret: string } | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? { keyId, keySecret } : null;
}

export interface CreateOrderInput {
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

export interface VerifyWebhookResult {
  verified: boolean;
  mock: boolean;
  error?: string;
}

/**
 * Verifies a Razorpay webhook delivery (app/api/webhook/payment) — HMAC-
 * SHA256 of the *raw* request body using RAZORPAY_WEBHOOK_SECRET, per
 * Razorpay's documented webhook scheme (a separate secret from the
 * checkout key pair, configured in the Razorpay dashboard). `rawBody` must
 * be the exact bytes Razorpay signed — never a re-serialized JSON.parse'd
 * copy, since re-encoding can change whitespace and break the signature.
 *
 * No RAZORPAY_WEBHOOK_SECRET configured → mock mode: accepts a delivery
 * with no signature header at all, since a real Razorpay webhook can never
 * omit one — that shape only occurs when the storefront's own "Simulate
 * Successful Payment" button posts here directly in local/demo dev. This
 * can't happen in production once a webhook secret is configured, since
 * the mock branch is only reachable when the secret is entirely absent.
 */
export function verifyRazorpayWebhookSignature(rawBody: string, signatureHeader: string | null): VerifyWebhookResult {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return signatureHeader
      ? { verified: false, mock: true, error: "No webhook secret configured, but a signature was supplied." }
      : { verified: true, mock: true };
  }

  if (!signatureHeader) {
    return { verified: false, mock: false, error: "Missing X-Razorpay-Signature header." };
  }

  const expectedSignature = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const expected = Buffer.from(expectedSignature, "utf8");
  const actual = Buffer.from(signatureHeader, "utf8");
  const verified = expected.length === actual.length && timingSafeEqual(expected, actual);

  return verified ? { verified: true, mock: false } : { verified: false, mock: false, error: "Signature mismatch." };
}
