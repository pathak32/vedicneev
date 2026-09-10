import {
  BUBBLE_OPTIONS,
  generateOmrSheetSpec,
  type BubbleOption,
  type OmrAnswerKeyEntry,
  type OmrExamType,
  type OmrSheetSpec,
} from "@vedicneev/engine";

import type { ExamQuestion, ExamSessionData, ExamType } from "./types";

// The app's own ExamType includes "DPS" (private-school admissions), which
// has no distinct OMR bubble/fiducial layout of its own — the engine's
// OmrExamType has no such member, so DPS sheets fall back to "OTHER"
// rather than being force-cast to a type they don't satisfy.
function toOmrExamType(examType: ExamType): OmrExamType {
  return examType === "DPS" ? "OTHER" : examType;
}

/** Global 1-indexed question order, matching the exam player's numbering (section order, then within-section order). */
export function orderedQuestionIdsForSession(session: ExamSessionData): string[] {
  return session.sections.flatMap((s) => s.questionIds);
}

const QUESTIONS_PER_PAGE = 50;

/** Builds an array of OMR bubble-grid specs, chunking questions across multiple A4 pages when the session exceeds one page's capacity. */
export function buildOmrSpecsForSession(session: ExamSessionData): OmrSheetSpec[] {
  const totalQuestions = orderedQuestionIdsForSession(session).length;
  const examType = toOmrExamType(session.examType);
  const rollNumberDigits = session.examType === "RMS" ? 5 : 6;

  if (totalQuestions <= QUESTIONS_PER_PAGE) {
    const dynamicColumns = totalQuestions > 25 ? 3 : 2;
    return [generateOmrSheetSpec({ examType, totalQuestions, columns: dynamicColumns, rollNumberDigits })];
  }

  const specs: OmrSheetSpec[] = [];
  let remaining = totalQuestions;
  while (remaining > 0) {
    const chunkCount = Math.min(remaining, QUESTIONS_PER_PAGE);
    specs.push(generateOmrSheetSpec({ examType, totalQuestions: chunkCount, columns: 4, rollNumberDigits }));
    remaining -= chunkCount;
  }

  return specs;
}

export function buildAnswerKeyForSession(session: ExamSessionData): OmrAnswerKeyEntry[] {
  const orderedIds = orderedQuestionIdsForSession(session);
  return orderedIds.map((questionId, index) => {
    const question = session.questionsById[questionId]!;
    const correctOption = questionOptionIdToOmrOption(question, question.correctOption) ?? "A";
    return { questionNumber: index + 1, correctOption };
  });
}

/** Converts an exam option id (e.g. "b") to its OMR bubble letter, by position in the question's options array. */
export function questionOptionIdToOmrOption(question: ExamQuestion, optionId: string): BubbleOption | undefined {
  const index = question.options.findIndex((o) => o.id === optionId);
  return index >= 0 ? BUBBLE_OPTIONS[index] : undefined;
}

/** Converts an OMR bubble letter back to the exam's option id, by position in the question's options array. */
export function omrOptionToQuestionOptionId(question: ExamQuestion, omrOption: BubbleOption): string | undefined {
  const index = BUBBLE_OPTIONS.indexOf(omrOption);
  return question.options[index]?.id;
}
