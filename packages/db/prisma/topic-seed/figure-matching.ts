import { labeledCell, shapeMarkup, svgDocument, transformed, type ShapeName } from "./svg-shapes";
import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * assertDistinctOptions only ever sees the "A"/"B"/"C"/"D" text labels for
 * these visual questions, which are trivially always distinct — it can
 * never catch two options that render the SAME figure. This checks the
 * thing that actually matters: the raw SVG markup for each option's shape
 * must be pairwise distinct, or the question is broken regardless of what
 * the labels say.
 */
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

/**
 * Generates the 40-question Figure Matching pool (Mental Ability →
 * "figure_matching" topic, new): 10 Easy / 15 Moderate / 15 Hard. Every
 * question shows a reference figure and a stated transformation in text;
 * the 4 lettered options are the SAME base shape (guaranteeing they're
 * only ever different by the transform actually applied, never a subtly
 * different shape unless the family specifically tests for that), rendered
 * as one inline-SVG `figureMetadata` diagram. All shapes are chosen to
 * have no rotational/reflective symmetry (see svg-shapes.ts) so every
 * distinct transform genuinely looks different — this is what makes
 * correctness verifiable by construction rather than by eye.
 */

const OPTION_IDS = ["a", "b", "c", "d"] as const;

function label(en: string, hi: string): LangText {
  return { en, hi };
}

/** Builds the figureMetadata diagram: a reference cell, then 4 lettered option cells, each showing `shape` at the given transform. Throws if any two option cells would render identically. */
function buildDiagram(key: string, shape: ShapeName, refRotate: number, refMirror: boolean, cellRotations: [number, boolean][]): { type: "svg"; markup: string } {
  const cellMarkups = cellRotations.map(([rot, mirror]) => transformed(shape, rot, mirror));
  assertDistinctFigures(key, cellMarkups);
  const refCell = labeledCell(0, "Ref", transformed(shape, refRotate, refMirror));
  const optionCells = cellMarkups.map((markup, i) => labeledCell(110 + i * 110, OPTION_IDS[i]!.toUpperCase(), markup));
  const width = 110 + cellRotations.length * 110;
  return { type: "svg" as const, markup: svgDocument([refCell, ...optionCells].join(""), width) };
}

function buildDiagramMixedShapes(key: string, refShape: ShapeName, refRotate: number, cells: [ShapeName, number, boolean][]): { type: "svg"; markup: string } {
  const cellMarkups = cells.map(([shape, rot, mirror]) => transformed(shape, rot, mirror));
  assertDistinctFigures(key, cellMarkups);
  const refCell = labeledCell(0, "Ref", transformed(refShape, refRotate, false));
  const optionCells = cellMarkups.map((markup, i) => labeledCell(110 + i * 110, OPTION_IDS[i]!.toUpperCase(), markup));
  const width = 110 + cells.length * 110;
  return { type: "svg" as const, markup: svgDocument([refCell, ...optionCells].join(""), width) };
}

function correctIdFromIndex(index: number): string {
  return OPTION_IDS[index]!;
}

function buildOptions(): OptionSeed[] {
  return OPTION_IDS.map((id) => ({ id, text: label(id.toUpperCase(), id.toUpperCase()) }));
}

