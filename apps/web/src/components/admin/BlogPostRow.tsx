"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button } from "@vedicneev/ui";
import { CheckCircle2, Eye, Pencil, RotateCcw } from "lucide-react";
import type { BlogPost } from "@vedicneev/db";
import { useRouter } from "next/navigation";

export interface BlogPostRowProps {
  post: BlogPost;
}

export function BlogPostRow({ post }: BlogPostRowProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function setStatus(action: "publish" | "unpublish") {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/blogs/${post.id}/${action}`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground" title={post.title}>
          {post.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{post.excerpt}</p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Badge variant={post.status === "PUBLISHED" ? "default" : "outline"} className="text-[10px]">
          {post.status === "PUBLISHED" ? "Published" : "Draft"}
        </Badge>

        <Button asChild type="button" variant="outline" size="sm">
          <Link href={`/admin/blogs/${post.id}/preview`}>
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Link>
        </Button>
        <Button asChild type="button" variant="outline" size="sm">
          <Link href={`/admin/blogs/${post.id}/edit`}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>

        {post.status === "DRAFT" ? (
          <Button type="button" size="sm" disabled={pending} onClick={() => setStatus("publish")}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Publish Now
          </Button>
        ) : (
          <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => setStatus("unpublish")}>
            <RotateCcw className="h-3.5 w-3.5" />
            Unpublish
          </Button>
        )}
      </div>
    </div>
  );
}
