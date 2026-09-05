import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "./env";

/**
 * Service-role Supabase client — can create/confirm arbitrary users and
 * mint sessions on their behalf, bypassing every RLS policy. Only ever
 * used server-side, only inside apps/web/app/api/auth/whatsapp-otp/route.ts,
 * to bridge a WhatsApp-delivered OTP (verified against our own PhoneOtp
 * table, not Supabase's own phone provider) into a real Supabase session:
 * this is the one place that actually needs elevated privileges — every
 * other Supabase touchpoint in this app (server.ts) acts only as the
 * already-signed-in user via their session cookie.
 *
 * Only ever import this from a Route Handler (route.ts), which Next.js
 * never bundles into client JS — SUPABASE_SERVICE_ROLE_KEY must never reach
 * the browser. Never import it from a "use client" component or a module
 * that one might import.
 *
 * Returns null when SUPABASE_SERVICE_ROLE_KEY or the public Supabase config
 * isn't set, so callers can fall back to this project's mock-auth path
 * instead of crashing — same convention as every other credential in this
 * codebase (razorpayServer.ts, WhatsApp send-report).
 */
export function createSupabaseAdminClient(): SupabaseClient | null {
  const config = getSupabasePublicConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!config || !serviceRoleKey) return null;

  return createClient(config.url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
