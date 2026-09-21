import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/blog/queries";
import { BOARD_DATA, type BoardType } from "@/lib/marketing/examBoards";
import { PYQ_CLASS9_EXAMS, PYQ_CLASS9_YEARS } from "@/lib/exam/pyqClass9";
import { SITE_URL } from "@/lib/siteConfig";

/**
 * The static public pages (English + their /hi/* twins — faq/privacy/
 * terms/disclaimer only; the blog and other static pages have no Hindi
 * route yet), the exam-board / PYQ landing pages, and every PUBLISHED blog
 * post. Everything else (dashboard, parent, onboarding, /exam/live/*,
 * /practice/*, results, OMR tools, /admin) is account-, session-, or
 * admin-specific and marked `robots: { index: false }` in its own layout —
 * deliberately kept out of the sitemap too, so Search Console's
 * "Discovered" queue isn't padded with URLs that were never meant to rank
 * (submitting a noindex URL here doesn't itself hurt indexing, but it
 * contradicts those layouts' whole reason for existing, so this list is
 * kept in sync with them rather than the inverse).
 */
// Revalidate periodically (like the blog pages) so newly published posts
// show up here without needing a full redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const posts = await getPublishedPosts();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/store`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/pricing`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/sprints`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/learn`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/exam-strategy`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/podcasts`, lastModified, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/pyq/class-9`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/faq`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/hi/faq`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/hi/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/hi/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/disclaimer`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/hi/disclaimer`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/refund-policy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    ...(Object.keys(BOARD_DATA) as BoardType[]).map((board) => ({
      url: `${SITE_URL}/exam-boards/${board}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...PYQ_CLASS9_EXAMS.flatMap((exam) =>
      PYQ_CLASS9_YEARS.map((year) => ({
        url: `${SITE_URL}/pyq/class-9/${exam.key}/${year}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }))
    ),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
