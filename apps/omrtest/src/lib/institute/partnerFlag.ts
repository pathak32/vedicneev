/**
 * Mirrors apps/web/src/lib/institute/partnerFlag.ts — same cookie name and
 * shared-domain scoping, kept in sync manually (see supabase/env.ts's
 * comment on why these two apps don't share a runtime package yet). Only
 * this app ever WRITES the flag (at login/logout); apps/web only reads it.
 */
import { getSupabaseCookieOptions } from "@vedicneev/auth";

export const INSTITUTE_FLAG_COOKIE = "vn_institute_admin";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

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
