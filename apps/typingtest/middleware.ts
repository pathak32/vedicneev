import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseCookieOptions, getSupabasePublicConfig } from "@/lib/supabase/env";

// Unlike apps/omrtest (B2B-only, every route gated), this is a
// consumer-freemium product: the catalog and exam detail pages must stay
// browsable by a signed-out visitor so freemium/paid intent is obvious
// before anyone is forced through a login wall. Only starting/submitting a
// test, the dashboard, and the leaderboard require a session.
// "/hi" covers every Hindi-URL twin (blog/faq/legal) under one prefix
// rather than listing each pair individually — none of those pages need
// auth, matching their English counterparts below.
const PUBLIC_PATH_PREFIXES = ["/login", "/exams", "/blog", "/faq", "/privacy", "/terms", "/disclaimer", "/hi"];
// /sitemap.xml and /robots.txt (app/sitemap.ts, app/robots.ts) need their
// own exact-match exemption, same reasoning as "/" — Googlebot fetches
// both anonymously, and without this it gets a 307 to /login instead of
// the actual file, silently breaking indexing rather than erroring loudly.
const PUBLIC_EXACT_PATHS = new Set(["/", "/sitemap.xml", "/robots.txt"]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Edge-runtime gate — mirrors apps/omrtest/middleware.ts's split between a
 * fast, DB-free check here (Prisma isn't available on the Edge runtime)
 * and this app's own DB-backed resolution (src/lib/supabase/server.ts's
 * getAuthenticatedUserId, called from each protected route/page). This can
 * only confirm a Supabase session EXISTS, not that a matching User row
 * does — that's fine here since every code path that needs a real User.id
 * resolves/creates it on demand rather than assuming one already exists.
 *
 * The whole /exams/ subtree passes this middleware (catalog browsing AND
 * the test-taking screen underneath it), since a slug-based prefix check
 * can't distinguish /exams/[slug] (public) from /exams/[slug]/test
 * (requires a session to submit an attempt) without hardcoding route
 * shapes here. /exams/[slug]/test and /exams/[slug]/logic instead check
 * their own session server-side in the page component and redirect to
 * /login themselves; this middleware only gates the sections that are
 * uniformly protected end-to-end (dashboard, leaderboard, results, the
 * api/attempts routes).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const config = getSupabasePublicConfig();

  if (!config) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(config.url, config.anonKey, {
    cookieOptions: getSupabaseCookieOptions(),
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
