import { prisma, type User } from "@vedicneev/db";

export interface AuthenticatedIdentity {
  /** Supabase auth.users.id (UUID) for this session. */
  id: string;
  /** Raw digits, matching User.phone's existing convention. */
  phone: string;
}

/**
 * Duplicated from apps/web/src/lib/auth/resolveDbUser.ts (same per-app
 * duplication convention as src/lib/supabase/env.ts) — maps a
 * Supabase-authenticated identity to this app's Postgres User row. Every
 * VedicNeev account created after Supabase-auth linkage shipped has
 * User.id === its Supabase auth uid; a "legacy" row created by the
 * original phone-only sync keeps its old cuid instead, so phone is the
 * fallback lookup rather than the primary one. See that file's own
 * comment for the full three-case rationale — this must stay logically
 * identical to it, since both apps read/write the same `users` table.
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
