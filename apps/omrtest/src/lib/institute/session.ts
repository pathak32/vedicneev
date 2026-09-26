import { prisma, type Institute, type InstituteAdmin } from "@vedicneev/db";
import { createSupabaseServerClient, isSupabaseAuthConfigured, resolveDbUser, toAppPhone } from "@vedicneev/auth";

export interface InstituteSession {
  admin: InstituteAdmin;
  institute: Institute;
}

/**
 * The canonical Prisma User.id for the current request's Supabase session,
 * or null if there isn't one — NEVER the raw Supabase auth UUID directly.
 * Those two are only guaranteed to match for a phone whose very first-ever
 * sign-in (on any VedicNeev app) went through Supabase; a phone with a
 * pre-existing, pre-Supabase User row (resolveDbUser's "legacy row" case)
 * keeps its original id, so the Supabase auth UUID resolves to a
 * DIFFERENT row than the one InstituteAdmin.userId actually points to.
 * Every caller here (getInstituteSession's lookup, createInstitute.ts's
 * write, login/callback's redirect logic) needs the SAME id resolveDbUser
 * would produce, or an onboarding submit throws a foreign-key violation
 * that surfaces to the browser as a bare "Network error" — this bug was
 * live in production before this fix (a phone re-using a legacy row could
 * never onboard, on any submission, with no diagnosable client-side error).
 */
export async function getAuthenticatedSupabaseUserId(): Promise<string | null> {
  if (!isSupabaseAuthConfigured()) return null;

  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  // A phone-first auth session always has a phone — this is defensive, not
  // expected in practice; falling back to the raw id here is no worse than
  // this function's behavior before this fix.
  if (!user.phone) return user.id;

  const dbUser = await resolveDbUser({ id: user.id, phone: toAppPhone(user.phone) });
  return dbUser.id;
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
 * used by the login callback. `next` is untrusted (it travels through a
 * query string on a login redirect), so it's only ever honored when it's a
 * same-app relative path; anything else (an absolute URL, a `//host`
 * scheme-relative one, or missing) falls back to real-state routing
 * instead: no session -> /onboarding; a session whose Institute isn't
 * ACTIVE yet -> /onboarding/pending; otherwise -> /dashboard.
 */
export function resolvePostLoginRedirect(session: InstituteSession | null, next?: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  if (!session) return "/onboarding";
  return session.institute.status === "ACTIVE" ? "/dashboard" : "/onboarding/pending";
}
