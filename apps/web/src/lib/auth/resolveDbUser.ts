import { prisma, type User } from "@vedicneev/db";

export interface AuthenticatedIdentity {
  /** Supabase auth.users.id (UUID) for this session. */
  id: string;
  /** Raw digits, matching User.phone's existing convention. */
  phone: string;
}

/**
 * Maps a Supabase-authenticated identity to this app's Postgres User row.
 * Three cases, in order:
 *
 * 1. Already linked — a User row with id === identity.id exists (created
 *    by this same function on an earlier sign-in). Return it as-is.
 * 2. Legacy row — no row has this id, but one already has this phone
 *    (created by the pre-Supabase-auth code: the original phone-only
 *    /api/auth/sync upsert, or the phone-trusting fallback branch of
 *    verify-payment). That's the same real person; keep their existing
 *    cuid id as the app-level identity rather than creating a duplicate
 *    row under the new Supabase id — every other table's FK (Subscription,
 *    TestSession, MistakeVault, OfflineMockSession) already points at that
 *    cuid, and phone is @unique so inserting a second row with the same
 *    phone under a different id would throw a P2002 constraint violation.
 * 3. Genuinely new — create a fresh row keyed by the Supabase auth id, so
 *    every real sign-in from now on is a proper Supabase-linked identity.
 */
export async function resolveDbUser(identity: AuthenticatedIdentity): Promise<User> {
  const byId = await prisma.user.findUnique({ where: { id: identity.id } });
  if (byId) return byId;

  const byPhone = await prisma.user.findUnique({ where: { phone: identity.phone } });
  if (byPhone) return byPhone;

  return prisma.user.create({
    data: {
      id: identity.id,
      phone: identity.phone,
      phoneVerifiedAt: new Date(),
      role: "PARENT",
    },
  });
}
