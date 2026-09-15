import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedSupabaseUserId, getInstituteSession, resolvePostLoginRedirect } from "@/lib/institute/session";
import { setInstitutePartnerFlag } from "@/lib/institute/partnerFlag";

/**
 * Lands here right after a Supabase session exists on this domain — either
 * from an OTP verified on apps/web (the shared-domain cookie already
 * carries it here) or, once this app grows its own OTP UI, from a login
 * completed directly on omrtest.vedicneev.com. This route is the single
 * place that: (1) checks whether that session is already a fully onboarded
 * InstituteAdmin, (2) sets the vn_institute_admin flag cookie so apps/web's
 * header immediately reflects it on the visitor's next vedicneev.com page
 * view, and (3) redirects to the right next page — the "partner login
 * redirection logic" this Phase 1 pass delivers.
 *
 * Three distinct outcomes, not two: no Supabase session at all -> back to
 * /login (the person never actually authenticated); a session that IS an
 * InstituteAdmin -> onward to /dashboard (or `next`); a session that
 * exists but has no InstituteAdmin row yet -> /onboarding, since that's a
 * legitimate mid-signup state, not a failed login, and must not be bounced
 * to /login as if it were.
 */
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");

  const userId = await getAuthenticatedSupabaseUserId();
  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await getInstituteSession();
  const redirectUrl = new URL(resolvePostLoginRedirect(Boolean(session), next), request.url);
  const response = NextResponse.redirect(redirectUrl);

  // The flag only ever means "authenticated" here, not "fully onboarded" —
  // apps/web's header only uses it to pick a link target (dashboard vs
  // login), and sending an unboarded admin back to omrtest at all is
  // already correct regardless of which page they land on first.
  setInstitutePartnerFlag(response.cookies);
  return response;
}
