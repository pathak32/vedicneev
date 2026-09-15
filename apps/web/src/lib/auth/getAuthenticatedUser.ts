import type { User } from "@vedicneev/db";
import { createSupabaseServerClient, resolveDbUser } from "@vedicneev/auth";

/**
 * The student-facing counterpart to admin/user.ts's getAuthenticatedAdmin —
 * verifies the request's real Supabase Auth session cookie (never a
 * client-supplied phone/id, unlike resolveCheckoutUser) and maps it to this
 * app's Postgres User row via the same resolveDbUser identity resolution
 * whatsappOtpServer.ts's login flow already relies on, so this can never
 * create a duplicate account for someone who signed in before Supabase Auth
 * was wired up. Returns null for a missing/invalid session, or a session
 * whose phone claim is empty (shouldn't happen for a phone-OTP account, but
 * checked rather than assumed).
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const phone = data.user.phone;
  if (!phone) return null;

  return resolveDbUser({ id: data.user.id, phone });
}
