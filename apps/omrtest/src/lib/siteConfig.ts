/**
 * Canonical site identity for this app's own app/robots.ts and
 * app/sitemap.ts, mirroring apps/web/src/lib/siteConfig.ts's pattern.
 *
 * Reuses NEXT_PUBLIC_INSTITUTE_APP_URL rather than introducing a second
 * var for the same URL — apps/web already reads it (see
 * apps/web/src/lib/institute/instituteUrl.ts) to link out to this app, and
 * it's already documented in the root .env.example with the correct
 * production value. Set it on THIS app's own Vercel Project too if you
 * want a non-default value here — a separate Project, so env vars aren't
 * shared automatically (same caveat as this app's WhatsApp credentials;
 * see that section of .env.example).
 *
 * NEXT_PUBLIC_INSTITUTE_APP_URL can be set but empty, or set without a
 * protocol (e.g. "omrtest.vedicneev.com"), and `new URL()` throws
 * ERR_INVALID_URL on either — only accept it when it actually looks like
 * an absolute URL.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_INSTITUTE_APP_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_INSTITUTE_APP_URL
  : "https://omrtest.vedicneev.com";
