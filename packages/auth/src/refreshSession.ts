import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

import { getSupabaseCookieOptions, getSupabasePublicConfig } from "./env";

export interface MiddlewareSessionResult {
  response: NextResponse;
  /** null when no Supabase project is configured OR no session cookie is present/valid. */
  user: User | null;
}

/**
 * Refreshes a near-expiry Supabase session (re-writing its cookies onto the
 * response — required by @supabase/ssr so Server Components, which can
 * only read cookies, never see a stale session) and returns the resulting
 * user alongside it. Meant to run from middleware.ts, the one place both
 * apps/web and apps/omrtest are allowed to mutate cookies ahead of a page
 * render.
 *
 * A no-op (no Supabase network call, user: null) when
 * NEXT_PUBLIC_SUPABASE_URL/ANON_KEY aren't configured, matching this
 * project's mock-auth fallback everywhere else.
 *
 * Two exports share this one implementation: apps/web's middleware.ts only
 * needs the refreshed response (see refreshSupabaseSession below), while
 * apps/omrtest's also needs to know whether a session exists at all, to
 * redirect an unauthenticated visitor to /login — see
 * getSupabaseSessionForMiddleware.
 */
async function runMiddlewareRefresh(request: NextRequest): Promise<MiddlewareSessionResult> {
  const config = getSupabasePublicConfig();
  if (!config) return { response: NextResponse.next(), user: null };

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

  // Triggers a refresh (and, via setAll above, new cookies on `response`)
  // when the session is expired or near-expiry; a no-op otherwise.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

/** apps/web/middleware.ts: refresh-only, no gating decision needed here. */
export async function refreshSupabaseSession(request: NextRequest): Promise<NextResponse> {
  const { response } = await runMiddlewareRefresh(request);
  return response;
}

/** apps/omrtest/middleware.ts: needs the user too, to redirect when absent. */
export async function getSupabaseSessionForMiddleware(request: NextRequest): Promise<MiddlewareSessionResult> {
  return runMiddlewareRefresh(request);
}
