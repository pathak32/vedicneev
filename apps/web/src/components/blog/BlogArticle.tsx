import { Badge } from "@vedicneev/ui";

import { renderMarkdown } from "@/lib/blog/markdown";

export interface BlogArticlePost {
  title: string;
  category: string;
  content: string;
  publishedAt: Date | null;
  status?: "DRAFT" | "PUBLISHED";
}

export interface BlogArticleProps {
  post: BlogArticlePost;
}

/** Shared renderer for a full article — used by both /blog/[slug] (public) and /admin/blogs/[id]/preview (draft). */
export function BlogArticle({ post }: BlogArticleProps) {
  const html = renderMarkdown(post.content);

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 md:px-8">
      {post.status === "DRAFT" ? (
        <div className="rounded-md border border-dashed border-amber-500/50 bg-amber-500/10 px-3 py-2 text-center text-xs font-medium text-amber-700 dark:text-amber-400">
          Draft preview — not visible on the public site until published.
        </div>
      ) : null}

      <header className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit text-xs">
          {post.category}
        </Badge>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
          {post.title}
        </h1>
        {post.publishedAt ? (
          <p className="text-sm text-muted-foreground">
            {post.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        ) : null}
      </header>

      {/*
        Rendered from Markdown authored only through the password-gated
        /admin panel (see middleware.ts) — same trust model as the SVG
        figure markup in QuestionCanvas.tsx. Never point this at
        user-submitted content. See src/lib/blog/markdown.ts.
      */}
      <div
        className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
