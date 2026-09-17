import { generateOmrSheetSpec, type OmrSheetSpec } from "@vedicneev/engine";

import { SHEET_TOKEN_DIGITS } from "@/lib/tests/createTestBatch";

/**
 * The one place that computes a TestBatch's OMR sheet geometry — used by
 * BOTH the print route (app/api/tests/[id]/sheets/route.ts) and the scan
 * ingestion pipeline (gradeUpload.ts). Deliberately factored out rather
 * than each computing its own generateOmrSheetSpec call: a scanned sheet
 * is only readable at all if the bubble/fiducial/roll/token coordinates
 * used to interpret it are bit-for-bit the same ones used to print it —
 * any drift here (e.g. a rollNumberDigits formula that changed between
 * releases) would silently misread every sheet from the older geometry.
 */
export function buildInstituteOmrSheetSpec(testBatch: { totalQuestions: number; totalStudents: number }): OmrSheetSpec {
  const rollNumberDigits = Math.max(4, String(testBatch.totalStudents).length);
  return generateOmrSheetSpec({
    examType: "OTHER",
    totalQuestions: testBatch.totalQuestions,
    rollNumberDigits,
    sheetTokenDigits: SHEET_TOKEN_DIGITS,
  });
}
