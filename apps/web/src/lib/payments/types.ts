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

/** Shape returned by POST /api/razorpay/verify-payment. */
export interface VerifyPaymentResponse {
  verified: boolean;
  mock: boolean;
  error?: string;
}

export interface RazorpayPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
