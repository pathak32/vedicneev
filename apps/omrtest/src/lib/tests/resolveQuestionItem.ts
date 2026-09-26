import type { Prisma, PrismaClient } from "@vedicneev/db";
import type { SetMappings } from "@vedicneev/engine";

type Tx = Prisma.TransactionClient | PrismaClient;

/**
 * Finds the TestBatchQuestionItem a scanned sheet's answer at `position`
 * (the OMR scan's own 1-based questionNumber, never a master number)
 * actually refers to — the one place both grading call sites (the upload
 * route, the answer-key re-grade pass) resolve this, so they can never
 * disagree about which parsed question a mistake gets linked to.
 *
 * Two distinct sources of content, checked in order:
 * 1. A real, independently-uploaded paper for THIS exact set (see
 *    TestBatchQuestionItem.setCode's own comment on Set A-D uploads) —
 *    its own `position` IS its native question number, no translation
 *    needed.
 * 2. The base/master paper (setCode: null) — reached either directly
 *    (a single-set batch, detectedSetCode null) or via a random-shuffled
 *    set's own permutation (packages/engine/src/questionShuffler.ts),
 *    which maps this position back to which master question it actually
 *    is.
 *
 * Returns null when neither exists — a batch that only ever set a
 * compact answer-key string (never uploaded a document) has no
 * TestBatchQuestionItem rows at all, and that's fine: there's simply
 * nothing to link a mistake to, so callers skip Mistake Vault logging for
 * that response entirely rather than treating it as an error.
 */
export async function resolveQuestionItemId(
  tx: Tx,
  testBatchId: string,
  position: number,
  detectedSetCode: string | null,
  setMappings: SetMappings | null
): Promise<string | null> {
  if (detectedSetCode) {
    // findFirst, not findUnique: Prisma's generated compound-unique input
    // for @@unique([testBatchId, setCode, questionNumber]) doesn't accept
    // a literal `null` for the nullable setCode field, even though the
    // constraint itself is on a nullable column — the unique index still
    // makes this a single-row lookup in practice.
    const perSetItem = await tx.testBatchQuestionItem.findFirst({
      where: { testBatchId, setCode: detectedSetCode, questionNumber: position },
    });
    if (perSetItem) return perSetItem.id;
  }

  const masterQuestionNumber =
    detectedSetCode && setMappings?.[detectedSetCode]
      ? (setMappings[detectedSetCode]!.permutation[position - 1] ?? position - 1) + 1
      : position;

  const masterItem = await tx.testBatchQuestionItem.findFirst({
    where: { testBatchId, setCode: null, questionNumber: masterQuestionNumber },
  });
  return masterItem?.id ?? null;
}
