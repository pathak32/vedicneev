import { NextResponse, type NextRequest } from "next/server";
// Edge-Runtime-safe subpath — the bare "@vedicneev/auth" barrel also
// re-exports Node-only code (otpCrypto's `crypto` import, Prisma via
// resolveDbUser/whatsappOtp) that middleware.ts, always Edge-run, can't
// load. See packages/auth/src/edge.ts.
import { refreshSupabaseSession } from "@vedicneev/auth/edge";

import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin/session";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/admin/login"]);

/**
 * Gates the whole /admin UI and /api/admin/* route tree behind the signed
 * session cookie from src/lib/admin/session.ts. Runs before any page/route
 * code, so a missing/invalid session never even reaches a page component —
 * this is the actual enforcement point, not just a UI redirect.
 */
async function handleAdminGate(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (await isValidSessionToken(token)) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return handleAdminGate(request);
  }
  return refreshSupabaseSession(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    // Supabase session refresh for everything else, excluding static
    // assets/images (the standard @supabase/ssr example matcher),
    // /api/exam/submit, and /api/whatsapp/webhook. exam/submit needs no
    // Supabase-cookie refresh (it authenticates by phone in its own body,
    // not a Supabase session) and refreshSupabaseSession's
    // `NextResponse.next({ request })` re-wraps the request in a way that
    // can consume/drop a POST body before it reaches the route handler —
    // see the empty-body guard added to app/api/exam/submit/route.ts,
    // which this exclusion stops from being needed in the first place.
    // whatsapp/webhook must be excluded too: Meta's GET verification
    // handshake and every inbound POST were routing through this
    // middleware first, which made an outbound Supabase auth.getUser()
    // network call before the route ever ran — adding latency and a new
    // failure mode ahead of a handler that has nothing to do with
    // Supabase sessions, and a plausible cause of Meta's dashboard
    // reporting "callback URL or verify token couldn't be validated"
    // (a slow/failed Supabase call delaying or breaking the response).
    "/((?!_next/static|_next/image|favicon.ico|api/exam/submit|api/whatsapp/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
