import { prisma, type TestBatch } from "@vedicneev/db";
import { assembleJnvstMock, shuffled, type BubbleOption } from "@vedicneev/engine";

import { flattenSubsections, getTaxonomyForExamBoard, type TaxonomySubject } from "@/lib/institute/taxonomy";
import { guessSubsectionId } from "@/lib/parsers/subsectionHeuristic";

export interface BankAllocation {
  topicId: string;
  count: number;
}

export interface GeneratedQuestion {
  questionNumber: number;
  text: string;
  options: Partial<Record<BubbleOption, string>>;
  correctOption: BubbleOption | null;
  warnings: string[];
  suggestedSubsectionId: string | null;
}

export interface GenerateFromBankResult {
  questions: GeneratedQuestion[];
  taxonomySubjects: TaxonomySubject[];
  warnings: string[];
}

const OPTION_ID_TO_LETTER: Record<string, BubbleOption> = { a: "A", b: "B", c: "C", d: "D" };

interface QuestionOption {
  id: string;
  text: Record<string, string>;
}

/**
 * Draws real questions from the shared Question bank (packages/db, the
 * same content the consumer product's mock tests use) instead of an
 * institute typing/uploading its own paper — one bucket per requested
 * topic, filled by a plain random draw (packages/engine's
 * assembleJnvstMock, generic over any string bucket key — a topicId here,
 * a PYQ sectionKey there). A topic whose pool is smaller than requested
 * comes back short with a warning rather than repeating a question to pad
 * it out.
 *
 * Returns the exact same shape /questions/parse already returns
 * (questions + taxonomySubjects), so the same preview/edit/save UI and
 * the same POST .../questions/save endpoint handle both paths identically
 * — generating from the bank is just a different way to fill that same
 * preview table, never a separate persistence path.
 */
export async function generateQuestionsFromBank(
  testBatch: Pick<TestBatch, "examCategory" | "instituteId">,
  allocations: BankAllocation[]
): Promise<GenerateFromBankResult> {
  const topicIds = allocations.map((a) => a.topicId);
  const pool = await prisma.question.findMany({
    where: { topicId: { in: topicIds } },
    select: { id: true, topicId: true, content: true, options: true, correctOption: true },
  });

  const assembled = assembleJnvstMock(
    pool.map((q) => ({ id: q.id, sectionKey: q.topicId })),
    allocations.map((a) => ({ sectionKey: a.topicId, questionCount: a.count })),
    Math.random
  );

  const byId = new Map(pool.map((q) => [q.id, q]));
  const selectedIds = assembled.sections.flatMap((s) => s.questionIds);
  // Interleave topics rather than block them — a real exam paper mixes
  // topics, it doesn't group every Fractions question together.
  const orderedIds = shuffled(selectedIds, Math.random);

  const taxonomySubjects = await getTaxonomyForExamBoard(testBatch.examCategory);
  const flatSubsections = flattenSubsections(taxonomySubjects);

  const questions: GeneratedQuestion[] = orderedIds.map((id, index) => {
    const row = byId.get(id)!;
    const text = (row.content as unknown as Record<string, string>).en ?? "";
    const options: Partial<Record<BubbleOption, string>> = {};
    for (const opt of row.options as unknown as QuestionOption[]) {
      const letter = OPTION_ID_TO_LETTER[opt.id];
      if (letter) options[letter] = opt.text?.en ?? "";
    }
    const correctOption = OPTION_ID_TO_LETTER[row.correctOption] ?? null;

    return {
      questionNumber: index + 1,
      text,
      options,
      correctOption,
      warnings: [],
      suggestedSubsectionId: flatSubsections.length > 0 ? guessSubsectionId(text, flatSubsections) : null,
    };
  });

  return { questions, taxonomySubjects, warnings: assembled.warnings };
}
