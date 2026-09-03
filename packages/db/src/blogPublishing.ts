import type { PrismaClient } from "@prisma/client";

/**
 * The organic-SEO strategy this app was built around is a manual drip-feed
 * (2-4 posts/day, see apps/web/app/admin/(protected)/blogs/page.tsx) rather
 * than publishing the whole draft queue at once — a large batch would dump
 * a hundred URLs on Search Console simultaneously, which reads as spammy
 * and dilutes crawl budget instead of ramping indexing gradually. This cap
 * is a deliberate guardrail against a batch call (or a misconfigured cron)
 * accidentally publishing the entire remaining queue in one shot.
 */
export const MAX_BLOG_PUBLISH_BATCH_SIZE = 20;
export const DEFAULT_BLOG_PUBLISH_BATCH_SIZE = 3;

export interface PublishDraftBatchResult {
  /** Slugs actually transitioned to PUBLISHED, in the order they were published. */
  publishedSlugs: string[];
  publishedCount: number;
  /** publishedAt stamped on every post in this batch — identical across the batch, distinct per batch. */
  publishedAt: Date;
  remainingDraftCount: number;
}

export class InvalidBatchSizeError extends Error {
  constructor(batchSize: number) {
    super(`Batch size must be between 1 and ${MAX_BLOG_PUBLISH_BATCH_SIZE}, got ${batchSize}.`);
    this.name = "InvalidBatchSizeError";
  }
}

/**
 * Publishes the next `batchSize` drafts and returns what happened. Safe to
 * call repeatedly (each call only ever touches posts still in DRAFT at the
 * moment of the update, so re-running never republishes or double-stamps
 * an already-published post) and safe under concurrent callers (the
 * `status: "DRAFT"` condition is re-checked inside the UPDATE itself, not
 * just the earlier SELECT, so a post another caller already published in
 * between is silently excluded rather than double-published).
 *
 * Selection is round-robin across categories (oldest post within each
 * category first) rather than pure creation-order, so a single batch
 * doesn't publish a run of same-topic posts back to back — the seed data
 * was inserted one category block at a time, so creation-order would
 * otherwise publish all of category 1 before touching category 2.
 */
export async function publishNextDraftBatch(
  prisma: PrismaClient,
  batchSize: number = DEFAULT_BLOG_PUBLISH_BATCH_SIZE
): Promise<PublishDraftBatchResult> {
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > MAX_BLOG_PUBLISH_BATCH_SIZE) {
    throw new InvalidBatchSizeError(batchSize);
  }

  const drafts = await prisma.blogPost.findMany({
    where: { status: "DRAFT" },
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true, category: true },
  });

  const queuesByCategory = new Map<string, typeof drafts>();
  for (const post of drafts) {
    const queue = queuesByCategory.get(post.category);
    if (queue) queue.push(post);
    else queuesByCategory.set(post.category, [post]);
  }
  const queues = Array.from(queuesByCategory.values());

  const selected: typeof drafts = [];
  for (let round = 0; selected.length < batchSize && queues.some((q) => q.length > 0); round += 1) {
    const queue = queues[round % queues.length];
    const next = queue?.shift();
    if (next) selected.push(next);
  }

  if (selected.length === 0) {
    const remainingDraftCount = await prisma.blogPost.count({ where: { status: "DRAFT" } });
    return { publishedSlugs: [], publishedCount: 0, publishedAt: new Date(), remainingDraftCount };
  }

  const publishedAt = new Date();
  const { count } = await prisma.blogPost.updateMany({
    // Re-checking status here (not just relying on the SELECT above) is
    // what makes this safe under a concurrent publish of the same rows.
    where: { id: { in: selected.map((p) => p.id) }, status: "DRAFT" },
    data: { status: "PUBLISHED", publishedAt },
  });

  const remainingDraftCount = await prisma.blogPost.count({ where: { status: "DRAFT" } });

  return {
    publishedSlugs: selected.map((p) => p.slug),
    publishedCount: count,
    publishedAt,
    remainingDraftCount,
  };
}
