import { NextResponse, type NextRequest } from "next/server";
// Edge-Runtime-safe subpath — see apps/web/middleware.ts's identical note
// and packages/auth/src/edge.ts.
import { getSupabaseSessionForMiddleware } from "@vedicneev/auth/edge";

// /login itself, plus the two API routes that ARE the login mechanism —
// an unauthenticated visitor must be able to reach these to become
// authenticated at all. Missing this exemption sends an unauthenticated
// POST to /api/auth/whatsapp/send-otp through a 307 redirect to /login,
// which only handles GET — landing as a 405 "INVALID_REQUEST_METHOD"
// instead of ever calling the OTP route, which is exactly what broke the
// live login flow.
const PUBLIC_PATHS = new Set(["/login", "/api/auth/whatsapp/send-otp", "/api/auth/whatsapp/verify-otp"]);

/**
 * Edge-runtime gate for the whole app — mirrors apps/web/middleware.ts's
 * split between a fast, DB-free check here and a real DB-backed one
 * downstream: this can only confirm a Supabase session EXISTS (Prisma
 * isn't available on the Edge runtime), not that it belongs to an
 * InstituteAdmin. The actual authorization happens in
 * app/(protected)/layout.tsx via src/lib/institute/session.ts's
 * getInstituteSession, which every request under (protected) passes
 * through after this middleware lets it by.
 *
 * getSupabaseSessionForMiddleware (packages/auth) is the same
 * refresh-a-near-expiry-session implementation apps/web/middleware.ts
 * uses, just also handing back the resolved user so this app can make its
 * own redirect decision on top.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await getSupabaseSessionForMiddleware(request);

  if (!user && !PUBLIC_PATHS.has(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Same static-asset/image exclusion apps/web/middleware.ts uses.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
