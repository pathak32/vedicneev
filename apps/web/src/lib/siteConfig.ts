/**
 * Canonical site identity, shared by app/layout.tsx (metadataBase, OG/Twitter,
 * JSON-LD), app/robots.ts, and app/sitemap.ts, so all three always agree.
 *
 * NEXT_PUBLIC_APP_URL can be set but empty, or set without a protocol (e.g.
 * "vedicneev.com"), and `new URL()` throws ERR_INVALID_URL on either — only
 * accept it when it actually looks like an absolute URL.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://vedicneev.com";

export const SITE_NAME = "Vedic Neev";
