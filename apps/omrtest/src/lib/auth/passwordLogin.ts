import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";
import { INDIAN_MOBILE_PATTERN, bridgeToSupabaseSession, isSupabaseAuthConfigured, resolveDbUser } from "@vedicneev/auth";

import { verifySecret } from "./password";

/**
 * The "fast daily access" login path — phone + password/PIN instead of a
 * WhatsApp round trip. Deliberately returns the exact same response shape
 * as verifyWhatsAppOtp (packages/auth's whatsappOtp.ts) — { success, mock,
 * user } — so app/login/page.tsx's two forms can share one
 * "on success -> /login/callback" handler regardless of which method ran.
 *
 * Session creation itself is bridgeToSupabaseSession, the SAME function
 * verify-otp calls — this is what "role resolution remains identical
 * regardless of the chosen login method" actually means in code: there is
 * only one function that ever mints the session, and both login methods
 * call it once they've each verified the caller by their own means.
 */
export async function loginWithPassword(phone: string, password: string | undefined): Promise<NextResponse> {
  if (!INDIAN_MOBILE_PATTERN.test(phone)) {
    return NextResponse.json({ success: false, error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ success: false, error: "Password is required." }, { status: 400 });
  }

  // One generic error for every failure mode (no such phone, no
  // InstituteAdmin, no password set, wrong password) — never reveal which
  // part was wrong, same reasoning any login form uses to avoid confirming
  // whether a phone number is registered at all.
  const genericError = NextResponse.json({ success: false, error: "Incorrect phone number or password." }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) return genericError;

  const admin = await prisma.instituteAdmin.findUnique({ where: { userId: user.id } });
  if (!admin || !admin.passwordHash) return genericError;

  const matches = await verifySecret(password, admin.passwordHash);
  if (!matches) return genericError;

  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      { success: false, error: "Password login isn't available in this environment yet — use WhatsApp OTP." },
      { status: 503 }
    );
  }

  const bridged = await bridgeToSupabaseSession(phone);
  if ("error" in bridged) {
    return NextResponse.json({ success: false, error: bridged.error }, { status: 502 });
  }

  const dbUser = await resolveDbUser({ id: bridged.authUserId, phone });
  return NextResponse.json({ success: true, mock: false, user: { id: dbUser.id, phone: dbUser.phone } });
}
