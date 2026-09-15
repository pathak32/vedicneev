/**
 * OMR (Optical Mark Recognition) sheet geometry. Positions are normalized
 * to a [0,1] x [0,1] "content area" so the same spec drives both the
 * printable layout (CSS percentages) and the scanner's bubble sampling
 * (normalized coordinate × detected-corner homography) — one source of
 * truth for where every bubble sits, so print and scan can never drift
 * apart from each other.
 */

export type BubbleOption = "A" | "B" | "C" | "D";

export const BUBBLE_OPTIONS: BubbleOption[] = ["A", "B", "C", "D"];

export type FiducialId = "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT";

export interface Point {
  x: number;
  y: number;
}

export interface OmrFiducialMarker extends Point {
  id: FiducialId;
}

export interface OmrBubblePosition extends Point {
  questionNumber: number;
  option: BubbleOption;
}

export interface OmrRollNumberDigitPosition extends Point {
  digitIndex: number;
  value: number;
}

export type OmrExamType = "JNVST" | "AISSEE" | "RMS" | "OTHER";

export interface OmrSheetSpec {
  examType: OmrExamType;
  totalQuestions: number;
  columns: number;
  questionsPerColumn: number;
  rollNumberDigits: number;
  fiducials: [OmrFiducialMarker, OmrFiducialMarker, OmrFiducialMarker, OmrFiducialMarker];
  bubbles: OmrBubblePosition[];
  rollNumberGrid: OmrRollNumberDigitPosition[];
  /**
   * Institute Suite only (omrtest.vedicneev.com) — a second, independent
   * digit-bubble grid alongside rollNumberGrid, for the anti-fraud
   * sheetToken every TestBatchRosterEntry carries (see
   * packages/db/prisma/schema.prisma's own comment on why that token, not
   * the roll number, is what ingestion matching actually keys off).
   * Encoding it as bubbles rather than a printed barcode/QR means the
   * exact same bubble-detection pipeline that reads answers and the roll
   * number also reads this — no second scanning mechanism or external
   * library to add. Zero-length (sheetTokenDigits: 0) for every sheet spec
   * that doesn't pass sheetTokenDigits — i.e. every existing JNVST/AISSEE
   * consumer sheet — so this is purely additive, not a breaking change to
   * that geometry.
   */
  sheetTokenDigits: number;
  sheetTokenGrid: OmrRollNumberDigitPosition[];
}

function defaultColumnsFor(totalQuestions: number): number {
  return Math.min(5, Math.max(1, Math.ceil(totalQuestions / 25)));
}

export interface GenerateOmrSheetSpecParams {
  examType: OmrExamType;
  totalQuestions: number;
  columns?: number;
  rollNumberDigits?: number;
  /** See OmrSheetSpec.sheetTokenDigits — omit entirely for a non-institute sheet. */
  sheetTokenDigits?: number;
}

export function generateOmrSheetSpec(params: GenerateOmrSheetSpecParams): OmrSheetSpec {
  const { examType, totalQuestions } = params;
  const columns = params.columns ?? defaultColumnsFor(totalQuestions);
  const rollNumberDigits = params.rollNumberDigits ?? 6;
  const questionsPerColumn = Math.ceil(totalQuestions / columns);

  const fiducialInset = 0.02;
  const fiducials: OmrSheetSpec["fiducials"] = [
    { id: "TOP_LEFT", x: fiducialInset, y: fiducialInset },
    { id: "TOP_RIGHT", x: 1 - fiducialInset, y: fiducialInset },
    { id: "BOTTOM_LEFT", x: fiducialInset, y: 1 - fiducialInset },
    { id: "BOTTOM_RIGHT", x: 1 - fiducialInset, y: 1 - fiducialInset },
  ];

  const gridTop = 0.24;
  const gridBottom = 0.96;
  const gridLeft = 0.05;
  const gridRight = 0.95;
  const columnWidth = (gridRight - gridLeft) / columns;
  const rowHeight = (gridBottom - gridTop) / questionsPerColumn;

  const bubbles: OmrBubblePosition[] = [];
  for (let q = 1; q <= totalQuestions; q++) {
    const col = Math.floor((q - 1) / questionsPerColumn);
    const rowInCol = (q - 1) % questionsPerColumn;
    const colLeft = gridLeft + col * columnWidth;
    const rowY = gridTop + rowInCol * rowHeight + rowHeight / 2;

    // Reserve the first ~28% of the column for the "Q<n>" label; spread the
    // 4 option bubbles evenly across the rest.
    const bubblesLeft = colLeft + columnWidth * 0.3;
    const bubblesRight = colLeft + columnWidth * 0.96;
    const spacing = (bubblesRight - bubblesLeft) / (BUBBLE_OPTIONS.length - 1);

    BUBBLE_OPTIONS.forEach((option, i) => {
      bubbles.push({ questionNumber: q, option, x: bubblesLeft + i * spacing, y: rowY });
    });
  }

  // Roll-number grid: rollNumberDigits columns × 10 rows (values 0-9), in the header area.
  const rollGridLeft = 0.06;
  const rollGridRight = 0.48;
  const rollGridTop = 0.06;
  const rollGridBottom = 0.2;
  const digitColWidth = (rollGridRight - rollGridLeft) / rollNumberDigits;
  const valueRowHeight = (rollGridBottom - rollGridTop) / 10;

  const rollNumberGrid: OmrRollNumberDigitPosition[] = [];
  for (let d = 0; d < rollNumberDigits; d++) {
    for (let v = 0; v <= 9; v++) {
      rollNumberGrid.push({
        digitIndex: d,
        value: v,
        x: rollGridLeft + d * digitColWidth + digitColWidth / 2,
        y: rollGridTop + v * valueRowHeight + valueRowHeight / 2,
      });
    }
  }

  // Sheet-token grid: same shape as the roll-number grid, mirrored into the
  // header's other half so the two never overlap regardless of digit count.
  const sheetTokenDigits = params.sheetTokenDigits ?? 0;
  const tokenGridLeft = 0.52;
  const tokenGridRight = 0.94;
  const tokenDigitColWidth = sheetTokenDigits > 0 ? (tokenGridRight - tokenGridLeft) / sheetTokenDigits : 0;

  const sheetTokenGrid: OmrRollNumberDigitPosition[] = [];
  for (let d = 0; d < sheetTokenDigits; d++) {
    for (let v = 0; v <= 9; v++) {
      sheetTokenGrid.push({
        digitIndex: d,
        value: v,
        x: tokenGridLeft + d * tokenDigitColWidth + tokenDigitColWidth / 2,
        y: rollGridTop + v * valueRowHeight + valueRowHeight / 2,
      });
    }
  }

  return {
    examType,
    totalQuestions,
    columns,
    questionsPerColumn,
    rollNumberDigits,
    fiducials,
    bubbles,
    rollNumberGrid,
    sheetTokenDigits,
    sheetTokenGrid,
  };
}

/** Standard 80-question JNVST bubble grid (4 columns × 20 rows, 6-digit roll number). */
export const JNVST_OMR_SPEC: OmrSheetSpec = generateOmrSheetSpec({
  examType: "JNVST",
  totalQuestions: 80,
  columns: 4,
  rollNumberDigits: 6,
});

/** Standard 125-question AISSEE bubble grid (5 columns × 25 rows, 7-digit roll number). */
export const AISSEE_OMR_SPEC: OmrSheetSpec = generateOmrSheetSpec({
  examType: "AISSEE",
  totalQuestions: 125,
  columns: 5,
  rollNumberDigits: 7,
});
