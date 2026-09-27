import { prisma } from "@vedicneev/db";
import type { OmrSheetEvaluationSummary, SetMappings } from "@vedicneev/engine";

export interface SubsectionPerformanceRow {
  branchId: string | null;
  subjectId: string;
  subjectName: string;
  subsectionId: string;
  subsectionName: string;
  correctCount: number;
  incorrectCount: number;
}

interface QuestionItemLite {
  id: string;
  subsectionId: string | null;
  subsectionName: string;
  subjectId: string;
  subjectName: string;
}

function itemKey(testBatchId: string, setCode: string | null, questionNumber: number): string {
  return `${testBatchId}::${setCode ?? "null"}::${questionNumber}`;
}

/**
 * Same two-step resolution as apps/omrtest/src/lib/tests/resolveQuestionItem.ts
 * (per-set paper first, else the master paper via the set's permutation)
 * but against an in-memory map built from ONE bulk query rather than a
 * DB round-trip per response — this runs over every GRADED upload's
 * every response for the whole institute, so an N+1 here would undo the
 * exact class of latency issue already fixed elsewhere (see
 * apps/omrtest/src/lib/institute/session.ts's cache() comment). Keep
 * this in sync with resolveQuestionItem.ts if that logic ever changes.
 */
function resolveItem(
  items: Map<string, QuestionItemLite>,
  testBatchId: string,
  position: number,
  detectedSetCode: string | null,
  setMappings: SetMappings | null
): QuestionItemLite | null {
  if (detectedSetCode) {
    const perSetItem = items.get(itemKey(testBatchId, detectedSetCode, position));
    if (perSetItem) return perSetItem;
  }

  const masterQuestionNumber =
    detectedSetCode && setMappings?.[detectedSetCode]
      ? (setMappings[detectedSetCode]!.permutation[position - 1] ?? position - 1) + 1
      : position;

  return items.get(itemKey(testBatchId, null, masterQuestionNumber)) ?? null;
}

/**
 * Subject/subsection accuracy across every GRADED upload in the
 * institute, broken down by branch (see the Control Room's own
 * requirement to show this per-branch) — untagged questions
 * (subsectionId null) are excluded entirely rather than bucketed, since
 * there's no meaningful subject/subsection grouping for them.
 */
export async function buildSubsectionPerformance(instituteId: string): Promise<SubsectionPerformanceRow[]> {
  const questionItemRows = await prisma.testBatchQuestionItem.findMany({
    where: { testBatch: { instituteId }, subsectionId: { not: null } },
    select: {
      id: true,
      testBatchId: true,
      setCode: true,
      questionNumber: true,
      subsectionId: true,
      subsection: { select: { name: true, subject: { select: { id: true, name: true } } } },
    },
  });

  const items = new Map<string, QuestionItemLite>();
  for (const row of questionItemRows) {
    if (!row.subsection) continue;
    items.set(itemKey(row.testBatchId, row.setCode, row.questionNumber), {
      id: row.id,
      subsectionId: row.subsectionId,
      subsectionName: row.subsection.name,
      subjectId: row.subsection.subject.id,
      subjectName: row.subsection.subject.name,
    });
  }

  const uploads = await prisma.omrUpload.findMany({
    where: { testBatch: { instituteId }, status: "GRADED" },
    select: {
      testBatchId: true,
      detectedSetCode: true,
      gradingResult: true,
      testBatch: { select: { branchId: true, setMappings: true } },
    },
  });

  const tally = new Map<string, SubsectionPerformanceRow>();
  for (const upload of uploads) {
    const result = upload.gradingResult as unknown as OmrSheetEvaluationSummary | null;
    if (!result) continue;
    const setMappings = upload.testBatch.setMappings as unknown as SetMappings | null;
    const branchId = upload.testBatch.branchId;

    for (const response of result.responses) {
      if (response.outcome !== "CORRECT" && response.outcome !== "INCORRECT") continue;

      const item = resolveItem(items, upload.testBatchId, response.questionNumber, upload.detectedSetCode, setMappings);
      if (!item || !item.subsectionId) continue;

      const key = `${branchId ?? "__unassigned__"}::${item.subsectionId}`;
      let row = tally.get(key);
      if (!row) {
        row = {
          branchId,
          subjectId: item.subjectId,
          subjectName: item.subjectName,
          subsectionId: item.subsectionId,
          subsectionName: item.subsectionName,
          correctCount: 0,
          incorrectCount: 0,
        };
        tally.set(key, row);
      }
      if (response.outcome === "CORRECT") row.correctCount += 1;
      else row.incorrectCount += 1;
    }
  }

  return [...tally.values()];
}
