import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";
import { formatWhatsAppOtpPayload, validateWhatsAppPayload } from "@vedicneev/engine";

import { generateOtpCode, hashOtpCode, otpCodeMatches } from "@/lib/auth/otpCrypto";
import { toSupabasePhoneDigits } from "@/lib/auth/phoneFormat";
import { resolveDbUser } from "@/lib/auth/resolveDbUser";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";

/**
 * WhatsApp-delivered OTP login — a from-scratch mechanism (own PhoneOtp
 * table, own hashing/expiry/attempt-limiting), not Supabase's built-in
 * phone provider, since that only delivers via a paid third-party SMS
 * gateway (Twilio/MSG91/etc.) this project isn't using. Delivery reuses
 * the exact WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID credentials
 * already configured for apps/web/app/api/whatsapp/send-report/route.ts.
 *
 * On a verified code, bridges into a real Supabase session (when a
 * Supabase project is configured) via the service-role Admin API — see
 * bridgeToSupabaseSession below for exactly how and why. When Supabase
 * isn't configured, falls back to a plain phone-keyed User upsert, the
 * same demo-mode convention every other integration in this codebase uses
 * (razorpayServer.ts, the WhatsApp report route) so local/demo dev keeps
 * working without live credentials.
 */
export const dynamic = "force-dynamic";

const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;
const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 30;
const GRAPH_API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";
const OTP_TEMPLATE_NAME = process.env.WHATSAPP_OTP_TEMPLATE_NAME || "otp_login";

function toE164(phone: string): string {
  return `+91${phone}`;
}

/**
 * A deterministic, never-delivered "email" used only as the identity field
 * Supabase's magic-link Admin API requires — this app is phone-first and
 * has no real email for these users. Never written to Prisma's User.email
 * (that column is for a real address); purely an internal Supabase Auth
 * implementation detail, recomputed from phone on every login rather than
 * looked up, so no phone -> Supabase-user mapping needs to be stored
 * anywhere but our own User.id (see resolveDbUser.ts).
 */
function syntheticSupabaseEmail(phone: string): string {
  return `phone-91${phone}@phone.internal.vedicneev.com`;
}

interface RequestBody {
  action?: "send" | "verify";
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

  if (body.action === "send") return handleSend(phone);
  if (body.action === "verify") return handleVerify(phone, body.code);
  return NextResponse.json({ success: false, error: 'action must be "send" or "verify".' }, { status: 400 });
}

async function handleSend(phone: string): Promise<NextResponse> {
  const recent = await prisma.phoneOtp.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });
  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_SECONDS * 1000) {
    return NextResponse.json(
      { success: false, error: `Please wait a moment before requesting another code.` },
      { status: 429 }
    );
  }

  const code = generateOtpCode();
  await prisma.phoneOtp.create({
    data: {
      phone,
      codeHash: hashOtpCode(code, phone),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  const payload = formatWhatsAppOtpPayload(code, toE164(phone), OTP_TEMPLATE_NAME);
  const validation = validateWhatsAppPayload(payload);
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: validation.errors.join(" ") }, { status: 500 });
  }

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    // eslint-disable-next-line no-console
    console.info(`[mock WhatsApp OTP] Code for +91${phone}: ${code} (no WhatsApp credentials configured)`);
    return NextResponse.json({ success: true, mock: true });
  }

  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { success: false, mock: false, error: data?.error?.message ?? "WhatsApp API error." },
        { status: 502 }
      );
    }
    return NextResponse.json({ success: true, mock: false });
  } catch (error) {
    return NextResponse.json(
      { success: false, mock: false, error: error instanceof Error ? error.message : "Failed to send." },
      { status: 502 }
    );
  }
}

