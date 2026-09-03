import { prisma } from "@vedicneev/db";

/** Published posts, most recent first — used by the public /blog index and sitemap.ts. */
export function getPublishedPosts() {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });
}

/** A single published post by slug, or null — the public /blog/[slug] route 404s when this is null. */
export function getPublishedPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" } });
}

/** Every post regardless of status, most recently updated first — the admin list view. */
export function getAllPostsForAdmin() {
  return prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
}

/** A single post by id regardless of status — admin edit/preview. */
export function getPostById(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}
