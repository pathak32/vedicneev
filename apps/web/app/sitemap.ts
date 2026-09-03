import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/siteConfig";

/**
 * Only the three genuinely public, indexable pages. Everything else
 * (dashboard, parent, onboarding, the exam player, results, OMR tools) is
 * account- or session-specific and marked noindex — deliberately kept out
 * of the sitemap too, so Search Console's "Discovered" queue isn't padded
 * with URLs that were never meant to rank.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/learn`, lastModified, changeFrequency: "weekly", priority: 0.8 },
  ];
}
