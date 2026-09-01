import { describe, expect, it } from "vitest";

import { AISSEE_OMR_SPEC, BUBBLE_OPTIONS, JNVST_OMR_SPEC, generateOmrSheetSpec } from "./omr";

function expectInUnitSquare(points: { x: number; y: number }[]) {
  for (const p of points) {
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.x).toBeLessThanOrEqual(1);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeLessThanOrEqual(1);
  }
}

describe("generateOmrSheetSpec", () => {
  it("produces exactly 4 bubbles per question", () => {
    const spec = generateOmrSheetSpec({ examType: "JNVST", totalQuestions: 10, columns: 2 });
    expect(spec.bubbles).toHaveLength(10 * BUBBLE_OPTIONS.length);
  });

  it("produces exactly 4 fiducial markers, one per corner", () => {
    const spec = generateOmrSheetSpec({ examType: "OTHER", totalQuestions: 20 });
    expect(spec.fiducials).toHaveLength(4);
    const ids = spec.fiducials.map((f) => f.id).sort();
    expect(ids).toEqual(["BOTTOM_LEFT", "BOTTOM_RIGHT", "TOP_LEFT", "TOP_RIGHT"]);
  });

  it("produces a roll-number grid of digits × 10 values", () => {
    const spec = generateOmrSheetSpec({ examType: "AISSEE", totalQuestions: 20, rollNumberDigits: 7 });
    expect(spec.rollNumberGrid).toHaveLength(7 * 10);
  });

  it("keeps every position within the normalized [0,1] unit square", () => {
    const spec = generateOmrSheetSpec({ examType: "JNVST", totalQuestions: 80, columns: 4 });
    expectInUnitSquare(spec.bubbles);
    expectInUnitSquare(spec.fiducials);
    expectInUnitSquare(spec.rollNumberGrid);
  });

  it("assigns a unique (questionNumber, option) pair to every bubble", () => {
    const spec = generateOmrSheetSpec({ examType: "JNVST", totalQuestions: 30, columns: 3 });
    const keys = new Set(spec.bubbles.map((b) => `${b.questionNumber}-${b.option}`));
    expect(keys.size).toBe(spec.bubbles.length);
  });

  it("distributes questions evenly across columns", () => {
    const spec = generateOmrSheetSpec({ examType: "JNVST", totalQuestions: 80, columns: 4 });
    expect(spec.questionsPerColumn).toBe(20);
  });
});

describe("standard presets", () => {
  it("JNVST_OMR_SPEC covers all 80 questions", () => {
    expect(JNVST_OMR_SPEC.totalQuestions).toBe(80);
    expect(JNVST_OMR_SPEC.bubbles).toHaveLength(80 * 4);
  });

  it("AISSEE_OMR_SPEC covers all 125 questions", () => {
    expect(AISSEE_OMR_SPEC.totalQuestions).toBe(125);
    expect(AISSEE_OMR_SPEC.bubbles).toHaveLength(125 * 4);
  });
});
