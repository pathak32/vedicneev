import { prisma, type Difficulty, type TestBatch } from "@vedicneev/db";
import { assembleJnvstMock, shuffled, type BubbleOption } from "@vedicneev/engine";

import { flattenSubsections, getTaxonomyForExamBoard, type TaxonomySubject } from "@/lib/institute/taxonomy";
import { guessSubsectionId } from "@/lib/parsers/subsectionHeuristic";

export interface BankAllocation {
  topicId: string;
  count: number;
}

/** Percentages, e.g. { EASY: 30, MEDIUM: 50, HARD: 20 } — need not be provided for all three; omitted keys are treated as 0. Omit the whole mix for no difficulty preference at all (the original, difficulty-blind draw). */
export type DifficultyMix = Partial<Record<Difficulty, number>>;

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
const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
const BUCKET_SEPARATOR = "::";

interface QuestionOption {
  id: string;
  text: Record<string, string>;
}

/**
 * Splits `total` into per-difficulty counts matching `mix`'s percentages as
 * closely as whole numbers allow, using the largest-remainder method so the
 * parts always sum to exactly `total` (never off by rounding) — e.g.
 * splitByDifficulty(10, {EASY:30,MEDIUM:50,HARD:20}) -> {EASY:3,MEDIUM:5,HARD:2}.
 * A difficulty missing from `mix` (or given 0%) gets 0 questions.
 */
function splitByDifficulty(total: number, mix: DifficultyMix): Record<Difficulty, number> {
  const raw = DIFFICULTIES.map((d) => ({ difficulty: d, exact: (total * (mix[d] ?? 0)) / 100 }));
  const floors = raw.map((r) => ({ ...r, floor: Math.floor(r.exact) }));
  let remainder = total - floors.reduce((sum, r) => sum + r.floor, 0);

  // Largest fractional remainder gets the leftover unit(s) first.
  const byRemainder = [...floors].sort((a, b) => b.exact - b.floor - (a.exact - a.floor));
  const result = Object.fromEntries(floors.map((r) => [r.difficulty, r.floor])) as Record<Difficulty, number>;
  for (const r of byRemainder) {
    if (remainder <= 0) break;
    result[r.difficulty] += 1;
    remainder -= 1;
  }
  return result;
}

/**
 * Draws real questions from the shared Question bank (packages/db, the
 * same content the consumer product's mock tests use) instead of an
 * institute typing/uploading its own paper — one bucket per requested
 * topic (or per topic+difficulty, when a mix is given), filled by a plain
 * random draw (packages/engine's assembleJnvstMock, generic over any
 * string bucket key — a topicId here, a PYQ sectionKey there). A bucket
 * whose pool is smaller than requested comes back short with a warning
 * rather than repeating a question to pad it out — difficulty filtering
 * makes a shortfall MORE likely (a topic can easily have plenty of MEDIUM
 * questions and very few HARD ones), which is exactly why this surfaces
 * as a warning instead of silently drawing from a different difficulty.
 *
 * Returns the exact same shape /questions/parse already returns
 * (questions + taxonomySubjects), so the same preview/edit/save UI and
 * the same POST .../questions/save endpoint handle both paths identically
 * — generating from the bank is just a different way to fill that same
 * preview table, never a separate persistence path.
 */
export async function generateQuestionsFromBank(
  testBatch: Pick<TestBatch, "examCategory" | "instituteId">,
  allocations: BankAllocation[],
  difficultyMix?: DifficultyMix
): Promise<GenerateFromBankResult> {
  const topicIds = allocations.map((a) => a.topicId);
  const [pool, topics] = await Promise.all([
    prisma.question.findMany({
      where: { topicId: { in: topicIds } },
      select: { id: true, topicId: true, difficulty: true, content: true, options: true, correctOption: true },
    }),
    prisma.topic.findMany({ where: { id: { in: topicIds } }, select: { id: true, name: true } }),
  ]);
  const topicNameById = new Map(
    topics.map((t) => [t.id, (t.name as unknown as Record<string, string>).en ?? t.id])
  );

  // Without a difficulty mix, each allocation is one bucket keyed by topicId
  // alone (the original, difficulty-blind behavior). With one, each
  // allocation's count is split by splitByDifficulty and expanded into up
  // to 3 buckets, keyed "topicId::DIFFICULTY" — the pool is bucketed to
  // match by the same key, so assembleJnvstMock needs no changes at all.
  const blueprint: { sectionKey: string; questionCount: number }[] = [];
  const bucketLabels = new Map<string, string>();
  for (const allocation of allocations) {
    const topicName = topicNameById.get(allocation.topicId) ?? allocation.topicId;
    if (!difficultyMix) {
      blueprint.push({ sectionKey: allocation.topicId, questionCount: allocation.count });
      bucketLabels.set(allocation.topicId, topicName);
      continue;
    }
    const perDifficulty = splitByDifficulty(allocation.count, difficultyMix);
    for (const difficulty of DIFFICULTIES) {
      const questionCount = perDifficulty[difficulty];
      if (questionCount <= 0) continue;
      const bucketKey = `${allocation.topicId}${BUCKET_SEPARATOR}${difficulty}`;
      blueprint.push({ sectionKey: bucketKey, questionCount });
      bucketLabels.set(bucketKey, `${topicName} (${difficulty.toLowerCase()})`);
    }
  }

  const poolItems = pool.map((q) => ({
    id: q.id,
    sectionKey: difficultyMix ? `${q.topicId}${BUCKET_SEPARATOR}${q.difficulty}` : q.topicId,
  }));

  const assembled = assembleJnvstMock(poolItems, blueprint, Math.random);
  const warnings = assembled.warnings.map((w) => {
    // assembleJnvstMock's own warning text is generic ("<sectionKey>: only
    // N of M...") — swap in the human-readable label we tracked above so an
    // institute director sees "LCM & HCF (hard)", not a raw topic id.
    const [bucketKey, ...rest] = w.split(":");
    const label = bucketLabels.get(bucketKey!) ?? bucketKey;
    return `${label}:${rest.join(":")}`;
  });

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

  return { questions, taxonomySubjects, warnings };
}
