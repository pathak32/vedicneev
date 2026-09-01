export interface MarkingScheme {
  /** Marks awarded for a correct answer */
  correctMarks: number;
  /** Marks deducted for an incorrect answer (positive number, e.g. 0.25) */
  negativeMarks: number;
  /** Marks awarded (usually 0) for a skipped question */
  unattemptedMarks: number;
}

export const DEFAULT_MARKING_SCHEME: MarkingScheme = {
  correctMarks: 1,
  negativeMarks: 0,
  unattemptedMarks: 0,
};

export type ResponseOutcome = "correct" | "incorrect" | "unattempted";

export interface ScoredResponse {
  outcome: ResponseOutcome;
}

export interface RawScoreResult {
  rawScore: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  totalQuestions: number;
}

/** Computes raw score from a list of response outcomes under a marking scheme. */
export function calculateRawScore(
  responses: ScoredResponse[],
  scheme: MarkingScheme = DEFAULT_MARKING_SCHEME
): RawScoreResult {
  let rawScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  for (const response of responses) {
    switch (response.outcome) {
      case "correct":
        rawScore += scheme.correctMarks;
        correctCount += 1;
        break;
      case "incorrect":
        rawScore -= scheme.negativeMarks;
        incorrectCount += 1;
        break;
      case "unattempted":
        rawScore += scheme.unattemptedMarks;
        unattemptedCount += 1;
        break;
    }
  }

  return {
    rawScore,
    correctCount,
    incorrectCount,
    unattemptedCount,
    totalQuestions: responses.length,
  };
}

/** Scales a raw score to a 0–100 range given the maximum achievable raw score. */
export function scaleScoreToPercent(rawScore: number, maxRawScore: number): number {
  if (maxRawScore <= 0) return 0;
  const pct = (rawScore / maxRawScore) * 100;
  return Math.min(100, Math.max(0, pct));
}

export interface PercentileInput {
  /** This candidate's raw score */
  score: number;
  /** All raw scores in the comparison cohort (including this candidate's) */
  cohortScores: number[];
}

/** Percentile rank: the share of the cohort scoring strictly below this score, as 0–100. */
export function calculatePercentile({ score, cohortScores }: PercentileInput): number {
  if (cohortScores.length === 0) return 0;
  const below = cohortScores.filter((s) => s < score).length;
  return (below / cohortScores.length) * 100;
}

export interface SectionScore {
  key: string;
  rawScore: number;
  maxRawScore: number;
}

/** Weighted composite score across sections, each scaled to 0–100 before weighting. */
export function calculateCompositeScore(
  sections: SectionScore[],
  weights: Record<string, number>
): number {
  let weightedSum = 0;
  let weightTotal = 0;

  for (const section of sections) {
    const weight = weights[section.key] ?? 0;
    const sectionPercent = scaleScoreToPercent(section.rawScore, section.maxRawScore);
    weightedSum += sectionPercent * weight;
    weightTotal += weight;
  }

  return weightTotal > 0 ? weightedSum / weightTotal : 0;
}
