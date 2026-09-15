/**
 * A non-sensitive UX hint cookie — "does the current browser belong to a
 * signed-in InstituteAdmin" — read by SiteHeader.tsx to decide whether its
 * "For Institutes" link should point at omrtest.vedicneev.com's login page
 * or straight to its dashboard, without SiteHeader (a client component
 * rendered on every vedicneev.com page) needing a Prisma round-trip just to
 * pick a link target.
 *
 * Deliberately NOT the session itself and NOT httpOnly: it carries no
 * identity, just "1"/absent, so a client component can read it via
 * document.cookie. The real authorization check (is this Supabase session
 * actually linked to an InstituteAdmin row) always happens server-side on
 * omrtest.vedicneev.com — see that app's src/lib/institute/session.ts. This
 * flag can go stale (e.g. a session expires without the flag being
 * cleared) with no security consequence, since the destination page
 * re-checks the real session regardless of which link routed the visitor
 * there.
 *
 * Scoped to NEXT_PUBLIC_COOKIE_DOMAIN (".vedicneev.com") — the same shared
 * domain as the Supabase session cookies, via getSupabaseCookieOptions —
 * so a flag set at institute login on omrtest.vedicneev.com is readable
 * back here on vedicneev.com.
 */
import { getSupabaseCookieOptions } from "@vedicneev/auth";

export const INSTITUTE_FLAG_COOKIE = "vn_institute_admin";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Cookie-store-agnostic: works with a Route Handler's NextResponse.cookies or ResponseCookies. */
interface WritableCookieJar {
  set(name: string, value: string, options: Record<string, unknown>): void;
}

export function setInstitutePartnerFlag(cookies: WritableCookieJar): void {
  cookies.set(INSTITUTE_FLAG_COOKIE, "1", {
    ...getSupabaseCookieOptions(),
    httpOnly: false,
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}

export function clearInstitutePartnerFlag(cookies: WritableCookieJar): void {
  cookies.set(INSTITUTE_FLAG_COOKIE, "", {
    ...getSupabaseCookieOptions(),
    httpOnly: false,
    path: "/",
    maxAge: 0,
  });
}

/** Client-side read via document.cookie — see SiteHeader.tsx. */
export function readInstitutePartnerFlagFromDocument(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((entry) => entry === `${INSTITUTE_FLAG_COOKIE}=1`);
}
