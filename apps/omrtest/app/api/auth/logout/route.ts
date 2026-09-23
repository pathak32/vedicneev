import { NextResponse } from "next/server";

import { createSupabaseServerClient, isSupabaseAuthConfigured } from "@vedicneev/auth";

import { clearInstitutePartnerFlag } from "@/lib/institute/partnerFlag";

// Mutates the Supabase session cookie (via auth.signOut()) and the
// vn_institute_admin flag cookie — never cache or statically collect this
// route, and it must be a Route Handler (not a Server Component) since
// only Route Handlers/Server Actions/middleware may write cookies at all
// (see createSupabaseServerClient's own comment).
export const dynamic = "force-dynamic";

export async function POST() {
  if (isSupabaseAuthConfigured()) {
    const supabase = createSupabaseServerClient();
    // Invalidates the session server-side (not just a client-side state
    // clear) and, via createSupabaseServerClient's cookie adapter, deletes
    // the session cookie from this response — without this, a signed-out
    // browser could still be replayed with the old cookie.
    await supabase?.auth.signOut();
  }

  const response = NextResponse.json({ success: true });
  // The flag only ever means "authenticated here" — apps/web's header reads
  // it to decide the partner-login link target, so it must be cleared too,
  // or a signed-out admin's next vedicneev.com page view would still show
  // them as a signed-in institute partner.
  clearInstitutePartnerFlag(response.cookies);
  return response;
}
