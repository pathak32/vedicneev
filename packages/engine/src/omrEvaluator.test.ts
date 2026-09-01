import { describe, expect, it } from "vitest";

import { evaluateOmrQuestion, evaluateOmrSheet, type OmrAnswerKeyEntry, type OmrQuestionScan } from "./omrEvaluator";
import type { MarkingScheme } from "./scoring";

const NO_NEGATIVE_MARKING: MarkingScheme = { correctMarks: 1, negativeMarks: 0, unattemptedMarks: 0 };
const NEGATIVE_MARKING: MarkingScheme = { correctMarks: 1, negativeMarks: 0.25, unattemptedMarks: 0 };

describe("evaluateOmrQuestion", () => {
  it("grades a single correctly-marked bubble as CORRECT", () => {
    const result = evaluateOmrQuestion({ questionNumber: 1, markedOptions: ["B"] }, "B", NO_NEGATIVE_MARKING);
    expect(result.outcome).toBe("CORRECT");
    expect(result.selectedOption).toBe("B");
    expect(result.marksAwarded).toBe(1);
  });

  it("grades a single incorrectly-marked bubble as INCORRECT and applies negative marking", () => {
    const result = evaluateOmrQuestion({ questionNumber: 1, markedOptions: ["A"] }, "B", NEGATIVE_MARKING);
    expect(result.outcome).toBe("INCORRECT");
    expect(result.selectedOption).toBe("A");
    expect(result.marksAwarded).toBe(-0.25);
  });

  it("grades no marked bubbles as UNATTEMPTED", () => {
    const result = evaluateOmrQuestion({ questionNumber: 1, markedOptions: [] }, "B", NEGATIVE_MARKING);
    expect(result.outcome).toBe("UNATTEMPTED");
    expect(result.selectedOption).toBeUndefined();
    expect(result.marksAwarded).toBe(0);
  });

  it("grades multiple marked bubbles (smudge) as INVALID_MULTIPLE_FILL worth 0, ignoring negative marking", () => {
    const result = evaluateOmrQuestion({ questionNumber: 1, markedOptions: ["A", "C"] }, "A", NEGATIVE_MARKING);
    expect(result.outcome).toBe("INVALID_MULTIPLE_FILL");
    expect(result.selectedOption).toBeUndefined();
    expect(result.marksAwarded).toBe(0);
  });

  it("treats a fully-filled 4-bubble smudge the same as any other multiple fill", () => {
    const result = evaluateOmrQuestion(
      { questionNumber: 1, markedOptions: ["A", "B", "C", "D"] },
      "A",
      NEGATIVE_MARKING
    );
    expect(result.outcome).toBe("INVALID_MULTIPLE_FILL");
    expect(result.marksAwarded).toBe(0);
  });
});

describe("evaluateOmrSheet", () => {
  // A small JNVST-style answer key: 5 questions, no negative marking (matches the real JNVST scheme).
  const answerKey: OmrAnswerKeyEntry[] = [
    { questionNumber: 1, correctOption: "B" },
    { questionNumber: 2, correctOption: "A" },
    { questionNumber: 3, correctOption: "D" },
    { questionNumber: 4, correctOption: "C" },
    { questionNumber: 5, correctOption: "B" },
  ];

  it("scores a perfect scan as full marks with zero errors", () => {
    const scans: OmrQuestionScan[] = answerKey.map((entry) => ({
      questionNumber: entry.questionNumber,
      markedOptions: [entry.correctOption],
    }));

    const summary = evaluateOmrSheet(scans, answerKey, NO_NEGATIVE_MARKING);
    expect(summary.totalMarks).toBe(5);
    expect(summary.correctCount).toBe(5);
    expect(summary.incorrectCount).toBe(0);
    expect(summary.unattemptedCount).toBe(0);
    expect(summary.invalidCount).toBe(0);
  });

  it("scores a mixed scan (correct, incorrect, blank, multi-fill) accurately", () => {
    const scans: OmrQuestionScan[] = [
      { questionNumber: 1, markedOptions: ["B"] }, // correct
      { questionNumber: 2, markedOptions: ["C"] }, // incorrect
      { questionNumber: 3, markedOptions: [] }, // blank
      { questionNumber: 4, markedOptions: ["A", "C"] }, // multi-fill
      { questionNumber: 5, markedOptions: ["B"] }, // correct
    ];

    const summary = evaluateOmrSheet(scans, answerKey, NEGATIVE_MARKING);
    expect(summary.correctCount).toBe(2);
    expect(summary.incorrectCount).toBe(1);
    expect(summary.unattemptedCount).toBe(1);
    expect(summary.invalidCount).toBe(1);
    // 2 correct (+1 each) + 1 incorrect (-0.25) + 1 blank (0) + 1 multi-fill (0)
    expect(summary.totalMarks).toBeCloseTo(2 - 0.25, 5);
  });

  it("throws when a scanned question has no matching answer-key entry", () => {
    const scans: OmrQuestionScan[] = [{ questionNumber: 99, markedOptions: ["A"] }];
    expect(() => evaluateOmrSheet(scans, answerKey, NO_NEGATIVE_MARKING)).toThrow();
  });
});
