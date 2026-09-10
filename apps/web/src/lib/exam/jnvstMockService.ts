import { prisma } from "@vedicneev/db";
import { assembleJnvstMock, type JnvstSectionKey, type PyqPoolItem, type SectionBlueprint } from "@vedicneev/engine";

import type { ExamOption, ExamQuestion, ExamSectionConfig, ExamSessionData, ExamType, Multilingual, QuestionDifficulty } from "./types";
import { asExamOption, asFigureMetadata, asMultilingual } from "./questionHydration";

const JNVST_TEMPLATE_SLUG = "jnvst-class-6";
const OPTION_IDS = ["a", "b", "c", "d"] as const;

/** Template slugs launchable via the generalized live-mock path below (packages/db/prisma/seed.ts's ExamTemplate.slug rows) — a template not in this catalog isn't offered as a live mock even if it exists in the DB, so a half-seeded template can't be launched accidentally. */
export const LIVE_MOCK_TEMPLATE_SLUGS = [
  "jnvst-class-6",
  "jnvst-class-9",
  "aissee-class-9",
  "rms-class-9",
  "aissee-class-6",
  "rms-class-6",
] as const;
export type LiveMockTemplateSlug = (typeof LIVE_MOCK_TEMPLATE_SLUGS)[number];

/**
 * Slugs whose full-length mock assembles from the real Question bank
 * (packages/db/prisma/topic-seed/*) instead of the PreviousYearQuestion PYQ
 * table. AISSEE/RMS Class 6 have no seeded PYQ content, but the Question
 * bank already carries enough verified, exam-tagged content (see
 * apps/web/src/lib/exam/topicPracticeService.ts's targetExam filtering) to
 * assemble a complete paper — see assembleFromQuestionBank below.
 */
const QUESTION_BANK_MOCK_SLUGS = ["aissee-class-6", "rms-class-6"] as const;

export function isLiveMockTemplateSlug(slug: string): slug is LiveMockTemplateSlug {
  return (LIVE_MOCK_TEMPLATE_SLUGS as readonly string[]).includes(slug);
}

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

/** Shared PreviousYearQuestion -> ExamQuestion hydration, used by both generateJnvstMockSession and getJnvstSampleQuestions below so the two can never format a question differently. */
function hydratePyqRow(
  q: { id: string; sectionId: string; optionsJson: unknown; correctAnswer: number; difficulty: string; questionJson: unknown; explanation: unknown },
  sectionKeyById: Map<string, JnvstSectionKey>
): ExamQuestion {
  const sectionKey = sectionKeyById.get(q.sectionId) ?? "mental_ability";
  const optionTexts = q.optionsJson as unknown[];
  const options: ExamOption[] = optionTexts.map((text, index) => ({
    id: OPTION_IDS[index] ?? String(index),
    text: asMultilingual(text, `PreviousYearQuestion ${q.id} option ${index}`),
  }));
  const correctOption = OPTION_IDS[q.correctAnswer] ?? OPTION_IDS[0];

  return {
    id: q.id,
    sectionKey,
    // PreviousYearQuestion tracks section-level granularity only (no topic
    // FK, per the model's design) — "pyq" is a fixed marker, not a real
    // Topic.key, so downstream topic-name lookups (e.g. the Mistake Vault's
    // TOPIC_NAMES map) should treat it as "uncategorized" rather than crash
    // on a missing key.
    topicKey: "pyq",
    difficulty: q.difficulty as QuestionDifficulty,
    content: asMultilingual(q.questionJson, `PreviousYearQuestion ${q.id} questionJson`),
    options,
    correctOption,
    explanation: asMultilingual(q.explanation, `PreviousYearQuestion ${q.id} explanation`),
    timeLimitSeconds: 60,
  };
}

/**
 * One PreviousYearQuestion per section (Mental Ability / Arithmetic /
 * Language) for the pre-auth preview shown on the Mock Exam Series intro
 * screen, before a visitor picks "Sign in first" or "Sign in later" — see
 * getTopicSampleQuestions in topicPracticeService.ts for the same pattern
 * applied to single-topic practice. Read-only and side-effect-free.
 */
