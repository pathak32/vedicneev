import { prisma } from "@vedicneev/db";

import { localize } from "@/lib/localize";

export interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: Date | null;
}

export interface BlogPost extends BlogListItem {
  content: string;
  updatedAt: Date;
}

export async function getPublishedPosts(lang: "en" | "hi"): Promise<BlogListItem[]> {
  const posts = await prisma.typingBlogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: localize(post.title, lang),
    excerpt: localize(post.excerpt, lang),
    category: post.category,
    publishedAt: post.publishedAt,
  }));
}

export async function getPublishedPostBySlug(slug: string, lang: "en" | "hi"): Promise<BlogPost | null> {
  const post = await prisma.typingBlogPost.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") return null;

  return {
    id: post.id,
    slug: post.slug,
    title: localize(post.title, lang),
    excerpt: localize(post.excerpt, lang),
    content: localize(post.content, lang),
    category: post.category,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
  };
}
