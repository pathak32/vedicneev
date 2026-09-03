import { prisma } from "@vedicneev/db";
import { assembleJnvstMock, type JnvstSectionKey, type PyqPoolItem, type SectionBlueprint } from "@vedicneev/engine";

import type { ExamOption, ExamQuestion, ExamSectionConfig, ExamSessionData, Multilingual, QuestionDifficulty } from "./types";

const JNVST_TEMPLATE_SLUG = "jnvst-class-6";
const OPTION_IDS = ["a", "b", "c", "d"] as const;

export interface JnvstMockGenerationResult {
  session: ExamSessionData;
  /** Non-fatal — e.g. a section came back short because the PYQ pool for it isn't deep enough yet. Surfaced to the caller, never hidden. */
  warnings: string[];
}

export type JnvstMockGenerationError = { error: string };

export interface JnvstBlueprintSection {
  key: string;
  name: Multilingual;
  questionCount: number;
  marksPerQuestion: number;
  timeLimitSeconds: number | null;
}

export interface JnvstBlueprint {
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number;
  negativeMarkingRatio: number;
  sections: JnvstBlueprintSection[];
}

/**
 * Reads the official JNVST Class 6 blueprint (80 questions / 100 marks /
 * 120 minutes / no negative marking, 40-20-20 across Mental Ability,
 * Arithmetic, and Language) straight from the seeded ExamTemplate +
 * ExamTemplateSection rows — not a second hardcoded copy of those numbers.
 * A UI that wants to display "what this mock covers" (e.g. before or while
 * generate-mock is loading) should call this instead of hardcoding the
 * blueprint again, so the two can never drift apart.
 */
export async function getJnvstClassSixBlueprint(): Promise<JnvstBlueprint | JnvstMockGenerationError> {
  const template = await prisma.examTemplate.findUnique({
    where: { slug: JNVST_TEMPLATE_SLUG },
    include: { sections: { include: { section: true }, orderBy: { order: "asc" } } },
  });
  if (!template) {
    return { error: `Exam template "${JNVST_TEMPLATE_SLUG}" isn't seeded yet.` };
  }

  return {
    totalQuestions: template.totalQuestions,
    totalMarks: template.totalMarks,
    durationMinutes: template.durationMinutes,
    negativeMarkingRatio: template.negativeMarkingRatio,
    sections: template.sections.map((s) => ({
      key: s.section.key,
      name: asMultilingual(s.section.name, `Section ${s.section.key} name`),
      questionCount: s.questionCount,
      marksPerQuestion: s.marksPerQuestion,
      timeLimitSeconds: s.timeLimitSeconds,
    })),
  };
}

/** Defensive runtime check — Prisma's `Json` columns are typed `JsonValue`, not `Multilingual`, so a malformed row (bad seed data, manual DB edit) fails loudly here instead of rendering as `undefined` deep inside the exam player. */
function asMultilingual(value: unknown, context: string): Multilingual {
  if (
    typeof value === "object" &&
    value !== null &&
    "en" in value &&
    typeof (value as Record<string, unknown>).en === "string"
  ) {
    return value as Multilingual;
  }
  throw new Error(`Expected multilingual JSON with an "en" key for ${context}, got: ${JSON.stringify(value)}`);
}

/**
 * Assembles and returns a fresh, ready-to-launch JNVST Class 6 mock paper:
 * fetches the real exam blueprint (ExamTemplate "jnvst-class-6" + its
 * ExamTemplateSection rows — the same 40/20/20 configuration seeded in
 * packages/db/prisma/seed.ts, not a second hardcoded copy of those numbers),
 * draws a balanced, non-repeating set of PreviousYearQuestion rows per
 * section via the pure packages/engine assembler, and shapes the result
 * into the exact ExamSessionData contract apps/web/src/components/exam's
 * ExamPlayer already knows how to run — so the API route that calls this
 * can hand the result straight to <ExamPlayer session={...} /> with no
 * further adaptation.
 */
