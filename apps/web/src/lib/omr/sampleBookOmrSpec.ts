import type { OmrExamType, QuestionBookletExamType } from "@vedicneev/engine";

/**
 * Must exactly match ROLL_NUMBER_DIGITS in both
 * apps/web/scripts/generate-sample-paper-books.mts and
 * package-sample-paper-books.mts — generateOmrSheetSpec's bubble geometry
 * depends on this number, and a scan has to reconstruct the IDENTICAL spec
 * the sheet was printed with, or every bubble coordinate silently shifts.
 * Not imported from those scripts directly: apps/web/scripts/** is run
 * standalone via tsx and isn't part of this app's Next.js build, so the
 * two sides intentionally duplicate this one constant rather than cross
 * that boundary.
 */
export const SAMPLE_BOOK_ROLL_NUMBER_DIGITS = 6;

/** Must exactly match OMR_EXAM_TYPE in the same two scripts, for the same reason. */
export const SAMPLE_BOOK_OMR_EXAM_TYPE: Record<QuestionBookletExamType, OmrExamType> = {
  JNVST: "JNVST",
  RMS: "RMS",
  AISSEE: "AISSEE",
  UPSS: "OTHER",
};
