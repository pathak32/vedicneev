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

/**
 * Splits a post's raw Markdown at its middle `##` heading, so
 * BlogArticle.tsx can render a CTA banner between the two halves instead
 * of only at the very bottom. Splits on section boundaries (never
 * mid-sentence) — falls back to putting everything in `before` (no `after`
 * half at all) for a post with fewer than two `##` headings, so a short
 * post just gets a single bottom banner rather than an oddly-placed split.
 */
export function splitMarkdownAtMidpoint(markdown: string): { before: string; after: string | null } {
  const headingIndexes: number[] = [];
  const headingPattern = /^## /gm;
  let match: RegExpExecArray | null;
  while ((match = headingPattern.exec(markdown))) {
    headingIndexes.push(match.index);
  }

  if (headingIndexes.length < 2) {
    return { before: markdown, after: null };
  }

  const midHeading = headingIndexes[Math.floor(headingIndexes.length / 2)];
  return { before: markdown.slice(0, midHeading).trimEnd(), after: markdown.slice(midHeading).trimStart() };
}
