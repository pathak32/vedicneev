import { labeledCell, shapeMarkup, svgDocument, transformed, type ShapeName } from "./svg-shapes";
import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Figure Series Completion pool (Mental Ability
 * → "figure_series" topic, new): 10 Easy / 15 Moderate / 15 Hard. Visual
 * analogue of number-series.ts: a sequence of figures follows a rule
 * (rotation by a fixed or growing step, shape-count growth, shape-identity
 * cycling), and the 4 options are the SAME base shape(s) differing only by
 * a computed transform/count/identity — never hand-drawn — so correctness
 * is enforced by construction. See figure-matching.ts and svg-shapes.ts
 * for the shared shape/transform primitives and the symmetry caveat on
 * "arrow" (fine for rotation-only questions, which is all this file uses
 * it for).
 */

const OPTION_IDS = ["a", "b", "c", "d"] as const;

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

function buildOptions(): OptionSeed[] {
  return OPTION_IDS.map((id) => ({ id, text: { en: id.toUpperCase(), hi: id.toUpperCase() } }));
}

/** Lays out `terms` sequence cells (unlabeled, just numbered 1..N) followed by a "?" cell, then the 4 lettered option cells below/after — all in one row for simplicity. */
function buildSeriesDiagram(key: string, seriesMarkups: string[], optionMarkups: string[]): { type: "svg"; markup: string } {
  assertDistinctFigures(key, optionMarkups);
  const seriesCells = seriesMarkups.map((m, i) => labeledCell(i * 100, String(i + 1), m));
  const qCell = labeledCell(seriesMarkups.length * 100, "?", "");
  const gap = (seriesMarkups.length + 1) * 100 + 20;
  const optionCells = optionMarkups.map((m, i) => labeledCell(gap + i * 100, OPTION_IDS[i]!.toUpperCase(), m));
  const width = gap + optionMarkups.length * 100;
  return { type: "svg" as const, markup: svgDocument([...seriesCells, qCell, ...optionCells].join(""), width) };
}

/** Renders `count` small copies of `shape` side by side, centered, inside one cell. */
function countMarkup(shape: ShapeName, count: number): string {
  // Cap the total row width so it never overflows the 90px cell even at
  // the highest count any family uses (6, for the "overshoot" distractor)
  // — fixed 22px spacing would put 6 copies ~110px wide, bleeding into the
  // next cell. Spacing shrinks as count grows instead of staying fixed.
  const maxSpan = 64;
  const spacing = count > 1 ? Math.min(22, maxSpan / (count - 1)) : 0;
  const scale = count > 4 ? 0.4 : 0.55;
  const startX = -((count - 1) * spacing) / 2;
  const copies = Array.from({ length: count }, (_, i) => {
    const x = startX + i * spacing;
    return `<g transform="translate(${x},0) scale(${scale})">${shapeMarkup(shape)}</g>`;
  });
  return `<g>${copies.join("")}</g>`;
}

