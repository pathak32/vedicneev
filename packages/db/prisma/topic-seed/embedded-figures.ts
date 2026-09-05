import { labeledCell, svgDocument } from "./svg-shapes";
import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Embedded Figures pool (Mental Ability ->
 * "embedded_figures" topic, new): 10 Easy / 15 Moderate / 15 Hard. A
 * simple reference shape (triangle or quadrilateral) is shown standalone;
 * 4 busier "cluttered" figures are shown as options, and exactly one
 * contains the reference shape's EXACT edges as a literal subset of its
 * drawn lines. Correctness is guaranteed by construction, not by a
 * rendered "looks embedded" judgment: the correct option's polygon is
 * built from the identical point array as the reference (asserted at
 * construction time), while every wrong option has at least one vertex
 * deliberately perturbed — verified to differ from the reference, not
 * just assumed to.
 */

type Point = [number, number];
const INK = "#1e293b";
const OPTION_IDS = ["a", "b", "c", "d"] as const;

function buildOptions(): OptionSeed[] {
  return OPTION_IDS.map((id) => ({ id, text: { en: id.toUpperCase(), hi: id.toUpperCase() } }));
}

function pointsEqual(a: Point[], b: Point[]): boolean {
  return a.length === b.length && a.every(([x, y], i) => x === b[i]![0] && y === b[i]![1]);
}

function polygonMarkup(points: Point[], strokeWidth = 2.5): string {
  const pathPoints = points.map(([x, y]) => `${x},${y}`).join(" ");
  return `<polygon points="${pathPoints}" fill="none" stroke="${INK}" stroke-width="${strokeWidth}"/>`;
}

function clutterMarkup(lines: [number, number, number, number][], strokeWidth = 2.5): string {
  return lines.map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="${strokeWidth}"/>`).join("");
}

const CLUTTER_SPARSE: [number, number, number, number][] = [
  [-25, -22, 24, -18],
  [22, 24, -22, 18],
];
const CLUTTER_MEDIUM: [number, number, number, number][] = [
  ...CLUTTER_SPARSE,
  [-24, 8, 24, 12],
  [8, -24, 12, 24],
];
const CLUTTER_BUSY: [number, number, number, number][] = [
  ...CLUTTER_MEDIUM,
  [-14, -24, 20, -3],
  [14, 24, -20, 3],
];
const CLUTTER_BUSIEST: [number, number, number, number][] = [
  ...CLUTTER_BUSY,
  [-24, -4, 24, 2],
];

/** Shifts a single vertex of `points` at `index` by (dx, dy), leaving every other vertex untouched — used to build a genuinely-different (verified, not assumed) distractor polygon. */
function perturb(points: Point[], index: number, dx: number, dy: number): Point[] {
  return points.map((p, i) => (i === index ? [p[0] + dx, p[1] + dy] : p));
}

function mirrorPoints(points: Point[]): Point[] {
  return points.map(([x, y]) => [-x, y] as Point);
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

/** Verifies the "correct" candidate literally matches the reference point-for-point, and every "wrong" candidate genuinely differs — the real construction-time guarantee this whole file rests on. */
function assertEmbeddingCorrectness(key: string, reference: Point[], correctCandidate: Point[], wrongCandidates: Point[][]): void {
  if (!pointsEqual(reference, correctCandidate)) {
    throw new Error(`${key}: the "correct" option's polygon does not exactly match the reference shape — construction bug.`);
  }
  wrongCandidates.forEach((wrong, i) => {
    if (pointsEqual(reference, wrong)) {
      throw new Error(`${key}: distractor #${i} accidentally matches the reference shape exactly — construction bug.`);
    }
  });
}

function buildDiagram(key: string, referencePoints: Point[], optionPointSets: Point[][], clutter: [number, number, number, number][]): { type: "svg"; markup: string } {
  const refMarkup = polygonMarkup(referencePoints);
  const optionMarkups = optionPointSets.map((pts) => polygonMarkup(pts) + clutterMarkup(clutter));
  assertDistinctFigures(key, optionMarkups);
  const refCell = labeledCell(0, "Ref", refMarkup);
  const optionCells = optionMarkups.map((m, i) => labeledCell(110 + i * 110, OPTION_IDS[i]!.toUpperCase(), m));
  const width = 110 + optionMarkups.length * 110;
  return { type: "svg" as const, markup: svgDocument([refCell, ...optionCells].join(""), width) };
}

