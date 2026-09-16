import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog/BlogArticle";
import { getPublishedPostBySlug } from "@/lib/blog/queries";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPublishedPostBySlug(params.slug, "hi");
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/hi/blog/${post.slug}`, languages: { en: `/blog/${post.slug}`, hi: `/hi/blog/${post.slug}` } },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/hi/blog/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function BlogPostPageHindi({ params }: { params: { slug: string } }) {
  const post = await getPublishedPostBySlug(params.slug, "hi");
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_TYPINGTEST_APP_URL || "https://typingtest.vedicneev.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/hi/blog/${post.slug}` },
    author: { "@type": "Organization", name: "VedicNeev Typing Test" },
    publisher: { "@type": "Organization", name: "VedicNeev Typing Test" },
    inLanguage: "hi",
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-sync-scripts -- static JSON-LD, not a loaded script */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogArticle post={post} lang="hi" />
    </>
  );
}
