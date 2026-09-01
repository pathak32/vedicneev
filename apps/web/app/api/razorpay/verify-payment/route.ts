import { NextResponse } from "next/server";

import { verifyRazorpayPayment } from "@/lib/payments/razorpayServer";

interface VerifyPaymentBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

export async function POST(request: Request) {
  let body: VerifyPaymentBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ verified: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { verified: false, error: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required." },
      { status: 400 }
    );
  }

  const result = verifyRazorpayPayment({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  return NextResponse.json(result, { status: result.verified ? 200 : 400 });
}
