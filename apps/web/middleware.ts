import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin/session";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

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

/**
 * Refreshes a near-expiry Supabase session and re-writes its cookies onto
 * the response — required by @supabase/ssr so Server Components (which
 * can only read cookies, never set them) never see a stale session; the
 * actual token refresh only happens here. A no-op (no Supabase network
 * call at all) when NEXT_PUBLIC_SUPABASE_URL/ANON_KEY aren't configured,
 * matching this app's mock-auth fallback everywhere else.
 */
async function refreshSupabaseSession(request: NextRequest): Promise<NextResponse> {
  const config = getSupabasePublicConfig();
  if (!config) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Triggers a refresh (and, via setAll above, new cookies on `response`)
  // when the session is expired or near-expiry; a no-op otherwise.
  await supabase.auth.getUser();
  return response;
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
    // assets/images — the standard @supabase/ssr example matcher.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
