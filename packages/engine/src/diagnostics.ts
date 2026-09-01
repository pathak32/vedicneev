/**
 * Post-test diagnostics: latency/accuracy behavior classification, an
 * admission-probability heuristic driven by historical cutoff data, and
 * speed-deficit ("marks left on the table") analysis.
 */

// ─────────────────────────────────────────────────────────────────────────
// Latency vs. Accuracy Classifier
// ─────────────────────────────────────────────────────────────────────────

export type SpeedAccuracyQuadrant =
  | "FAST_AND_ACCURATE"
  | "SLOW_AND_ACCURATE"
  | "RUSHED_CARELESS"
  | "STRUGGLED_CONCEPT_GAP";

export type AutoMistakeTag = "CARELESS_RUSHED" | "CONCEPT_GAP";

/** Below this fraction of the topic baseline time, a wrong answer reads as a careless slip rather than a knowledge gap. */
const RUSHED_THRESHOLD_RATIO = 0.5;

export interface LatencyAccuracyInput {
  questionId: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  /** Expected/allotted time for this question's topic — the classifier's reference point. */
  baselineTimeSeconds: number;
}

export interface LatencyAccuracyResult extends LatencyAccuracyInput {
  quadrant: SpeedAccuracyQuadrant;
  /** Only set for incorrect answers — the auto-derived Mistake Vault tag. */
  mistakeTag?: AutoMistakeTag;
  /** timeSpentSeconds / baselineTimeSeconds */
  speedRatio: number;
}

export function classifyLatencyAccuracy(input: LatencyAccuracyInput): LatencyAccuracyResult {
  const baseline = input.baselineTimeSeconds > 0 ? input.baselineTimeSeconds : 1;
  const speedRatio = input.timeSpentSeconds / baseline;

  if (input.isCorrect) {
    const quadrant: SpeedAccuracyQuadrant = speedRatio <= 1 ? "FAST_AND_ACCURATE" : "SLOW_AND_ACCURATE";
    return { ...input, quadrant, speedRatio };
  }

  if (speedRatio < RUSHED_THRESHOLD_RATIO) {
    return { ...input, quadrant: "RUSHED_CARELESS", mistakeTag: "CARELESS_RUSHED", speedRatio };
  }
  return { ...input, quadrant: "STRUGGLED_CONCEPT_GAP", mistakeTag: "CONCEPT_GAP", speedRatio };
}

export function classifyLatencyAccuracyBatch(
  inputs: LatencyAccuracyInput[]
): LatencyAccuracyResult[] {
  return inputs.map(classifyLatencyAccuracy);
}

export type SpeedAccuracySummary = Record<SpeedAccuracyQuadrant, number>;

export function summarizeSpeedAccuracy(results: LatencyAccuracyResult[]): SpeedAccuracySummary {
  const summary: SpeedAccuracySummary = {
    FAST_AND_ACCURATE: 0,
    SLOW_AND_ACCURATE: 0,
    RUSHED_CARELESS: 0,
    STRUGGLED_CONCEPT_GAP: 0,
  };
  for (const result of results) summary[result.quadrant] += 1;
  return summary;
}

// ─────────────────────────────────────────────────────────────────────────
// Cutoff & Selection Predictor
// ─────────────────────────────────────────────────────────────────────────

export type CutoffExamType = "JNVST" | "AISSEE";
export type CutoffCategory = "GEN" | "OBC" | "SC" | "ST" | "DEFENSE";
export type CutoffLocality = "RURAL" | "URBAN";

/**
 * One historical cutoff data point. Callers supply their own table — this
 * module has no opinion on where the numbers come from (verified official
 * publications, a scraped archive, etc.) and ships no built-in dataset.
 */
export interface HistoricalCutoff {
  examType: CutoffExamType;
  state: string;
  locality: CutoffLocality;
  category: CutoffCategory;
  /** Cutoff score expressed as a percentage of total marks. */
  cutoffPercentage: number;
}

export interface CutoffLookupParams {
  examType: CutoffExamType;
  state: string;
  locality: CutoffLocality;
  category: CutoffCategory;
}

