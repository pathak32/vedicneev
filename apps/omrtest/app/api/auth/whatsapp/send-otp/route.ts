import { NextResponse } from "next/server";
import { INDIAN_MOBILE_PATTERN, sendWhatsAppOtp } from "@vedicneev/auth";

/**
 * Thin HTTP adapter over packages/auth's shared sendWhatsAppOtp — identical
 * contract to apps/web/app/api/auth/whatsapp/send-otp/route.ts, since both
 * apps' logins are the same phone-OTP-to-Supabase-session bridge. An
 * InstituteAdmin is authenticated exactly like any other User; only
 * login/callback/route.ts's InstituteAdmin lookup afterward is specific to
 * this app.
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
