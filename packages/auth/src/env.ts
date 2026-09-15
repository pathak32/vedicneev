/**
 * Shared "is a real Supabase project configured" check plus the
 * cookie-sharing contract, used by every Supabase touchpoint in both
 * apps/web and apps/omrtest (browser code, server/admin clients,
 * middleware) so they all agree on the same conditions — matching the
 * mock-fallback convention already established for Razorpay
 * (razorpayServer.ts) and WhatsApp (send-report): unset env vars mean
 * local/demo dev without live credentials, not a broken deployment.
 *
 * Extracted from apps/web (originally src/lib/supabase/env.ts) into this
 * shared package so apps/omrtest can read the exact same config instead of
 * maintaining a second copy that could drift — see whatsappOtp.ts's own
 * comment for why the OTP bridge needed to move here too.
 */
export function isSupabaseAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

/**
 * `@supabase/ssr`'s per-cookie options. NEXT_PUBLIC_COOKIE_DOMAIN must be a
 * leading-dot parent domain (".vedicneev.com", never a bare subdomain
 * host) set identically on both the apps/web and apps/omrtest deployments
 * — that shared value is what makes a session cookie set on either
 * subdomain readable on the other. Left unset in local dev on purpose: a
 * Domain attribute doesn't work sensibly against "localhost", so omitting
 * it just falls back to normal host-only cookies there.
 */
export function getSupabaseCookieOptions(): { domain?: string; sameSite: "lax"; secure: boolean } {
  const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined;
  return {
    domain,
    sameSite: "lax",
    // Domain-scoped cookies are only ever sent to real deployed
    // subdomains, never a plain-HTTP localhost, so Secure is safe to force
    // on whenever a domain is actually configured.
    secure: Boolean(domain),
  };
}
