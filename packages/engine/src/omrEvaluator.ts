import type { MarkingScheme } from "./scoring";
import type { BubbleOption } from "./omr";

export type OmrResponseOutcome = "CORRECT" | "INCORRECT" | "UNATTEMPTED" | "INVALID_MULTIPLE_FILL";

export interface OmrAnswerKeyEntry {
  questionNumber: number;
  correctOption: BubbleOption;
}

export interface OmrQuestionScan {
  questionNumber: number;
  /** Options already determined to be "marked" (post-threshold) for this question — 0, 1, or more. */
  markedOptions: BubbleOption[];
}

export interface EvaluatedOmrResponse {
  questionNumber: number;
  markedOptions: BubbleOption[];
  outcome: OmrResponseOutcome;
  /** Only set when exactly one bubble was marked. */
  selectedOption?: BubbleOption;
  correctOption: BubbleOption;
  marksAwarded: number;
}

/**
 * Grades a single question from its detected marked bubbles:
 * - 0 marked  -> UNATTEMPTED
 * - 1 marked  -> CORRECT / INCORRECT against the answer key
 * - 2+ marked -> INVALID_MULTIPLE_FILL, always 0 marks (a spoiled response
 *   is voided, not penalized, regardless of the scheme's negative marking)
 */
export function evaluateOmrQuestion(
  scan: OmrQuestionScan,
  correctOption: BubbleOption,
  scheme: MarkingScheme
): EvaluatedOmrResponse {
  const { questionNumber, markedOptions } = scan;

  if (markedOptions.length === 0) {
    return {
      questionNumber,
      markedOptions,
      outcome: "UNATTEMPTED",
      correctOption,
      marksAwarded: scheme.unattemptedMarks,
    };
  }

  if (markedOptions.length > 1) {
    return {
      questionNumber,
      markedOptions,
      outcome: "INVALID_MULTIPLE_FILL",
      correctOption,
      marksAwarded: 0,
    };
  }

  const selectedOption = markedOptions[0]!;
  const isCorrect = selectedOption === correctOption;
  return {
    questionNumber,
    markedOptions,
    outcome: isCorrect ? "CORRECT" : "INCORRECT",
    selectedOption,
    correctOption,
    marksAwarded: isCorrect ? scheme.correctMarks : -scheme.negativeMarks,
  };
}

export interface OmrSheetEvaluationSummary {
  responses: EvaluatedOmrResponse[];
  totalMarks: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  invalidCount: number;
}

/** Grades a full sheet's scans against an answer key. Throws if a scanned question has no matching answer-key entry. */
export function evaluateOmrSheet(
  scans: OmrQuestionScan[],
  answerKey: OmrAnswerKeyEntry[],
  scheme: MarkingScheme
): OmrSheetEvaluationSummary {
  const correctByQuestion = new Map(answerKey.map((entry) => [entry.questionNumber, entry.correctOption]));

  const responses = scans.map((scan) => {
    const correctOption = correctByQuestion.get(scan.questionNumber);
    if (!correctOption) {
      throw new Error(`No answer key entry for question ${scan.questionNumber}`);
    }
    return evaluateOmrQuestion(scan, correctOption, scheme);
  });

  const summary: OmrSheetEvaluationSummary = {
    responses,
    totalMarks: 0,
    correctCount: 0,
    incorrectCount: 0,
    unattemptedCount: 0,
    invalidCount: 0,
  };

  for (const response of responses) {
    summary.totalMarks += response.marksAwarded;
    if (response.outcome === "CORRECT") summary.correctCount += 1;
    else if (response.outcome === "INCORRECT") summary.incorrectCount += 1;
    else if (response.outcome === "UNATTEMPTED") summary.unattemptedCount += 1;
    else summary.invalidCount += 1;
  }

  return summary;
}
