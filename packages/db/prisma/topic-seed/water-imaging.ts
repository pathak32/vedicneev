import { labeledCell, separator, shapeMarkup, svgDocument, type ShapeName } from "./svg-shapes";
import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Water Imaging pool (Mental Ability ->
 * "water_imaging" topic, new): 10 Easy / 15 Moderate / 15 Hard. The
 * horizontal-axis counterpart to mirror-imaging.ts: every question asks
 * which option shows a figure's reflection in water below it
 * (scale(1,-1)) instead of a vertical mirror to its side. "arrow" is
 * excluded from this entire file: it's symmetric about its own horizontal
 * axis at rotation 0 (reflecting it top-to-bottom renders pixel-identical
 * to the unrotated original — this was the very first shape-symmetry bug
 * found in this project's visual generators), while flag/triangle/
 * ltromino have no symmetry axis at all and are safe for any
 * rotation+reflection combination.
 */

const SAFE_SHAPES: ShapeName[] = ["flag", "triangle", "ltromino"];
const OPTION_IDS = ["a", "b", "c", "d"] as const;

function buildOptions(): OptionSeed[] {
  return OPTION_IDS.map((id) => ({ id, text: { en: id.toUpperCase(), hi: id.toUpperCase() } }));
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

interface CompositePart {
  shape: ShapeName;
  dx: number;
  dy: number;
  rotate: number;
}

function compositeInner(parts: CompositePart[]): string {
  return parts.map((p) => `<g transform="translate(${p.dx},${p.dy}) rotate(${p.rotate})">${shapeMarkup(p.shape)}</g>`).join("");
}

/** Wraps a composite in an optional horizontal (water) reflection + rotation. */
function renderComposite(parts: CompositePart[], outerRotate: number, reflected: boolean): string {
  const flip = reflected ? "scale(1,-1) " : "";
  return `<g transform="${flip}rotate(${outerRotate})">${compositeInner(parts)}</g>`;
}

function buildDiagram(key: string, refMarkup: string, optionMarkups: string[]): { type: "svg"; markup: string } {
  assertDistinctFigures(key, optionMarkups);
  const refCell = labeledCell(0, "Figure", refMarkup);
  const waterGlyph = separator(105, "->");
  const optionCells = optionMarkups.map((m, i) => labeledCell(140 + i * 110, OPTION_IDS[i]!.toUpperCase(), m));
  const width = 140 + optionMarkups.length * 110;
  return { type: "svg" as const, markup: svgDocument([refCell, waterGlyph, ...optionCells].join(""), width) };
}

// ── EASY (×10): single shape, rotation 0, reflected in water below ───────
function singleShapeQuestions(): GeneratedQuestion[] {
  const shapes: ShapeName[] = [...SAFE_SHAPES, ...SAFE_SHAPES, ...SAFE_SHAPES, "flag"];
  return shapes.map((shape, i) => {
    const parts: CompositePart[] = [{ shape, dx: 0, dy: 0, rotate: 0 }];
    const refMarkup = renderComposite(parts, 0, false);
    const correctMarkup = renderComposite(parts, 0, true);
    const distractorMarkups: [string, string, string] = [
      renderComposite(parts, 0, false), // unchanged — not reflected at all
      renderComposite(parts, 90, false), // rotated instead of reflected
      renderComposite(parts, 90, true), // correctly reflected, extra unwanted rotation
    ];
    const correctIndex = i % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "This is the figure completely unchanged — it was never reflected at all.", hi: "यह आकृति बिल्कुल अपरिवर्तित है — इसे कभी परावर्तित ही नहीं किया गया।" },
        { en: "This is the figure rotated 90° instead of reflected — a turn, not a water reflection.", hi: "यह आकृति जल-प्रतिबिंब के बजाय 90° घुमाई गई है — यह एक घुमाव है, जल-प्रतिबिंब नहीं।" },
        { en: "Correctly reflected, but with an extra unwanted 90° rotation added on top.", hi: "सही ढंग से जल-प्रतिबिंबित है, पर ऊपर से एक अतिरिक्त अवांछित 90° घुमाव भी जोड़ दिया गया है।" },
      ]
    );
    const key = `bank-ma-waterimg-single-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY",
      content: {
        en: "Which option (A-D) shows this figure's reflection in still water directly below it?",
        hi: "कौन-सा विकल्प (A-D) इस आकृति का, ठीक नीचे स्थिर पानी में, प्रतिबिंब दिखाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `A water reflection flips up and down while keeping left and right in place — option ${correctOption.toUpperCase()} is the only one showing that exact flip with no extra rotation.`,
        hi: `जल-प्रतिबिंब ऊपर-नीचे को पलट देता है जबकि बाएँ-दाएँ अपनी जगह रहते हैं — विकल्प ${correctOption.toUpperCase()} ही बिना किसी अतिरिक्त घुमाव के ठीक वही पलट दिखाता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (a) ×5: single shape at a given oblique rotation, reflected ─
function obliqueSingleQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; angle: number }[] = [
    { shape: "flag", angle: 40 },
    { shape: "triangle", angle: 60 },
    { shape: "ltromino", angle: 30 },
    { shape: "flag", angle: 70 },
    { shape: "triangle", angle: 50 },
  ];
  return params.map(({ shape, angle }, i) => {
    const parts: CompositePart[] = [{ shape, dx: 0, dy: 0, rotate: angle }];
    const refMarkup = renderComposite(parts, 0, false);
    const correctMarkup = renderComposite(parts, 0, true);
    const distractorMarkups: [string, string, string] = [
      renderComposite(parts, 0, false),
      renderComposite([{ shape, dx: 0, dy: 0, rotate: -angle }], 0, false), // opposite rotation instead of reflected
      renderComposite(parts, 45, true),
    ];
    const correctIndex = (i + 1) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "This is the figure completely unchanged — no reflection applied.", hi: "यह आकृति बिल्कुल अपरिवर्तित है — कोई प्रतिबिंब लागू नहीं किया गया।" },
        { en: "This rotates the figure the opposite way instead of reflecting it in water.", hi: "यह आकृति को जल-प्रतिबिंबित करने के बजाय विपरीत दिशा में घुमा देता है।" },
        { en: "Correctly reflected, but with an extra unwanted rotation added on top.", hi: "सही ढंग से जल-प्रतिबिंबित है, पर ऊपर से एक अतिरिक्त अवांछित घुमाव भी जोड़ दिया गया है।" },
      ]
    );
    const key = `bank-ma-waterimg-oblique-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "This figure is tilted at an angle above the water. Which option (A-D) shows its correct reflection, keeping the same tilt?",
        hi: "यह आकृति पानी के ऊपर एक कोण पर झुकी है। कौन-सा विकल्प (A-D) इसका सही प्रतिबिंब दिखाता है, वही झुकाव बनाए रखते हुए?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Reflecting in water doesn't remove the tilt — option ${correctOption.toUpperCase()} shows the figure correctly flipped top-bottom while keeping its ${angle}° tilt.`,
        hi: `जल-प्रतिबिंब झुकाव को नहीं हटाता — विकल्प ${correctOption.toUpperCase()} आकृति को सही ढंग से ऊपर-नीचे पलटा हुआ दिखाता है, जबकि उसका ${angle}° झुकाव बना रहता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (b) ×5: two shapes stacked vertically, reflected ──────
function verticalStackQuestions(): GeneratedQuestion[] {
  const params: { shapeTop: ShapeName; shapeBottom: ShapeName }[] = [
    { shapeTop: "flag", shapeBottom: "triangle" },
    { shapeTop: "triangle", shapeBottom: "ltromino" },
    { shapeTop: "ltromino", shapeBottom: "flag" },
    { shapeTop: "flag", shapeBottom: "ltromino" },
    { shapeTop: "triangle", shapeBottom: "flag" },
  ];
  return params.map(({ shapeTop, shapeBottom }, i) => {
    const parts: CompositePart[] = [
      { shape: shapeTop, dx: 0, dy: -20, rotate: 0 },
      { shape: shapeBottom, dx: 0, dy: 20, rotate: 0 },
    ];
    const refMarkup = renderComposite(parts, 0, false);
    const correctMarkup = renderComposite(parts, 0, true);
    // Positions correctly swapped (water reflection DOES swap top/bottom), but neither shape was itself flipped.
    const positionsSwappedOnly: CompositePart[] = [
      { shape: shapeTop, dx: 0, dy: 20, rotate: 0 },
      { shape: shapeBottom, dx: 0, dy: -20, rotate: 0 },
    ];
    const distractorMarkups: [string, string, string] = [
      renderComposite(parts, 0, false), // both shapes unchanged
      compositeInner(positionsSwappedOnly), // positions swapped, but neither shape was itself reflected
      renderComposite(parts, 90, true), // correctly reflected, extra unwanted rotation
    ];
    const correctIndex = (i + 2) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Both figures are shown completely unchanged.", hi: "दोनों आकृतियाँ बिल्कुल अपरिवर्तित दिखाई गई हैं।" },
        { en: "The top and bottom figures correctly swapped places, but neither shape was actually reflected itself — only half the job was done.", hi: "ऊपर और नीचे की आकृतियों ने सही ढंग से जगह बदली, पर किसी भी आकृति को स्वयं प्रतिबिंबित नहीं किया गया — केवल आधा काम हुआ।" },
        { en: "Correctly reflected (top and bottom swapped), but with an extra unwanted rotation added on top.", hi: "सही ढंग से जल-प्रतिबिंबित (ऊपर-नीचे बदले), पर ऊपर से एक अतिरिक्त अवांछित घुमाव भी जोड़ दिया गया है।" },
      ]
    );
    const key = `bank-ma-waterimg-vstack-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "One figure sits above another, over water. Which option (A-D) shows their correct combined reflection?",
        hi: "एक आकृति दूसरी के ऊपर, पानी के ऊपर, स्थित है। कौन-सा विकल्प (A-D) उनका सही संयुक्त प्रतिबिंब दिखाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `A water reflection swaps top and bottom AND flips each figure individually — option ${correctOption.toUpperCase()} is the only one that does both correctly.`,
        hi: `जल-प्रतिबिंब ऊपर-नीचे को आपस में बदल देता है और हर आकृति को अलग से भी पलट देता है — विकल्प ${correctOption.toUpperCase()} ही दोनों काम सही ढंग से करता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (c) ×5: two shapes side by side — tests that water
// reflection does NOT swap left/right, only top/bottom ──────────────────
function sideBySideQuestions(): GeneratedQuestion[] {
  const params: { shapeLeft: ShapeName; shapeRight: ShapeName }[] = [
    { shapeLeft: "flag", shapeRight: "triangle" },
    { shapeLeft: "triangle", shapeRight: "ltromino" },
    { shapeLeft: "ltromino", shapeRight: "flag" },
    { shapeLeft: "flag", shapeRight: "ltromino" },
    { shapeLeft: "triangle", shapeRight: "flag" },
  ];
  return params.map(({ shapeLeft, shapeRight }, i) => {
    const parts: CompositePart[] = [
      { shape: shapeLeft, dx: -18, dy: 0, rotate: 0 },
      { shape: shapeRight, dx: 18, dy: 0, rotate: 0 },
    ];
    const refMarkup = renderComposite(parts, 0, false);
    const correctMarkup = renderComposite(parts, 0, true);
    // The classic trap for a SIDE-BY-SIDE pair: swapping left and right, as if this were a vertical (mirror) reflection instead of a horizontal (water) one.
    const leftRightSwapped: CompositePart[] = [
      { shape: shapeRight, dx: -18, dy: 0, rotate: 0 },
      { shape: shapeLeft, dx: 18, dy: 0, rotate: 0 },
    ];
    const distractorMarkups: [string, string, string] = [
      renderComposite(parts, 0, false), // both shapes unchanged
      `<g transform="scale(1,-1)">${compositeInner(leftRightSwapped)}</g>`, // WRONG: also swapped left/right, which a water reflection never does
      renderComposite(parts, 90, true), // correctly reflected, extra unwanted rotation
    ];
    const correctIndex = (i + 3) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Both figures are shown completely unchanged.", hi: "दोनों आकृतियाँ बिल्कुल अपरिवर्तित दिखाई गई हैं।" },
        { en: "This swaps the LEFT and RIGHT figures — but a water reflection only swaps top and bottom; left and right should stay exactly where they are.", hi: "यह बाईं और दाईं आकृतियों को आपस में बदल देता है — पर जल-प्रतिबिंब केवल ऊपर-नीचे बदलता है; बाएँ-दाएँ अपनी जगह ही रहने चाहिए।" },
        { en: "Correctly reflected, but with an extra unwanted rotation added on top.", hi: "सही ढंग से जल-प्रतिबिंबित है, पर ऊपर से एक अतिरिक्त अवांछित घुमाव भी जोड़ दिया गया है।" },
      ]
    );
    const key = `bank-ma-waterimg-sidebyside-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "Two figures sit side by side, over water. Which option (A-D) shows their correct reflection?",
        hi: "दो आकृतियाँ साथ-साथ, पानी के ऊपर, रखी हैं। कौन-सा विकल्प (A-D) उनका सही प्रतिबिंब दिखाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `A water reflection only flips top-bottom — the left figure stays on the left and the right stays on the right, each individually flipped. Option ${correctOption.toUpperCase()} is the only one that keeps the left/right order unchanged.`,
        hi: `जल-प्रतिबिंब केवल ऊपर-नीचे पलटता है — बाईं आकृति बाईं ओर ही रहती है और दाईं दाईं ओर ही, हर एक अलग से पलटकर। विकल्प ${correctOption.toUpperCase()} ही बाएँ/दाएँ क्रम को अपरिवर्तित रखता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (a) ×5: two-shape vertical composite at oblique rotation ──
function obliqueTwoShapeQuestions(): GeneratedQuestion[] {
  const params: { shapeTop: ShapeName; shapeBottom: ShapeName; angle: number }[] = [
    { shapeTop: "flag", shapeBottom: "triangle", angle: 35 },
    { shapeTop: "triangle", shapeBottom: "ltromino", angle: 55 },
    { shapeTop: "ltromino", shapeBottom: "flag", angle: 40 },
    { shapeTop: "flag", shapeBottom: "ltromino", angle: 65 },
    { shapeTop: "triangle", shapeBottom: "flag", angle: 25 },
  ];
  return params.map(({ shapeTop, shapeBottom, angle }, i) => {
    const parts: CompositePart[] = [
      { shape: shapeTop, dx: 0, dy: -20, rotate: 0 },
      { shape: shapeBottom, dx: 0, dy: 20, rotate: 0 },
    ];
    const refMarkup = renderComposite(parts, angle, false);
    const correctMarkup = renderComposite(parts, angle, true);
    const distractorMarkups: [string, string, string] = [
      renderComposite(parts, angle, false),
      renderComposite(parts, -angle, false),
      renderComposite(parts, angle + 45, true),
    ];
    const correctIndex = i % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "The whole composite is shown unchanged — no reflection applied.", hi: "पूरी संयुक्त आकृति अपरिवर्तित दिखाई गई है — कोई प्रतिबिंब लागू नहीं किया गया।" },
        { en: "The composite is rotated the opposite way instead of being reflected.", hi: "संयुक्त आकृति को जल-प्रतिबिंबित करने के बजाय विपरीत दिशा में घुमाया गया है।" },
        { en: "Correctly reflected, but tilted at the wrong angle.", hi: "सही ढंग से जल-प्रतिबिंबित है, पर गलत कोण पर झुका हुआ है।" },
      ]
    );
    const key = `bank-ma-waterimg-obliquetwo-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "This tilted two-figure composite needs to be reflected in water as a whole. Which option (A-D) is correct?",
        hi: "इस झुकी हुई दो-आकृति संयुक्त रचना को पूरी तरह जल-प्रतिबिंबित करना है। कौन-सा विकल्प (A-D) सही है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The whole tilted composite must flip top-bottom while keeping its ${angle}° tilt — option ${correctOption.toUpperCase()} is the only one that does this correctly.`,
        hi: `पूरी झुकी हुई संयुक्त रचना को अपने ${angle}° झुकाव को बनाए रखते हुए ऊपर-नीचे पलटना है — विकल्प ${correctOption.toUpperCase()} ही यह सही ढंग से करता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (b) ×5: three-shape vertical stack, reflected ────────────
function threeShapeStackQuestions(): GeneratedQuestion[] {
  const shapeSets: [ShapeName, ShapeName, ShapeName][] = [
    ["flag", "triangle", "ltromino"],
    ["triangle", "ltromino", "flag"],
    ["ltromino", "flag", "triangle"],
    ["flag", "ltromino", "triangle"],
    ["triangle", "flag", "ltromino"],
  ];
  return shapeSets.map((shapes, i) => {
    const parts: CompositePart[] = [
      { shape: shapes[0], dx: 0, dy: -24, rotate: 0 },
      { shape: shapes[1], dx: 0, dy: 0, rotate: 0 },
      { shape: shapes[2], dx: 0, dy: 24, rotate: 0 },
    ];
    const refMarkup = renderComposite(parts, 0, false);
    const correctMarkup = renderComposite(parts, 0, true);
    const swappedEndsOnly: CompositePart[] = [
      { shape: shapes[2], dx: 0, dy: -24, rotate: 0 },
      { shape: shapes[1], dx: 0, dy: 0, rotate: 0 },
      { shape: shapes[0], dx: 0, dy: 24, rotate: 0 },
    ];
    const distractorMarkups: [string, string, string] = [
      renderComposite(parts, 0, false), // nothing changed
      compositeInner(swappedEndsOnly), // top/bottom swapped, but forgot to reflect each individual shape
      renderComposite(parts, 90, true), // correct reflection, extra unwanted rotation
    ];
    const correctIndex = (i + 3) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "All three figures are shown completely unchanged.", hi: "तीनों आकृतियाँ बिल्कुल अपरिवर्तित दिखाई गई हैं।" },
        { en: "The top and bottom figures swapped places, but none of the three figures were actually reflected themselves.", hi: "ऊपर और नीचे की आकृतियों ने अपनी जगह बदल ली, पर तीनों में से किसी भी आकृति को वास्तव में प्रतिबिंबित नहीं किया गया।" },
        { en: "Correctly reflected, but with an extra unwanted rotation added on top.", hi: "सही ढंग से जल-प्रतिबिंबित है, पर ऊपर से एक अतिरिक्त अवांछित घुमाव भी जोड़ दिया गया है।" },
      ]
    );
    const key = `bank-ma-waterimg-threeshape-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "Three figures are stacked, over water. Which option (A-D) shows their correct combined reflection?",
        hi: "तीन आकृतियाँ, पानी के ऊपर, एक के ऊपर एक रखी हैं। कौन-सा विकल्प (A-D) उनका सही संयुक्त प्रतिबिंब दिखाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Reflecting in water reverses the ORDER top-to-bottom (top and bottom swap, middle stays in the middle) AND flips each figure individually — option ${correctOption.toUpperCase()} is the only one that does both correctly.`,
        hi: `जल-प्रतिबिंब ऊपर-से-नीचे क्रम को उलट देता है (ऊपर-नीचे आपस में बदलती हैं, बीच वाली बीच में रहती है) और हर आकृति को अलग से भी पलट देता है — विकल्प ${correctOption.toUpperCase()} ही दोनों काम सही ढंग से करता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (c) ×5: single shape, oblique rotation, tight distractors ──
function tightObliqueQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; angle: number }[] = [
    { shape: "flag", angle: 33 },
    { shape: "triangle", angle: 47 },
    { shape: "ltromino", angle: 62 },
    { shape: "flag", angle: 18 },
    { shape: "triangle", angle: 71 },
  ];
  return params.map(({ shape, angle }, i) => {
    const parts: CompositePart[] = [{ shape, dx: 0, dy: 0, rotate: angle }];
    const refMarkup = renderComposite(parts, 0, false);
    const correctMarkup = renderComposite(parts, 0, true);
    const distractorMarkups: [string, string, string] = [
      renderComposite([{ shape, dx: 0, dy: 0, rotate: angle + 8 }], 0, true), // reflected, but tilted 8° off
      renderComposite([{ shape, dx: 0, dy: 0, rotate: angle - 8 }], 0, true), // reflected, but tilted 8° the other way
      renderComposite(parts, 0, false),
    ];
    const correctIndex = (i + 1) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Correctly reflected, but tilted a few degrees too far in one direction — a subtle angle mismatch.", hi: "सही ढंग से जल-प्रतिबिंबित है, पर एक दिशा में कुछ डिग्री अधिक झुका है — एक सूक्ष्म कोण बेमेल।" },
        { en: "Correctly reflected, but tilted a few degrees too far in the other direction — a subtle angle mismatch.", hi: "सही ढंग से जल-प्रतिबिंबित है, पर दूसरी दिशा में कुछ डिग्री अधिक झुका है — एक सूक्ष्म कोण बेमेल।" },
        { en: "This is the figure completely unchanged — no reflection applied at all.", hi: "यह आकृति बिल्कुल अपरिवर्तित है — कोई प्रतिबिंब लागू ही नहीं किया गया।" },
      ]
    );
    const key = `bank-ma-waterimg-tightoblique-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "The 4 options are all reflected versions at very close angles — look carefully. Which option (A-D) matches the exact tilt of the original?",
        hi: "चारों विकल्प बहुत करीबी कोणों पर जल-प्रतिबिंबित संस्करण हैं — ध्यान से देखें। कौन-सा विकल्प (A-D) मूल आकृति के ठीक झुकाव से मेल खाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The original is tilted at ${angle}° — reflecting in water keeps that exact tilt, and option ${correctOption.toUpperCase()} is the only one at precisely ${angle}°, not a few degrees off.`,
        hi: `मूल आकृति ${angle}° पर झुकी है — जल-प्रतिबिंब वही झुकाव बनाए रखता है, और विकल्प ${correctOption.toUpperCase()} ही ठीक ${angle}° पर है, कुछ डिग्री इधर-उधर नहीं।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildWaterImagingQuestions(): GeneratedQuestion[] {
  const all = [
    ...singleShapeQuestions(),
    ...obliqueSingleQuestions(),
    ...verticalStackQuestions(),
    ...sideBySideQuestions(),
    ...obliqueTwoShapeQuestions(),
    ...threeShapeStackQuestions(),
    ...tightObliqueQuestions(),
  ];
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Water Imaging pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}
