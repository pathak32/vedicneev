import { prisma, type ExamType } from "@vedicneev/db";

import { localize } from "@/lib/exam/localize";
import { asExamOption, asMultilingual } from "@/lib/exam/questionHydration";
import type { Multilingual } from "@/lib/exam/types";

/**
 * Slugs whose live mock draws from the Question bank instead of
 * PreviousYearQuestion — mirrors QUESTION_BANK_MOCK_SLUGS in
 * jnvstMockService.ts exactly, since this must resolve the identical pool
 * a student's randomly-assembled paper actually draws from. Duplicated
 * rather than imported because the source constant isn't exported (it's
 * private to that module's own assembly logic) — if that ever changes,
 * import it instead of keeping two copies in sync by hand.
 */
const QUESTION_BANK_MOCK_SLUGS = new Set(["aissee-class-6", "rms-class-6"]);

export interface SprintPoolOption {
  key: string;
  text: Multilingual;
  isCorrect: boolean;
}

export interface SprintPoolQuestion {
  id: string;
  source: "QUESTION" | "PYQ";
  sectionKey: string;
  sectionName: string;
  difficulty: string;
  content: Multilingual;
  options: SprintPoolOption[];
  explanation: Multilingual | null;
  /** ISO 8601, or null if not yet reviewed. */
  verifiedAt: string | null;
}

export interface SprintPool {
  templateSlug: string;
  templateName: string;
  examType: ExamType;
  classLevel: number;
  totalMarks: number;
  durationMinutes: number;
  questions: SprintPoolQuestion[];
}

/**
 * Loads every question that COULD appear in a National Sprint built on
 * this ExamTemplate — the full source pool, not one student's randomly-
 * assembled paper. Sprints have no single fixed paper (see
 * generateLiveMockSession in jnvstMockService.ts, which this mirrors the
 * eligibility filtering of exactly): each registrant draws their own
 * random subset at attempt time. Reviewing/exporting the full pool is the
 * only way to actually verify everything a student might see, and is what
 * /admin/sprints and the PDF export are both built around.
 */
export async function loadSprintQuestionPool(examTemplateId: string): Promise<SprintPool | null> {
  const template = await prisma.examTemplate.findUnique({
    where: { id: examTemplateId },
    include: { sections: { include: { section: true }, orderBy: { order: "asc" } } },
  });
  if (!template) return null;

  const sectionIds = template.sections.map((s) => s.sectionId);
  const sectionInfoById = new Map(
    template.sections.map((s) => [
      s.sectionId,
      { key: s.section.key, name: localize(asMultilingual(s.section.name, `Section ${s.section.key} name`), "en") },
    ])
  );

  const questions: SprintPoolQuestion[] = [];

  if (QUESTION_BANK_MOCK_SLUGS.has(template.slug)) {
    const rows = await prisma.question.findMany({
      where: {
        topic: { sectionId: { in: sectionIds } },
        OR: [{ targetExam: null }, { targetExam: template.examType }],
      },
      include: { topic: { include: { section: true } } },
      orderBy: [{ topicId: "asc" }, { createdAt: "asc" }],
    });
    for (const q of rows) {
      const rawOptions = q.options as unknown[];
      const options = rawOptions.map((o, idx) => asExamOption(o, `Question ${q.key} option ${idx}`));
      questions.push({
        id: q.id,
        source: "QUESTION",
        sectionKey: q.topic.section.key,
        sectionName: localize(asMultilingual(q.topic.section.name, `Section ${q.topic.section.key} name`), "en"),
        difficulty: q.difficulty,
        content: asMultilingual(q.content, `Question ${q.key} content`),
        options: options.map((o) => ({
          key: o.id,
          text: o.text ?? { en: "(figure — see options)" },
          isCorrect: o.id === q.correctOption,
        })),
        explanation: q.explanation ? asMultilingual(q.explanation, `Question ${q.key} explanation`) : null,
        verifiedAt: q.verifiedAt ? q.verifiedAt.toISOString() : null,
      });
    }
  } else {
    const rows = await prisma.previousYearQuestion.findMany({
      where: { examType: template.examType, classLevel: template.classLevel, sectionId: { in: sectionIds } },
      orderBy: [{ sectionId: "asc" }, { year: "asc" }],
    });
    for (const q of rows) {
      const optionTexts = q.optionsJson as unknown[];
      const sectionInfo = sectionInfoById.get(q.sectionId);
      questions.push({
        id: q.id,
        source: "PYQ",
        sectionKey: sectionInfo?.key ?? q.sectionId,
        sectionName: sectionInfo?.name ?? q.sectionId,
        difficulty: q.difficulty,
        content: asMultilingual(q.questionJson, `PreviousYearQuestion ${q.key} content`),
        options: optionTexts.map((text, idx) => ({
          key: String(idx),
          text: asMultilingual(text, `PreviousYearQuestion ${q.key} option ${idx}`),
          isCorrect: idx === q.correctAnswer,
        })),
        explanation: asMultilingual(q.explanation, `PreviousYearQuestion ${q.key} explanation`),
        verifiedAt: q.verifiedAt ? q.verifiedAt.toISOString() : null,
      });
    }
  }

  return {
    templateSlug: template.slug,
    templateName: localize(asMultilingual(template.name, `ExamTemplate ${template.slug} name`), "en"),
    examType: template.examType,
    classLevel: template.classLevel,
    totalMarks: template.totalMarks,
    durationMinutes: template.durationMinutes,
    questions,
  };
}
