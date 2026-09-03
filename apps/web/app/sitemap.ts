import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/blog/queries";
import { SITE_URL } from "@/lib/siteConfig";

/**
 * The static public pages plus every PUBLISHED blog post. Everything else
 * (dashboard, parent, onboarding, the exam player, results, OMR tools,
 * /admin) is account-, session-, or admin-specific and marked noindex —
 * deliberately kept out of the sitemap too, so Search Console's
 * "Discovered" queue isn't padded with URLs that were never meant to rank.
 */
// Revalidate periodically (like the blog pages) so newly published posts
// show up here without needing a full redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const posts = await getPublishedPosts();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/learn`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: "daily", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
