import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/siteConfig";

/**
 * Unlike apps/web, none of this app's signed-in-only routes
 * (/dashboard, /tests/*) carry their own `robots: { index: false }`
 * metadata yet, so — also unlike apps/web's robots.ts — disallowing them
 * here IS the only thing keeping them out of search results; there's no
 * risk of the "indexed though blocked" trap that comment warns about,
 * since there's no noindex tag on these pages for a block to hide from
 * Googlebot in the first place. /login and /onboarding are pure auth
 * flow, never meaningful landing content either.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/tests/", "/login/", "/onboarding/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
