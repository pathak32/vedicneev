import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/siteConfig";

/**
 * Purely static — this app has no blog or other Prisma-backed public
 * content (unlike apps/web/app/sitemap.ts's blog posts), just the
 * marketing landing page and its three legal pages. /dashboard, /tests/*,
 * /login, and /onboarding are signed-in/auth-flow routes, kept out here
 * and blocked in robots.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/refund-policy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
