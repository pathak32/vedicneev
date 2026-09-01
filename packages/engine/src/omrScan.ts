/**
 * Pixel-level math behind the OMR scanner: perspective correction from the
 * 4 detected corner markers, and per-bubble darkness sampling through that
 * correction. Deliberately framework-agnostic (plain arrays, no DOM/canvas
 * dependency) so it's portable and unit-testable outside the browser — the
 * browser-side glue (getUserMedia, <canvas> pixel extraction) lives in
 * apps/web's OmrScanner component and just calls into this module.
 *
 * Honest limits: corner detection here is a simple "darkest blob in each
 * image quadrant" search and bubble darkness is a plain average-brightness
 * threshold. That's enough for a well-lit, reasonably-aligned photo of a
 * printed sheet — it is not a production-grade OMR pipeline (no adaptive
 * thresholding, denoising, or skew/rotation tolerance beyond what the
 * 4-point homography corrects for).
 */

import type { Point } from "./omr";

/** Row-major 3×3 homography matrix (9 numbers, h[8] normalized to 1). */
export type HomographyMatrix = number[];

/**
 * Solves an n×n linear system (Ax = b) via Gaussian elimination with
 * partial pivoting. Used internally to fit the homography.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]!]);

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row]![col]!) > Math.abs(M[pivotRow]![col]!)) pivotRow = row;
    }
    [M[col], M[pivotRow]] = [M[pivotRow]!, M[col]!];

    const pivot = M[col]![col]!;
    if (Math.abs(pivot) < 1e-12) {
      throw new Error("Singular matrix: cannot compute a homography from these points");
    }
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = M[row]![col]! / pivot;
      for (let k = col; k <= n; k++) {
        M[row]![k] = M[row]![k]! - factor * M[col]![k]!;
      }
    }
  }

  return M.map((row, i) => row[n]! / row[i]!);
}

/**
 * Computes the planar homography mapping each `from[i]` point to `to[i]`
 * (standard 4-point Direct Linear Transform). Both arrays must list points
 * in the same order (this codebase uses [TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT,
 * BOTTOM_RIGHT] throughout).
 */
export function computeHomography(
  from: [Point, Point, Point, Point],
  to: [Point, Point, Point, Point]
): HomographyMatrix {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = from[i]!;
    const { x: u, y: v } = to[i]!;
    A.push([x, y, 1, 0, 0, 0, -x * u, -y * u]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -x * v, -y * v]);
    b.push(v);
  }
  const h = solveLinearSystem(A, b);
  return [...h, 1];
}

/** Maps a point through a homography computed by `computeHomography`. */
export function applyHomography(h: HomographyMatrix, p: Point): Point {
  const denom = h[6]! * p.x + h[7]! * p.y + h[8]!;
  return {
    x: (h[0]! * p.x + h[1]! * p.y + h[2]!) / denom,
    y: (h[3]! * p.x + h[4]! * p.y + h[5]!) / denom,
  };
}

export interface GrayscaleImage {
  width: number;
  height: number;
  /** Single-channel brightness, length === width*height. 0 = black, 255 = white. */
  data: Uint8ClampedArray;
}

/** Converts an RGBA buffer (e.g. from `CanvasRenderingContext2D.getImageData`) to grayscale. */
export function toGrayscale(rgba: Uint8ClampedArray, width: number, height: number): GrayscaleImage {
  const data = new Uint8ClampedArray(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = rgba[i * 4]!;
    const g = rgba[i * 4 + 1]!;
    const b = rgba[i * 4 + 2]!;
    data[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }
  return { width, height, data };
}

function getPixel(image: GrayscaleImage, x: number, y: number): number {
  const xi = Math.round(x);
  const yi = Math.round(y);
  if (xi < 0 || yi < 0 || xi >= image.width || yi >= image.height) return 255; // treat out-of-bounds as blank paper
  return image.data[yi * image.width + xi]!;
}

/** Average darkness (0 = white, 1 = fully black) of pixels within `radiusPx` of `center`. */
export function sampleDarkness(image: GrayscaleImage, center: Point, radiusPx: number): number {
  let sum = 0;
  let count = 0;
  const r2 = radiusPx * radiusPx;
  for (let dy = -radiusPx; dy <= radiusPx; dy++) {
    for (let dx = -radiusPx; dx <= radiusPx; dx++) {
      if (dx * dx + dy * dy > r2) continue;
      sum += 255 - getPixel(image, center.x + dx, center.y + dy);
      count++;
    }
  }
  return count > 0 ? sum / count / 255 : 0;
}

/** Samples the fill darkness of a bubble at a normalized [0,1] sheet coordinate, through the given homography into pixel space. */
export function sampleBubbleFillRatio(
  image: GrayscaleImage,
  homography: HomographyMatrix,
  normalizedCenter: Point,
  radiusPx = 6
): number {
  const pixelCenter = applyHomography(homography, normalizedCenter);
  return sampleDarkness(image, pixelCenter, radiusPx);
}

export interface FiducialDetectionResult {
  /** Detected pixel positions, in [TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT] order. */
  corners: [Point, Point, Point, Point];
  /** Minimum darkness found across the 4 corners — a rough confidence signal. */
  confidence: number;
}

export interface DetectFiducialCornersOptions {
  /** Fraction of the image's width/height searched from each edge for a corner marker. */
  searchFraction?: number;
  /** Radius (px) of the darkness sample used to score each candidate blob center. */
  blobRadiusPx?: number;
  /** Grid step (px) between candidate blob centers — smaller is more precise but slower. */
  stridePx?: number;
  /** Minimum darkness (0-1) required at all 4 corners to accept the result. */
  minConfidence?: number;
}

/**
 * Searches each quadrant of the image for the darkest small blob — a
 * heuristic finder for the sheet's 4 solid-black corner markers. Returns
 * null when any corner's best match is too faint to trust (e.g. a blank
 * corner, a photo that doesn't include the full sheet).
 */
export function detectFiducialCorners(
  image: GrayscaleImage,
  options: DetectFiducialCornersOptions = {}
): FiducialDetectionResult | null {
  const searchFraction = options.searchFraction ?? 0.25;
  const blobRadiusPx = options.blobRadiusPx ?? 8;
  const stridePx = options.stridePx ?? 4;
  const minConfidence = options.minConfidence ?? 0.35;

  const searchW = Math.max(1, Math.round(image.width * searchFraction));
  const searchH = Math.max(1, Math.round(image.height * searchFraction));

  function findDarkestInRegion(x0: number, y0: number, w: number, h: number): { point: Point; darkness: number } {
    let best = { point: { x: x0, y: y0 }, darkness: -1 };
    for (let y = y0; y < y0 + h; y += stridePx) {
      for (let x = x0; x < x0 + w; x += stridePx) {
        const darkness = sampleDarkness(image, { x, y }, blobRadiusPx);
        if (darkness > best.darkness) best = { point: { x, y }, darkness };
      }
    }
    return best;
  }

  const topLeft = findDarkestInRegion(0, 0, searchW, searchH);
  const topRight = findDarkestInRegion(image.width - searchW, 0, searchW, searchH);
  const bottomLeft = findDarkestInRegion(0, image.height - searchH, searchW, searchH);
  const bottomRight = findDarkestInRegion(image.width - searchW, image.height - searchH, searchW, searchH);

  const confidence = Math.min(topLeft.darkness, topRight.darkness, bottomLeft.darkness, bottomRight.darkness);
  if (confidence < minConfidence) return null;

  return { corners: [topLeft.point, topRight.point, bottomLeft.point, bottomRight.point], confidence };
}
