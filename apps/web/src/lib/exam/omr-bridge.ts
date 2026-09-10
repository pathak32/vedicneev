import { BUBBLE_OPTIONS, generateOmrSheetSpec, type BubbleOption, type OmrAnswerKeyEntry, type OmrSheetSpec } from "@vedicneev/engine";

import type { ExamQuestion, ExamSessionData } from "./types";

/** Global 1-indexed question order, matching the exam player's numbering (section order, then within-section order). */
export function orderedQuestionIdsForSession(session: ExamSessionData): string[] {
  return session.sections.flatMap((s) => s.questionIds);
}

/** Builds an OMR bubble-grid spec sized to this session's actual question count. */
export function buildOmrSpecForSession(session: ExamSessionData): OmrSheetSpec {
  const totalQuestions = orderedQuestionIdsForSession(session).length;
  // Dynamically calculate grid columns based on question density and exam type
  const dynamicColumns = totalQuestions > 90 ? 5 : totalQuestions > 50 ? 4 : totalQuestions > 25 ? 3 : 2;

  return generateOmrSheetSpec({
    examType: session.examType as any,
    totalQuestions,
    columns: dynamicColumns,
    rollNumberDigits: session.examType === "RMS" ? 5 : 6,
  });
}

/** Maps each question's correct answer to its OMR bubble letter (A-D), by option position. */
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