async function handleVerify(phone: string, code: string | undefined): Promise<NextResponse> {
  if (!code) {
    return NextResponse.json({ success: false, error: "code is required." }, { status: 400 });
  }

  const pending = await prisma.phoneOtp.findFirst({
    where: { phone, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!pending) {
    return NextResponse.json({ success: false, error: "No pending code for this number. Request a new OTP." }, { status: 400 });
  }
  if (pending.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ success: false, error: "This code has expired. Request a new OTP." }, { status: 400 });
  }
  if (pending.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ success: false, error: "Too many incorrect attempts. Request a new OTP." }, { status: 429 });
  }

  if (!otpCodeMatches(code, phone, pending.codeHash)) {
    await prisma.phoneOtp.update({ where: { id: pending.id }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ success: false, error: "Incorrect OTP." }, { status: 400 });
  }

  await prisma.phoneOtp.update({ where: { id: pending.id }, data: { consumedAt: new Date() } });

  if (!isSupabaseAuthConfigured()) {
    // No Supabase project configured — same phone-only upsert
    // apps/web/app/api/auth/sync/route.ts already does, so local/demo dev
    // keeps working without live credentials.
    const user = await prisma.user.upsert({
      where: { phone },
      update: { phoneVerifiedAt: new Date() },
      create: { phone, phoneVerifiedAt: new Date(), role: "PARENT" },
    });
    return NextResponse.json({ success: true, mock: true, user: { id: user.id, phone: user.phone } });
  }

  const bridged = await bridgeToSupabaseSession(phone);
  if ("error" in bridged) {
    return NextResponse.json({ success: false, error: bridged.error }, { status: 502 });
  }

  const dbUser = await resolveDbUser({ id: bridged.authUserId, phone });
  return NextResponse.json({ success: true, mock: false, user: { id: dbUser.id, phone: dbUser.phone } });
}

type BridgeResult = { authUserId: string } | { error: string };

/**
 * Turns a WhatsApp-verified phone number into a real Supabase session,
 * using the service-role Admin API (Supabase's phone provider can't verify
 * a code it didn't itself issue, so supabase.auth.verifyOtp isn't usable
 * here — this is the documented alternative: admin-generate a magic-link
 * token, then redeem it through a cookie-aware server client so the
 * resulting sb-access-token/sb-refresh-token cookies land on THIS route's
 * response automatically):
 *
 * 1. admin.createUser — ensures a Supabase auth user exists for this phone
 *    (idempotent; "already registered" is expected and ignored on repeat
 *    logins, since generateLink doesn't require creating the user itself
 *    for an existing one).
 * 2. admin.generateLink({ type: "magiclink" }) — mints a one-time
 *    hashed_token for that identity, without emailing anything (the
 *    "email" here is the synthetic, never-delivered address from
 *    syntheticSupabaseEmail; nothing is sent to it).
 * 3. A regular (anon-key) server client redeems that token via
 *    auth.verifyOtp({ token_hash, type: "magiclink" }) — Supabase's normal
 *    session-issuing path, so cookies get set exactly as they would for
 *    any real magic-link sign-in.
 */
async function bridgeToSupabaseSession(phone: string): Promise<BridgeResult> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is not configured on the server." };
  }

  const email = syntheticSupabaseEmail(phone);

  const { error: createError } = await adminClient.auth.admin.createUser({
    phone: toSupabasePhoneDigits(phone),
    email,
    phone_confirm: true,
    email_confirm: true,
  });
  // Idempotent: an existing user for this phone/email is the expected case
  // on every login after the first, not a real failure.
  if (createError && !/already been registered|already exists/i.test(createError.message)) {
    return { error: `Could not provision the Supabase user: ${createError.message}` };
  }

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError || !linkData?.properties?.hashed_token) {
    return { error: `Could not mint a session token: ${linkError?.message ?? "no hashed_token returned"}` };
  }

  const serverClient = createSupabaseServerClient();
  if (!serverClient) {
    return { error: "Supabase server client unavailable." };
  }

  const { data: verifyData, error: verifyError } = await serverClient.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "magiclink",
  });
  if (verifyError || !verifyData.user) {
    return { error: `Could not establish a session: ${verifyError?.message ?? "no user returned"}` };
  }

  return { authUserId: verifyData.user.id };
}
