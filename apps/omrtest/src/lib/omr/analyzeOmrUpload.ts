import {
  DEFAULT_MARKING_SCHEME,
  computeHomography,
  decodeDigitGrid,
  detectFiducialCorners,
  evaluateOmrSheet,
  resolveAnswerKeyForSet,
  sampleBubbleFillRatio,
  type BubbleOption,
  type GrayscaleImage,
  type OmrAnswerKeyEntry,
  type OmrQuestionScan,
  type OmrSheetEvaluationSummary,
  type OmrSheetSpec,
  type Point,
  type SetMappings,
} from "@vedicneev/engine";

/**
 * Same proven threshold apps/web/src/components/omr/OmrScanner.tsx uses
 * for its own (browser-side, consumer-product) bubble reads — kept as one
 * named constant here rather than imported, since that component is
 * app-local, not part of a shared package (see its own file for the
 * original value/rationale).
 */
export const FILL_THRESHOLD = 0.42;

export interface RosterEntryForMatching {
  id: string;
  sheetToken: string;
  consumedAt: Date | null;
  rollNumber: string;
}

export type OmrAnalysisResult =
  | { outcome: "UNREADABLE"; reason: string }
  | { outcome: "ROSTER_MISMATCH"; reason: string; detectedSheetToken: string }
  | { outcome: "DUPLICATE"; reason: string; rosterEntryId: string; detectedSheetToken: string }
  | {
      outcome: "MATCHED";
      rosterEntryId: string;
      detectedSheetToken: string;
      /** "SET_1".."SET_5" when spec.setGrid is non-empty and exactly one set bubble was filled; null for a single-set batch, or when the set bubble couldn't be read unambiguously. */
      detectedSetCode: string | null;
      scans: OmrQuestionScan[];
      /** null when there's no answerKey to grade against yet — either TestBatch.answerKey is unset (see its own comment), or this is a multi-set batch whose Set bubble couldn't be read. The caller persists this as QUEUED rather than GRADED either way. */
      grading: OmrSheetEvaluationSummary | null;
    };

/**
 * The full read-and-match pipeline for one uploaded sheet image, pure and
 * side-effect-free (no DB access, no Prisma types) so it's testable on its
 * own and so the caller (the upload route) owns every persistence decision.
 * Every step reuses packages/engine/src/omrScan.ts's already-tested
 * pixel-math — fiducial-anchored homography, then per-bubble darkness
 * sampling — the exact same technique OmrScanner.tsx uses in the browser,
 * just fed from a server-decoded image (see decodeImage.ts) instead of
 * <canvas>.getImageData.
 *
 * Order matters: corner detection and sheetToken reading gate everything
 * else (there's no sensible answer to "is this a duplicate" or "what did
 * they mark" for a sheet whose identity can't be trusted yet), and roster
 * matching happens before answer-bubble reading so a mismatched/duplicate
 * sheet is rejected without wasting the (slightly more expensive) full
 * bubble sweep.
 */
export function analyzeOmrUpload(
  image: GrayscaleImage,
  spec: OmrSheetSpec,
  rosterEntries: RosterEntryForMatching[],
  /** The single-set batch's frozen key — used as-is whenever spec.setGrid is empty, and as the fallback whenever a multi-set batch's Set bubble can't be read. */
  defaultAnswerKeyEntries: OmrAnswerKeyEntry[] | null,
  /** Present only for a multi-set batch (see TestBatch.setMappings) — resolved against whichever Set bubble this sheet actually has filled, never against a pre-assumed set. */
  setMappings: SetMappings | null = null
): OmrAnalysisResult {
  const fiducialResult = detectFiducialCorners(image);
  if (!fiducialResult) {
    return {
      outcome: "UNREADABLE",
      reason: "Could not locate the sheet's 4 corner markers — ensure the full sheet is in frame, well-lit, and roughly upright, then rescan.",
    };
  }

  const idealCorners = spec.fiducials.map((f) => ({ x: f.x, y: f.y })) as [Point, Point, Point, Point];
  const homography = computeHomography(idealCorners, fiducialResult.corners);

  const tokenResult = decodeDigitGrid(image, homography, spec.sheetTokenGrid, spec.sheetTokenDigits, FILL_THRESHOLD);
  if (!tokenResult.complete) {
    return {
      outcome: "UNREADABLE",
      reason: `Could not read the sheet ID bubbles clearly (partial read: "${tokenResult.value}") — rescan with better lighting/focus.`,
    };
  }
  const detectedSheetToken = tokenResult.value;

  const rosterEntry = rosterEntries.find((entry) => entry.sheetToken === detectedSheetToken);
  if (!rosterEntry) {
    return {
      outcome: "ROSTER_MISMATCH",
      reason: `Sheet ID ${detectedSheetToken} does not match any student in this test batch's roster — wrong batch, or a corrupted print.`,
      detectedSheetToken,
    };
  }

  if (rosterEntry.consumedAt) {
    return {
      outcome: "DUPLICATE",
      reason: `This sheet (roll number ${rosterEntry.rollNumber}) was already graded on ${rosterEntry.consumedAt.toISOString()} — a second scan of the same sheet ID cannot consume a second credit.`,
      rosterEntryId: rosterEntry.id,
      detectedSheetToken,
    };
  }

  // Read exactly like an answer bubble (same threshold, same sampling
  // call) — the Set strip is just a single-choice question with
  // spec.setGrid.length options instead of 4. An empty setGrid (every
  // single-set batch) makes this loop a no-op, leaving detectedSetCode
  // null and defaultAnswerKeyEntries as the only resolution path below.
  const filledSetNumbers: number[] = [];
  for (const cell of spec.setGrid) {
    const fillRatio = sampleBubbleFillRatio(image, homography, { x: cell.x, y: cell.y }, 6);
    if (fillRatio > FILL_THRESHOLD) filledSetNumbers.push(cell.setNumber);
  }
  const detectedSetCode = filledSetNumbers.length === 1 ? `SET_${filledSetNumbers[0]}` : null;

  const markedByQuestion = new Map<number, BubbleOption[]>();
  for (const bubble of spec.bubbles) {
    const fillRatio = sampleBubbleFillRatio(image, homography, { x: bubble.x, y: bubble.y }, 6);
    if (fillRatio > FILL_THRESHOLD) {
      const list = markedByQuestion.get(bubble.questionNumber) ?? [];
      list.push(bubble.option);
      markedByQuestion.set(bubble.questionNumber, list);
    }
  }

  const scans: OmrQuestionScan[] = Array.from({ length: spec.totalQuestions }, (_, i) => ({
    questionNumber: i + 1,
    markedOptions: (markedByQuestion.get(i + 1) ?? []) as BubbleOption[],
  }));

  // Resolve WHICH answer key to grade against from what was actually
  // scanned, never from a pre-assumed assignment (see
  // TestBatchRosterEntry.setCode's own comment) — a multi-set batch whose
  // Set bubble came back ambiguous falls through to
  // defaultAnswerKeyEntries, same as a plain single-set batch would, so
  // this sheet is safely held QUEUED rather than graded against a guess.
  const resolvedAnswerKeyEntries = resolveAnswerKeyForSet(setMappings, detectedSetCode, defaultAnswerKeyEntries);

  const grading = resolvedAnswerKeyEntries
    ? evaluateOmrSheet(scans, resolvedAnswerKeyEntries, DEFAULT_MARKING_SCHEME)
    : null;

  return { outcome: "MATCHED", rosterEntryId: rosterEntry.id, detectedSheetToken, detectedSetCode, scans, grading };
}
