import { notFound } from "next/navigation";

import { BlogEditForm } from "@/components/admin/BlogEditForm";
import { BlogPostRow } from "@/components/admin/BlogPostRow";
import { getPostById } from "@/lib/blog/queries";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  if (!post) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Post</h1>
        <p className="text-sm text-muted-foreground">
          Last updated {post.updatedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>

      <BlogPostRow post={post} />

      <BlogEditForm
        mode="edit"
        postId={post.id}
        initialValues={{
          title: post.title,
          slug: post.slug,
          category: post.category,
          excerpt: post.excerpt,
          content: post.content,
        }}
      />
    </div>
  );
}
