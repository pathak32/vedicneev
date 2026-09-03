import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/blog/BlogArticle";
import { getPostById } from "@/lib/blog/queries";

export const dynamic = "force-dynamic";

export default async function AdminBlogPreviewPage({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  if (!post) notFound();

  return <BlogArticle post={post} />;
}
