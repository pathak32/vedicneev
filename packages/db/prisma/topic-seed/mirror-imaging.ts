import { labeledCell, separator, shapeMarkup, svgDocument, type ShapeName } from "./svg-shapes";
import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Mirror Imaging pool (Mental Ability ->
 * "mirror_imaging" topic, new): 10 Easy / 15 Moderate / 15 Hard. Every
 * question asks which option shows a figure's reflection across a
 * VERTICAL mirror axis (scale(-1,1)) — the counterpart to Water Imaging's
 * horizontal-axis reflection. "arrow" is excluded from this entire file:
 * it has one line of symmetry along its own shaft, and at a 90°/270°
 * rotation a vertical mirror leaves it pixel-identical to the unmirrored
 * figure (verified by direct point-set comparison in the original
 * figure-matching.ts/analogy.ts work) — flag/triangle/ltromino have no
 * symmetry axis at all, so they're safe for any rotation+mirror
 * combination, and composing 2-3 of them together (different shapes at
 * different offsets) gives plenty of visual variety without inventing new
 * base shapes that would need their own from-scratch symmetry check.
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

/** Renders one or more shapes at fixed relative offsets as a single rigid composite figure. */
function compositeInner(parts: CompositePart[]): string {
  return parts.map((p) => `<g transform="translate(${p.dx},${p.dy}) rotate(${p.rotate})">${shapeMarkup(p.shape)}</g>`).join("");
}

/** Wraps a composite in an optional vertical mirror + rotation — the single building block every family in this file uses for both the reference and the 4 options. */
function renderComposite(parts: CompositePart[], outerRotate: number, mirror: boolean): string {
  const flip = mirror ? "scale(-1,1) " : "";
  return `<g transform="${flip}rotate(${outerRotate})">${compositeInner(parts)}</g>`;
}

/** Reference cell + a vertical mirror-line glyph + the 4 lettered option cells. */
function buildDiagram(key: string, refMarkup: string, optionMarkups: string[]): { type: "svg"; markup: string } {
  assertDistinctFigures(key, optionMarkups);
  const refCell = labeledCell(0, "Figure", refMarkup);
  const mirrorGlyph = separator(105, "->");
  const optionCells = optionMarkups.map((m, i) => labeledCell(140 + i * 110, OPTION_IDS[i]!.toUpperCase(), m));
  const width = 140 + optionMarkups.length * 110;
  return { type: "svg" as const, markup: svgDocument([refCell, mirrorGlyph, ...optionCells].join(""), width) };
}

