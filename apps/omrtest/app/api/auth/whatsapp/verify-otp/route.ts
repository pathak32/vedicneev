import { NextResponse } from "next/server";
import { INDIAN_MOBILE_PATTERN, verifyWhatsAppOtp } from "@vedicneev/auth";

/**
 * Thin HTTP adapter over packages/auth's shared verifyWhatsAppOtp —
 * identical contract to apps/web's equivalent route. On success this
 * response carries the Supabase session cookies (set via the shared-domain
 * cookie config, see @vedicneev/auth's env.ts), so the client's next step
 * is a plain navigation to /login/callback — no token needs passing
 * through JS, the cookie is already there.
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
