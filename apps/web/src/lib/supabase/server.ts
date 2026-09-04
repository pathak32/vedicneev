import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "./env";

/**
 * Supabase client for Server Components and Route Handlers, backed by the
 * request's cookie jar — @supabase/ssr's documented App Router pattern
 * (getAll/setAll, not the older per-cookie get/set/remove API). Uses the
 * anon key only: this client acts AS the currently signed-in user (via
 * their session cookie), never with elevated privileges — see admin.ts for
 * the service-role client that can act on arbitrary users.
 *
 * `cookies().set()` throws when called from a Server Component (only
 * Route Handlers, Server Actions, and Middleware may mutate cookies) — the
 * try/catch below is what @supabase/ssr's own docs prescribe for that
 * case; apps/web/middleware.ts is what actually refreshes/persists a
 * near-expiry session for Server Components that only ever read cookies.
 *
 * Returns null when NEXT_PUBLIC_SUPABASE_URL/ANON_KEY aren't set, so every
 * caller can fall back to this project's existing mock-auth path instead
 * of crashing on a missing config (the same pattern razorpayServer.ts and
 * the WhatsApp send-report route already use for their own credentials).
 */
export function createSupabaseServerClient(): SupabaseClient | null {
  const config = getSupabasePublicConfig();
  if (!config) return null;

  const cookieStore = cookies();

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — no-op; middleware handles refresh.
        }
      },
    },
  });
}