export async function getJnvstSampleQuestions(): Promise<{ questions: ExamQuestion[] } | JnvstMockGenerationError> {
  const template = await prisma.examTemplate.findUnique({
    where: { slug: JNVST_TEMPLATE_SLUG },
    include: { sections: { include: { section: true }, orderBy: { order: "asc" } } },
  });
  if (!template) {
    return { error: `Exam template "${JNVST_TEMPLATE_SLUG}" isn't seeded yet.` };
  }

  const sectionKeyById = new Map<string, JnvstSectionKey>(
    template.sections.map((s) => [s.sectionId, s.section.key as JnvstSectionKey])
  );

  const rows = await Promise.all(
    template.sections.map((s) =>
      prisma.previousYearQuestion.findFirst({
        where: { examType: "JNVST", classLevel: 6, sectionId: s.sectionId },
        orderBy: { id: "asc" },
      })
    )
  );

  const questions = rows
    .filter((q): q is NonNullable<typeof q> => q !== null)
    .map((q) => hydratePyqRow(q, sectionKeyById));

  return { questions };
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
    questionsById[q.id] = hydratePyqRow(q, sectionKeyById);
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

/**
 * Generalized version of getJnvstClassSixBlueprint/generateJnvstMockSession
 * above — looks up ANY seeded ExamTemplate by slug instead of assuming
 * "jnvst-class-6", and reads examType/classLevel off the template row
 * instead of hardcoding them. Added alongside the JNVST-Class-6-specific
 * functions (left unchanged, still used by the existing
 * /api/exams/jnvst/generate-mock route) rather than replacing them, so
 * that existing route keeps working unmodified. New callers — e.g. Class 9
 * live mocks — should use this pair instead.
 */
export async function getExamBlueprint(slug: string): Promise<JnvstBlueprint | JnvstMockGenerationError> {
  const template = await prisma.examTemplate.findUnique({
    where: { slug },
    include: { sections: { include: { section: true }, orderBy: { order: "asc" } } },
  });
  if (!template) {
    return { error: `Exam template "${slug}" isn't seeded yet.` };
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

/**
 * Assembles a full-length mock from the real Question bank instead of the
 * PreviousYearQuestion table — see QUESTION_BANK_MOCK_SLUGS above for why.
 * Reuses assembleJnvstMock (packages/engine) unchanged: it only needs an
 * {id, sectionKey} pool and a blueprint, so drawing from Question instead
 * of PreviousYearQuestion needs no engine changes, only a different pool
 * query and a different hydration step below. The pool is filtered to
 * targetExam null-or-matching (never a different exam's exclusive
 * content — the same boundary topicPracticeService.ts's catalog filtering
 * already enforces), so a shortfall here (e.g. a section whose bank isn't
 * deep enough yet) surfaces as assembleJnvstMock's normal non-fatal
 * warning, never by borrowing another exam's questions to pad it out.
 */
async function assembleFromQuestionBank(
  template: NonNullable<Awaited<ReturnType<typeof prisma.examTemplate.findUnique>>> & {
    sections: { sectionId: string; order: number; timeLimitSeconds: number | null; section: { key: string; name: unknown } }[];
  },
  blueprint: SectionBlueprint[],
  sectionKeyById: Map<string, JnvstSectionKey>
): Promise<JnvstMockGenerationResult | JnvstMockGenerationError> {
  const sectionIds = template.sections.map((s) => s.sectionId);
  const pool = await prisma.question.findMany({
    where: {
      topic: { sectionId: { in: sectionIds } },
      OR: [{ targetExam: null }, { targetExam: template.examType }],
    },
    select: { id: true, topic: { select: { key: true, sectionId: true } } },
  });
  const poolItems: PyqPoolItem[] = pool.map((q) => ({
    id: q.id,
    sectionKey: sectionKeyById.get(q.topic.sectionId) ?? template.sections[0]!.section.key,
  }));

  const assembled = assembleJnvstMock(poolItems, blueprint);
  const drawnIds = assembled.sections.flatMap((s) => s.questionIds);
  if (drawnIds.length === 0) {
    return { error: `No verified question-bank content is available yet for "${template.slug}".` };
  }

  const drawnQuestions = await prisma.question.findMany({
    where: { id: { in: drawnIds } },
    include: { topic: true },
  });

  const questionsById: Record<string, ExamQuestion> = {};
  for (const q of drawnQuestions) {
    const sectionKey = sectionKeyById.get(q.topic.sectionId) ?? template.sections[0]!.section.key;
    const rawOptions = q.options as unknown[];
    questionsById[q.id] = {
      id: q.id,
      sectionKey,
      topicKey: q.topic.key,
      difficulty: q.difficulty as QuestionDifficulty,
      content: asMultilingual(q.content, `Question ${q.key} content`),
      options: rawOptions.map((o, idx) => asExamOption(o, `Question ${q.key} option ${idx}`)),
      correctOption: q.correctOption,
      figureMetadata: q.figureMetadata ? asFigureMetadata(q.figureMetadata, `Question ${q.key} figureMetadata`) : undefined,
      vedicSpeedHackId: q.vedicSpeedHackId ?? null,
      explanation: q.explanation ? asMultilingual(q.explanation, `Question ${q.key} explanation`) : null,
      explanationVideoUrl: q.explanationVideoUrl ?? null,
      timeLimitSeconds: q.timeLimitSeconds,
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
    examId: `${template.slug}-live-mock-${Date.now()}`,
    examType: template.examType as ExamType,
    templateName: asMultilingual(template.name, `ExamTemplate ${template.slug} name`),
    totalDurationSeconds: template.durationMinutes * 60,
    negativeMarkingRatio: template.negativeMarkingRatio,
    sections,
    questionsById,
    speedHacksById: {},
  };

  return { session, warnings: assembled.warnings };
}

export async function generateLiveMockSession(slug: string): Promise<JnvstMockGenerationResult | JnvstMockGenerationError> {
  const template = await prisma.examTemplate.findUnique({
    where: { slug },
    include: { sections: { include: { section: true }, orderBy: { order: "asc" } } },
  });
  if (!template) {
    return { error: `Exam template "${slug}" isn't seeded yet — run the db seed script first.` };
  }
  if (template.sections.length === 0) {
    return { error: `Exam template "${slug}" has no sections configured.` };
  }

  const sectionKeyById = new Map<string, JnvstSectionKey>(
    template.sections.map((s) => [s.sectionId, s.section.key])
  );

  const blueprint: SectionBlueprint[] = template.sections.map((s) => ({
    sectionKey: s.section.key,
    questionCount: s.questionCount,
  }));

  if ((QUESTION_BANK_MOCK_SLUGS as readonly string[]).includes(slug)) {
    return assembleFromQuestionBank(template, blueprint, sectionKeyById);
  }

  const pool = await prisma.previousYearQuestion.findMany({
    where: {
      examType: template.examType,
      classLevel: template.classLevel,
      sectionId: { in: template.sections.map((s) => s.sectionId) },
    },
    select: { id: true, sectionId: true },
  });
  const poolItems: PyqPoolItem[] = pool.map((p) => ({
    id: p.id,
    sectionKey: sectionKeyById.get(p.sectionId) ?? template.sections[0]!.section.key,
  }));

  const assembled = assembleJnvstMock(poolItems, blueprint);
  const drawnIds = assembled.sections.flatMap((s) => s.questionIds);

  if (drawnIds.length === 0) {
    return { error: `No Previous-Year-Question content is seeded yet for "${slug}" — nothing to assemble a mock from.` };
  }

  const drawnQuestions = await prisma.previousYearQuestion.findMany({ where: { id: { in: drawnIds } } });

  const questionsById: Record<string, ExamQuestion> = {};
  for (const q of drawnQuestions) {
    const sectionKey = sectionKeyById.get(q.sectionId) ?? template.sections[0]!.section.key;
    const optionTexts = q.optionsJson as unknown[];
    const options: ExamOption[] = optionTexts.map((text, index) => ({
      id: OPTION_IDS[index] ?? String(index),
      text: asMultilingual(text, `PreviousYearQuestion ${q.id} option ${index}`),
    }));
    const correctOption = OPTION_IDS[q.correctAnswer] ?? OPTION_IDS[0];

    questionsById[q.id] = {
      id: q.id,
      sectionKey,
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
    examId: `${slug}-live-mock-${Date.now()}`,
    examType: template.examType as ExamType,
    templateName: asMultilingual(template.name, `ExamTemplate ${slug} name`),
    totalDurationSeconds: template.durationMinutes * 60,
    negativeMarkingRatio: template.negativeMarkingRatio,
    sections,
    questionsById,
    speedHacksById: {},
  };

  return { session, warnings: assembled.warnings };
}
