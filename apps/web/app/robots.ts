import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/siteConfig";

/**
 * Deliberately does NOT disallow /dashboard, /parent, /onboarding, or
 * /exam — those are excluded from search via `robots: { index: false }` in
 * their own metadata instead. Blocking them here as well would stop
 * Googlebot from ever crawling them to see that noindex tag, which is the
 * classic cause of a Search Console "Indexed, though blocked by robots.txt"
 * warning (Google indexes the bare URL — no title/snippet — because it
 * can see links pointing at it but was never allowed to fetch the page to
 * find the noindex directive). See SEO_CHECKLIST.md.
 *
 * /admin/ and /api/ are different: nothing ever legitimately links to them
 * from outside the site, so there's no realistic path to that same
 * "indexed though blocked" warning — an explicit Disallow is safe here
 * (and, for /admin, an added layer alongside its own `noindex`, since it's
 * also gated by a real signed-session check in middleware.ts either way —
 * robots.txt is advisory, not a security boundary).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
