import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseCookieOptions, getSupabasePublicConfig } from "./env";

/**
 * Mirrors apps/omrtest/src/lib/supabase/server.ts exactly — acts as
 * whichever user the shared-domain session cookie belongs to, anon key
 * only. This is how a session established via apps/web's WhatsApp OTP
 * login is read back here: the cookie itself crosses the subdomain
 * boundary via getSupabaseCookieOptions' shared domain, this client just
 * reads it.
 */
export function createSupabaseServerClient(): SupabaseClient | null {
  const config = getSupabasePublicConfig();
  if (!config) return null;

  const cookieStore = cookies();

  return createServerClient(config.url, config.anonKey, {
    cookieOptions: getSupabaseCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — no-op; middleware.ts handles refresh.
        }
      },
    },
  });
}

/**
 * Returns the signed-in VedicNeev User.id (Prisma users.id) for the
 * current request, resolving/linking it via resolveDbUser.ts exactly like
 * apps/web does — see that file for why a simple id-only lookup isn't
 * enough (legacy pre-Supabase-auth rows keep their original cuid). Null
 * only when there's no Supabase session at all.
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.phone) return null;

  const { toAppPhone } = await import("../auth/phoneFormat");
  const { resolveDbUser } = await import("../auth/resolveDbUser");
  const dbUser = await resolveDbUser({ id: user.id, phone: toAppPhone(user.phone) });
  return dbUser.id;
}
