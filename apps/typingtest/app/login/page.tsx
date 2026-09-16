import { redirect } from "next/navigation";

import { getAuthenticatedUserId } from "@/lib/supabase/server";
import { LoginRedirectCard } from "@/components/auth/LoginRedirectCard";

export const dynamic = "force-dynamic";

/**
 * `next` is an attacker-controllable query param — unlike apps/web's own
 * /login (which legitimately needs to redirect to an absolute URL on a
 * sibling subdomain for the cross-app handoff, guarded by
 * crossDomainRedirect.ts's allowlist), this page's `next` only ever needs
 * to point somewhere within typingtest.vedicneev.com itself. Rejecting
 * anything that isn't a same-app relative path — including a
 * protocol-relative "//evil.example" a browser would still treat as
 * off-site — closes what would otherwise be an open redirect straight out
 * of a real, freshly-verified session.
 */
function safeLocalNext(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

/**
 * Sign-in for typingtest.vedicneev.com is a shared VedicNeev account, not a
 * separate system — the actual WhatsApp OTP flow lives only in apps/web
 * (src/lib/auth/whatsappOtpServer.ts + useAuthStore), and its session
 * cookie is shared across subdomains via NEXT_PUBLIC_COOKIE_DOMAIN (see
 * src/lib/supabase/env.ts).
 *
 * This is a Server Component specifically so the ".vedicneev.com" session
 * cookie can be checked server-side (getAuthenticatedUserId, the same
 * check every other protected page/route in this app already uses) BEFORE
 * any login UI ever renders — a visitor who already has a valid shared
 * session (e.g. signed in on vedicneev.com/omrtest.vedicneev.com earlier,
 * or just finished the round trip below) is redirected straight to `next`
 * with no flash of a login screen and no manual click required. This
 * reuses the one authoritative check every other protected page/route in
 * this app already relies on, rather than a second, parallel client-side
 * mechanism (e.g. sniffing document.cookie for Supabase's cookie by name)
 * that would have to independently parse/validate the session and could
 * drift out of sync with the real check.
 *
 * For a genuinely signed-out visitor, LoginRedirectCard sends them to
 * apps/web in the SAME tab, carrying an absolute `next` back to this exact
 * domain/path plus `product=typing`. apps/web's own /login reads that
 * `product` marker to skip its K-12 "Add a student profile" onboarding
 * wizard entirely for this sign-in (see crossDomainRedirect.ts +
 * app/login/page.tsx there) — a typing candidate is never a K-12
 * parent/student — and once OTP verifies, it redirects the browser
 * straight back to `next`. Landing back here re-runs this same
 * server-side check, which now finds the session and completes the
 * handoff automatically.
 */
export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = safeLocalNext(searchParams.next);

  const userId = await getAuthenticatedUserId();
  if (userId) redirect(next);

  const mainAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vedicneev.com";
  const typingAppUrl = process.env.NEXT_PUBLIC_TYPINGTEST_APP_URL || "https://typingtest.vedicneev.com";

  const absoluteNext = `${typingAppUrl}${next}`;
  const loginUrl = `${mainAppUrl}/login?product=typing&next=${encodeURIComponent(absoluteNext)}`;

  return <LoginRedirectCard loginUrl={loginUrl} />;
}
