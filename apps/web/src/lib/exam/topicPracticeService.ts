import { prisma, type ContentClassLevel, type ExamType } from "@vedicneev/db";

import { asExamOption, asFigureMetadata, asMultilingual } from "./questionHydration";
import type {
  ExamQuestion,
  ExamSectionConfig,
  ExamSessionData,
  Multilingual,
  QuestionDifficulty,
  VedicSpeedHack,
} from "./types";

export type TopicPracticeResult = { session: ExamSessionData };
export type TopicPracticeError = { error: string };

export interface PracticeTopicSummary {
  key: string;
  name: Multilingual;
  sectionKey: string;
  sectionName: Multilingual;
  questionCount: number;
  /** Null means exam-agnostic — shown to every student regardless of their chosen target exam. See Topic.targetExam. */
  targetExam: string | null;
  /** Never null in this summary — see Topic.targetClass's own doc comment for why null there means CLASS_6, not "any class"; this field always reports the resolved value (CLASS_6 when the underlying column is null). */
  targetClass: ContentClassLevel;
}

/**
 * Lists every practice-able Topic (has at least one seeded Question),
 * filtered by exam AND grade relevance:
 *
 * - Exam: a topic with no targetExam is exam-agnostic and always included;
 *   a topic tagged for one exam is included only when it matches the
 *   caller's `targetExam`. Passing no `targetExam` returns only the
 *   exam-agnostic topics — the safe default.
 *
 * - Class: unlike targetExam, a null Topic.targetClass does NOT mean
 *   "shown to every grade" — it means CLASS_6, the grade this schema
 *   originally (and solely) supported before targetClass existed (see
 *   that column's own doc comment in schema.prisma). So a CLASS_9 caller
 *   sees only explicitly CLASS_9-tagged topics, and everyone else (no
 *   `targetClass` passed, or an explicit CLASS_6) sees null-or-CLASS_6
 *   topics — never both, since there's no "grade-agnostic" topic today.
 *
 * Both filters apply together (AND), so a CLASS_9 AISSEE student sees only
 * topics that are (exam-agnostic OR AISSEE) AND CLASS_9-tagged. Read-only
 * and side-effect-free.
 */
export async function listPracticeTopics(targetExam?: string, targetClass?: string): Promise<PracticeTopicSummary[]> {
  const examWhere = targetExam ? { OR: [{ targetExam: null }, { targetExam: targetExam as ExamType }] } : { targetExam: null };
  const resolvedClass: ContentClassLevel = targetClass === "CLASS_9" ? "CLASS_9" : "CLASS_6";
  const classWhere: { targetClass: ContentClassLevel } | { OR: { targetClass: ContentClassLevel | null }[] } =
    resolvedClass === "CLASS_9" ? { targetClass: "CLASS_9" } : { OR: [{ targetClass: null }, { targetClass: "CLASS_6" }] };

  const topics = await prisma.topic.findMany({
    where: { AND: [examWhere, classWhere] },
    include: { section: true, _count: { select: { questions: true } } },
    orderBy: [{ section: { order: "asc" } }, { order: "asc" }],
  });
  return topics
    .filter((t) => t._count.questions > 0)
    .map((t) => ({
      key: t.key,
      name: asMultilingual(t.name, `Topic ${t.key} name`),
      sectionKey: t.section.key,
      sectionName: asMultilingual(t.section.name, `Section ${t.section.key} name`),
      questionCount: t._count.questions,
      targetExam: t.targetExam,
      targetClass: t.targetClass ?? "CLASS_6",
    }));
}

/**
 * Assembles a single-topic practice session straight from the real
 * Question bank (packages/db/prisma/schema.prisma's Question model, seeded
 * from packages/db/prisma/topic-seed/*.ts) — the topic-drill counterpart to
 * jnvstMockService.ts's PYQ-based full mock-paper generation. Every
 * question the given Topic has is included (topics here run ~5-40
 * questions, not the hundreds a PYQ pool draws from), the session is
 * untimed at the section level (practiceMode, not a race against the
 * clock), and there's no negative marking. `untimed` (default true) sets
 * ExamSessionData.untimed, which useTestStore's tick() and ExamHeader
 * respect — pass false for a student who wants a real countdown against
 * the same question set. Read-only and side-effect-free.
 */
export async function generateTopicPracticeSession(
  topicKey: string,
  { untimed = true }: { untimed?: boolean } = {}
): Promise<TopicPracticeResult | TopicPracticeError> {
  const topic = await prisma.topic.findFirst({
    where: { key: topicKey },
    include: { section: true },
  });
  if (!topic) {
    return { error: `Unknown topic "${topicKey}" — it isn't seeded yet.` };
  }

  const rows = await prisma.question.findMany({
    where: { topicId: topic.id },
    orderBy: { key: "asc" },
  });
  if (rows.length === 0) {
    return { error: `Topic "${topicKey}" has no questions seeded yet.` };
  }

  const hackIds = Array.from(new Set(rows.map((q) => q.vedicSpeedHackId).filter((id): id is string => Boolean(id))));
  const hacks = hackIds.length > 0 ? await prisma.vedicSpeedHack.findMany({ where: { id: { in: hackIds } } }) : [];
  const speedHacksById: Record<string, VedicSpeedHack> = {};
  for (const hack of hacks) {
    speedHacksById[hack.id] = {
      id: hack.id,
      key: hack.key,
      title: asMultilingual(hack.title, `VedicSpeedHack ${hack.id} title`),
      description: asMultilingual(hack.description, `VedicSpeedHack ${hack.id} description`),
    };
  }

  const questionsById: Record<string, ExamQuestion> = {};
  let totalDurationSeconds = 0;
  for (const q of rows) {
    const rawOptions = q.options as unknown[];
    questionsById[q.id] = {
      id: q.id,
      sectionKey: topic.section.key,
      topicKey: topic.key,
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
    totalDurationSeconds += q.timeLimitSeconds;
  }

  const topicName = asMultilingual(topic.name, `Topic ${topic.key} name`);
  const section: ExamSectionConfig = {
    key: topic.key,
    name: topicName,
    order: 1,
    timeLimitSeconds: null,
    questionIds: rows.map((q) => q.id),
  };

  const session: ExamSessionData = {
    examId: `topic-practice-${topic.key}-${Date.now()}`,
    examType: "JNVST",
    templateName: topicName,
    totalDurationSeconds,
    negativeMarkingRatio: 0,
    untimed,
    sections: [section],
    questionsById,
    speedHacksById,
  };

  return { session };
}
