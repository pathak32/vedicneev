import { prisma, type Institute, type InstituteAdmin } from "@vedicneev/db";
import { createSupabaseServerClient, isSupabaseAuthConfigured } from "@vedicneev/auth";

export interface InstituteSession {
  admin: InstituteAdmin;
  institute: Institute;
}

/** The Supabase auth user id for the current request's session, or null if there isn't one. */
export async function getAuthenticatedSupabaseUserId(): Promise<string | null> {
  if (!isSupabaseAuthConfigured()) return null;

  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * The real, DB-backed authorization check — Prisma isn't reachable from
 * middleware.ts's Edge runtime, so that layer can only confirm a Supabase
 * session exists (see middleware.ts); this is what actually confirms that
 * session belongs to an InstituteAdmin, meant to run from a Node-runtime
 * Server Component (app/(protected)/layout.tsx) on every protected render,
 * same split apps/web's /admin panel already uses between middleware.ts's
 * signature-only gate and its own DB-backed layout check.
 *
 * Returns null for both "no Supabase session" and "session exists but this
 * user has no InstituteAdmin row yet" — app/(protected)/layout.tsx sends
 * either case to /login, since it can't distinguish them without extra
 * queries it doesn't need. login/callback/route.ts, which DOES need to
 * distinguish "not authenticated" from "authenticated but not yet
 * onboarded" (to route the latter to /onboarding instead of /login), calls
 * getAuthenticatedSupabaseUserId directly rather than through here.
 */
export async function getInstituteSession(): Promise<InstituteSession | null> {
  const userId = await getAuthenticatedSupabaseUserId();
  if (!userId) return null;

  const admin = await prisma.instituteAdmin.findUnique({
    where: { userId },
    include: { institute: true },
  });
  if (!admin) return null;

  return { admin, institute: admin.institute };
}

/**
 * Where to send an InstituteAdmin right after their session is confirmed —
 * shared by the login callback and the protected layout's redirect. `next`
 * is untrusted (it travels through a query string on a login redirect), so
 * it's only ever honored when it's a same-app relative path; anything else
 * (an absolute URL, a `//host` scheme-relative one, or missing) falls back
 * to onboarding-vs-dashboard based on real state instead.
 */
export function resolvePostLoginRedirect(isOnboarded: boolean, next?: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return isOnboarded ? "/dashboard" : "/onboarding";
}