// ── EASY (×10): rotation by a fixed 90°-multiple step each term ──────────
function fixedRightAngleStepQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; start: number; step: 90 | 180 | 270 }[] = [
    { shape: "arrow", start: 0, step: 90 }, { shape: "arrow", start: 90, step: 90 },
    { shape: "flag", start: 0, step: 90 }, { shape: "flag", start: 180, step: 90 },
    { shape: "triangle", start: 0, step: 90 }, { shape: "triangle", start: 90, step: 90 },
    { shape: "ltromino", start: 0, step: 90 }, { shape: "ltromino", start: 90, step: 90 },
    { shape: "arrow", start: 0, step: 180 }, { shape: "flag", start: 0, step: 180 },
  ];
  return params.map(({ shape, start, step }, i) => {
    const terms = [0, 1, 2, 3].map((k) => (start + k * step) % 360);
    const correctAngle = (start + 4 * step) % 360;
    const seriesMarkups = terms.map((a) => transformed(shape, a, false));
    const lastTerm = terms[3]!;
    const distractorAngles = [lastTerm, terms[2]!, (correctAngle + step) % 360].filter((a, idx, arr) => arr.indexOf(a) === idx && a !== correctAngle);
    for (let attempt = 0; distractorAngles.length < 3 && attempt < 20; attempt++) {
      const candidate = (correctAngle + 45 * (attempt + 2)) % 360;
      if (candidate !== correctAngle && !distractorAngles.includes(candidate)) distractorAngles.push(candidate);
    }
    if (distractorAngles.length < 3) throw new Error(`figure-series rightangle ${i}: could not find 3 distinct distractor angles.`);
    const correctMarkup = transformed(shape, correctAngle, false);
    const distractorMarkups = distractorAngles.slice(0, 3).map((a) => transformed(shape, a, false)) as [string, string, string];
    const correctIndex = i % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Simply repeats the last shown term instead of advancing the rotation by one more step.", hi: "घुमाव को एक और कदम आगे बढ़ाने के बजाय अंतिम दिखाए गए पद को ही दोहरा देता है।" },
        { en: "Repeats an earlier term in the sequence instead of the correct next one.", hi: "सही अगले पद के बजाय श्रृंखला के एक पुराने पद को दोहरा देता है।" },
        { en: `Overshoots by rotating one extra ${step}° step beyond the correct answer.`, hi: `सही उत्तर से एक अतिरिक्त ${step}° कदम आगे घुमा देता है।` },
      ]
    );
    const key = `bank-ma-figseries-rightangle-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildSeriesDiagram(key, seriesMarkups, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY",
      content: {
        en: `The figure rotates by ${step}° clockwise at each step in the series. Which option (A-D) comes next?`,
        hi: `श्रृंखला में प्रत्येक चरण पर आकृति ${step}° दक्षिणावर्त घूमती है। कौन-सा विकल्प (A-D) आगे आएगा?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Each term adds ${step}° to the last (clockwise): the next term is ${lastTerm}° + ${step}° = ${correctAngle}° (mod 360°), shown in option ${correctOption.toUpperCase()}.`,
        hi: `प्रत्येक पद पिछले में ${step}° जोड़ता है (दक्षिणावर्त): अगला पद ${lastTerm}° + ${step}° = ${correctAngle}° (mod 360°) है, जो विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (a) ×5: rotation by a fixed non-right-angle step ───────
function fixedObliqueStepQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; start: number; step: 30 | 45 | 60 | 72 | 40 }[] = [
    { shape: "arrow", start: 0, step: 30 },
    { shape: "flag", start: 0, step: 45 },
    { shape: "triangle", start: 0, step: 60 },
    { shape: "ltromino", start: 0, step: 72 },
    { shape: "arrow", start: 10, step: 40 },
  ];
  return params.map(({ shape, start, step }, i) => {
    const terms = [0, 1, 2, 3].map((k) => (start + k * step) % 360);
    const correctAngle = (start + 4 * step) % 360;
    const seriesMarkups = terms.map((a) => transformed(shape, a, false));
    const lastTerm = terms[3]!;
    const distractorAngles = [lastTerm, terms[2]!, (correctAngle + step) % 360].filter((a, idx, arr) => arr.indexOf(a) === idx && a !== correctAngle);
    for (let attempt = 0; distractorAngles.length < 3 && attempt < 20; attempt++) {
      const candidate = (correctAngle + 17 * (attempt + 2)) % 360;
      if (candidate !== correctAngle && !distractorAngles.includes(candidate)) distractorAngles.push(candidate);
    }
    if (distractorAngles.length < 3) throw new Error(`figure-series oblique ${i}: could not find 3 distinct distractor angles.`);
    const correctMarkup = transformed(shape, correctAngle, false);
    const distractorMarkups = distractorAngles.slice(0, 3).map((a) => transformed(shape, a, false)) as [string, string, string];
    const correctIndex = (i + 1) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Simply repeats the last shown term instead of advancing by one more step.", hi: "एक और कदम आगे बढ़ाने के बजाय अंतिम दिखाए गए पद को ही दोहरा देता है।" },
        { en: "Repeats an earlier term in the sequence instead of the correct next one.", hi: "सही अगले पद के बजाय श्रृंखला के एक पुराने पद को दोहरा देता है।" },
        { en: `Overshoots by rotating one extra ${step}° step beyond the correct answer.`, hi: `सही उत्तर से एक अतिरिक्त ${step}° कदम आगे घुमा देता है।` },
      ]
    );
    const key = `bank-ma-figseries-oblique-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildSeriesDiagram(key, seriesMarkups, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `The figure rotates by ${step}° clockwise at each step in the series. Which option (A-D) comes next?`,
        hi: `श्रृंखला में प्रत्येक चरण पर आकृति ${step}° दक्षिणावर्त घूमती है। कौन-सा विकल्प (A-D) आगे आएगा?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Each term adds ${step}° to the last: the next term is ${lastTerm}° + ${step}° = ${correctAngle}° (mod 360°), shown in option ${correctOption.toUpperCase()}.`,
        hi: `प्रत्येक पद पिछले में ${step}° जोड़ता है: अगला पद ${lastTerm}° + ${step}° = ${correctAngle}° (mod 360°) है, जो विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (b) ×5: growing count of copies of a shape ────────────
