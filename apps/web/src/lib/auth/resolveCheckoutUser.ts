import { prisma } from "@vedicneev/db";

import { isSupabaseAuthConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toAppPhone } from "./phoneFormat";
import { resolveDbUser } from "./resolveDbUser";

export type ResolveUserResult = { ok: true; user: { id: string } } | { ok: false; status: number; error: string };

/**
 * Resolves the real DB user behind a storefront request — the exact
 * dual-path pattern (Supabase session first, else a phone-trusting
 * fallback) already established in
 * app/api/razorpay/verify-payment/route.ts, shared here since checkout,
 * the library, and bootcamp-start all need the identical resolution.
 *
 * `createIfMissing` controls whether an unrecognized phone should be
 * upserted into a new User row (true for checkout — paying can create an
 * account) or just looked up (false for read-only routes like
 * /api/library, so viewing a library never silently creates a user).
 */
export async function resolveCheckoutUser(phone: string | undefined, createIfMissing: boolean): Promise<ResolveUserResult> {
  if (isSupabaseAuthConfigured()) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user: authUser },
      error: authError,
    } = supabase ? await supabase.auth.getUser() : { data: { user: null }, error: null };

    if (!supabase || authError || !authUser) {
      return { ok: false, status: 401, error: "Not authenticated." };
    }
    if (!authUser.phone) {
      return { ok: false, status: 400, error: "Signed-in user has no verified phone." };
    }
    const dbUser = await resolveDbUser({ id: authUser.id, phone: toAppPhone(authUser.phone) });
    return { ok: true, user: { id: dbUser.id } };
  }

  if (!phone) {
    return { ok: false, status: 400, error: "phone is required." };
  }

  if (createIfMissing) {
    const dbUser = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone, phoneVerifiedAt: new Date(), role: "PARENT" },
    });
    return { ok: true, user: { id: dbUser.id } };
  }

  const dbUser = await prisma.user.findUnique({ where: { phone } });
  if (!dbUser) return { ok: false, status: 404, error: "No account found for this phone." };
  return { ok: true, user: { id: dbUser.id } };
}
