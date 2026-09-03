/** One seed blog post — matches the BlogPost Prisma model minus id/timestamps/status (seed.ts sets status: "DRAFT" for all of these on insert). */
export interface BlogSeedPost {
  title: string;
  /** kebab-case, unique across the whole seed set. */
  slug: string;
  category: string;
  /** ~140-160 characters — used as both the card summary and the meta description. */
  excerpt: string;
  /** Markdown body, ~300-500 words, with ## subheadings and at least one list. */
  content: string;
}
