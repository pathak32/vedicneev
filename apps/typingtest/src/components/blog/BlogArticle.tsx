import { Badge } from "@vedicneev/ui";

import { renderMarkdown } from "@/lib/blog/markdown";
import type { BlogPost } from "@/lib/blog/queries";

const DATE_LOCALE: Record<"en" | "hi", string> = { en: "en-IN", hi: "hi-IN" };

/** Mirrors apps/web's BlogArticle.tsx exactly (same Markdown-at-request-time rendering) — lang only affects date formatting, since title/excerpt/content are already localized by the caller (getPublishedPostBySlug). */
export function BlogArticle({ post, lang }: { post: BlogPost; lang: "en" | "hi" }) {
  const html = renderMarkdown(post.content);

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 md:px-8">
      <header className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit text-xs">
          {post.category}
        </Badge>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
          {post.title}
        </h1>
        {post.publishedAt ? (
          <p className="text-sm text-muted-foreground">
            {post.publishedAt.toLocaleDateString(DATE_LOCALE[lang], { day: "numeric", month: "long", year: "numeric" })}
          </p>
        ) : null}
      </header>

      {/* Rendered from Markdown authored only via packages/db/prisma/seed-typing-blog.ts — never point this at user-submitted content, same trust model as apps/web's BlogArticle.tsx. */}
      <div
        className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
