import { BUBBLE_OPTIONS, generateOmrSheetSpec, type BubbleOption, type OmrAnswerKeyEntry, type OmrSheetSpec } from "@vedicneev/engine";

import type { ExamQuestion, ExamSessionData } from "./types";

/** Global 1-indexed question order, matching the exam player's numbering (section order, then within-section order). */
export function orderedQuestionIdsForSession(session: ExamSessionData): string[] {
  return session.sections.flatMap((s) => s.questionIds);
}

/** Builds an OMR bubble-grid spec sized to this session's actual question count. */
/** Builds an array of OMR bubble-grid specs, chunking questions across multiple A4 pages if necessary. */
export function buildOmrSpecsForSession(session: ExamSessionData): OmrSheetSpec[] {
  const orderedIds = orderedQuestionIdsForSession(session);
  const totalQuestions = orderedIds.length;
  
  // Max questions per single A4 page to avoid visual overcrowding / clipping
  const QUESTIONS_PER_PAGE = 50;
  
  if (totalQuestions <= QUESTIONS_PER_PAGE) {
    const dynamicColumns = totalQuestions > 25 ? 3 : 2;
    return [
      generateOmrSheetSpec({
        examType: session.examType as any,
        totalQuestions,
        columns: dynamicColumns,
        rollNumberDigits: session.examType === "RMS" ? 5 : 6,
      })
    ];
  }

  // Multi-page chunking logic
  const specs: OmrSheetSpec[] = [];
  let remaining = totalQuestions;
  let offset = 0;

  while (remaining > 0) {
    const chunkCount = Math.min(remaining, QUESTIONS_PER_PAGE);
    specs.push(
      generateOmrSheetSpec({
        examType: session.examType as any,
        totalQuestions: chunkCount,
        columns: 4,
        rollNumberDigits: session.examType === "RMS" ? 5 : 6,
      })
    );
    remaining -= chunkCount;
    offset += chunkCount;
  }

  return specs;
}

// Backward compatibility wrapper if single spec is expected elsewhere
export function buildOmrSpecForSession(session: ExamSessionData): OmrSheetSpec {
  return buildOmrSpecsForSession(session)[0];
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
