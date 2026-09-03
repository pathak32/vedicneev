import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin/session";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/admin/login"]);

/**
 * Gates the whole /admin UI and /api/admin/* route tree behind the signed
 * session cookie from src/lib/admin/session.ts. Runs before any page/route
 * code, so a missing/invalid session never even reaches a page component —
 * this is the actual enforcement point, not just a UI redirect.
 */
export async function middleware(request: NextRequest) {
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

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
