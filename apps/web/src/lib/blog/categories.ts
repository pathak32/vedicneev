/**
 * Canonical starting set of blog category labels. `BlogPost.category` is a
 * plain string column, not a Prisma enum (see the comment in schema.prisma)
 * — new categories can be added from the admin panel without a migration —
 * so this list is a UI/filtering convenience, not a hard constraint.
 */
export const BLOG_CATEGORIES = [
  "Eligibility & Exam Blueprint",
  "Syllabus & Exam Pattern",
  "Speed Math & Vedic Shortcuts",
  "Myths & Reality Checks",
  "Mistake Analysis & Diagnostics",
  "Cutoffs & Trend Analysis",
  "Parent Guidance & Home Support",
  "OMR & Exam Day Strategy",
  "Success Stories",
  "Life After Selection",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
