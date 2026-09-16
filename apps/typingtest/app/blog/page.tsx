import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog/BlogIndex";
import { getPublishedPosts } from "@/lib/blog/queries";

export const revalidate = 3600;

const title = "Typing Exam Blog — RRB NTPC, High Court, UPSSSC Guides";
const description =
  "Exam-specific government typing test guides — patterns, speed targets, and Inscript/Remington layout tips for RRB NTPC, High Court RO/ARO, and UPSSSC skill tests.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog", languages: { en: "/blog", hi: "/hi/blog" } },
  openGraph: { title, description, url: "/blog" },
};

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts("en");
  return <BlogIndex posts={posts} lang="en" />;
}
