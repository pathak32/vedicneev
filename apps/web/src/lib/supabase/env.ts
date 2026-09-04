/**
 * Shared "is a real Supabase project configured" check, used by every
 * Supabase-touching module (browser client, server client, admin client,
 * middleware) so they all agree on the same condition — matching the
 * mock-fallback convention already established for Razorpay
 * (razorpayServer.ts) and WhatsApp (app/api/whatsapp/send-report):
 * unset env vars mean local/demo dev without live credentials, not a
 * broken deployment.
 */
export function isSupabaseAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}
