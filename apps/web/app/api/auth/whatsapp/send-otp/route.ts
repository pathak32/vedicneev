import { NextResponse } from "next/server";

import { INDIAN_MOBILE_PATTERN, sendWhatsAppOtp } from "@/lib/auth/whatsappOtpServer";

/**
 * Generates and dispatches a fresh WhatsApp OTP for a 10-digit Indian
 * mobile number. See src/lib/auth/whatsappOtpServer.ts for generation,
 * storage, and delivery — this route is just the HTTP adapter (request
 * parsing + phone validation) over that shared implementation, which
 * app/api/auth/whatsapp/verify-otp/route.ts also builds on.
 */
export const dynamic = "force-dynamic";

interface RequestBody {
  phone?: string;
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

  return sendWhatsAppOtp(phone);
}