// ── EASY (×10): identify a single 90°-multiple rotation ──────────────────
function rightAngleRotationQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; target: 90 | 180 | 270 }[] = [
    { shape: "arrow", target: 90 }, { shape: "arrow", target: 180 }, { shape: "arrow", target: 270 },
    { shape: "flag", target: 90 }, { shape: "flag", target: 180 }, { shape: "flag", target: 270 },
    { shape: "triangle", target: 90 }, { shape: "triangle", target: 180 },
    { shape: "ltromino", target: 90 }, { shape: "ltromino", target: 270 },
  ];
  return params.map(({ shape, target }, i) => {
    const angles = [0, 90, 180, 270];
    const correctIndex = angles.indexOf(target);
    const cells: [number, boolean][] = angles.map((a) => [a, false]);
    const key = `bank-ma-figmatch-easy-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, shape, 0, false, cells);
    const options = buildOptions();
    assertDistinctOptions(key, options); // labels only — real distinctness is checked in buildDiagram via assertDistinctFigures
    return {
      key,
      difficulty: "EASY",
      content: {
        en: `The reference figure is rotated ${target}° clockwise. Which option (A-D) shows the correct result?`,
        hi: `संदर्भ आकृति को ${target}° दक्षिणावर्त घुमाया गया है। कौन-सा विकल्प (A-D) सही परिणाम दिखाता है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption: correctIdFromIndex(correctIndex),
      figureMetadata: diagram,
      explanation: {
        en: `Rotating the reference by ${target}° clockwise gives the figure shown in option ${correctIdFromIndex(correctIndex).toUpperCase()}.`,
        hi: `संदर्भ को ${target}° दक्षिणावर्त घुमाने पर विकल्प ${correctIdFromIndex(correctIndex).toUpperCase()} में दिखाई गई आकृति प्राप्त होती है।`,
      },
      distractorAnalysis: Object.fromEntries(
        angles
          .map((a, idx) => [idx, a])
          .filter(([idx]) => idx !== correctIndex)
          .map(([idx, a]) => [
            correctIdFromIndex(idx as number),
            a === 0
              ? { en: "Shows the reference completely unrotated — the figure was not turned at all.", hi: "संदर्भ को बिल्कुल भी नहीं घुमाया गया है — यह अपरिवर्तित आकृति दिखाता है।" }
              : { en: `Rotated by ${a}° instead of the instructed ${target}°.`, hi: `निर्देशित ${target}° के बजाय ${a}° घुमाया गया है।` },
          ])
      ),
    };
  });
}

