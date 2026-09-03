import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/**
 * Renders a blog post's Markdown body to HTML for `dangerouslySetInnerHTML`.
 *
 * Not sanitized — same trust model as the admin-authored SVG figure markup
 * in QuestionCanvas.tsx: blog content only ever comes from the
 * password-gated /admin panel (see middleware.ts), never from public user
 * input, so this is safe under that assumption but would NOT be safe to
 * point at arbitrary user-submitted Markdown.
 */
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}
