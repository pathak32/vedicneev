import { cookies } from "next/headers";
import { prisma, type User } from "@vedicneev/db";

import { ADMIN_SESSION_COOKIE, ADMIN_USER_PHONE, verifySessionToken } from "./session";

/**
 * The one admin account this app manages. Upserted (not just created) so
 * logging in is idempotent — the same row is reused across logins rather
 * than accumulating duplicate admin users each time ADMIN_ACCESS_KEY is
 * entered correctly.
 */
export function getOrCreateAdminUser(): Promise<User> {
  return prisma.user.upsert({
    where: { phone: ADMIN_USER_PHONE },
    update: {},
    create: {
      phone: ADMIN_USER_PHONE,
      name: "Admin",
      role: "ADMIN",
    },
  });
}

/**
 * The real, DB-backed role check behind /admin. middleware.ts (Edge
 * Runtime, no Prisma) only verifies the session cookie's signature before
 * this ever runs — by the time app/admin/(protected)/layout.tsx calls
 * this, the cookie is already known to be validly signed. This function
 * covers what middleware structurally cannot: confirming the signed
 * userId still resolves to a real User whose role is actually ADMIN.
 * Returns null if the cookie is missing/invalid, the user no longer
 * exists, or their role was changed away from ADMIN.
 */
export async function getAuthenticatedAdmin(): Promise<User | null> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const userId = await verifySessionToken(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user && user.role === "ADMIN" ? user : null;
}