// ── EASY (×10): single shape, rotation 0, mirrored across the vertical axis ─
function singleShapeQuestions(): GeneratedQuestion[] {
  const shapes: ShapeName[] = [...SAFE_SHAPES, ...SAFE_SHAPES, ...SAFE_SHAPES, "flag"];
  return shapes.map((shape, i) => {
    const parts: CompositePart[] = [{ shape, dx: 0, dy: 0, rotate: 0 }];
    const refMarkup = renderComposite(parts, 0, false);
    const correctMarkup = renderComposite(parts, 0, true);
    const distractorMarkups: [string, string, string] = [
      renderComposite(parts, 0, false), // unmirrored — copies the reference exactly, a common careless trap
      renderComposite(parts, 90, false), // rotated instead of mirrored
      renderComposite(parts, 90, true), // mirrored but with an extra unwanted rotation
    ];
    const correctIndex = i % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "This is the figure completely unchanged — it was never reflected at all.", hi: "यह आकृति बिल्कुल अपरिवर्तित है — इसे कभी परावर्तित ही नहीं किया गया।" },
        { en: "This is the figure rotated 90° instead of mirrored — a turn, not a reflection.", hi: "यह आकृति दर्पण-प्रतिबिंब के बजाय 90° घुमाई गई है — यह एक घुमाव है, प्रतिबिंब नहीं।" },
        { en: "Correctly mirrored, but with an extra unwanted 90° rotation added on top.", hi: "सही ढंग से दर्पण-प्रतिबिंबित है, पर ऊपर से एक अतिरिक्त अवांछित 90° घुमाव भी जोड़ दिया गया है।" },
      ]
    );
    const key = `bank-ma-mirrorimg-single-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY",
      content: {
        en: "Which option (A-D) shows this figure's reflection in a vertical mirror placed to its right?",
        hi: "कौन-सा विकल्प (A-D) इस आकृति का, दाईं ओर रखे एक ऊर्ध्वाधर दर्पण में, प्रतिबिंब दिखाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `A vertical mirror flips left and right while keeping up and down in place — option ${correctOption.toUpperCase()} is the only one showing that exact flip with no extra rotation.`,
        hi: `ऊर्ध्वाधर दर्पण बाएँ-दाएँ को पलट देता है जबकि ऊपर-नीचे अपनी जगह रहते हैं — विकल्प ${correctOption.toUpperCase()} ही बिना किसी अतिरिक्त घुमाव के ठीक वही पलट दिखाता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (a) ×5: single shape at a given oblique rotation, mirrored ─
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
      renderComposite([{ shape, dx: 0, dy: 0, rotate: -angle }], 0, false), // rotated the opposite way instead of mirrored — a classic confusion between rotation and reflection
      renderComposite(parts, 45, true),
    ];
    const correctIndex = (i + 1) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "This is the figure completely unchanged — no reflection applied.", hi: "यह आकृति बिल्कुल अपरिवर्तित है — कोई प्रतिबिंब लागू नहीं किया गया।" },
        { en: "This rotates the figure the opposite way instead of mirroring it — rotating backward is not the same as reflecting.", hi: "यह आकृति को दर्पण-प्रतिबिंबित करने के बजाय विपरीत दिशा में घुमा देता है — पीछे घुमाना प्रतिबिंब के समान नहीं है।" },
        { en: "Correctly mirrored, but with an extra unwanted rotation added on top.", hi: "सही ढंग से दर्पण-प्रतिबिंबित है, पर ऊपर से एक अतिरिक्त अवांछित घुमाव भी जोड़ दिया गया है।" },
      ]
    );
    const key = `bank-ma-mirrorimg-oblique-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "This figure is tilted at an angle. Which option (A-D) shows its correct mirror image (in a vertical mirror), keeping the same tilt?",
        hi: "यह आकृति एक कोण पर झुकी है। कौन-सा विकल्प (A-D) इसका सही दर्पण-प्रतिबिंब (ऊर्ध्वाधर दर्पण में) दिखाता है, वही झुकाव बनाए रखते हुए?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Mirroring doesn't remove the tilt — option ${correctOption.toUpperCase()} shows the figure correctly flipped left-right while keeping its ${angle}° tilt.`,
        hi: `दर्पण-प्रतिबिंब झुकाव को नहीं हटाता — विकल्प ${correctOption.toUpperCase()} आकृति को सही ढंग से बाएँ-दाएँ पलटा हुआ दिखाता है, जबकि उसका ${angle}° झुकाव बना रहता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (b) ×5: two different shapes composed together, mirrored ──
function twoShapeCompositeQuestions(): GeneratedQuestion[] {
  const params: { shapeA: ShapeName; shapeB: ShapeName }[] = [
    { shapeA: "flag", shapeB: "triangle" },
    { shapeA: "triangle", shapeB: "ltromino" },
    { shapeA: "ltromino", shapeB: "flag" },
    { shapeA: "flag", shapeB: "ltromino" },
    { shapeA: "triangle", shapeB: "flag" },
  ];
  return params.map(({ shapeA, shapeB }, i) => {
    const parts: CompositePart[] = [
      { shape: shapeA, dx: -18, dy: 0, rotate: 0 },
      { shape: shapeB, dx: 18, dy: 0, rotate: 0 },
    ];
    const refMarkup = renderComposite(parts, 0, false);
    const correctMarkup = renderComposite(parts, 0, true);
    // A common trap: swapping the two shapes' POSITIONS correctly, but forgetting to
    // also mirror each individual shape — genuinely different from both the correct
    // answer (positions swapped AND each shape mirrored) and the unchanged original.
    const positionsSwappedOnly: CompositePart[] = [
      { shape: shapeA, dx: 18, dy: 0, rotate: 0 },
      { shape: shapeB, dx: -18, dy: 0, rotate: 0 },
    ];
    const distractorMarkups: [string, string, string] = [
      renderComposite(parts, 0, false), // both shapes unchanged
      compositeInner(positionsSwappedOnly), // positions swapped, but neither shape was itself mirrored
      renderComposite(parts, 90, true), // correctly mirrored, but with an extra unwanted rotation
    ];
    const correctIndex = (i + 2) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Both shapes are shown completely unchanged — neither the positions nor the figures were mirrored.", hi: "दोनों आकृतियाँ बिल्कुल अपरिवर्तित दिखाई गई हैं — न तो स्थिति और न ही आकृतियाँ दर्पण-प्रतिबिंबित हुईं।" },
        { en: "The two shapes correctly swapped sides, but neither shape was actually mirrored itself — only half the job was done.", hi: "दोनों आकृतियों ने सही ढंग से तरफ बदली, पर किसी भी आकृति को स्वयं दर्पण-प्रतिबिंबित नहीं किया गया — केवल आधा काम हुआ।" },
        { en: "Correctly mirrored (both shapes swapped sides), but with an extra unwanted rotation added on top.", hi: "सही ढंग से दर्पण-प्रतिबिंबित (दोनों आकृतियों ने तरफ बदली), पर ऊपर से एक अतिरिक्त अवांछित घुमाव भी जोड़ दिया गया है।" },
      ]
    );
    const key = `bank-ma-mirrorimg-twoshape-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "Two figures sit side by side. Which option (A-D) shows their correct combined reflection in a vertical mirror?",
        hi: "दो आकृतियाँ साथ-साथ रखी हैं। कौन-सा विकल्प (A-D) उनका सही संयुक्त प्रतिबिंब ऊर्ध्वाधर दर्पण में दिखाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Mirroring swaps the two shapes' positions AND flips each one — option ${correctOption.toUpperCase()} is the only one that does both correctly.`,
        hi: `दर्पण-प्रतिबिंब दोनों आकृतियों की स्थिति बदल देता है और हर एक को पलट भी देता है — विकल्प ${correctOption.toUpperCase()} ही दोनों काम सही ढंग से करता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (c) ×5: two shapes stacked VERTICALLY — tests that a
// vertical mirror does NOT swap top/bottom, only left/right ──────────────
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
    // The classic trap for a VERTICAL stack: swapping top and bottom, as if this were a horizontal (water) reflection instead of a vertical one.
    const topBottomSwapped: CompositePart[] = [
      { shape: shapeBottom, dx: 0, dy: -20, rotate: 0 },
      { shape: shapeTop, dx: 0, dy: 20, rotate: 0 },
    ];
    const distractorMarkups: [string, string, string] = [
      renderComposite(parts, 0, false), // both shapes unchanged
      `<g transform="scale(-1,1)">${compositeInner(topBottomSwapped)}</g>`, // WRONG: also swapped top/bottom, which a vertical mirror never does
      renderComposite(parts, 90, true), // correct mirror, extra unwanted rotation
    ];
    const correctIndex = (i + 2) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Both figures are shown completely unchanged.", hi: "दोनों आकृतियाँ बिल्कुल अपरिवर्तित दिखाई गई हैं।" },
        { en: "This swaps the TOP and BOTTOM figures — but a vertical mirror only swaps left and right; top and bottom should stay exactly where they are.", hi: "यह ऊपर और नीचे की आकृतियों को आपस में बदल देता है — पर ऊर्ध्वाधर दर्पण केवल बाएँ-दाएँ बदलता है; ऊपर-नीचे अपनी जगह ही रहने चाहिए।" },
        { en: "Correctly mirrored, but with an extra unwanted rotation added on top.", hi: "सही ढंग से दर्पण-प्रतिबिंबित है, पर ऊपर से एक अतिरिक्त अवांछित घुमाव भी जोड़ दिया गया है।" },
      ]
    );
    const key = `bank-ma-mirrorimg-vstack-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "One figure sits above another. Which option (A-D) shows their correct reflection in a vertical mirror?",
        hi: "एक आकृति दूसरी के ऊपर है। कौन-सा विकल्प (A-D) उनका सही प्रतिबिंब ऊर्ध्वाधर दर्पण में दिखाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `A vertical mirror only flips left-right — the top figure stays on top and the bottom stays on the bottom, each individually mirrored. Option ${correctOption.toUpperCase()} is the only one that keeps the top/bottom order unchanged.`,
        hi: `ऊर्ध्वाधर दर्पण केवल बाएँ-दाएँ पलटता है — ऊपर वाली आकृति ऊपर ही रहती है और नीचे वाली नीचे ही, हर एक अलग से प्रतिबिंबित होकर। विकल्प ${correctOption.toUpperCase()} ही ऊपर/नीचे क्रम को अपरिवर्तित रखता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (a) ×5: two-shape composite at an oblique overall rotation ──
function obliqueTwoShapeQuestions(): GeneratedQuestion[] {
  const params: { shapeA: ShapeName; shapeB: ShapeName; angle: number }[] = [
    { shapeA: "flag", shapeB: "triangle", angle: 35 },
    { shapeA: "triangle", shapeB: "ltromino", angle: 55 },
    { shapeA: "ltromino", shapeB: "flag", angle: 40 },
    { shapeA: "flag", shapeB: "ltromino", angle: 65 },
    { shapeA: "triangle", shapeB: "flag", angle: 25 },
  ];
  return params.map(({ shapeA, shapeB, angle }, i) => {
    const parts: CompositePart[] = [
      { shape: shapeA, dx: -18, dy: 0, rotate: 0 },
      { shape: shapeB, dx: 18, dy: 0, rotate: 0 },
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
        { en: "The composite is rotated the opposite way instead of being mirrored.", hi: "संयुक्त आकृति को दर्पण-प्रतिबिंबित करने के बजाय विपरीत दिशा में घुमाया गया है।" },
        { en: "Correctly mirrored, but tilted at the wrong angle.", hi: "सही ढंग से दर्पण-प्रतिबिंबित है, पर गलत कोण पर झुका हुआ है।" },
      ]
    );
    const key = `bank-ma-mirrorimg-obliquetwo-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "This tilted two-figure composite needs to be mirrored as a whole. Which option (A-D) is correct?",
        hi: "इस झुकी हुई दो-आकृति संयुक्त रचना को पूरी तरह दर्पण-प्रतिबिंबित करना है। कौन-सा विकल्प (A-D) सही है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The whole tilted composite must swap left-right while keeping its ${angle}° tilt — option ${correctOption.toUpperCase()} is the only one that does this correctly.`,
        hi: `पूरी झुकी हुई संयुक्त रचना को अपने ${angle}° झुकाव को बनाए रखते हुए बाएँ-दाएँ बदलना है — विकल्प ${correctOption.toUpperCase()} ही यह सही ढंग से करता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (b) ×5: three-shape composite, mirrored ─────────────────
function threeShapeCompositeQuestions(): GeneratedQuestion[] {
  const shapeSets: [ShapeName, ShapeName, ShapeName][] = [
    ["flag", "triangle", "ltromino"],
    ["triangle", "ltromino", "flag"],
    ["ltromino", "flag", "triangle"],
    ["flag", "ltromino", "triangle"],
    ["triangle", "flag", "ltromino"],
  ];
  return shapeSets.map((shapes, i) => {
    const parts: CompositePart[] = [
      { shape: shapes[0], dx: -24, dy: 0, rotate: 0 },
      { shape: shapes[1], dx: 0, dy: 0, rotate: 0 },
      { shape: shapes[2], dx: 24, dy: 0, rotate: 0 },
    ];
    const refMarkup = renderComposite(parts, 0, false);
    const correctMarkup = renderComposite(parts, 0, true);
    const swappedEndsOnly: CompositePart[] = [
      { shape: shapes[2], dx: -24, dy: 0, rotate: 0 }, // end shapes swapped, middle left in place — but no shape itself was mirrored
      { shape: shapes[1], dx: 0, dy: 0, rotate: 0 },
      { shape: shapes[0], dx: 24, dy: 0, rotate: 0 },
    ];
    const distractorMarkups: [string, string, string] = [
      renderComposite(parts, 0, false), // nothing changed
      compositeInner(swappedEndsOnly), // positions swapped, but forgot to mirror each individual shape
      renderComposite(parts, 90, true), // correct mirror, extra unwanted rotation
    ];
    const correctIndex = (i + 3) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "All three figures are shown completely unchanged.", hi: "तीनों आकृतियाँ बिल्कुल अपरिवर्तित दिखाई गई हैं।" },
        { en: "The outer two figures swapped places, but none of the three figures were actually mirrored themselves.", hi: "बाहरी दोनों आकृतियों ने अपनी जगह बदल ली, पर तीनों में से किसी भी आकृति को वास्तव में दर्पण-प्रतिबिंबित नहीं किया गया।" },
        { en: "Correctly mirrored, but with an extra unwanted rotation added on top.", hi: "सही ढंग से दर्पण-प्रतिबिंबित है, पर ऊपर से एक अतिरिक्त अवांछित घुमाव भी जोड़ दिया गया है।" },
      ]
    );
    const key = `bank-ma-mirrorimg-threeshape-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "Three figures sit in a row. Which option (A-D) shows their correct combined reflection in a vertical mirror?",
        hi: "तीन आकृतियाँ एक पंक्ति में रखी हैं। कौन-सा विकल्प (A-D) उनका सही संयुक्त प्रतिबिंब ऊर्ध्वाधर दर्पण में दिखाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Mirroring reverses the ORDER of all three figures (outer ones swap, middle stays in the middle) AND flips each one individually — option ${correctOption.toUpperCase()} is the only one that does both correctly.`,
        hi: `दर्पण-प्रतिबिंब तीनों आकृतियों के क्रम को उलट देता है (बाहरी आपस में बदलती हैं, बीच वाली बीच में रहती है) और हर एक को अलग से भी पलट देता है — विकल्प ${correctOption.toUpperCase()} ही दोनों काम सही ढंग से करता है।`,
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
      renderComposite([{ shape, dx: 0, dy: 0, rotate: angle + 8 }], 0, true), // mirrored, but tilted 8° off from the reference
      renderComposite([{ shape, dx: 0, dy: 0, rotate: angle - 8 }], 0, true), // mirrored, but tilted 8° the other way
      renderComposite(parts, 0, false),
    ];
    const correctIndex = (i + 1) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Correctly mirrored, but tilted a few degrees too far in one direction — a subtle angle mismatch.", hi: "सही ढंग से दर्पण-प्रतिबिंबित है, पर एक दिशा में कुछ डिग्री अधिक झुका है — एक सूक्ष्म कोण बेमेल।" },
        { en: "Correctly mirrored, but tilted a few degrees too far in the other direction — a subtle angle mismatch.", hi: "सही ढंग से दर्पण-प्रतिबिंबित है, पर दूसरी दिशा में कुछ डिग्री अधिक झुका है — एक सूक्ष्म कोण बेमेल।" },
        { en: "This is the figure completely unchanged — no reflection applied at all.", hi: "यह आकृति बिल्कुल अपरिवर्तित है — कोई प्रतिबिंब लागू ही नहीं किया गया।" },
      ]
    );
    const key = `bank-ma-mirrorimg-tightoblique-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, refMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "The 4 options are all mirrored versions at very close angles — look carefully. Which option (A-D) matches the exact tilt of the original?",
        hi: "चारों विकल्प बहुत करीबी कोणों पर दर्पण-प्रतिबिंबित संस्करण हैं — ध्यान से देखें। कौन-सा विकल्प (A-D) मूल आकृति के ठीक झुकाव से मेल खाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The original is tilted at ${angle}° — mirroring keeps that exact tilt, and option ${correctOption.toUpperCase()} is the only one at precisely ${angle}°, not a few degrees off.`,
        hi: `मूल आकृति ${angle}° पर झुकी है — दर्पण-प्रतिबिंब वही झुकाव बनाए रखता है, और विकल्प ${correctOption.toUpperCase()} ही ठीक ${angle}° पर है, कुछ डिग्री इधर-उधर नहीं।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildMirrorImagingQuestions(): GeneratedQuestion[] {
  const all = [
    ...singleShapeQuestions(),
    ...obliqueSingleQuestions(),
    ...twoShapeCompositeQuestions(),
    ...verticalStackQuestions(),
    ...obliqueTwoShapeQuestions(),
    ...threeShapeCompositeQuestions(),
    ...tightObliqueQuestions(),
  ];
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Mirror Imaging pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}
