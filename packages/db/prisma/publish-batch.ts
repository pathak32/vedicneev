/**
 * Batch-publishes the next N draft blog posts (default 3, see
 * DEFAULT_BLOG_PUBLISH_BATCH_SIZE) for the manual/cron organic-SEO
 * drip-feed. Shares its selection + transition logic with the admin
 * panel's "Publish Next Batch" action (apps/web/app/api/admin/blogs/
 * publish-batch/route.ts) via packages/db/src/blogPublishing.ts — this is
 * the terminal/cron entry point, that's the browser one.
 *
 * Usage: npm run publish:batch --workspace=@vedicneev/db [-- <count>]
 */
import { PrismaClient } from "@prisma/client";

import { InvalidBatchSizeError, publishNextDraftBatch } from "../src/blogPublishing";

const prisma = new PrismaClient();

async function main() {
  const arg = process.argv[2];
  const batchSize = arg !== undefined ? Number(arg) : undefined;

  const result = await publishNextDraftBatch(prisma, batchSize);

  if (result.publishedCount === 0) {
    console.log("Nothing to publish — no drafts remaining.");
    return;
  }

  console.log(`Published ${result.publishedCount} post(s) at ${result.publishedAt.toISOString()}:`);
  for (const slug of result.publishedSlugs) console.log(`  - ${slug}`);
  console.log(`${result.remainingDraftCount} draft(s) remaining in the queue.`);
}

main()
  .catch((error) => {
    if (error instanceof InvalidBatchSizeError) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
