import { NextResponse } from "next/server";

import { INDIAN_MOBILE_PATTERN, verifyWhatsAppOtp } from "@/lib/auth/whatsappOtpServer";

/**
 * Validates a submitted OTP against the code sent by
 * app/api/auth/whatsapp/send-otp/route.ts, and on success either bridges
 * into a real Supabase session (cookies land on this response) or, if no
 * Supabase project is configured, upserts a demo-mode phone-keyed User.
 * See src/lib/auth/whatsappOtpServer.ts for the actual verification and
 * session-bridging logic — this route is just the HTTP adapter.
 */
export const dynamic = "force-dynamic";

interface RequestBody {
  phone?: string;
  code?: string;
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const phone = body.phone;
  if (!phone || !INDIAN_MOBILE_PATTERN.test(phone)) {
    return NextResponse.json({ success: false, error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
  }

  return verifyWhatsAppOtp(phone, body.code);
}
