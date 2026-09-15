/**
 * Same Supabase config + cookie-sharing contract as
 * apps/web/src/lib/supabase/env.ts and apps/omrtest/src/lib/supabase/env.ts
 * — kept as an intentional duplicate rather than a shared import, since
 * these are separate Next.js builds/deployments (no shared runtime package
 * for app-local config exists yet; only packages/db and packages/engine are
 * actually shared). If this drifts out of sync with the other apps' copies
 * in a way that matters, that's the signal to extract all three into a real
 * shared package.
 *
 * NEXT_PUBLIC_SUPABASE_URL/ANON_KEY and NEXT_PUBLIC_COOKIE_DOMAIN must be
 * set to the SAME values as apps/web's — same Supabase project, same
 * leading-dot parent domain — for a session established via apps/web's
 * WhatsApp OTP login to be recognized here.
 */
export function isSupabaseAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export function getSupabaseCookieOptions(): { domain?: string; sameSite: "lax"; secure: boolean } {
  const domain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined;
  return {
    domain,
    sameSite: "lax",
    secure: Boolean(domain),
  };
}