const TRIANGLE_REFS: Point[][] = [
  [[-15, -10], [12, 14], [16, -14]],
  [[-16, 12], [14, -12], [8, 16]],
  [[-14, -14], [16, -6], [-6, 16]],
  [[-16, -8], [10, -16], [14, 12]],
  [[-12, 14], [16, 6], [-8, -16]],
];
const QUAD_REFS: Point[][] = [
  [[-15, -15], [15, -10], [10, 15], [-15, 10]],
  [[-16, -12], [12, -16], [16, 10], [-10, 16]],
  [[-14, -16], [16, -8], [12, 14], [-16, 8]],
  [[-16, -10], [8, -16], [16, 12], [-12, 14]],
  [[-15, -12], [14, -15], [16, 14], [-12, 16]],
];
// A second, genuinely distinct set of 5 triangles for the back half of
// easyQuestions() — reusing TRIANGLE_REFS a second time there (even with
// different perturbations) would leave every reference shape and its
// correct-option rendering byte-identical between item i and i+5, which
// the within-question distinctness checks can't catch since they only
// compare options inside a single question, never across questions.
const TRIANGLE_REFS_2: Point[][] = [
  [[-13, 15], [16, 8], [4, -16]],
  [[16, -14], [-8, 16], [-16, -6]],
  [[-16, 4], [6, -16], [16, 14]],
  [[14, 16], [-16, 10], [-2, -16]],
  [[-16, -16], [16, -4], [2, 16]],
];

