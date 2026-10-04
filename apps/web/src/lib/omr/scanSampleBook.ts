import {
  computeHomography,
  detectFiducialCorners,
  evaluateOmrQuestion,
  sampleBubbleFillRatio,
  type BubbleOption,
  type EvaluatedOmrResponse,
  type GrayscaleImage,
  type MarkingScheme,
  type OmrSheetSpec,
  type Point,
} from "@vedicneev/engine";

/**
 * Same proven threshold apps/omrtest/src/lib/omr/analyzeOmrUpload.ts and
 * apps/web/src/components/omr/OmrScanner.tsx both use for bubble reads —
 * duplicated as a named constant here rather than imported, matching their
 * same precedent (this value lives wherever a bubble is actually sampled,
 * not in a shared package).
 */
const FILL_THRESHOLD = 0.42;

export interface SampleBookAnswerKeyEntry {
  questionNumber: number;
  correctOption: BubbleOption;
  /** Travels per-question rather than one scheme-wide constant — see SampleBookAnswerKey.answerKey's own schema comment for why. */
  marksEach: number;
}

export type SampleBookScanResult =
  | { outcome: "UNREADABLE"; reason: string }
  | {
      outcome: "SCORED";
      responses: EvaluatedOmrResponse[];
      totalMarks: number;
      maxMarks: number;
      correctCount: number;
      incorrectCount: number;
      unattemptedCount: number;
      invalidCount: number;
    };

/**
 * The full read-and-grade pipeline for one uploaded sample-book sheet,
 * pure and side-effect-free (no DB access) so the caller (the scan route)
 * owns every persistence decision — same shape as analyzeOmrUpload.ts's
 * identical split, just without that function's roster-matching/sheet-
 * token/set-bubble steps: this product's OMR sheets (omrSheetDocument.mts)
 * carry none of those, since the buyer picks their exact set from a
 * dropdown instead of it being decoded off the sheet (see this feature's
 * own design notes on why — shipping the simpler dropdown version first).
 *
 * Grades question-by-question via evaluateOmrQuestion rather than the
 * batch evaluateOmrSheet, because each question can carry its own marks
 * value (answerKey's own comment explains why evaluateOmrSheet's single
 * MarkingScheme can't express that). None of this product's exam patterns
 * use negative marking today (see EXAM_PATTERNS in
 * apps/web/scripts/lib/mockPaperSelection.mts), so negativeMarks is always
 * 0 here — not wired to a per-question value because there's no real case
 * yet that needs one.
 */
export function scanSampleBook(image: GrayscaleImage, spec: OmrSheetSpec, answerKey: SampleBookAnswerKeyEntry[]): SampleBookScanResult {
  const fiducialResult = detectFiducialCorners(image);
  if (!fiducialResult) {
    return {
      outcome: "UNREADABLE",
      reason: "Could not locate the sheet's 4 corner markers — ensure the full sheet is in frame, well-lit, and roughly upright, then rescan.",
    };
  }

  const idealCorners = spec.fiducials.map((f) => ({ x: f.x, y: f.y })) as [Point, Point, Point, Point];
  const homography = computeHomography(idealCorners, fiducialResult.corners);

  const markedByQuestion = new Map<number, BubbleOption[]>();
  for (const bubble of spec.bubbles) {
    const fillRatio = sampleBubbleFillRatio(image, homography, { x: bubble.x, y: bubble.y }, 6);
    if (fillRatio > FILL_THRESHOLD) {
      const list = markedByQuestion.get(bubble.questionNumber) ?? [];
      list.push(bubble.option);
      markedByQuestion.set(bubble.questionNumber, list);
    }
  }

  const responses: EvaluatedOmrResponse[] = [];
  let totalMarks = 0;
  let maxMarks = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let invalidCount = 0;

  for (const entry of answerKey) {
    const scheme: MarkingScheme = { correctMarks: entry.marksEach, negativeMarks: 0, unattemptedMarks: 0 };
    const response = evaluateOmrQuestion(
      { questionNumber: entry.questionNumber, markedOptions: markedByQuestion.get(entry.questionNumber) ?? [] },
      entry.correctOption,
      scheme
    );
    responses.push(response);
    totalMarks += response.marksAwarded;
    maxMarks += entry.marksEach;
    switch (response.outcome) {
      case "CORRECT":
        correctCount++;
        break;
      case "INCORRECT":
        incorrectCount++;
        break;
      case "UNATTEMPTED":
        unattemptedCount++;
        break;
      case "INVALID_MULTIPLE_FILL":
        invalidCount++;
        break;
    }
  }

  return { outcome: "SCORED", responses, totalMarks, maxMarks, correctCount, incorrectCount, unattemptedCount, invalidCount };
}
