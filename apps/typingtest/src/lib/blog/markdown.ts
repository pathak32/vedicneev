import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/**
 * Renders a blog post's Markdown body to HTML for `dangerouslySetInnerHTML`
 * — same approach and trust model as apps/web's own
 * src/lib/blog/markdown.ts: content only ever comes from
 * packages/db/prisma/seed-typing-blog.ts (no public submission path), so
 * unsanitized rendering is safe under that assumption.
 */
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}