// ── EASY (×10): triangle reference, sparse clutter, large perturbation ──
function easyQuestions(): GeneratedQuestion[] {
  const refs = [...TRIANGLE_REFS, ...TRIANGLE_REFS_2];
  return refs.map((ref, i) => {
    const delta = 14;
    const wrong1 = perturb(ref, 0, delta, 0);
    const wrong2 = perturb(ref, 1, 0, delta);
    const wrong3 = perturb(ref, 2, -delta, 0);
    assertEmbeddingCorrectness(`bank-ma-embedfig-easy-${i}`, ref, ref, [wrong1, wrong2, wrong3]);
    const correctIndex = i % 4;
    const { contents: optionPointSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      ref,
      [wrong1, wrong2, wrong3],
      [
        { en: "One corner of this figure is shifted well away from where the reference shape actually has it.", hi: "इस आकृति का एक कोना संदर्भ आकृति की वास्तविक स्थिति से काफी दूर खिसका हुआ है।" },
        { en: "One corner of this figure is shifted well away from the reference — a different vertex than option before, but still a clear mismatch.", hi: "इस आकृति का एक कोना संदर्भ से काफी दूर खिसका हुआ है — पिछले विकल्प से एक अलग कोना, पर फिर भी स्पष्ट बेमेल।" },
        { en: "One corner of this figure is shifted well away from the reference in yet another direction.", hi: "इस आकृति का एक कोना संदर्भ से एक और दिशा में काफी दूर खिसका हुआ है।" },
      ]
    );
    const key = `bank-ma-embedfig-easy-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, ref, optionPointSets, CLUTTER_SPARSE);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY",
      content: {
        en: "The reference shape is hidden among extra lines in exactly one of the 4 options. Which option (A-D) contains it exactly?",
        hi: "संदर्भ आकृति चारों विकल्पों में से ठीक एक में अतिरिक्त रेखाओं के बीच छिपी है। कौन-सा विकल्प (A-D) इसे बिल्कुल सही रखता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Only option ${correctOption.toUpperCase()} contains the reference triangle's exact 3 corners — the other options each have one corner clearly shifted.`,
        hi: `केवल विकल्प ${correctOption.toUpperCase()} में संदर्भ त्रिभुज के ठीक 3 कोने हैं — बाकी विकल्पों में हर एक का एक कोना स्पष्ट रूप से खिसका हुआ है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (a) ×5: triangle ref, medium clutter, moderate perturbation ─
function mediumClutterQuestions(): GeneratedQuestion[] {
  return TRIANGLE_REFS.map((ref, i) => {
    const delta = 9;
    const wrong1 = perturb(ref, 0, delta, delta);
    const wrong2 = perturb(ref, 1, -delta, delta);
    const wrong3 = perturb(ref, 2, delta, -delta);
    assertEmbeddingCorrectness(`bank-ma-embedfig-mediumclutter-${i}`, ref, ref, [wrong1, wrong2, wrong3]);
    const correctIndex = (i + 1) % 4;
    const { contents: optionPointSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      ref,
      [wrong1, wrong2, wrong3],
      [
        { en: "One corner is noticeably out of place among the extra clutter lines.", hi: "अतिरिक्त गड़बड़ रेखाओं के बीच एक कोना स्पष्ट रूप से गलत जगह पर है।" },
        { en: "A different corner is noticeably out of place here.", hi: "यहाँ एक अलग कोना स्पष्ट रूप से गलत जगह पर है।" },
        { en: "Yet another corner is shifted, in a different direction than the other two wrong options.", hi: "एक और कोना खिसका हुआ है, अन्य दो गलत विकल्पों से भिन्न दिशा में।" },
      ]
    );
    const key = `bank-ma-embedfig-mediumclutter-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, ref, optionPointSets, CLUTTER_MEDIUM);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "There are more clutter lines this time. Which option (A-D) still contains the reference shape's exact corners?",
        hi: "इस बार अधिक गड़बड़ रेखाएँ हैं। कौन-सा विकल्प (A-D) फिर भी संदर्भ आकृति के ठीक कोने रखता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Despite the extra clutter, only option ${correctOption.toUpperCase()} has all 3 corners exactly matching the reference.`,
        hi: `अतिरिक्त गड़बड़ी के बावजूद, केवल विकल्प ${correctOption.toUpperCase()} के सभी 3 कोने संदर्भ से बिल्कुल मेल खाते हैं।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (b) ×5: quadrilateral reference ────────────────────────
function quadrilateralQuestions(): GeneratedQuestion[] {
  return QUAD_REFS.map((ref, i) => {
    const delta = 9;
    const wrong1 = perturb(ref, 0, delta, delta);
    const wrong2 = perturb(ref, 2, -delta, -delta);
    const wrong3 = perturb(ref, 1, delta, -delta);
    assertEmbeddingCorrectness(`bank-ma-embedfig-quad-${i}`, ref, ref, [wrong1, wrong2, wrong3]);
    const correctIndex = (i + 2) % 4;
    const { contents: optionPointSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      ref,
      [wrong1, wrong2, wrong3],
      [
        { en: "One of the four corners is noticeably out of place.", hi: "चार में से एक कोना स्पष्ट रूप से गलत जगह पर है।" },
        { en: "A different corner is out of place in this option, on the opposite side.", hi: "इस विकल्प में विपरीत ओर एक अलग कोना गलत जगह पर है।" },
        { en: "Yet another corner is shifted here, in its own distinct direction.", hi: "यहाँ एक और कोना अपनी अलग दिशा में खिसका हुआ है।" },
      ]
    );
    const key = `bank-ma-embedfig-quad-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, ref, optionPointSets, CLUTTER_MEDIUM);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "This time the reference is a 4-sided shape. Which option (A-D) contains its exact 4 corners?",
        hi: "इस बार संदर्भ एक 4-भुजा वाली आकृति है। कौन-सा विकल्प (A-D) इसके ठीक 4 कोने रखता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Only option ${correctOption.toUpperCase()} has all 4 corners exactly matching the reference quadrilateral.`,
        hi: `केवल विकल्प ${correctOption.toUpperCase()} के सभी 4 कोने संदर्भ चतुर्भुज से बिल्कुल मेल खाते हैं।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (c) ×5: triangle ref, BUSY clutter (harder via visual
// noise alone, not smaller perturbation) ─────────────────────────────────
function busyClutterQuestions(): GeneratedQuestion[] {
  const refs = [TRIANGLE_REFS[0]!, TRIANGLE_REFS[1]!, TRIANGLE_REFS[2]!, TRIANGLE_REFS[3]!, TRIANGLE_REFS[4]!];
  return refs.map((ref, i) => {
    const delta = 9;
    const wrong1 = perturb(ref, 1, delta, 0);
    const wrong2 = perturb(ref, 2, 0, -delta);
    const wrong3 = perturb(ref, 0, -delta, delta);
    assertEmbeddingCorrectness(`bank-ma-embedfig-busy-${i}`, ref, ref, [wrong1, wrong2, wrong3]);
    const correctIndex = (i + 3) % 4;
    const { contents: optionPointSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      ref,
      [wrong1, wrong2, wrong3],
      [
        { en: "Amid all the extra lines, one corner here is still noticeably out of place.", hi: "सभी अतिरिक्त रेखाओं के बीच, यहाँ एक कोना अभी भी स्पष्ट रूप से गलत जगह पर है।" },
        { en: "A different corner is out of place among the clutter here.", hi: "यहाँ गड़बड़ी के बीच एक अलग कोना गलत जगह पर है।" },
        { en: "Yet another corner is shifted here, hidden among the busy lines.", hi: "यहाँ व्यस्त रेखाओं के बीच एक और कोना खिसका हुआ है।" },
      ]
    );
    const key = `bank-ma-embedfig-busy-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, ref, optionPointSets, CLUTTER_BUSY);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "The clutter is much busier now, though the corners themselves aren't hard to compare. Which option (A-D) exactly matches the reference?",
        hi: "अब गड़बड़ी बहुत अधिक व्यस्त है, हालाँकि कोनों की तुलना करना कठिन नहीं है। कौन-सा विकल्प (A-D) संदर्भ से बिल्कुल मेल खाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Even with all the extra clutter lines, only option ${correctOption.toUpperCase()} has the reference triangle's exact 3 corners.`,
        hi: `सभी अतिरिक्त गड़बड़ रेखाओं के बावजूद, केवल विकल्प ${correctOption.toUpperCase()} में संदर्भ त्रिभुज के ठीक 3 कोने हैं।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (a) ×5: quadrilateral ref, busy clutter, small perturbation ─
function hardQuadQuestions(): GeneratedQuestion[] {
  return QUAD_REFS.map((ref, i) => {
    const delta = 5;
    const wrong1 = perturb(ref, 0, delta, 0);
    const wrong2 = perturb(ref, 2, 0, delta);
    const wrong3 = perturb(ref, 3, -delta, 0);
    assertEmbeddingCorrectness(`bank-ma-embedfig-hardquad-${i}`, ref, ref, [wrong1, wrong2, wrong3]);
    const correctIndex = i % 4;
    const { contents: optionPointSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      ref,
      [wrong1, wrong2, wrong3],
      [
        { en: "One corner is subtly off — just a small shift, easy to miss.", hi: "एक कोना सूक्ष्म रूप से गलत है — बस थोड़ा सा खिसका हुआ, चूकना आसान है।" },
        { en: "A different corner is subtly off here — a small shift in another direction.", hi: "यहाँ एक अलग कोना सूक्ष्म रूप से गलत है — एक अन्य दिशा में थोड़ा सा खिसका हुआ।" },
        { en: "Yet another corner is subtly shifted, in its own small way.", hi: "एक और कोना अपने ही सूक्ष्म ढंग से खिसका हुआ है।" },
      ]
    );
    const key = `bank-ma-embedfig-hardquad-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, ref, optionPointSets, CLUTTER_BUSY);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "The 4 options are all very close to the reference — look very carefully at each corner. Which option (A-D) matches exactly, with no difference at all?",
        hi: "चारों विकल्प संदर्भ के बहुत करीब हैं — हर कोने को बहुत ध्यान से देखें। कौन-सा विकल्प (A-D) बिना किसी अंतर के बिल्कुल मेल खाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Option ${correctOption.toUpperCase()} is the only one with all 4 corners in exactly the reference's positions — the rest each have one corner shifted by just a little.`,
        hi: `विकल्प ${correctOption.toUpperCase()} ही एकमात्र ऐसा है जिसके सभी 4 कोने ठीक संदर्भ की स्थिति में हैं — बाकी सभी में एक-एक कोना थोड़ा सा खिसका हुआ है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (b) ×5: triangle ref, one distractor is a MIRRORED copy —
// a genuine close-distractor, not just a shifted corner ─────────────────
function mirroredDistractorQuestions(): GeneratedQuestion[] {
  const refs = [TRIANGLE_REFS[0]!, TRIANGLE_REFS[1]!, TRIANGLE_REFS[2]!, TRIANGLE_REFS[3]!, TRIANGLE_REFS[4]!];
  return refs.map((ref, i) => {
    const delta = 6;
    const mirrored = mirrorPoints(ref);
    const wrong2 = perturb(ref, 1, delta, 0);
    const wrong3 = perturb(ref, 2, 0, -delta);
    assertEmbeddingCorrectness(`bank-ma-embedfig-mirrored-${i}`, ref, ref, [mirrored, wrong2, wrong3]);
    const correctIndex = (i + 1) % 4;
    const { contents: optionPointSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      ref,
      [mirrored, wrong2, wrong3],
      [
        { en: "This is a MIRRORED version of the reference — same size and shape, but flipped, so it is not an exact match.", hi: "यह संदर्भ का दर्पण-प्रतिबिंबित संस्करण है — आकार और आकृति समान है, पर पलटा हुआ है, इसलिए यह बिल्कुल मेल नहीं खाता।" },
        { en: "One corner here is shifted away from the reference's true position.", hi: "यहाँ एक कोना संदर्भ की वास्तविक स्थिति से खिसका हुआ है।" },
        { en: "A different corner here is shifted, in another direction.", hi: "यहाँ एक अलग कोना दूसरी दिशा में खिसका हुआ है।" },
      ]
    );
    const key = `bank-ma-embedfig-mirrored-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, ref, optionPointSets, CLUTTER_BUSY);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "One option looks almost identical to the reference but is actually its mirror image, not an exact copy. Which option (A-D) is the true, unflipped match?",
        hi: "एक विकल्प संदर्भ से लगभग समान दिखता है पर वास्तव में उसका दर्पण-प्रतिबिंब है, बिल्कुल सटीक प्रति नहीं। कौन-सा विकल्प (A-D) सही, बिना पलटा हुआ मेल है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Option ${correctOption.toUpperCase()} is the only one with the reference's exact, unflipped corners — one distractor is a mirror image, and the other two have a shifted corner.`,
        hi: `विकल्प ${correctOption.toUpperCase()} ही एकमात्र ऐसा है जिसमें संदर्भ के ठीक, बिना पलटे कोने हैं — एक विकर्षक दर्पण-प्रतिबिंब है, और बाकी दो में एक-एक कोना खिसका हुआ है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (c) ×5: quadrilateral ref, busiest clutter, tightest perturbation ─
function tightestQuestions(): GeneratedQuestion[] {
  return QUAD_REFS.map((ref, i) => {
    const delta = 3;
    const wrong1 = perturb(ref, 1, delta, 0);
    const wrong2 = perturb(ref, 3, 0, delta);
    const wrong3 = perturb(ref, 0, -delta, -delta);
    assertEmbeddingCorrectness(`bank-ma-embedfig-tightest-${i}`, ref, ref, [wrong1, wrong2, wrong3]);
    const correctIndex = (i + 2) % 4;
    const { contents: optionPointSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      ref,
      [wrong1, wrong2, wrong3],
      [
        { en: "A very slight shift in one corner — the hardest kind of mismatch to catch.", hi: "एक कोने में बहुत हल्का सा खिसकाव — यह पकड़ने में सबसे कठिन प्रकार का बेमेल है।" },
        { en: "A very slight shift in a different corner.", hi: "एक अलग कोने में बहुत हल्का सा खिसकाव।" },
        { en: "A very slight shift in yet another corner, in its own direction.", hi: "एक और कोने में बहुत हल्का सा खिसकाव, अपनी ही दिशा में।" },
      ]
    );
    const key = `bank-ma-embedfig-tightest-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, ref, optionPointSets, CLUTTER_BUSIEST);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "The busiest clutter yet, and the smallest differences yet — this is the hardest version of this question. Which option (A-D) matches the reference exactly?",
        hi: "अब तक की सबसे व्यस्त गड़बड़ी, और अब तक के सबसे छोटे अंतर — यह इस प्रश्न का सबसे कठिन संस्करण है। कौन-सा विकल्प (A-D) संदर्भ से बिल्कुल मेल खाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Option ${correctOption.toUpperCase()} is the only one with all 4 corners in precisely the reference's positions — every other option has one corner off by just a hair.`,
        hi: `विकल्प ${correctOption.toUpperCase()} ही एकमात्र ऐसा है जिसके सभी 4 कोने ठीक संदर्भ की स्थिति में हैं — बाकी हर विकल्प में एक कोना बाल जितना ही खिसका हुआ है।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildEmbeddedFiguresQuestions(): GeneratedQuestion[] {
  const all = [
    ...easyQuestions(),
    ...mediumClutterQuestions(),
    ...quadrilateralQuestions(),
    ...busyClutterQuestions(),
    ...hardQuadQuestions(),
    ...mirroredDistractorQuestions(),
    ...tightestQuestions(),
  ];
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Embedded Figures pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}
