import { describe, expect, it } from "vitest";

import type { OmrRollNumberDigitPosition, Point } from "./omr";
import {
  applyHomography,
  computeHomography,
  decodeDigitGrid,
  detectFiducialCorners,
  sampleDarkness,
  type GrayscaleImage,
  type HomographyMatrix,
} from "./omrScan";

function makeBlankImage(width: number, height: number): GrayscaleImage {
  return { width, height, data: new Uint8ClampedArray(width * height).fill(255) };
}

function paintSquare(image: GrayscaleImage, center: Point, halfSize: number, value = 0) {
  for (let y = center.y - halfSize; y <= center.y + halfSize; y++) {
    for (let x = center.x - halfSize; x <= center.x + halfSize; x++) {
      if (x < 0 || y < 0 || x >= image.width || y >= image.height) continue;
      image.data[Math.round(y) * image.width + Math.round(x)] = value;
    }
  }
}

describe("computeHomography / applyHomography", () => {
  it("maps points correctly through a pure scale+translate transform", () => {
    const from: [Point, Point, Point, Point] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ];
    // scale x2, translate by (10, 20)
    const to: [Point, Point, Point, Point] = [
      { x: 10, y: 20 },
      { x: 12, y: 20 },
      { x: 10, y: 22 },
      { x: 12, y: 22 },
    ];
    const h = computeHomography(from, to);
    const mapped = applyHomography(h, { x: 0.5, y: 0.5 });
    expect(mapped.x).toBeCloseTo(11, 5);
    expect(mapped.y).toBeCloseTo(21, 5);
  });

  it("round-trips through a perspective (skewed quad) transform", () => {
    const unitSquare: [Point, Point, Point, Point] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ];
    // A skewed quadrilateral, as a slightly-tilted photo of the sheet might produce.
    const skewedQuad: [Point, Point, Point, Point] = [
      { x: 50, y: 40 },
      { x: 480, y: 60 },
      { x: 30, y: 550 },
      { x: 500, y: 520 },
    ];

    const forward = computeHomography(unitSquare, skewedQuad);
    const inverse = computeHomography(skewedQuad, unitSquare);

    for (const p of [{ x: 0.5, y: 0.5 }, { x: 0.2, y: 0.8 }, { x: 0.9, y: 0.1 }]) {
      const roundTripped = applyHomography(inverse, applyHomography(forward, p));
      expect(roundTripped.x).toBeCloseTo(p.x, 4);
      expect(roundTripped.y).toBeCloseTo(p.y, 4);
    }
  });
});

describe("sampleDarkness", () => {
  it("reports near-zero darkness over a blank white region", () => {
    const image = makeBlankImage(40, 40);
    expect(sampleDarkness(image, { x: 5, y: 5 }, 3)).toBeCloseTo(0, 2);
  });

  it("reports near-full darkness over a filled black bubble", () => {
    const image = makeBlankImage(40, 40);
    paintSquare(image, { x: 20, y: 20 }, 6);
    expect(sampleDarkness(image, { x: 20, y: 20 }, 3)).toBeGreaterThan(0.95);
  });
});

describe("decodeDigitGrid", () => {
  const IDENTITY_HOMOGRAPHY: HomographyMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const DIGIT_COUNT = 4;
  const VALUE_ROW_SPACING = 20;
  const DIGIT_COL_SPACING = 20;

  /** A digitIndex/value grid laid out on a generous pixel spacing, matching the real spec's shape (one column per digit, 10 value rows). */
  function buildGrid(): OmrRollNumberDigitPosition[] {
    const grid: OmrRollNumberDigitPosition[] = [];
    for (let d = 0; d < DIGIT_COUNT; d++) {
      for (let v = 0; v <= 9; v++) {
        grid.push({ digitIndex: d, value: v, x: 10 + d * DIGIT_COL_SPACING, y: 10 + v * VALUE_ROW_SPACING });
      }
    }
    return grid;
  }

  it("reads a fully and unambiguously filled grid", () => {
    const grid = buildGrid();
    const width = 10 + DIGIT_COUNT * DIGIT_COL_SPACING;
    const height = 10 + 10 * VALUE_ROW_SPACING;
    const image = makeBlankImage(width, height);

    const trueDigits = [0, 0, 4, 7];
    trueDigits.forEach((value, digitIndex) => {
      const cell = grid.find((c) => c.digitIndex === digitIndex && c.value === value)!;
      paintSquare(image, cell, 5);
    });

    const result = decodeDigitGrid(image, IDENTITY_HOMOGRAPHY, grid, DIGIT_COUNT, 0.42);
    expect(result).toEqual({ value: "0047", complete: true });
  });

  it("marks a digit ambiguous (and the whole result incomplete) when two bubbles in one column are filled", () => {
    const grid = buildGrid();
    const width = 10 + DIGIT_COUNT * DIGIT_COL_SPACING;
    const height = 10 + 10 * VALUE_ROW_SPACING;
    const image = makeBlankImage(width, height);

    paintSquare(image, grid.find((c) => c.digitIndex === 0 && c.value === 1)!, 5);
    paintSquare(image, grid.find((c) => c.digitIndex === 1 && c.value === 3)!, 5);
    paintSquare(image, grid.find((c) => c.digitIndex === 1 && c.value === 8)!, 5); // second fill in digit 1's column
    paintSquare(image, grid.find((c) => c.digitIndex === 2 && c.value === 9)!, 5);
    // digit 3 left entirely blank — also ambiguous (zero bubbles filled).

    const result = decodeDigitGrid(image, IDENTITY_HOMOGRAPHY, grid, DIGIT_COUNT, 0.42);
    expect(result.value).toBe("1?9?");
    expect(result.complete).toBe(false);
  });
});

describe("detectFiducialCorners", () => {
  it("locates 4 black corner markers on an otherwise blank sheet", () => {
    const image = makeBlankImage(200, 200);
    const trueCorners: [Point, Point, Point, Point] = [
      { x: 10, y: 10 },
      { x: 190, y: 10 },
      { x: 10, y: 190 },
      { x: 190, y: 190 },
    ];
    for (const c of trueCorners) paintSquare(image, c, 5);

    const result = detectFiducialCorners(image);
    expect(result).not.toBeNull();
    expect(result!.confidence).toBeGreaterThan(0.35);
    const tolerancePx = 10;
    result!.corners.forEach((detected, i) => {
      expect(Math.abs(detected.x - trueCorners[i]!.x)).toBeLessThanOrEqual(tolerancePx);
      expect(Math.abs(detected.y - trueCorners[i]!.y)).toBeLessThanOrEqual(tolerancePx);
    });
  });

  it("returns null when no corner markers are present", () => {
    const image = makeBlankImage(200, 200);
    expect(detectFiducialCorners(image)).toBeNull();
  });
});
