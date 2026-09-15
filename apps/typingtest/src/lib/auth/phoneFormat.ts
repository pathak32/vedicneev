/**
 * Duplicated from apps/web/src/lib/auth/phoneFormat.ts (same per-app
 * duplication convention as src/lib/supabase/env.ts) — User.phone is raw
 * 10-digit Indian mobile digits with no country code (e.g. "9876543210"),
 * while Supabase Auth stores user.phone as E.164 digits with no leading
 * '+' (e.g. "919876543210").
 */
export function toAppPhone(supabasePhoneDigits: string): string {
  return supabasePhoneDigits.replace(/^91/, "");
}
