import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { resolveSafeNext } from "@/lib/auth/crossDomainRedirect";
import { LoginPageContent } from "./LoginPageContent";

export const dynamic = "force-dynamic";

/**
 * Server Component wrapper, same reasoning as
 * apps/typingtest/app/login/page.tsx: checks the REAL Supabase session
 * cookie (getAuthenticatedUser) before any login UI renders, rather than
 * the client-side "already signed in" shortcut this page used to run as a
 * useEffect keyed off useAuthStore's `activePhone` flag.
 *
 * That flag is purely local (Zustand + localStorage, see useAuthStore.ts)
 * and can go stale independently of the real session — cleared cookies
 * without clearing localStorage, an expired/revoked session, or simply a
 * different browser/device. When it read stale-true, the old client effect
 * fired `window.location.replace(next)` on load with NO session to back
 * it up: for a cross-domain `next` (typingtest.vedicneev.com/exams/...),
 * that lands the visitor on a protected page with no real cookie, whose
 * own auth gate immediately bounces them back to *this* /login with the
 * same product=typing&next=... — which reads the same stale flag and
 * bounces them again. That round trip is the "instant bounce-back/loop"
 * typing candidates hit: the phone-entry form never gets a chance to
 * render because the effect fires (and redirects away) before they can
 * interact with it.
 *
 * A server-side check on the one real, authoritative source (the session
 * cookie itself) can't go stale like that, and removing the client
 * redirect entirely means the phone form is now the guaranteed first thing
 * a genuinely signed-out visitor sees.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; product?: string };
}) {
  const next = resolveSafeNext(searchParams.next, "https://vedicneev.com");
  const user = await getAuthenticatedUser();
  if (user) redirect(next);

  return <LoginPageContent next={next} isExternalProductIntent={searchParams.product !== undefined} />;
}