export async function generateJnvstMockSession(): Promise<JnvstMockGenerationResult | JnvstMockGenerationError> {
  const template = await prisma.examTemplate.findUnique({
    where: { slug: JNVST_TEMPLATE_SLUG },
    include: { sections: { include: { section: true }, orderBy: { order: "asc" } } },
  });
  if (!template) {
    return { error: `Exam template "${JNVST_TEMPLATE_SLUG}" isn't seeded yet — run the db seed script first.` };
  }
  if (template.sections.length === 0) {
    return { error: `Exam template "${JNVST_TEMPLATE_SLUG}" has no sections configured.` };
  }

  const sectionKeyById = new Map<string, JnvstSectionKey>(
    template.sections.map((s) => [s.sectionId, s.section.key as JnvstSectionKey])
  );

  const blueprint: SectionBlueprint[] = template.sections.map((s) => ({
    sectionKey: s.section.key as JnvstSectionKey,
    questionCount: s.questionCount,
  }));

  const pool = await prisma.previousYearQuestion.findMany({
    where: { examType: "JNVST", classLevel: 6, sectionId: { in: template.sections.map((s) => s.sectionId) } },
    select: { id: true, sectionId: true },
  });
  const poolItems: PyqPoolItem[] = pool.map((p) => ({
    id: p.id,
    sectionKey: sectionKeyById.get(p.sectionId) ?? "mental_ability",
  }));

  const assembled = assembleJnvstMock(poolItems, blueprint);
  const drawnIds = assembled.sections.flatMap((s) => s.questionIds);

  if (drawnIds.length === 0) {
    return { error: "No JNVST Previous-Year-Question content is seeded yet — nothing to assemble a mock from." };
  }

  const drawnQuestions = await prisma.previousYearQuestion.findMany({ where: { id: { in: drawnIds } } });

  const questionsById: Record<string, ExamQuestion> = {};
  for (const q of drawnQuestions) {
    const sectionKey = sectionKeyById.get(q.sectionId) ?? "mental_ability";
    const optionTexts = q.optionsJson as unknown[];
    const options: ExamOption[] = optionTexts.map((text, index) => ({
      id: OPTION_IDS[index] ?? String(index),
      text: asMultilingual(text, `PreviousYearQuestion ${q.id} option ${index}`),
    }));
    const correctOption = OPTION_IDS[q.correctAnswer] ?? OPTION_IDS[0];

    questionsById[q.id] = {
      id: q.id,
      sectionKey,
      // PreviousYearQuestion tracks section-level granularity only (no
      // topic FK, per the model's design) — "pyq" is a fixed marker, not a
      // real Topic.key, so downstream topic-name lookups (e.g. the Mistake
      // Vault's TOPIC_NAMES map) should treat it as "uncategorized" rather
      // than crash on a missing key.
      topicKey: "pyq",
      difficulty: q.difficulty as QuestionDifficulty,
      content: asMultilingual(q.questionJson, `PreviousYearQuestion ${q.id} questionJson`),
      options,
      correctOption,
      explanation: asMultilingual(q.explanation, `PreviousYearQuestion ${q.id} explanation`),
      timeLimitSeconds: 60,
    };
  }

  const sections: ExamSectionConfig[] = template.sections.map((s) => ({
    key: s.section.key,
    name: asMultilingual(s.section.name, `Section ${s.section.key} name`),
    order: s.order,
    timeLimitSeconds: s.timeLimitSeconds,
    questionIds: assembled.sections.find((a) => a.sectionKey === s.section.key)?.questionIds ?? [],
  }));

  const session: ExamSessionData = {
    examId: `jnvst-live-mock-${Date.now()}`,
    examType: "JNVST",
    templateName: asMultilingual(template.name, "ExamTemplate jnvst-class-6 name"),
    totalDurationSeconds: template.durationMinutes * 60,
    negativeMarkingRatio: template.negativeMarkingRatio,
    sections,
    questionsById,
    // The PYQ bank isn't linked to VedicSpeedHack rows (the practice-set
    // explanations name the sutra in prose instead — see the model comment
    // on PreviousYearQuestion) — an empty map is valid; ExamPlayer only
    // renders the speed-hack tip when a question's vedicSpeedHackId is set.
    speedHacksById: {},
  };

  return { session, warnings: assembled.warnings };
}
