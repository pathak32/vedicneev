import Link from "next/link";
import { Button } from "@vedicneev/ui";
import { DEFAULT_BLOG_PUBLISH_BATCH_SIZE, MAX_BLOG_PUBLISH_BATCH_SIZE } from "@vedicneev/db";
import type { BlogPost } from "@vedicneev/db";
import { PenSquare } from "lucide-react";

import { BlogPostRow } from "@/components/admin/BlogPostRow";
import { PublishBatchControl } from "@/components/admin/PublishBatchControl";
import { getAllPostsForAdmin } from "@/lib/blog/queries";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const posts = await getAllPostsForAdmin();
  const drafts = posts.filter((p: BlogPost) => p.status === "DRAFT");
  const published = posts.filter((p: BlogPost) => p.status === "PUBLISHED");

  const draftsByCategory = new Map<string, typeof drafts>();
  for (const post of drafts) {
    const bucket = draftsByCategory.get(post.category) ?? [];
    bucket.push(post);
    draftsByCategory.set(post.category, bucket);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Queue</h1>
          <p className="text-sm text-muted-foreground">
            {drafts.length} draft{drafts.length === 1 ? "" : "s"} · {published.length} published
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PublishBatchControl
            draftCount={drafts.length}
            defaultBatchSize={DEFAULT_BLOG_PUBLISH_BATCH_SIZE}
            maxBatchSize={MAX_BLOG_PUBLISH_BATCH_SIZE}
          />
          <Button asChild>
            <Link href="/admin/blogs/new">
              <PenSquare className="h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Published ({published.length})</h2>
        {published.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing published yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {published.map((post) => (
              <BlogPostRow key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-foreground">Drafts ({drafts.length})</h2>
        {drafts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No drafts in the queue.</p>
        ) : (
          Array.from(draftsByCategory.entries()).map(([category, categoryPosts]) => (
            <div key={category} className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {category} ({categoryPosts.length})
              </h3>
              {categoryPosts.map((post) => (
                <BlogPostRow key={post.id} post={post} />
              ))}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
