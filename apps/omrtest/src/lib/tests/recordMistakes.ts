import type { Prisma, PrismaClient } from "@vedicneev/db";
import type { OmrSheetEvaluationSummary, SetMappings } from "@vedicneev/engine";

import { resolveQuestionItemId } from "./resolveQuestionItem";

type Tx = Prisma.TransactionClient | PrismaClient;

export interface RecordMistakesInput {
  testBatchId: string;
  rosterEntryId: string;
  omrUploadId: string;
  grading: OmrSheetEvaluationSummary;
  detectedSetCode: string | null;
  setMappings: SetMappings | null;
}

/**
 * The institute-scoped Mistake Vault writer — called from both grading
 * paths (the upload route's initial grade, the answer-key route's QUEUED
 * re-grade pass) right after each writes its own OmrUpload row, inside
 * the SAME transaction. Only ever logs an actual wrong answer
 * (outcome === "INCORRECT"); an unattempted or multiple-filled response
 * isn't "a mistake" in the sense this table exists to support (a specific
 * wrong belief to review), so those are left out entirely.
 *
 * Silently no-ops per-question when resolveQuestionItemId finds nothing
 * to link to (see its own comment) — this table is purely additive, never
 * a grading dependency, so a batch with no parsed question content just
 * accumulates zero mistake rows rather than failing.
 */
export async function recordMistakesForGrading(tx: Tx, input: RecordMistakesInput): Promise<void> {
  for (const response of input.grading.responses) {
    if (response.outcome !== "INCORRECT") continue;

    const questionItemId = await resolveQuestionItemId(
      tx,
      input.testBatchId,
      response.questionNumber,
      input.detectedSetCode,
      input.setMappings
    );
    if (!questionItemId) continue;

    await tx.testBatchMistake.create({
      data: {
        rosterEntryId: input.rosterEntryId,
        questionItemId,
        omrUploadId: input.omrUploadId,
        selectedOption: response.selectedOption ?? null,
      },
    });
  }
}
