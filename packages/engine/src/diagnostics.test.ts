import { describe, expect, it } from "vitest";

import {
  calculateAdmissionProbability,
  calculateSpeedDeficit,
  classifyLatencyAccuracy,
  classifyLatencyAccuracyBatch,
  findHistoricalCutoff,
  summarizeSpeedAccuracy,
  type HistoricalCutoff,
  type SpeedDeficitInput,
} from "./diagnostics";

describe("classifyLatencyAccuracy", () => {
  it("classifies a correct answer within baseline time as FAST_AND_ACCURATE", () => {
    const result = classifyLatencyAccuracy({
      questionId: "q1",
      isCorrect: true,
      timeSpentSeconds: 30,
      baselineTimeSeconds: 60,
    });
    expect(result.quadrant).toBe("FAST_AND_ACCURATE");
    expect(result.mistakeTag).toBeUndefined();
  });

  it("treats exactly-at-baseline correct answers as FAST_AND_ACCURATE (inclusive boundary)", () => {
    const result = classifyLatencyAccuracy({
      questionId: "q1",
      isCorrect: true,
      timeSpentSeconds: 60,
      baselineTimeSeconds: 60,
    });
    expect(result.quadrant).toBe("FAST_AND_ACCURATE");
  });

  it("classifies a correct answer over baseline time as SLOW_AND_ACCURATE", () => {
    const result = classifyLatencyAccuracy({
      questionId: "q1",
      isCorrect: true,
      timeSpentSeconds: 90,
      baselineTimeSeconds: 60,
    });
    expect(result.quadrant).toBe("SLOW_AND_ACCURATE");
  });

  it("classifies a fast wrong answer as RUSHED_CARELESS with a CARELESS_RUSHED tag", () => {
    const result = classifyLatencyAccuracy({
      questionId: "q1",
      isCorrect: false,
      timeSpentSeconds: 20, // < 50% of 60
      baselineTimeSeconds: 60,
    });
    expect(result.quadrant).toBe("RUSHED_CARELESS");
    expect(result.mistakeTag).toBe("CARELESS_RUSHED");
  });

  it("classifies a wrong answer at exactly 50% of baseline as STRUGGLED_CONCEPT_GAP (exclusive rushed boundary)", () => {
    const result = classifyLatencyAccuracy({
      questionId: "q1",
      isCorrect: false,
      timeSpentSeconds: 30, // exactly 50% of 60
      baselineTimeSeconds: 60,
    });
    expect(result.quadrant).toBe("STRUGGLED_CONCEPT_GAP");
    expect(result.mistakeTag).toBe("CONCEPT_GAP");
  });

  it("classifies a slow wrong answer as STRUGGLED_CONCEPT_GAP with a CONCEPT_GAP tag", () => {
    const result = classifyLatencyAccuracy({
      questionId: "q1",
      isCorrect: false,
      timeSpentSeconds: 90,
      baselineTimeSeconds: 60,
    });
    expect(result.quadrant).toBe("STRUGGLED_CONCEPT_GAP");
    expect(result.mistakeTag).toBe("CONCEPT_GAP");
  });

  it("guards against a zero/invalid baseline instead of dividing by zero", () => {
    const result = classifyLatencyAccuracy({
      questionId: "q1",
      isCorrect: true,
      timeSpentSeconds: 0,
      baselineTimeSeconds: 0,
    });
    expect(Number.isFinite(result.speedRatio)).toBe(true);
    expect(result.quadrant).toBe("FAST_AND_ACCURATE");
  });
});

describe("summarizeSpeedAccuracy", () => {
  it("tallies quadrant counts across a batch", () => {
    const results = classifyLatencyAccuracyBatch([
      { questionId: "q1", isCorrect: true, timeSpentSeconds: 10, baselineTimeSeconds: 60 },
      { questionId: "q2", isCorrect: true, timeSpentSeconds: 90, baselineTimeSeconds: 60 },
      { questionId: "q3", isCorrect: false, timeSpentSeconds: 10, baselineTimeSeconds: 60 },
      { questionId: "q4", isCorrect: false, timeSpentSeconds: 90, baselineTimeSeconds: 60 },
      { questionId: "q5", isCorrect: false, timeSpentSeconds: 90, baselineTimeSeconds: 60 },
    ]);

    const summary = summarizeSpeedAccuracy(results);
    expect(summary).toEqual({
      FAST_AND_ACCURATE: 1,
      SLOW_AND_ACCURATE: 1,
      RUSHED_CARELESS: 1,
      STRUGGLED_CONCEPT_GAP: 2,
    });
  });
});

