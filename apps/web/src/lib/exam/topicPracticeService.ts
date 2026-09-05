import { prisma } from "@vedicneev/db";

import { asMultilingual } from "./jnvstMockService";
import type {
  ExamOption,
  ExamQuestion,
  ExamSectionConfig,
  ExamSessionData,
  FigureMetadata,
  QuestionDifficulty,
  VedicSpeedHack,
} from "./types";

export type TopicPracticeResult = { session: ExamSessionData };
export type TopicPracticeError = { error: string };

/** Same defensive-validation reasoning as asMultilingual — Question.options is a `Json` column shaped `{ id, text?, imageUrl? }[]` (see packages/db/prisma/schema.prisma), not type-checked by Prisma. */
function asExamOption(raw: unknown, context: string): ExamOption {
  if (typeof raw !== "object" || raw === null || typeof (raw as Record<string, unknown>).id !== "string") {
    throw new Error(`Expected an option with a string "id" for ${context}, got: ${JSON.stringify(raw)}`);
  }
  const o = raw as Record<string, unknown>;
  const option: ExamOption = { id: o.id as string };
  if (o.text !== undefined) option.text = asMultilingual(o.text, `${context} text`);
  if (typeof o.imageUrl === "string") option.imageUrl = o.imageUrl;
  return option;
}

/** Same reasoning — Question.figureMetadata is a `Json` column shaped `{ type: "svg"|"image", markup?, url?, transform? }` (see packages/db/prisma/schema.prisma), not type-checked by Prisma. */
function asFigureMetadata(raw: unknown, context: string): FigureMetadata {
  const type = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>).type : undefined;
  if (type !== "svg" && type !== "image") {
    throw new Error(`Expected figureMetadata with type "svg" or "image" for ${context}, got: ${JSON.stringify(raw)}`);
  }
  return raw as FigureMetadata;
}

/**
 * Assembles a single-topic practice session straight from the real
 * Question bank (packages/db/prisma/schema.prisma's Question model, seeded
 * from packages/db/prisma/topic-seed/*.ts) — the topic-drill counterpart to
 * jnvstMockService.ts's PYQ-based full mock-paper generation. Every
 * question the given Topic has is included (topics here run ~5-40
 * questions, not the hundreds a PYQ pool draws from), the session is
 * untimed at the section level (practiceMode, not a race against the
 * clock), and there's no negative marking. Read-only and side-effect-free.
 */
export async function generateTopicPracticeSession(topicKey: string): Promise<TopicPracticeResult | TopicPracticeError> {
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
    sections: [section],
    questionsById,
    speedHacksById,
  };

  return { session };
}