// ── MEDIUM family (a) ×5: mirror vs rotation vs original ────────────────
// "arrow" is excluded here: it has one line of symmetry along its own shaft,
// and at a 90° rotation (used by the "rotate90"/"mirror+rotate90" option
// cells below) a vertical mirror leaves it pixel-identical to the unmirrored
// figure — verified by comparing rotated point sets directly, not by eye.
// flag/triangle/ltromino have no symmetry axis at all, so they're safe for
// any rotation+mirror combination.
function mirrorRecognitionQuestions(): GeneratedQuestion[] {
  const shapes: ShapeName[] = ["flag", "triangle", "ltromino", "flag", "triangle"];
  return shapes.map((shape, i) => {
    // [correct: mirror only] vs distractors [original, rotate90(no mirror), mirror+rotate90]
    const correctCell: [number, boolean] = [0, true];
    const distractorCells: [[number, boolean], [number, boolean], [number, boolean]] = [
      [0, false],
      [90, false],
      [90, true],
    ];
    const correctIndex = i % 4;
    const { contents: cells, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctCell,
      distractorCells,
      [
        { en: "Shows the reference completely unchanged — it was not mirrored at all.", hi: "संदर्भ को बिल्कुल भी नहीं बदला गया है — इसे दर्पण-प्रतिबिंबित नहीं किया गया।" },
        { en: "Shows the reference rotated by 90° instead of mirrored — a rotation, not a reflection.", hi: "संदर्भ को दर्पण-प्रतिबिंबित करने के बजाय 90° घुमाया गया है — यह एक घुमाव है, प्रतिबिंब नहीं।" },
        { en: "Combines a mirror with an extra 90° rotation, which is more than what was instructed.", hi: "दर्पण-प्रतिबिंब के साथ एक अतिरिक्त 90° घुमाव भी जोड़ दिया गया है, जो निर्देश से अधिक है।" },
      ]
    );
    const key = `bank-ma-figmatch-mirror-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, shape, 0, false, cells);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `Which option shows the reference figure mirrored (flipped left-to-right), with no rotation?`,
        hi: `कौन-सा विकल्प संदर्भ आकृति को दर्पण-प्रतिबिंबित (बाएँ-दाएँ पलटा हुआ) दिखाता है, बिना किसी घुमाव के?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `A plain horizontal mirror flip, with no rotation applied, is shown in option ${correctOption.toUpperCase()}.`,
        hi: `बिना किसी घुमाव के केवल एक क्षैतिज दर्पण-पलट विकल्प ${correctOption.toUpperCase()} में दिखाई गई है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (b) ×5: non-right-angle single rotation ────────────────
function obliqueRotationQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; target: 45 | 135 | 225 | 315 }[] = [
    { shape: "arrow", target: 45 }, { shape: "arrow", target: 135 }, { shape: "flag", target: 225 },
    { shape: "flag", target: 315 }, { shape: "triangle", target: 45 },
  ];
  return params.map(({ shape, target }, i) => {
    const angles = [45, 135, 225, 315];
    const correctIndex = angles.indexOf(target);
    const cells: [number, boolean][] = angles.map((a) => [a, false]);
    const key = `bank-ma-figmatch-oblique-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, shape, 0, false, cells);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `The reference figure is rotated ${target}° clockwise. Which option (A-D) shows the correct result?`,
        hi: `संदर्भ आकृति को ${target}° दक्षिणावर्त घुमाया गया है। कौन-सा विकल्प (A-D) सही परिणाम दिखाता है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption: correctIdFromIndex(correctIndex),
      figureMetadata: diagram,
      explanation: {
        en: `Rotating the reference by ${target}° clockwise gives the figure shown in option ${correctIdFromIndex(correctIndex).toUpperCase()}.`,
        hi: `संदर्भ को ${target}° दक्षिणावर्त घुमाने पर विकल्प ${correctIdFromIndex(correctIndex).toUpperCase()} में दिखाई गई आकृति प्राप्त होती है।`,
      },
      distractorAnalysis: Object.fromEntries(
        angles
          .map((a, idx) => [idx, a])
          .filter(([idx]) => idx !== correctIndex)
          .map(([idx, a]) => [correctIdFromIndex(idx as number), { en: `Rotated by ${a}° instead of the instructed ${target}°.`, hi: `निर्देशित ${target}° के बजाय ${a}° घुमाया गया है।` }])
      ),
    };
  });
}

// ── MEDIUM family (c) ×5: sum of two same-direction sequential rotations ─
function twoStepSameDirectionQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; step1: number; step2: number }[] = [
    { shape: "arrow", step1: 90, step2: 90 },
    { shape: "flag", step1: 45, step2: 90 },
    { shape: "triangle", step1: 90, step2: 180 },
    { shape: "ltromino", step1: 45, step2: 45 },
    { shape: "arrow", step1: 60, step2: 30 },
  ];
  return params.map(({ shape, step1, step2 }, i) => {
    const net = (step1 + step2) % 360;
    const distractorValues = [step1, step2, (net + 90) % 360].filter((v, idx, arr) => arr.indexOf(v) === idx && v !== net);
    // Ensure exactly 3 distinct distractor values (pad with a safe extra if a collision reduced the set).
    // `attempt` (not distractorValues.length) drives the candidate so a
    // rejected candidate is never recomputed identically forever — with a
    // fixed step size and a fixed length, `candidate` would otherwise be
    // the exact same rejected value on every loop iteration.
    for (let attempt = 0; distractorValues.length < 3 && attempt < 20; attempt++) {
      const candidate = (net + 45 * (attempt + 2)) % 360;
      if (candidate !== net && !distractorValues.includes(candidate)) distractorValues.push(candidate);
    }
    if (distractorValues.length < 3) throw new Error(`figure-matching twostep ${i}: could not find 3 distinct distractor angles.`);
    const correctCell: [number, boolean] = [net, false];
    const distractorCells = distractorValues.slice(0, 3).map((a) => [a, false] as [number, boolean]) as [
      [number, boolean],
      [number, boolean],
      [number, boolean]
    ];
    const correctIndex = (i + 1) % 4;
    const { contents: cells, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctCell,
      distractorCells,
      [
        { en: `Shows only the first rotation step (${step1}°), stopping before the second rotation.`, hi: `केवल पहला घुमाव चरण (${step1}°) दिखाता है, दूसरे घुमाव से पहले ही रुक गया।` },
        { en: `Shows only the second rotation step (${step2}°), as if the first rotation never happened.`, hi: `केवल दूसरा घुमाव चरण (${step2}°) दिखाता है, जैसे पहला घुमाव हुआ ही न हो।` },
        { en: "Adds the two steps incorrectly, landing on the wrong total angle.", hi: "दोनों चरणों को गलत तरीके से जोड़ता है, जिससे गलत कुल कोण प्राप्त होता है।" },
      ]
    );
    const key = `bank-ma-figmatch-twostep-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, shape, 0, false, cells);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `The reference figure is first rotated ${step1}° clockwise, then rotated another ${step2}° clockwise. Which option (A-D) shows the final result?`,
        hi: `संदर्भ आकृति को पहले ${step1}° दक्षिणावर्त घुमाया जाता है, फिर एक बार और ${step2}° दक्षिणावर्त घुमाया जाता है। कौन-सा विकल्प (A-D) अंतिम परिणाम दिखाता है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The two rotations add together: ${step1}° + ${step2}° = ${net}°, shown in option ${correctOption.toUpperCase()}.`,
        hi: `दोनों घुमाव जुड़ जाते हैं: ${step1}° + ${step2}° = ${net}°, जो विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (d) ×5: horizontal vs vertical axis reflection vs 180° rotation ─
function axisReflectionQuestions(): GeneratedQuestion[] {
  // "arrow" is deliberately excluded here: it's symmetric about its own
  // horizontal axis (reflecting it top-to-bottom renders pixel-identical to
  // the unrotated original — verified by comparing raw point sets, not by
  // eye), which would make the "correct" horizontal-flip option and the
  // "unchanged original" distractor indistinguishable. Every other family
  // in this file is unaffected — arrow only has this one blind spot.
  const shapes: ShapeName[] = ["flag", "triangle", "ltromino", "flag", "triangle"];
  return shapes.map((shape, i) => {
    const refCell = labeledCell(0, "Ref", transformed(shape, 0, false));
    // horizontal-axis flip (upside down) = rotate(180) + mirror = equivalent to scale(1,-1). We build it as rotate(180) then mirror-x, i.e. combined visual via nested transform.
    const horizontalFlipMarkup = `<g transform="scale(1,-1)">${shapeMarkup(shape)}</g>`;
    const verticalFlipMarkup = `<g transform="scale(-1,1)">${shapeMarkup(shape)}</g>`;
    const rotate180Markup = transformed(shape, 180, false);
    const originalMarkup = transformed(shape, 0, false);
    const distractorContents: [string, string, string] = [verticalFlipMarkup, rotate180Markup, originalMarkup];
    const correctIndex = (i + 2) % 4;
    const { contents: cellContents, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      horizontalFlipMarkup,
      distractorContents,
      [
        { en: "Reflects across the VERTICAL axis instead (left-right flip) — a different axis than the one instructed.", hi: "इसके बजाय ऊर्ध्वाधर अक्ष के आर-पार परावर्तित करता है (बाएँ-दाएँ पलट) — यह निर्देशित अक्ष से अलग है।" },
        { en: "Rotates the figure 180° instead of reflecting it — for an asymmetric figure this looks different from either single-axis reflection.", hi: "आकृति को परावर्तित करने के बजाय 180° घुमाता है — असममित आकृति के लिए यह किसी भी एक-अक्ष परावर्तन से भिन्न दिखता है।" },
        { en: "Shows the reference completely unchanged — no reflection was applied at all.", hi: "संदर्भ को बिल्कुल भी नहीं बदला गया है — कोई परावर्तन लागू ही नहीं किया गया।" },
      ]
    );
    const key = `bank-ma-figmatch-axisflip-${String(i + 1).padStart(2, "0")}`;
    assertDistinctFigures(key, cellContents);
    const cells = cellContents.map((content, idx) => labeledCell(110 + idx * 110, OPTION_IDS[idx]!.toUpperCase(), content));
    const diagram = { type: "svg" as const, markup: svgDocument([refCell, ...cells].join(""), 110 + 4 * 110) };
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `Which option shows the reference figure reflected across the HORIZONTAL axis (flipped upside-down, top becomes bottom)?`,
        hi: `कौन-सा विकल्प संदर्भ आकृति को क्षैतिज अक्ष के आर-पार परावर्तित (उल्टा, ऊपर-नीचे पलटा हुआ) दिखाता है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Reflecting across the horizontal axis flips the figure top-to-bottom (up becomes down) while left and right stay in place — shown in option ${correctOption.toUpperCase()}.`,
        hi: `क्षैतिज अक्ष के आर-पार परावर्तित करने पर आकृति ऊपर-नीचे पलट जाती है (ऊपर नीचे बन जाता है) जबकि बाएँ-दाएँ अपनी जगह बने रहते हैं — यह विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (e) ×5: sum of two DIFFERENT sequential rotations ────────
function twoStepDifferentQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; step1: number; step2: number }[] = [
    { shape: "arrow", step1: 30, step2: 150 },
    { shape: "flag", step1: 20, step2: 100 },
    { shape: "triangle", step1: 75, step2: 105 },
    { shape: "ltromino", step1: 40, step2: 200 },
    { shape: "arrow", step1: 15, step2: 255 },
  ];
  return params.map(({ shape, step1, step2 }, i) => {
    const net = (step1 + step2) % 360;
    const wrongDifference = Math.abs(step1 - step2) % 360;
    const candidates = [net, step1, step2, wrongDifference];
    const uniqueAngles = Array.from(new Set(candidates));
    for (let attempt = 0; uniqueAngles.length < 4 && attempt < 20; attempt++) {
      const candidate = (net + 37 * (attempt + 1)) % 360;
      if (!uniqueAngles.includes(candidate)) uniqueAngles.push(candidate);
    }
    if (uniqueAngles.length < 4) throw new Error(`figure-matching twostephard ${i}: could not find 4 distinct angles.`);
    const angles = uniqueAngles.slice(0, 4);
    const cells: [number, boolean][] = angles.map((a) => [a, false]);
    const key = `bank-ma-figmatch-twostephard-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, shape, 0, false, cells);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    const correctIndex = angles.indexOf(net);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `The reference figure is first rotated ${step1}° clockwise, then rotated another ${step2}° clockwise. Which option (A-D) shows the final result?`,
        hi: `संदर्भ आकृति को पहले ${step1}° दक्षिणावर्त घुमाया जाता है, फिर एक बार और ${step2}° दक्षिणावर्त घुमाया जाता है। कौन-सा विकल्प (A-D) अंतिम परिणाम दिखाता है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption: correctIdFromIndex(correctIndex),
      figureMetadata: diagram,
      explanation: {
        en: `The two rotations add together: ${step1}° + ${step2}° = ${net}° (mod 360°), shown in option ${correctIdFromIndex(correctIndex).toUpperCase()}.`,
        hi: `दोनों घुमाव जुड़ जाते हैं: ${step1}° + ${step2}° = ${net}° (mod 360°), जो विकल्प ${correctIdFromIndex(correctIndex).toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis: Object.fromEntries(
        angles
          .map((a, idx) => [idx, a])
          .filter(([idx]) => idx !== correctIndex)
          .map(([idx, a]) => {
            let reason: LangText;
            if (a === step1) reason = { en: `Shows only the first rotation step (${step1}°), stopping before the second.`, hi: `केवल पहला घुमाव चरण (${step1}°) दिखाता है, दूसरे से पहले रुक गया।` };
            else if (a === step2) reason = { en: `Shows only the second rotation step (${step2}°), as if the first never happened.`, hi: `केवल दूसरा घुमाव चरण (${step2}°) दिखाता है, जैसे पहला हुआ ही न हो।` };
            else if (a === wrongDifference) reason = { en: `Subtracts the two steps instead of adding them (|${step1}−${step2}|), a wrong combination rule.`, hi: `दोनों चरणों को जोड़ने के बजाय घटा देता है (|${step1}−${step2}|), जो एक गलत संयोजन नियम है।` };
            else reason = { en: "An unrelated angle that matches none of the individual steps or their correct sum.", hi: "एक असंबंधित कोण जो न तो किसी एक चरण से मेल खाता है और न ही उनके सही योग से।" };
            return [correctIdFromIndex(idx as number), reason];
          })
      ),
    };
  });
}

// ── HARD family (f) ×5: correct angle but decoy SHAPE among options ─────
function shapeIdentityDecoyQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; decoyShape: ShapeName; target: 90 | 180 | 270 }[] = [
    { shape: "arrow", decoyShape: "flag", target: 90 },
    { shape: "flag", decoyShape: "arrow", target: 180 },
    { shape: "triangle", decoyShape: "ltromino", target: 90 },
    { shape: "ltromino", decoyShape: "triangle", target: 270 },
    { shape: "arrow", decoyShape: "triangle", target: 180 },
  ];
  return params.map(({ shape, decoyShape, target }, i) => {
    // correct: shape@target; distractors: shape@wrongAngle1, decoyShape@target (right angle, wrong shape!), shape@wrongAngle2
    const otherAngles = [0, 90, 180, 270].filter((a) => a !== target);
    const correctCell: [ShapeName, number, boolean] = [shape, target, false];
    const distractorCells: [[ShapeName, number, boolean], [ShapeName, number, boolean], [ShapeName, number, boolean]] = [
      [shape, otherAngles[0]!, false],
      [decoyShape, target, false],
      [shape, otherAngles[1]!, false],
    ];
    const correctIndex = (i + 3) % 4;
    const { contents: cells, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctCell,
      distractorCells,
      [
        { en: `The right figure, but rotated by ${otherAngles[0]}° instead of the instructed ${target}°.`, hi: `सही आकृति है, लेकिन निर्देशित ${target}° के बजाय ${otherAngles[0]}° घुमाई गई है।` },
        { en: "Rotated by the correct angle, but this is actually a DIFFERENT figure altogether, not the reference shape rotated.", hi: "सही कोण पर घुमाई गई है, लेकिन यह वास्तव में एक बिल्कुल अलग आकृति है, संदर्भ आकृति का घुमाव नहीं।" },
        { en: `The right figure, but rotated by ${otherAngles[1]}° instead of the instructed ${target}°.`, hi: `सही आकृति है, लेकिन निर्देशित ${target}° के बजाय ${otherAngles[1]}° घुमाई गई है।` },
      ]
    );
    const key = `bank-ma-figmatch-shapedecoy-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagramMixedShapes(key, shape, 0, cells);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `The reference figure is rotated ${target}° clockwise. Which option (A-D) shows the SAME figure, correctly rotated?`,
        hi: `संदर्भ आकृति को ${target}° दक्षिणावर्त घुमाया गया है। कौन-सा विकल्प (A-D) उसी आकृति को सही ढंग से घुमाया हुआ दिखाता है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Option ${correctOption.toUpperCase()} shows the exact same figure as the reference, rotated by the correct ${target}°.`,
        hi: `विकल्प ${correctOption.toUpperCase()} संदर्भ के समान ही आकृति दिखाता है, जो सही ${target}° घुमाई गई है।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildFigureMatchingQuestions(): GeneratedQuestion[] {
  const all = [
    ...rightAngleRotationQuestions(),
    ...mirrorRecognitionQuestions(),
    ...obliqueRotationQuestions(),
    ...twoStepSameDirectionQuestions(),
    ...axisReflectionQuestions(),
    ...twoStepDifferentQuestions(),
    ...shapeIdentityDecoyQuestions(),
  ];
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Figure Matching pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}