describe("calculateAdmissionProbability", () => {
  const table: HistoricalCutoff[] = [
    { examType: "JNVST", state: "Bihar", locality: "RURAL", category: "GEN", cutoffPercentage: 60 },
    { examType: "JNVST", state: "Bihar", locality: "URBAN", category: "GEN", cutoffPercentage: 65 },
  ];

  it("finds an exact match in the historical table", () => {
    const row = findHistoricalCutoff(table, {
      examType: "JNVST",
      state: "Bihar",
      locality: "RURAL",
      category: "GEN",
    });
    expect(row?.cutoffPercentage).toBe(60);
  });

  it("scores exactly-at-cutoff as index 50 and MODERATE", () => {
    const result = calculateAdmissionProbability(
      table,
      { examType: "JNVST", state: "Bihar", locality: "RURAL", category: "GEN" },
      60, // score
      100 // max
    );
    expect(result.studentPercentage).toBe(60);
    expect(result.marginPercentagePoints).toBe(0);
    expect(result.probabilityIndex).toBe(50);
    expect(result.selectionChance).toBe("MODERATE");
  });

  it("scores comfortably above cutoff as HIGH", () => {
    const result = calculateAdmissionProbability(
      table,
      { examType: "JNVST", state: "Bihar", locality: "RURAL", category: "GEN" },
      80,
      100
    );
    // margin = 20pp -> index = 50 + 20*2.5 = 100 (clamped)
    expect(result.marginPercentagePoints).toBe(20);
    expect(result.probabilityIndex).toBe(100);
    expect(result.selectionChance).toBe("HIGH");
  });

  it("scores comfortably below cutoff as LOW and clamps the index at 0", () => {
    const result = calculateAdmissionProbability(
      table,
      { examType: "JNVST", state: "Bihar", locality: "RURAL", category: "GEN" },
      10,
      100
    );
    // margin = -50pp -> index = 50 - 125 = -75, clamped to 0
    expect(result.probabilityIndex).toBe(0);
    expect(result.selectionChance).toBe("LOW");
  });

  it("falls back to a score-only estimate when no historical row matches", () => {
    const result = calculateAdmissionProbability(
      table,
      { examType: "AISSEE", state: "Unknown State", locality: "URBAN", category: "OBC" },
      75,
      100
    );
    expect(result.cutoffPercentage).toBeNull();
    expect(result.marginPercentagePoints).toBeNull();
    expect(result.probabilityIndex).toBe(75);
  });
});

describe("calculateSpeedDeficit", () => {
  it("sums potential marks only from the two recoverable (incorrect) quadrants", () => {
    const inputs: SpeedDeficitInput[] = [
      { questionId: "q1", isCorrect: true, timeSpentSeconds: 10, baselineTimeSeconds: 60, quadrant: "FAST_AND_ACCURATE", speedRatio: 0.17, marks: 1 },
      { questionId: "q2", isCorrect: true, timeSpentSeconds: 90, baselineTimeSeconds: 60, quadrant: "SLOW_AND_ACCURATE", speedRatio: 1.5, marks: 1 },
      { questionId: "q3", isCorrect: false, timeSpentSeconds: 10, baselineTimeSeconds: 60, quadrant: "RUSHED_CARELESS", mistakeTag: "CARELESS_RUSHED", speedRatio: 0.17, marks: 1 },
      { questionId: "q4", isCorrect: false, timeSpentSeconds: 90, baselineTimeSeconds: 60, quadrant: "STRUGGLED_CONCEPT_GAP", mistakeTag: "CONCEPT_GAP", speedRatio: 1.5, marks: 1.25 },
    ];

    const summary = calculateSpeedDeficit(inputs);
    expect(summary.recoverableQuestionCount).toBe(2);
    expect(summary.potentialMarksGained).toBeCloseTo(2.25, 5);
    expect(summary.breakdown).toEqual([
      { quadrant: "RUSHED_CARELESS", count: 1, marks: 1 },
      { quadrant: "STRUGGLED_CONCEPT_GAP", count: 1, marks: 1.25 },
    ]);
  });

  it("returns zeros when nothing is recoverable", () => {
    const inputs: SpeedDeficitInput[] = [
      { questionId: "q1", isCorrect: true, timeSpentSeconds: 10, baselineTimeSeconds: 60, quadrant: "FAST_AND_ACCURATE", speedRatio: 0.17, marks: 1 },
    ];
    const summary = calculateSpeedDeficit(inputs);
    expect(summary.recoverableQuestionCount).toBe(0);
    expect(summary.potentialMarksGained).toBe(0);
  });
});
