/**
 * Guards the post-login `next` redirect target for app/login/page.tsx.
 * `next` is an attacker-controllable query param — once it can point at an
 * absolute cross-origin URL (needed so apps/typingtest/apps/omrtest can
 * send a signed-in visitor all the way back to their own subdomain after
 * OTP verify on vedicneev.com), an unrestricted value would be a classic
 * open-redirect: a crafted `?next=https://evil.example` link would ride a
 * real, freshly-verified login into an attacker site. Only relative paths
 * and *.vedicneev.com subdomains (plus localhost, for cross-app local dev)
 * are ever allowed through; anything else falls back to "/dashboard".
 */

const ALLOWED_EXACT_HOST = "vedicneev.com";
const ALLOWED_HOST_SUFFIX = ".vedicneev.com";
const DEFAULT_NEXT = "/dashboard";

/** Resolves `next` to a safe redirect target — itself if it's relative or an allowed subdomain, otherwise the default. */
export function resolveSafeNext(next: string | null | undefined, currentOrigin: string): string {
  if (!next) return DEFAULT_NEXT;

  let url: URL;
  try {
    url = new URL(next, currentOrigin);
  } catch {
    return DEFAULT_NEXT;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return DEFAULT_NEXT;
  if (url.origin === currentOrigin) return next;
  if (url.hostname === "localhost") return next;
  if (url.hostname === ALLOWED_EXACT_HOST || url.hostname.endsWith(ALLOWED_HOST_SUFFIX)) return next;

  return DEFAULT_NEXT;
}

/** True when `next` (already assumed safe — call resolveSafeNext first) points at a different origin than the current page, meaning the redirect needs a full navigation rather than the Next.js router. */
export function isCrossOrigin(next: string, currentOrigin: string): boolean {
  try {
    return new URL(next, currentOrigin).origin !== currentOrigin;
  } catch {
    return false;
  }
}
