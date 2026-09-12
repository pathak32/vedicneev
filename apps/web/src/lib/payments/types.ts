import type { EntitlementExamType, PaidPlanId } from "@vedicneev/engine";

/** Shape returned by POST /api/razorpay/create-order. */
export interface CreateOrderResponse {
  mock: boolean;
  orderId: string;
  amount: number;
  currency: "INR";
  keyId: string | null;
  planId: PaidPlanId;
  targetExam: EntitlementExamType | null;
  amountInr: number;
}

/** The persisted Subscription row POST /api/razorpay/verify-payment creates once a payment verifies. */
export interface VerifiedSubscription {
  id: string;
  parentId: string;
  plan: PaidPlanId;
  targetExam: EntitlementExamType | null;
  amountPaid: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  /** ISO 8601. */
  validUntil: string;
}

/** Shape returned by POST /api/razorpay/verify-payment. `subscription` is set only when `verified` is true. */
export interface VerifyPaymentResponse {
  verified: boolean;
  mock: boolean;
  error?: string;
  subscription?: VerifiedSubscription;
}

export interface RazorpayPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/** Body POST /api/razorpay/verify-payment expects, on top of RazorpayPaymentPayload — everything needed to attach a real Subscription row to the paying parent. */
export interface VerifyPaymentRequestBody extends RazorpayPaymentPayload {
  /** Identifies (and if needed, creates) the parent's real User row — see apps/web/app/api/auth/sync/route.ts, the same phone-keyed upsert used at sign-in. */
  phone: string;
  planId: PaidPlanId;
  targetExam: EntitlementExamType | null;
}

/**
 * Body POST /api/checkout/verify expects — a client-side, synchronous
 * counterpart to the async webhook (app/api/webhook/payment) for one-time
 * Store purchases, so a real captured payment is never left PENDING purely
 * because a webhook delivery got lost. `purchaseIds` is only a hint for the
 * response shape/UI continuity — the route always re-derives which
 * purchases to mark PAID from `razorpay_order_id` server-side, the same way
 * the webhook does, never from this client-supplied list.
 */
export interface CheckoutVerifyRequestBody extends RazorpayPaymentPayload {
  purchaseIds: string[];
}

/** Shape returned by POST /api/checkout/verify. */
export interface CheckoutVerifyResponse {
  verified: boolean;
  mock: boolean;
  error?: string;
  purchaseIds?: string[];
}
