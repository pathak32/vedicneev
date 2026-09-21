import type { MetadataRoute } from "next";
import { prisma } from "@vedicneev/db";

import { SITE_URL } from "@/lib/siteConfig";

/**
 * The static public pages (English + their /hi/* twins — this app's own
 * middleware.ts treats "/hi" as a first-class public prefix, unlike
 * apps/web where the Hindi twins aren't in the sitemap yet), every active
 * TypingExam's catalog/detail page, and every PUBLISHED TypingBlogPost in
 * both languages. Everything else (/dashboard, /leaderboard, /results,
 * /practice/custom, /exams/[slug]/test, /exams/[slug]/logic, /login) is
 * signed-in or session-specific and kept out here, blocked in robots.ts —
 * see this app's own middleware.ts PUBLIC_PATH_PREFIXES for which routes
 * that split follows.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Direct query rather than reusing @/lib/blog/queries' getPublishedPosts
  // — that helper localizes title/excerpt/content per language, none of
  // which a sitemap needs, and both /blog and /hi/blog draw from the same
  // PUBLISHED rows (just rendered in a different language), so one query
  // covers both URL sets.
  const [posts, exams] = await Promise.all([
    prisma.typingBlogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.typingExam.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/hi/blog`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/faq`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/hi/faq`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/hi/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/hi/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/disclaimer`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/hi/disclaimer`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    ...exams.map((exam) => ({
      url: `${SITE_URL}/exams/${exam.slug}`,
      lastModified: exam.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/hi/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
