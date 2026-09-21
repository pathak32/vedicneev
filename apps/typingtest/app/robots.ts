import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/siteConfig";

/**
 * Mirrors apps/web/app/robots.ts's reasoning: /dashboard, /leaderboard,
 * /results, /exams/[slug]/test, and /exams/[slug]/logic are all
 * signed-in/session-specific (see this app's own middleware.ts —
 * PUBLIC_PATH_PREFIXES notably does NOT include /dashboard, /leaderboard,
 * or /results, and /exams/[slug]/test|logic self-gate past that
 * middleware). None of them carry their own noindex metadata today, so —
 * same as apps/omrtest — disallowing them here is what actually keeps
 * them out of search results, not a redundant belt-and-suspenders layer
 * over an existing noindex tag.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/leaderboard/", "/results/", "/practice/", "/login/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