function growingCountQuestions(): GeneratedQuestion[] {
  const shapes: ShapeName[] = ["arrow", "flag", "triangle", "ltromino", "arrow"];
  return shapes.map((shape, i) => {
    const counts = [1, 2, 3, 4];
    const correctCount = 5;
    const seriesMarkups = counts.map((c) => countMarkup(shape, c));
    const correctMarkup = countMarkup(shape, correctCount);
    const distractorMarkups = [4, 3, 6].map((c) => countMarkup(shape, c)) as [string, string, string];
    const correctIndex = (i + 2) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Repeats the last shown count (4) instead of increasing it by one more.", hi: "एक और नहीं बढ़ाते हुए अंतिम दिखाई गई संख्या (4) को ही दोहरा देता है।" },
        { en: "Repeats an earlier count (3) from the sequence.", hi: "श्रृंखला की एक पुरानी संख्या (3) को दोहरा देता है।" },
        { en: "Overshoots by jumping straight to 6, skipping past 5.", hi: "5 को छोड़कर सीधे 6 पर पहुँच जाता है।" },
      ]
    );
    const key = `bank-ma-figseries-count-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildSeriesDiagram(key, seriesMarkups, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "The number of figures increases by 1 at each step. Which option (A-D) comes next?",
        hi: "प्रत्येक चरण पर आकृतियों की संख्या 1 से बढ़ती है। कौन-सा विकल्प (A-D) आगे आएगा?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The count goes 1, 2, 3, 4, so the next term has 5 copies — shown in option ${correctOption.toUpperCase()}.`,
        hi: `संख्या 1, 2, 3, 4 के क्रम में बढ़ती है, इसलिए अगले पद में 5 प्रतियाँ होंगी — जो विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (c) ×5: alternating two shapes, fixed rotation (period 2) ─
function alternatingTwoShapesQuestions(): GeneratedQuestion[] {
  const params: { shapeA: ShapeName; shapeB: ShapeName }[] = [
    { shapeA: "arrow", shapeB: "flag" },
    { shapeA: "triangle", shapeB: "ltromino" },
    { shapeA: "flag", shapeB: "arrow" },
    { shapeA: "ltromino", shapeB: "triangle" },
    { shapeA: "arrow", shapeB: "triangle" },
  ];
  return params.map(({ shapeA, shapeB }, i) => {
    const sequenceShapes: ShapeName[] = [shapeA, shapeB, shapeA, shapeB];
    const correctShape = shapeA; // position 5 continues the A,B,A,B,... pattern
    const seriesMarkups = sequenceShapes.map((s) => transformed(s, 0, false));
    const correctMarkup = transformed(correctShape, 0, false);
    // Distractors: repeat-second-figure, first-figure-mirrored, second-figure-mirrored — the mirrors keep options visually distinct even when a shape name repeats.
    const distractorMarkups: [string, string, string] = [
      transformed(shapeB, 0, false),
      transformed(shapeA, 0, true),
      transformed(shapeB, 0, true),
    ];
    const correctIndex = (i + 3) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Repeats the second figure again instead of switching back to the first — fails to alternate.", hi: "पहली आकृति पर वापस जाने के बजाय दूसरी आकृति को फिर दोहरा देता है — बदलाव करने में विफल रहता है।" },
        { en: "Shows the first figure but mirrored — the pattern only alternates WHICH figure appears, not its orientation.", hi: "पहली आकृति तो दिखाता है पर उसे दर्पण-प्रतिबिंबित कर देता है — पैटर्न केवल यह बदलता है कि कौन-सी आकृति आती है, उसकी दिशा नहीं।" },
        { en: "Shows the second figure mirrored — both the wrong figure and an extra transformation not present anywhere in the series.", hi: "दूसरी आकृति को दर्पण-प्रतिबिंबित करके दिखाता है — यह गलत आकृति भी है और एक अतिरिक्त परिवर्तन भी, जो श्रृंखला में कहीं नहीं था।" },
      ]
    );
    const key = `bank-ma-figseries-alternate2-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildSeriesDiagram(key, seriesMarkups, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "The series alternates between two figures. Which option (A-D) comes next?",
        hi: "यह श्रृंखला दो आकृतियों के बीच बदलती रहती है। कौन-सा विकल्प (A-D) आगे आएगा?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The pattern alternates first-figure, second-figure, first-figure, second-figure, ...; the 5th term returns to the first figure, shown in option ${correctOption.toUpperCase()}.`,
        hi: `पैटर्न पहली-आकृति, दूसरी-आकृति, पहली-आकृति, दूसरी-आकृति ... के क्रम में बदलता है; 5वाँ पद फिर से पहली आकृति पर लौटता है, जो विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (d) ×5: rotation step itself growing by a constant ──────
function growingStepRotationQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; d0: number; e: number }[] = [
    { shape: "arrow", d0: 15, e: 15 },
    { shape: "flag", d0: 10, e: 10 },
    { shape: "triangle", d0: 20, e: 10 },
    { shape: "ltromino", d0: 10, e: 20 },
    { shape: "arrow", d0: 5, e: 15 },
  ];
  return params.map(({ shape, d0, e }, i) => {
    const diffs = [0, 1, 2, 3, 4].map((k) => d0 + k * e); // d1..d5
    const terms: number[] = [0];
    for (let k = 0; k < 4; k++) terms.push((terms[k]! + diffs[k]!) % 360);
    const lastTerm = terms[4]!;
    const d4 = diffs[3]!; // last used difference (between term4 and term5... wait terms has 5 entries now)
    const d5 = diffs[4]!;
    const correctAngle = (lastTerm + d5) % 360;
    const seriesMarkups = terms.map((a) => transformed(shape, a, false));
    const distractor1 = (lastTerm + d4) % 360; // reused last difference instead of advancing it
    const distractor2 = (lastTerm + d5 + e) % 360; // advanced the difference one step too far
    const distractor3 = (terms[3]! + d5) % 360; // applied to the wrong (earlier) term
    const distractors = [distractor1, distractor2, distractor3].filter((a, idx, arr) => arr.indexOf(a) === idx && a !== correctAngle);
    for (let attempt = 0; distractors.length < 3 && attempt < 20; attempt++) {
      const candidate = (correctAngle + 11 * (attempt + 2)) % 360;
      if (candidate !== correctAngle && !distractors.includes(candidate)) distractors.push(candidate);
    }
    if (distractors.length < 3) throw new Error(`figure-series growstep ${i}: could not find 3 distinct distractor angles.`);
    const correctMarkup = transformed(shape, correctAngle, false);
    const distractorMarkups = distractors.slice(0, 3).map((a) => transformed(shape, a, false)) as [string, string, string];
    const correctIndex = i % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: `Reuses the last step size (${d4}°) unchanged, missing that the step itself is growing by ${e}° each time.`, hi: `अंतिम चरण आकार (${d4}°) को अपरिवर्तित पुनः उपयोग करता है, यह चूक जाता है कि चरण स्वयं ${e}° से बढ़ रहा है।` },
        { en: "Advances the growing step one increment too far.", hi: "बढ़ते हुए चरण को एक वृद्धि अधिक आगे बढ़ा देता है।" },
        { en: "Applies the correct next step to the wrong (earlier) term in the sequence.", hi: "सही अगले चरण को श्रृंखला के गलत (पहले वाले) पद पर लागू कर देता है।" },
      ]
    );
    const key = `bank-ma-figseries-growstep-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildSeriesDiagram(key, seriesMarkups, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "The amount of rotation between each step grows by a fixed extra amount every time. Which option (A-D) comes next?",
        hi: "प्रत्येक चरण के बीच घुमाव की मात्रा हर बार एक निश्चित अतिरिक्त मात्रा से बढ़ती है। कौन-सा विकल्प (A-D) आगे आएगा?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The rotation step itself increases by ${e}° each time (${diffs.slice(0, 4).join("°, ")}°, ...), so the next step is ${d5}°: ${lastTerm}° + ${d5}° = ${correctAngle}° (mod 360°), shown in option ${correctOption.toUpperCase()}.`,
        hi: `घुमाव का चरण स्वयं हर बार ${e}° से बढ़ता है (${diffs.slice(0, 4).join("°, ")}°, ...), इसलिए अगला चरण ${d5}° है: ${lastTerm}° + ${d5}° = ${correctAngle}° (mod 360°), जो विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (e) ×5: two shapes alternating, each rotating independently ─
function alternatingRotatingQuestions(): GeneratedQuestion[] {
  const params: { shapeA: ShapeName; shapeB: ShapeName; stepA: number; stepB: number }[] = [
    { shapeA: "arrow", shapeB: "flag", stepA: 90, stepB: 90 },
    { shapeA: "triangle", shapeB: "ltromino", stepA: 45, stepB: 90 },
    { shapeA: "flag", shapeB: "arrow", stepA: 60, stepB: 30 },
    { shapeA: "ltromino", shapeB: "triangle", stepA: 90, stepB: 45 },
    { shapeA: "arrow", shapeB: "triangle", stepA: 30, stepB: 60 },
  ];
  return params.map(({ shapeA, shapeB, stepA, stepB }, i) => {
    // Positions 1,3,5,... are shapeA at angles 0, stepA, 2*stepA...; positions 2,4,... are shapeB at 0, stepB, 2*stepB...
    const aAngles = [0, stepA, 2 * stepA].map((a) => a % 360); // used at series positions 1,3,5
    const bAngles = [0, stepB].map((a) => a % 360); // used at series positions 2,4
    const seriesMarkups = [
      transformed(shapeA, aAngles[0]!, false),
      transformed(shapeB, bAngles[0]!, false),
      transformed(shapeA, aAngles[1]!, false),
      transformed(shapeB, bAngles[1]!, false),
    ];
    const correctAngle = aAngles[2]!; // position 5 continues shapeA's own progression
    const seriesLastAAngle = aAngles[1]!;
    const distractorAngles = [seriesLastAAngle, (bAngles[1]! + stepB) % 360, (correctAngle + stepA) % 360].filter(
      (a, idx, arr) => arr.indexOf(a) === idx && a !== correctAngle
    );
    for (let attempt = 0; distractorAngles.length < 3 && attempt < 20; attempt++) {
      const candidate = (correctAngle + 23 * (attempt + 2)) % 360;
      if (candidate !== correctAngle && !distractorAngles.includes(candidate)) distractorAngles.push(candidate);
    }
    if (distractorAngles.length < 2) throw new Error(`figure-series altrotate ${i}: could not find enough distinct distractor angles.`);
    const correctMarkup = transformed(shapeA, correctAngle, false);
    // 3rd distractor: correct angle but WRONG shape (shapeB) — a shape-identity trap, guaranteed visually distinct.
    const distractorMarkups = [
      transformed(shapeA, distractorAngles[0]!, false),
      transformed(shapeA, distractorAngles[1]!, false),
      transformed(shapeB, correctAngle, false),
    ] as [string, string, string];
    const correctIndex = (i + 1) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Repeats the first figure's most recent angle instead of advancing it by one more step.", hi: "पहली आकृति के कोण को एक और कदम आगे बढ़ाने के बजाय उसके सबसे हाल के कोण को दोहरा देता है।" },
        { en: "Confuses the two figures' separate rotation rates, applying the second figure's step progression to the first.", hi: "दोनों आकृतियों की अलग-अलग घुमाव दरों को भ्रमित कर देता है, दूसरी आकृति की चरण प्रगति को पहली पर लागू कर देता है।" },
        { en: "Uses the correct rotation angle but shows the WRONG figure — the second one instead of the first.", hi: "सही घुमाव कोण का उपयोग करता है लेकिन गलत आकृति दिखाता है — पहली के बजाय दूसरी।" },
      ]
    );
    const key = `bank-ma-figseries-altrotate-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildSeriesDiagram(key, seriesMarkups, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "Two figures alternate in the series, and each one rotates a little more clockwise every time it reappears. Which option (A-D) comes next?",
        hi: "श्रृंखला में दो आकृतियाँ बारी-बारी से आती हैं, और हर बार दोबारा आने पर प्रत्येक थोड़ा और दक्षिणावर्त घूम जाती है। कौन-सा विकल्प (A-D) आगे आएगा?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The first figure appears at positions 1, 3, 5, ... rotating by ${stepA}° more each time; the 5th term continues that at ${correctAngle}° (mod 360°), shown in option ${correctOption.toUpperCase()}.`,
        hi: `पहली आकृति स्थिति 1, 3, 5, ... पर आती है और हर बार ${stepA}° अधिक घूमती है; 5वाँ पद उसी क्रम में ${correctAngle}° (mod 360°) पर होगा, जो विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (f) ×5: period-3 shape cycle, fixed rotation ────────────
function periodThreeCycleQuestions(): GeneratedQuestion[] {
  const params: { cycle: [ShapeName, ShapeName, ShapeName] }[] = [
    { cycle: ["arrow", "flag", "triangle"] },
    { cycle: ["flag", "ltromino", "arrow"] },
    { cycle: ["triangle", "arrow", "flag"] },
    { cycle: ["ltromino", "triangle", "flag"] },
    { cycle: ["arrow", "triangle", "ltromino"] },
  ];
  return params.map(({ cycle }, i) => {
    const seriesShapes: ShapeName[] = [cycle[0]!, cycle[1]!, cycle[2]!, cycle[0]!];
    const correctShape = cycle[1]!; // position 5 = index 4 (0-based) -> 4 % 3 = 1 -> cycle[1]
    const seriesMarkups = seriesShapes.map((s) => transformed(s, 0, false));
    const correctMarkup = transformed(correctShape, 0, false);
    // Last distractor mirrors the correct shape's identity so it's still visually distinct despite reusing the same base shape.
    const distractorMarkups: [string, string, string] = [
      transformed(cycle[0]!, 0, false),
      transformed(cycle[2]!, 0, false),
      transformed(correctShape, 0, true),
    ];
    const correctIndex = (i + 2) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Shows the cycle's 1st figure instead of correctly continuing to its 2nd figure.", hi: "चक्र की दूसरी आकृति पर सही ढंग से बढ़ने के बजाय पहली आकृति दिखाता है।" },
        { en: "Shows the cycle's 3rd figure — one step too far ahead in the cycle.", hi: "चक्र की तीसरी आकृति दिखाता है — चक्र में एक कदम बहुत आगे।" },
        { en: "Shows the correct figure from the cycle, but mirrored — the cycle only repeats WHICH figure appears, not a reflected version of it.", hi: "चक्र की सही आकृति दिखाता है, पर दर्पण-प्रतिबिंबित रूप में — चक्र केवल यह दोहराता है कि कौन-सी आकृति आती है, उसका प्रतिबिंबित रूप नहीं।" },
      ]
    );
    const key = `bank-ma-figseries-period3-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildSeriesDiagram(key, seriesMarkups, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "The series cycles through three different figures, repeating the same order. Which option (A-D) comes next?",
        hi: "यह श्रृंखला तीन अलग-अलग आकृतियों के बीच चक्रित होती है, उसी क्रम को दोहराते हुए। कौन-सा विकल्प (A-D) आगे आएगा?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The three figures repeat in a fixed cycle (1st, 2nd, 3rd, 1st, 2nd, ...); the 5th term is the cycle's 2nd figure, shown in option ${correctOption.toUpperCase()}.`,
        hi: `तीनों आकृतियाँ एक निश्चित चक्र में दोहराई जाती हैं (पहली, दूसरी, तीसरी, पहली, दूसरी, ...); 5वाँ पद चक्र की दूसरी आकृति है, जो विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildFigureSeriesQuestions(): GeneratedQuestion[] {
  const all = [
    ...fixedRightAngleStepQuestions(),
    ...fixedObliqueStepQuestions(),
    ...growingCountQuestions(),
    ...alternatingTwoShapesQuestions(),
    ...growingStepRotationQuestions(),
    ...alternatingRotatingQuestions(),
    ...periodThreeCycleQuestions(),
  ];
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Figure Series pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}
