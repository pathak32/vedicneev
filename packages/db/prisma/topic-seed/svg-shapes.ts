/**
 * Shared SVG building blocks for the visual Mental Ability generators
 * (figure-matching.ts, figure-series.ts, analogy.ts). Every shape here is
 * deliberately asymmetric (no rotational or reflective symmetry) — a
 * symmetric shape like a plain square looks IDENTICAL after a 90°/180°
 * rotation, which would make "rotated by the wrong angle" distractors
 * indistinguishable from the correct answer. Correctness for every
 * generated question rests on this: the same base shape is reused across
 * an item's 4 options with only the `transform` attribute differing, so a
 * genuinely different transform always renders a genuinely different
 * picture.
 */

const INK = "#1e293b";

/** A directional arrow pointing right at rotation 0 — fully asymmetric. */
export function arrowShape(): string {
  return `<g><line x1="-16" y1="0" x2="16" y2="0" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><polygon points="16,0 4,-9 4,9" fill="${INK}"/></g>`;
}

/** A pennant/flag on a pole — asymmetric, reads as "pointing" toward the flag. */
export function flagShape(): string {
  return `<g><line x1="0" y1="-20" x2="0" y2="20" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><polygon points="0,-20 22,-11 0,-2" fill="${INK}"/></g>`;
}

/** A right-angled scalene triangle with a small dot marking one vertex — asymmetric. */
export function markedTriangleShape(): string {
  return `<g><polygon points="-18,16 18,16 -18,-16" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="-18" cy="-16" r="4" fill="${INK}"/></g>`;
}

/** An L-tromino (three squares in an L) — asymmetric. */
export function lTrominoShape(): string {
  return `<g fill="${INK}"><rect x="-18" y="-18" width="14" height="14"/><rect x="-18" y="-2" width="14" height="14"/><rect x="-2" y="-2" width="14" height="14"/></g>`;
}

export type ShapeName = "arrow" | "flag" | "triangle" | "ltromino";

const SHAPES: Record<ShapeName, () => string> = {
  arrow: arrowShape,
  flag: flagShape,
  triangle: markedTriangleShape,
  ltromino: lTrominoShape,
};

export function shapeMarkup(name: ShapeName): string {
  return SHAPES[name]();
}

/**
 * Wraps a shape with a rotation (degrees, clockwise) and/or a horizontal
 * mirror flip, both as real SVG transforms — never approximated or
 * described in prose. `mirror` is applied before `rotate` (flip, then
 * turn), matching how "reflect, then rotate" is conventionally read.
 */
export function transformed(shapeName: ShapeName, rotateDeg: number, mirror = false): string {
  const inner = shapeMarkup(shapeName);
  const flip = mirror ? "scale(-1,1) " : "";
  return `<g transform="${flip}rotate(${rotateDeg})">${inner}</g>`;
}

/** One labeled option box (or the unlabeled reference/"?" box) at x-offset `x`, drawn inside a 90×90 cell. */
export function labeledCell(x: number, label: string, innerMarkup: string): string {
  return `<g transform="translate(${x},0)">
    <rect x="0" y="0" width="90" height="90" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" rx="8"/>
    <g transform="translate(45,45)">${innerMarkup}</g>
    ${label ? `<text x="45" y="112" text-anchor="middle" font-size="16" font-weight="600" fill="#334155" font-family="system-ui,sans-serif">${label}</text>` : ""}
  </g>`;
}

/** A ":" or "→" separator glyph, vertically centered in a 90-tall row, at x-offset `x`. */
export function separator(x: number, glyph: "::" | "->" = "->"): string {
  const text = glyph === "->" ? "→" : "::";
  return `<text x="${x}" y="52" text-anchor="middle" font-size="28" fill="#64748b" font-family="system-ui,sans-serif">${text}</text>`;
}

/** Wraps a full row of cells/separators into a complete, standalone SVG document. */
export function svgDocument(innerMarkup: string, width: number, height = 130): string {
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${innerMarkup}</svg>`;
}
