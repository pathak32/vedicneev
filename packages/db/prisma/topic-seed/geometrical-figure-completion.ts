import { labeledCell, svgDocument } from "./svg-shapes";
import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Geometrical Figure Completion pool (Mental
 * Ability -> "geometrical_figure_completion" topic, new): 10 Easy / 15
 * Moderate / 15 Hard. Every question shows a host outline (triangle,
 * square, or circle) with a rectangular or wedge-shaped "notch" erased
 * from one edge (drawn by overlaying a cell-background-colored shape on
 * top of the host's stroke, not real polygon clipping), and asks which of
 * 4 candidate pieces exactly fills that notch. Correctness is a pure
 * dimension/angle comparison (piece size == notch size), never a rendered
 * "does this look right" judgment — the safest kind of construction-time
 * guarantee, since two pieces only ever collide when they share the exact
 * same numeric dimensions (trivial to deduplicate), unlike the
 * rotation/mirror symmetry traps the other visual generators have to
 * guard against.
 */

const INK = "#1e293b";
const CELL_BG = "#f8fafc"; // must match labeledCell's own cell background exactly, or the "erased" notch won't blend in

const OPTION_IDS = ["a", "b", "c", "d"] as const;

function buildOptions(): OptionSeed[] {
  return OPTION_IDS.map((id) => ({ id, text: { en: id.toUpperCase(), hi: id.toUpperCase() } }));
}

type HostShape = "triangle" | "square" | "circle";
type EdgePosition = "bottom" | "left" | "right";

/** Host outlines share a ~46x46 bounding box so a "bottom edge" notch can always be placed at y=22 regardless of which shape is drawn. */
function hostOutline(shape: HostShape): string {
  if (shape === "triangle") return `<polygon points="0,-28 -28,22 28,22" fill="none" stroke="${INK}" stroke-width="3"/>`;
  if (shape === "square") return `<rect x="-22" y="-22" width="44" height="44" fill="none" stroke="${INK}" stroke-width="3"/>`;
  return `<circle cx="0" cy="0" r="23" fill="none" stroke="${INK}" stroke-width="3"/>`;
}

/** `span` = the notch's extent ALONG the edge; `depth` = how far it pokes perpendicular to the edge. Erases with the cell's own background color so the gap blends in seamlessly. */
function notchRect(span: number, depth: number, edge: EdgePosition): string {
  if (edge === "bottom") return `<rect x="${-span / 2}" y="${22 - depth / 2}" width="${span}" height="${depth}" fill="${CELL_BG}"/>`;
  if (edge === "left") return `<rect x="${-22 - depth / 2}" y="${-span / 2}" width="${depth}" height="${span}" fill="${CELL_BG}"/>`;
  return `<rect x="${22 - depth / 2}" y="${-span / 2}" width="${depth}" height="${span}" fill="${CELL_BG}"/>`;
}

/** The piece that would exactly fill a given (span, depth, edge) notch, rendered as a standalone ink rectangle in its own cell — width/height are swapped for left/right edges so the piece's on-screen proportions genuinely match a vertical gap instead of a horizontal one. */
function pieceMarkup(span: number, depth: number, edge: EdgePosition): string {
  const [w, h] = edge === "bottom" ? [span, depth] : [depth, span];
  return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="${INK}"/>`;
}

/** A pie-slice wedge of `angleDeg` span, pointing outward in direction `dirDeg` (0=up, 90=right, 180=down, 270=left), apex at the origin. Used both for the circle host's wedge-notch (large radius, CELL_BG) and the candidate wedge pieces (small radius, INK). */
function wedgeMarkup(angleDeg: number, dirDeg: number, radius: number, fill: string): string {
  const half = (angleDeg / 2) * (Math.PI / 180);
  const x1 = radius * Math.sin(-half);
  const y1 = -radius * Math.cos(-half);
  const x2 = radius * Math.sin(half);
  const y2 = -radius * Math.cos(half);
  const largeArc = angleDeg > 180 ? 1 : 0;
  return `<g transform="rotate(${dirDeg})"><path d="M0,0 L${x1.toFixed(2)},${y1.toFixed(2)} A${radius},${radius} 0 ${largeArc} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${fill}"/></g>`;
}

function assertDistinctFigures(key: string, cellMarkups: string[]): void {
  const seen = new Map<string, number>();
  cellMarkups.forEach((markup, i) => {
    const existing = seen.get(markup);
    if (existing !== undefined) {
      throw new Error(`${key}: option cells ${existing} and ${i} render identical SVG markup — construction bug, fix the generator.`);
    }
    seen.set(markup, i);
  });
}

/** Reference-with-notch cell followed by the 4 lettered option cells. */
function buildDiagram(key: string, refMarkup: string, optionMarkups: string[]): { type: "svg"; markup: string } {
  assertDistinctFigures(key, optionMarkups);
  const refCell = labeledCell(0, "Ref", refMarkup);
  const optionCells = optionMarkups.map((m, i) => labeledCell(110 + i * 110, OPTION_IDS[i]!.toUpperCase(), m));
  const width = 110 + optionMarkups.length * 110;
  return { type: "svg" as const, markup: svgDocument([refCell, ...optionCells].join(""), width) };
}

/** Ensures a set of numeric distractors ends up with `target` distinct values distinct from `correct`, keyed by `attempt` (not array length) so a rejected candidate is never recomputed identically forever. */
function padDistinctValues(base: number[], target: number, correct: number, step: number, min = 4): number[] {
  const values = Array.from(new Set(base.filter((v) => v !== correct && v >= min)));
  for (let attempt = 0; values.length < target && attempt < 30; attempt++) {
    const candidate = Math.max(min, correct + step * (attempt + 2) * (attempt % 2 === 0 ? 1 : -1));
    if (candidate !== correct && !values.includes(candidate)) values.push(candidate);
  }
  if (values.length < target) throw new Error(`padDistinctValues: could not reach ${target} distinct values.`);
  return values.slice(0, target);
}

const HOST_CYCLE: HostShape[] = ["triangle", "square", "circle"];

// ── EASY (×10): width-only variation, notch always on the bottom edge ───
function widthOnlyQuestions(): GeneratedQuestion[] {
  const depth = 10;
  const widths = [12, 16, 20, 14, 18, 22, 10, 24, 16, 20];
  return widths.map((w, i) => {
    const host = HOST_CYCLE[i % 3]!;
    const refMarkup = hostOutline(host) + notchRect(w, depth, "bottom");
    const correctMarkup = pieceMarkup(w, depth, "bottom");
    const distractorWidths = padDistinctValues([w - 6, w + 6, w - 10], 3, w, 4);
    const distractorMarkups = distractorWidths.map((dw) => pieceMarkup(dw, depth, "bottom")) as [string, string, string];
    const correctIndex = i % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "This piece is too narrow — it would leave part of the gap uncovered.", hi: "यह टुकड़ा बहुत संकरा है — यह गैप का एक हिस्सा खुला छोड़ देगा।" },
        { en: "This piece is too wide — it would overlap past the edges of the gap.", hi: "यह टुकड़ा बहुत चौड़ा है — यह गैप के किनारों से आगे निकल जाएगा।" },
        { en: "This piece's width doesn't match the gap at all, even though its height happens to be right.", hi: "इस टुकड़े की चौड़ाई गैप से बिल्कुल मेल नहीं खाती, भले ही इसकी ऊँचाई सही हो।" },
      ]
    );
    const key = `bank-ma-geomcomplete-width-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY",
      content: {
        en: `A piece is missing from the bottom edge of the ${host}. Which option (A-D) is the exact piece that completes it?`,
        hi: `${host === "triangle" ? "त्रिभुज" : host === "square" ? "वर्ग" : "वृत्त"} के निचले किनारे से एक टुकड़ा गायब है। कौन-सा विकल्प (A-D) इसे पूरा करने वाला सही टुकड़ा है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The missing gap is ${w} units wide and ${depth} units deep — only the piece in option ${correctOption.toUpperCase()} matches both measurements exactly.`,
        hi: `गायब गैप ${w} इकाई चौड़ा और ${depth} इकाई गहरा है — केवल विकल्प ${correctOption.toUpperCase()} का टुकड़ा दोनों मापों से बिल्कुल मेल खाता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (a) ×5: both width AND depth vary ──────────────────────
function twoDimensionQuestions(): GeneratedQuestion[] {
  const params = [
    { w: 18, d: 8 },
    { w: 14, d: 14 },
    { w: 22, d: 10 },
    { w: 16, d: 18 },
    { w: 20, d: 12 },
  ];
  return params.map(({ w, d }, i) => {
    const host = HOST_CYCLE[i % 3]!;
    const refMarkup = hostOutline(host) + notchRect(w, d, "bottom");
    const correctMarkup = pieceMarkup(w, d, "bottom");
    const distractorMarkups: [string, string, string] = [
      pieceMarkup(w, Math.max(4, d - 6), "bottom"), // right width, wrong depth
      pieceMarkup(Math.max(4, w - 6), d, "bottom"), // right depth, wrong width
      pieceMarkup(Math.max(4, w - 6), Math.max(4, d - 6), "bottom"), // both wrong
    ];
    const correctIndex = (i + 1) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "The width is correct, but the depth is too shallow.", hi: "चौड़ाई सही है, पर गहराई बहुत कम है।" },
        { en: "The depth is correct, but the width is too narrow.", hi: "गहराई सही है, पर चौड़ाई बहुत कम है।" },
        { en: "Both the width and depth are wrong — this piece is smaller in every direction.", hi: "चौड़ाई और गहराई दोनों गलत हैं — यह टुकड़ा हर दिशा में छोटा है।" },
      ]
    );
    const key = `bank-ma-geomcomplete-twodim-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `A piece is missing from the bottom edge of the ${host}. Both its width and depth matter this time — which option (A-D) matches exactly?`,
        hi: `${host} के निचले किनारे से एक टुकड़ा गायब है। इस बार इसकी चौड़ाई और गहराई दोनों मायने रखती हैं — कौन-सा विकल्प (A-D) बिल्कुल मेल खाता है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The gap measures ${w} x ${d} — option ${correctOption.toUpperCase()} is the only piece matching both dimensions.`,
        hi: `गैप का माप ${w} x ${d} है — विकल्प ${correctOption.toUpperCase()} ही दोनों माप से मेल खाने वाला एकमात्र टुकड़ा है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (b) ×5: notch on the LEFT vs RIGHT edge of a square ───
function edgeOrientationQuestions(): GeneratedQuestion[] {
  const params: { span: number; depth: number; edge: EdgePosition }[] = [
    { span: 20, depth: 10, edge: "left" },
    { span: 16, depth: 8, edge: "right" },
    { span: 24, depth: 12, edge: "left" },
    { span: 18, depth: 10, edge: "right" },
    { span: 22, depth: 8, edge: "left" },
  ];
  return params.map(({ span, depth, edge }, i) => {
    const refMarkup = hostOutline("square") + notchRect(span, depth, edge);
    const correctMarkup = pieceMarkup(span, depth, edge);
    const oppositeEdge: EdgePosition = edge === "left" ? "right" : "left";
    const distractorMarkups: [string, string, string] = [
      pieceMarkup(span, depth, "bottom"), // classic trap: right dimensions, but oriented for the wrong (horizontal) edge — width/height swapped
      pieceMarkup(Math.max(4, span - 6), depth, edge), // right edge, wrong span
      pieceMarkup(span, Math.max(4, depth - 4), oppositeEdge === edge ? edge : edge), // right span, wrong depth
    ];
    const correctIndex = (i + 2) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "This piece has the right size, but it's oriented for a horizontal (top/bottom) gap, not this vertical one — width and height are swapped.", hi: "इस टुकड़े का आकार सही है, पर यह क्षैतिज (ऊपर/नीचे) गैप के लिए है, इस खड़े गैप के लिए नहीं — चौड़ाई और ऊँचाई बदली हुई है।" },
        { en: "Correctly oriented for this edge, but too short along it.", hi: "इस किनारे के लिए सही दिशा में है, पर इसकी लंबाई इसके साथ बहुत कम है।" },
        { en: "Correctly oriented and the right length, but it doesn't poke in deep enough.", hi: "सही दिशा और सही लंबाई है, पर यह पर्याप्त गहराई तक अंदर नहीं जाता।" },
      ]
    );
    const key = `bank-ma-geomcomplete-edgeorient-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `A piece is missing from the ${edge} edge of the square. Which option (A-D) is correctly sized AND correctly oriented to fill it?`,
        hi: `वर्ग के ${edge === "left" ? "बाएँ" : "दाएँ"} किनारे से एक टुकड़ा गायब है। कौन-सा विकल्प (A-D) इसे भरने के लिए सही आकार और सही दिशा में है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The gap is on the ${edge} edge, so the correct piece must stand tall (not lie wide) — option ${correctOption.toUpperCase()} is the only one both correctly sized and correctly oriented.`,
        hi: `गैप ${edge === "left" ? "बाएँ" : "दाएँ"} किनारे पर है, इसलिए सही टुकड़ा खड़ा (लेटा नहीं) होना चाहिए — विकल्प ${correctOption.toUpperCase()} ही सही आकार और सही दिशा दोनों में है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (c) ×5: edge position itself varies (bottom vs left) ──
function mixedEdgeQuestions(): GeneratedQuestion[] {
  const params: { span: number; depth: number; edge: EdgePosition; host: HostShape }[] = [
    { span: 18, depth: 9, edge: "bottom", host: "square" },
    { span: 20, depth: 10, edge: "left", host: "circle" },
    { span: 16, depth: 8, edge: "bottom", host: "circle" },
    { span: 22, depth: 11, edge: "left", host: "square" },
    { span: 14, depth: 7, edge: "bottom", host: "square" },
  ];
  return params.map(({ span, depth, edge, host }, i) => {
    const refMarkup = hostOutline(host) + notchRect(span, depth, edge);
    const correctMarkup = pieceMarkup(span, depth, edge);
    const otherEdge: EdgePosition = edge === "bottom" ? "left" : "bottom";
    const distractorMarkups: [string, string, string] = [
      pieceMarkup(span, depth, otherEdge), // right size, wrong edge (swapped orientation)
      pieceMarkup(Math.max(4, span - 5), depth, edge),
      pieceMarkup(span, Math.max(4, depth - 5), edge),
    ];
    const correctIndex = (i + 3) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Right size, but oriented for the wrong edge of the shape.", hi: "आकार सही है, पर आकृति के गलत किनारे के लिए दिशा में है।" },
        { en: "Right edge and orientation, but too short along the edge.", hi: "सही किनारा और दिशा है, पर किनारे के साथ लंबाई कम है।" },
        { en: "Right edge and orientation, but doesn't poke in deep enough.", hi: "सही किनारा और दिशा है, पर पर्याप्त गहराई तक अंदर नहीं जाता।" },
      ]
    );
    const key = `bank-ma-geomcomplete-mixededge-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `First find WHICH edge of the ${host} the piece is missing from, then find the piece that fills it. Which option (A-D) is correct?`,
        hi: `पहले पता करें कि ${host} के किस किनारे से टुकड़ा गायब है, फिर वह टुकड़ा खोजें जो उसे भरता है। कौन-सा विकल्प (A-D) सही है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The gap is on the ${edge} edge — option ${correctOption.toUpperCase()} is the only piece with both the right size and the right orientation for that edge.`,
        hi: `गैप ${edge} किनारे पर है — विकल्प ${correctOption.toUpperCase()} ही उस किनारे के लिए सही आकार और सही दिशा वाला टुकड़ा है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (d) ×5: wedge (pie-slice) notch on a circle host ────────
function wedgeAngleQuestions(): GeneratedQuestion[] {
  const angles = [40, 60, 90, 50, 75];
  return angles.map((angle, i) => {
    const refMarkup = hostOutline("circle") + wedgeMarkup(angle, 180, 32, CELL_BG);
    const correctMarkup = wedgeMarkup(angle, 180, 18, INK);
    const distractorAngles = padDistinctValues([angle - 20, angle + 20, angle - 30], 3, angle, 15, 20);
    const distractorMarkups = distractorAngles.map((a) => wedgeMarkup(a, 180, 18, INK)) as [string, string, string];
    const correctIndex = i % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "This wedge's angle is too narrow to fill the missing slice.", hi: "यह वेज कोण गायब हिस्से को भरने के लिए बहुत संकरा है।" },
        { en: "This wedge's angle is too wide — it would overlap into the rest of the circle.", hi: "यह वेज कोण बहुत चौड़ा है — यह वृत्त के बाकी हिस्से में फैल जाएगा।" },
        { en: "This wedge's angle is clearly a different size from the missing slice.", hi: "यह वेज कोण गायब हिस्से से स्पष्ट रूप से अलग आकार का है।" },
      ]
    );
    const key = `bank-ma-geomcomplete-wedge-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `A wedge-shaped slice is missing from the circle. Which option (A-D) is the exact slice (by angle) that completes it?`,
        hi: `वृत्त से एक वेज-आकार का हिस्सा गायब है। कौन-सा विकल्प (A-D) इसे पूरा करने वाला सही (कोण के अनुसार) हिस्सा है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The missing slice spans ${angle}° — only option ${correctOption.toUpperCase()} shows a wedge of exactly that angle.`,
        hi: `गायब हिस्सा ${angle}° का है — केवल विकल्प ${correctOption.toUpperCase()} ठीक उसी कोण का वेज दिखाता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (e) ×5: edge, span, AND depth all vary together ─────────
function threeWayComboQuestions(): GeneratedQuestion[] {
  const params: { span: number; depth: number; edge: EdgePosition }[] = [
    { span: 18, depth: 9, edge: "bottom" },
    { span: 20, depth: 10, edge: "left" },
    { span: 16, depth: 8, edge: "right" },
    { span: 22, depth: 11, edge: "bottom" },
    { span: 14, depth: 12, edge: "left" },
  ];
  // "left" and "right" pieces render as identical standalone rectangles
  // (pieceMarkup only distinguishes "bottom" from "not-bottom" — a piece
  // doesn't visually know which vertical edge it's meant for), so the only
  // genuinely different wrong-edge distractor is the OTHER orientation
  // class. Restricting this family's edge param to "bottom"/"left" (never
  // introducing "right" as a distinct case) keeps every distractor a real,
  // distinguishable rectangle — caught by assertDistinctFigures when
  // "right" was tried here and rendered identically to "left".
  return params.map(({ span, depth, edge }, i) => {
    const refMarkup = hostOutline("square") + notchRect(span, depth, edge);
    const correctMarkup = pieceMarkup(span, depth, edge);
    const wrongEdge: EdgePosition = edge === "bottom" ? "left" : "bottom";
    const distractorMarkups: [string, string, string] = [
      pieceMarkup(span, depth, wrongEdge), // right dims, wrong edge (only ever the other orientation class)
      pieceMarkup(Math.max(4, span - 5), Math.max(4, depth - 3), edge), // right edge, both dims off
      pieceMarkup(span, Math.max(4, depth - 5), wrongEdge), // wrong edge AND wrong depth
    ];
    const correctIndex = (i + 1) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "The size is right, but it's meant for a different edge entirely.", hi: "आकार सही है, पर यह एक अलग किनारे के लिए बना है।" },
        { en: "The edge is right, but both the span and depth are off.", hi: "किनारा सही है, पर लंबाई और गहराई दोनों गलत हैं।" },
        { en: "Wrong edge AND wrong depth — two mistakes at once.", hi: "गलत किनारा और गलत गहराई — एक साथ दो गलतियाँ।" },
      ]
    );
    const key = `bank-ma-geomcomplete-threeway-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `The missing piece could be on any edge, at any size — check the edge, the span, and the depth all together. Which option (A-D) is the exact match?`,
        hi: `गायब टुकड़ा किसी भी किनारे पर, किसी भी आकार का हो सकता है — किनारा, लंबाई और गहराई तीनों एक साथ जाँचें। कौन-सा विकल्प (A-D) बिल्कुल मेल खाता है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The gap is on the ${edge} edge, spanning ${span} units at a depth of ${depth} — option ${correctOption.toUpperCase()} is the only piece matching all three.`,
        hi: `गैप ${edge} किनारे पर है, जिसकी लंबाई ${span} इकाई और गहराई ${depth} है — विकल्प ${correctOption.toUpperCase()} ही तीनों से मेल खाता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (f) ×5: tight numeric distractors, hardest to eyeball ───
function tightDeltaQuestions(): GeneratedQuestion[] {
  const params = [
    { w: 20, d: 10 },
    { w: 16, d: 14 },
    { w: 24, d: 8 },
    { w: 18, d: 12 },
    { w: 22, d: 16 },
  ];
  return params.map(({ w, d }, i) => {
    const host = HOST_CYCLE[i % 3]!;
    const refMarkup = hostOutline(host) + notchRect(w, d, "bottom");
    const correctMarkup = pieceMarkup(w, d, "bottom");
    const distractorMarkups: [string, string, string] = [
      pieceMarkup(w - 2, d, "bottom"),
      pieceMarkup(w, d - 2, "bottom"),
      pieceMarkup(w + 2, d, "bottom"),
    ];
    const correctIndex = (i + 2) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Just 2 units narrower than the gap — a subtle undersize.", hi: "गैप से केवल 2 इकाई कम चौड़ा — एक सूक्ष्म कमी।" },
        { en: "Just 2 units shallower than the gap — a subtle undersize.", hi: "गैप से केवल 2 इकाई कम गहरा — एक सूक्ष्म कमी।" },
        { en: "Just 2 units wider than the gap — a subtle oversize.", hi: "गैप से केवल 2 इकाई अधिक चौड़ा — एक सूक्ष्म अधिकता।" },
      ]
    );
    const key = `bank-ma-geomcomplete-tightdelta-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `The 4 candidate pieces are all very close in size — look carefully. Which option (A-D) matches the gap exactly, with no difference at all?`,
        hi: `चारों संभावित टुकड़े आकार में बहुत करीब हैं — ध्यान से देखें। कौन-सा विकल्प (A-D) बिना किसी अंतर के गैप से बिल्कुल मेल खाता है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The gap measures exactly ${w} x ${d} — option ${correctOption.toUpperCase()} is the only piece with no difference in either measurement.`,
        hi: `गैप का सही माप ${w} x ${d} है — विकल्प ${correctOption.toUpperCase()} ही ऐसा टुकड़ा है जिसमें किसी भी माप में कोई अंतर नहीं है।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildGeometricalFigureCompletionQuestions(): GeneratedQuestion[] {
  const all = [
    ...widthOnlyQuestions(),
    ...twoDimensionQuestions(),
    ...edgeOrientationQuestions(),
    ...mixedEdgeQuestions(),
    ...wedgeAngleQuestions(),
    ...threeWayComboQuestions(),
    ...tightDeltaQuestions(),
  ];
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Geometrical Figure Completion pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}