export type SelectionChance = "LOW" | "MODERATE" | "HIGH";

export interface AdmissionProbabilityResult {
  /** Null when no matching historical row exists for these params. */
  cutoffPercentage: number | null;
  studentPercentage: number;
  /** studentPercentage - cutoffPercentage; null when no cutoff was found. */
  marginPercentagePoints: number | null;
  /** Heuristic 0-100 score, not a calibrated statistical probability. */
  probabilityIndex: number;
  selectionChance: SelectionChance;
}

export function findHistoricalCutoff(
  table: HistoricalCutoff[],
  params: CutoffLookupParams
): HistoricalCutoff | undefined {
  return table.find(
    (row) =>
      row.examType === params.examType &&
      row.state === params.state &&
      row.locality === params.locality &&
      row.category === params.category
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function selectionChanceFromIndex(index: number): SelectionChance {
  if (index >= 70) return "HIGH";
  if (index >= 40) return "MODERATE";
  return "LOW";
}

/**
 * Heuristic admission-probability index: centered at 50 when the student is
 * exactly at the cutoff, shifting ±2.5 points per percentage-point of
 * margin above/below it. This is a coarse planning signal, not a calibrated
 * statistical probability — do not present it to users as one.
 */
export function calculateAdmissionProbability(
  table: HistoricalCutoff[],
  params: CutoffLookupParams,
  studentScore: number,
  maxScore: number
): AdmissionProbabilityResult {
  const studentPercentage = maxScore > 0 ? (studentScore / maxScore) * 100 : 0;
  const cutoff = findHistoricalCutoff(table, params);

  if (!cutoff) {
    const probabilityIndex = clamp(studentPercentage, 0, 100);
    return {
      cutoffPercentage: null,
      studentPercentage,
      marginPercentagePoints: null,
      probabilityIndex,
      selectionChance: selectionChanceFromIndex(probabilityIndex),
    };
  }

  const marginPercentagePoints = studentPercentage - cutoff.cutoffPercentage;
  const probabilityIndex = clamp(50 + marginPercentagePoints * 2.5, 0, 100);

  return {
    cutoffPercentage: cutoff.cutoffPercentage,
    studentPercentage,
    marginPercentagePoints,
    probabilityIndex,
    selectionChance: selectionChanceFromIndex(probabilityIndex),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Speed Deficit Analysis
// ─────────────────────────────────────────────────────────────────────────

export interface SpeedDeficitInput extends LatencyAccuracyResult {
  /** Marks that would have been awarded had this question been answered correctly. */
  marks: number;
}

const RECOVERABLE_QUADRANTS: SpeedAccuracyQuadrant[] = ["RUSHED_CARELESS", "STRUGGLED_CONCEPT_GAP"];

export interface SpeedDeficitBreakdownEntry {
  quadrant: "RUSHED_CARELESS" | "STRUGGLED_CONCEPT_GAP";
  count: number;
  marks: number;
}

export interface SpeedDeficitSummary {
  recoverableQuestionCount: number;
  /** Additional marks the student would gain if every rushed/struggled error were converted to correct. */
  potentialMarksGained: number;
  breakdown: SpeedDeficitBreakdownEntry[];
}

/** Marks left on the table from careless slips and concept-gap misses — the two "recoverable" wrong-answer quadrants. */
export function calculateSpeedDeficit(inputs: SpeedDeficitInput[]): SpeedDeficitSummary {
  const recoverable = inputs.filter((r) => RECOVERABLE_QUADRANTS.includes(r.quadrant));

  const breakdown = (["RUSHED_CARELESS", "STRUGGLED_CONCEPT_GAP"] as const).map((quadrant) => {
    const matches = recoverable.filter((r) => r.quadrant === quadrant);
    return {
      quadrant,
      count: matches.length,
      marks: matches.reduce((sum, r) => sum + r.marks, 0),
    };
  });

  return {
    recoverableQuestionCount: recoverable.length,
    potentialMarksGained: recoverable.reduce((sum, r) => sum + r.marks, 0),
    breakdown,
  };
}
