import { labeledCell, svgDocument } from "./svg-shapes";
import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Punched Hole Pattern pool (Mental Ability ->
 * "punched_hole_pattern" topic, new): 10 Easy / 15 Moderate / 15 Hard. A
 * square paper is folded along one or more axes, then punched through
 * with one or more holes; the question shows the folded paper (fold
 * lines dashed, the folded-away region shaded, punch dots marked) and
 * asks which option shows the correctly unfolded paper. Correctness is
 * REAL geometry, not a rendered guess: a punch at point P, folded along
 * axis A, produces a hole at P and at reflect(P, A) — for multiple folds,
 * the full set is every combination of reflections applied or not,
 * computed by computeHoles() below. A point exactly ON a fold line
 * reflects onto itself, so it deliberately produces FEWER holes than a
 * generic point — several HARD items rely on this to test genuine
 * understanding of the rule, not pattern memorization.
 */

const INK = "#1e293b";
const SHADE = "#dbe3ee";
const HALF = 30;

type Axis = "vertical" | "horizontal" | "diagonal-main" | "diagonal-anti";
type Point = [number, number];

function reflect([x, y]: Point, axis: Axis): Point {
  if (axis === "vertical") return [-x, y];
  if (axis === "horizontal") return [x, -y];
  if (axis === "diagonal-main") return [y, x];
  return [-y, -x];
}

/** Every hole produced by punching through `punchPoints` on paper folded (in order) along `foldAxes` — the full orbit of each point under every combination of the given reflections, deduplicated (a point on a fold line reflects onto itself). */
function computeHoles(foldAxes: Axis[], punchPoints: Point[]): Point[] {
  const n = foldAxes.length;
  const result = new Map<string, Point>();
  for (const p of punchPoints) {
    for (let mask = 0; mask < 1 << n; mask++) {
      let pt: Point = [p[0], p[1]];
      for (let bit = 0; bit < n; bit++) {
        if (mask & (1 << bit)) pt = reflect(pt, foldAxes[bit]!);
      }
      const key = `${Math.round(pt[0] * 10)},${Math.round(pt[1] * 10)}`;
      result.set(key, pt);
    }
  }
  return Array.from(result.values());
}

function paperOutline(): string {
  return `<rect x="${-HALF}" y="${-HALF}" width="${HALF * 2}" height="${HALF * 2}" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
}

function foldLineMarkup(axis: Axis): string {
  if (axis === "vertical") return `<line x1="0" y1="${-HALF}" x2="0" y2="${HALF}" stroke="${INK}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
  if (axis === "horizontal") return `<line x1="${-HALF}" y1="0" x2="${HALF}" y2="0" stroke="${INK}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
  if (axis === "diagonal-main") return `<line x1="${-HALF}" y1="${-HALF}" x2="${HALF}" y2="${HALF}" stroke="${INK}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
  return `<line x1="${-HALF}" y1="${HALF}" x2="${HALF}" y2="${-HALF}" stroke="${INK}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
}

/** Shades the half that folds AWAY, by this file's fixed convention: vertical folds away the left half, horizontal folds away the top half, diagonal-main folds away the upper-right triangle, diagonal-anti folds away the lower-right triangle. Punch points must always lie in the un-shaded (kept, folded-visible) region for every active axis. */
function foldedAwayShade(axis: Axis): string {
  if (axis === "vertical") return `<rect x="${-HALF}" y="${-HALF}" width="${HALF}" height="${HALF * 2}" fill="${SHADE}"/>`;
  if (axis === "horizontal") return `<rect x="${-HALF}" y="${-HALF}" width="${HALF * 2}" height="${HALF}" fill="${SHADE}"/>`;
  if (axis === "diagonal-main") return `<polygon points="${-HALF},${-HALF} ${HALF},${-HALF} ${HALF},${HALF}" fill="${SHADE}"/>`;
  return `<polygon points="${-HALF},${HALF} ${HALF},${HALF} ${HALF},${-HALF}" fill="${SHADE}"/>`;
}

function punchDots(points: Point[], radius = 3): string {
  return points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${INK}"/>`).join("");
}

/** The folded-paper reference diagram: full square, shaded folded-away region(s), dashed fold line(s), punch dot(s) in the visible region. */
function foldedDiagram(foldAxes: Axis[], punchPoints: Point[]): string {
  const shades = foldAxes.map(foldedAwayShade).join("");
  const lines = foldAxes.map(foldLineMarkup).join("");
  return paperOutline() + shades + lines + punchDots(punchPoints);
}

/** One unfolded-paper option: full square with the resulting holes marked. */
function unfoldedOption(holes: Point[]): string {
  return paperOutline() + punchDots(holes);
}

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

/** Compares hole SETS (not markup strings) since two option markups could coincidentally list the same points in a different order — a real risk once distractor generation gets more elaborate. */
function holesKey(points: Point[]): string {
  return points
    .map(([x, y]) => `${Math.round(x * 10)},${Math.round(y * 10)}`)
    .sort()
    .join("|");
}

function assertDistinctHoleSets(key: string, pointSets: Point[][]): void {
  const seen = new Map<string, number>();
  pointSets.forEach((pts, i) => {
    const k = holesKey(pts);
    const existing = seen.get(k);
    if (existing !== undefined) {
      throw new Error(`${key}: option cells ${existing} and ${i} produce the identical hole SET — construction bug, fix the generator.`);
    }
    seen.set(k, i);
  });
}

function buildDiagram(key: string, refMarkup: string, optionHoleSets: Point[][]): { type: "svg"; markup: string } {
  assertDistinctHoleSets(key, optionHoleSets);
  const optionMarkups = optionHoleSets.map((holes) => unfoldedOption(holes));
  assertDistinctFigures(key, optionMarkups);
  const refCell = labeledCell(0, "Folded", refMarkup);
  const optionCells = optionMarkups.map((m, i) => labeledCell(110 + i * 110, OPTION_IDS[i]!.toUpperCase(), m));
  const width = 110 + optionMarkups.length * 110;
  return { type: "svg" as const, markup: svgDocument([refCell, ...optionCells].join(""), width) };
}

/** Nudges a point by (dx, dy) — used to build "right count, wrong position" distractors. */
function nudge([x, y]: Point, dx: number, dy: number): Point {
  return [x + dx, y + dy];
}

// ── EASY (×10): single fold, one punch point, 2 resulting holes ─────────
function singleFoldQuestions(): GeneratedQuestion[] {
  const params: { axis: Axis; punch: Point }[] = [
    { axis: "vertical", punch: [15, -10] },
    { axis: "horizontal", punch: [10, 15] },
    { axis: "vertical", punch: [10, 12] },
    { axis: "horizontal", punch: [-12, 15] },
    { axis: "vertical", punch: [18, 5] },
    { axis: "horizontal", punch: [8, 18] },
    { axis: "vertical", punch: [12, -18] },
    { axis: "horizontal", punch: [-8, 10] },
    { axis: "vertical", punch: [20, 15] },
    { axis: "horizontal", punch: [15, 8] },
  ];
  return params.map(({ axis, punch }, i) => {
    const correctHoles = computeHoles([axis], [punch]);
    const wrongAxis: Axis = axis === "vertical" ? "horizontal" : "vertical";
    const distractorHoleSets: [Point[], Point[], Point[]] = [
      [punch], // forgot the fold entirely — only 1 hole shown
      computeHoles([wrongAxis], [punch]), // folded along the wrong axis
      computeHoles([axis], [nudge(punch, 6, 6)]), // right axis, but the punch position itself is off
    ];
    const correctIndex = i % 4;
    const { contents: optionHoleSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctHoles,
      distractorHoleSets,
      [
        { en: "Shows only 1 hole — forgets that a fold always produces a matching pair.", hi: "केवल 1 छेद दिखाता है — यह भूल जाता है कि एक तह हमेशा एक मिलान जोड़ा बनाती है।" },
        { en: `Reflects across the ${wrongAxis} axis instead of the ${axis} axis the paper was actually folded along.`, hi: `कागज़ जिस ${axis === "vertical" ? "ऊर्ध्वाधर" : "क्षैतिज"} अक्ष पर वास्तव में मुड़ा था, उसके बजाय ${wrongAxis === "vertical" ? "ऊर्ध्वाधर" : "क्षैतिज"} अक्ष के आर-पार परावर्तित करता है।` },
        { en: "Uses the right fold axis, but starts from the wrong punch position, so both resulting holes are shifted.", hi: "सही तह अक्ष का उपयोग करता है, पर गलत पंच स्थिति से शुरू करता है, इसलिए दोनों परिणामी छेद खिसक जाते हैं।" },
      ]
    );
    const key = `bank-ma-punchedhole-single-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, foldedDiagram([axis], [punch]), optionHoleSets);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY",
      content: {
        en: `The paper is folded once (along the ${axis} line) and punched once. Which option (A-D) shows it correctly unfolded?`,
        hi: `कागज़ को एक बार (${axis === "vertical" ? "ऊर्ध्वाधर" : "क्षैतिज"} रेखा पर) मोड़ा गया है और एक बार पंच किया गया है। कौन-सा विकल्प (A-D) इसे सही ढंग से खुला हुआ दिखाता है?`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `One fold means the punch reflects across that one line, giving exactly 2 holes — option ${correctOption.toUpperCase()} is the only one with the correct mirrored pair.`,
        hi: `एक तह का अर्थ है कि पंच उस एक रेखा के आर-पार परावर्तित होता है, जिससे ठीक 2 छेद बनते हैं — विकल्प ${correctOption.toUpperCase()} ही सही दर्पण-जोड़ी वाला है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (a) ×5: double fold, one punch point, 4 resulting holes ─
function doubleFoldQuestions(): GeneratedQuestion[] {
  const punches: Point[] = [[15, 12], [10, 18], [18, 8], [12, 15], [20, 10]];
  const foldPairs: [Axis, Axis][] = [
    ["vertical", "horizontal"],
    ["vertical", "horizontal"],
    ["vertical", "horizontal"],
    ["vertical", "horizontal"],
    ["vertical", "horizontal"],
  ];
  return punches.map((punch, i) => {
    const axes = foldPairs[i]!;
    const correctHoles = computeHoles(axes, [punch]);
    const distractorHoleSets: [Point[], Point[], Point[]] = [
      computeHoles([axes[0]!], [punch]), // only folded along one axis — half the holes missing
      [punch], // forgot both folds — only 1 hole
      computeHoles(axes, [nudge(punch, 6, -5)]), // both folds right, punch position off
    ];
    const correctIndex = (i + 1) % 4;
    const { contents: optionHoleSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctHoles,
      distractorHoleSets,
      [
        { en: "Only reflects across ONE of the two fold lines, missing half the holes a double fold produces.", hi: "दो में से केवल एक तह रेखा के आर-पार परावर्तित करता है, दोहरी तह से बनने वाले आधे छेद छूट जाते हैं।" },
        { en: "Shows only the original punch — forgets that a double fold produces four holes, not one.", hi: "केवल मूल पंच दिखाता है — भूल जाता है कि दोहरी तह चार छेद बनाती है, एक नहीं।" },
        { en: "Correct fold pattern (four holes), but starting from the wrong punch position, so the whole group is shifted.", hi: "सही तह पैटर्न (चार छेद), पर गलत पंच स्थिति से शुरू होकर, इसलिए पूरा समूह खिसक जाता है।" },
      ]
    );
    const key = `bank-ma-punchedhole-double-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, foldedDiagram(axes, [punch]), optionHoleSets);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "The paper is folded twice (into quarters) and punched once. Which option (A-D) shows it correctly unfolded?",
        hi: "कागज़ को दो बार (चार भागों में) मोड़ा गया है और एक बार पंच किया गया है। कौन-सा विकल्प (A-D) इसे सही ढंग से खुला हुआ दिखाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Two folds mean the punch reflects across both lines, giving exactly 4 holes (one in each quarter) — option ${correctOption.toUpperCase()} is the only one with all four in the right places.`,
        hi: `दो तह का अर्थ है कि पंच दोनों रेखाओं के आर-पार परावर्तित होता है, जिससे ठीक 4 छेद बनते हैं (हर चौथाई में एक) — विकल्प ${correctOption.toUpperCase()} ही चारों को सही जगह दिखाता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (b) ×5: single fold, TWO punch points, 4 holes ────────
function twoPunchesQuestions(): GeneratedQuestion[] {
  const params: { axis: Axis; punches: [Point, Point] }[] = [
    { axis: "vertical", punches: [[10, -15], [20, 10]] },
    { axis: "horizontal", punches: [[-15, 10], [10, 20]] },
    { axis: "vertical", punches: [[8, 18], [22, -8]] },
    { axis: "horizontal", punches: [[15, 8], [-10, 18]] },
    { axis: "vertical", punches: [[12, 12], [18, -12]] },
  ];
  return params.map(({ axis, punches }, i) => {
    const correctHoles = computeHoles([axis], punches);
    const distractorHoleSets: [Point[], Point[], Point[]] = [
      computeHoles([axis], [punches[0]]), // only reflected the first punch, forgot the second entirely
      [...punches], // forgot the fold for both punches — only 2 holes instead of 4
      computeHoles([axis], [punches[0], nudge(punches[1], 6, 6)]), // second punch position off
    ];
    const correctIndex = (i + 2) % 4;
    const { contents: optionHoleSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctHoles,
      distractorHoleSets,
      [
        { en: "Only the first punch was reflected across the fold — the second punch's mirror hole is missing.", hi: "केवल पहले पंच को तह के आर-पार परावर्तित किया गया — दूसरे पंच का दर्पण छेद गायब है।" },
        { en: "Shows only the two original punches — forgets that folded paper always produces a mirrored pair for EACH punch.", hi: "केवल दो मूल पंच दिखाता है — भूल जाता है कि मुड़ा हुआ कागज़ हर पंच के लिए हमेशा एक दर्पण जोड़ा बनाता है।" },
        { en: "The first punch's pair is correct, but the second punch's position is off, shifting its pair too.", hi: "पहले पंच की जोड़ी सही है, पर दूसरे पंच की स्थिति गलत है, जिससे उसकी जोड़ी भी खिसक जाती है।" },
      ]
    );
    const key = `bank-ma-punchedhole-twopunch-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, foldedDiagram([axis], punches), optionHoleSets);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "The paper is folded once, and punched TWICE before unfolding. Which option (A-D) is correct?",
        hi: "कागज़ को एक बार मोड़ा गया है, और खोलने से पहले दो बार पंच किया गया है। कौन-सा विकल्प (A-D) सही है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Each of the 2 punches gets its own mirrored partner across the fold, giving 4 holes total — option ${correctOption.toUpperCase()} is the only one showing both correct pairs.`,
        hi: `दोनों में से हर पंच को तह के आर-पार अपना दर्पण साथी मिलता है, जिससे कुल 4 छेद बनते हैं — विकल्प ${correctOption.toUpperCase()} ही दोनों सही जोड़े दिखाता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (c) ×5: double fold, punch ON one fold line (degenerate:
// only 2 distinct holes instead of 4) ────────────────────────────────────
function onFoldLineQuestions(): GeneratedQuestion[] {
  const params: { punch: Point }[] = [
    { punch: [0, 12] }, // on the vertical fold line
    { punch: [15, 0] }, // on the horizontal fold line
    { punch: [0, 18] },
    { punch: [10, 0] },
    { punch: [0, 8] },
  ];
  const axes: [Axis, Axis] = ["vertical", "horizontal"];
  return params.map(({ punch }, i) => {
    const correctHoles = computeHoles(axes, [punch]); // deliberately collapses to 2 distinct holes since punch is on one fold line
    const offLinePunch: Point = punch[0] === 0 ? [punch[0] + 8, punch[1]] : [punch[0], punch[1] + 8];
    // Shifted ALONG the same fold line (so it's still the degenerate on-line
    // case, not a different bug class) — a "right rule, wrong position"
    // distractor. Reflecting across "the axis the point already sits on"
    // (a genuine no-op) would coincide with the "forgot both folds"
    // distractor below whenever the shift is applied to that same
    // coordinate, so this must vary the OTHER coordinate to stay distinct.
    const shiftedOnLine: Point = punch[0] === 0 ? [punch[0], punch[1] + 6] : [punch[0] + 6, punch[1]];
    const distractorHoleSets: [Point[], Point[], Point[]] = [
      computeHoles(axes, [offLinePunch]), // treats it as a generic point, wrongly producing 4 holes instead of 2
      [punch], // forgot both folds — only 1 hole
      computeHoles(axes, [shiftedOnLine]), // correctly recognizes it's a 2-hole on-line case, but from the wrong position along that line
    ];
    const correctIndex = i % 4;
    const { contents: optionHoleSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctHoles,
      distractorHoleSets,
      [
        { en: "Treats the punch as an ordinary point and shows 4 holes — but this punch sits exactly ON a fold line, so reflecting across that line lands back on itself, giving only 2 distinct holes.", hi: "पंच को एक सामान्य बिंदु मानकर 4 छेद दिखाता है — पर यह पंच ठीक एक तह रेखा पर है, इसलिए उस रेखा के आर-पार परावर्तित होने पर यह अपनी ही जगह लौट आता है, जिससे केवल 2 अलग छेद बनते हैं।" },
        { en: "Shows only 1 hole — forgets to reflect across the other fold line at all.", hi: "केवल 1 छेद दिखाता है — दूसरी तह रेखा के आर-पार परावर्तित करना ही भूल जाता है।" },
        { en: "Correctly shows only 2 holes, but starting from the wrong position along the fold line, so both are shifted.", hi: "सही ढंग से केवल 2 छेद दिखाता है, पर तह रेखा पर गलत स्थिति से शुरू होकर, इसलिए दोनों खिसक जाते हैं।" },
      ]
    );
    const key = `bank-ma-punchedhole-onfoldline-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, foldedDiagram(axes, [punch]), optionHoleSets);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "Look carefully at exactly where the punch sits relative to the fold lines. Which option (A-D) shows the correctly unfolded paper?",
        hi: "ध्यान से देखें कि पंच तह रेखाओं के सापेक्ष ठीक कहाँ स्थित है। कौन-सा विकल्प (A-D) सही ढंग से खुला हुआ कागज़ दिखाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `The punch sits exactly on one of the two fold lines, so reflecting across that line changes nothing — only the OTHER fold produces a genuinely new hole, giving 2 distinct holes total. Option ${correctOption.toUpperCase()} is the only one showing this correctly.`,
        hi: `पंच दोनों में से एक तह रेखा पर ठीक स्थित है, इसलिए उस रेखा के आर-पार परावर्तित होने से कुछ नहीं बदलता — केवल दूसरी तह ही वास्तव में एक नया छेद बनाती है, जिससे कुल 2 अलग छेद बनते हैं। विकल्प ${correctOption.toUpperCase()} ही इसे सही ढंग से दिखाता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (a) ×5: double fold, TWO punch points (up to 8 holes) ───
function doubleFoldTwoPunchesQuestions(): GeneratedQuestion[] {
  const params: { punches: [Point, Point] }[] = [
    { punches: [[10, 12], [18, 18]] },
    { punches: [[8, 15], [20, 8]] },
    { punches: [[15, 10], [10, 20]] },
    { punches: [[12, 18], [22, 12]] },
    { punches: [[18, 8], [10, 15]] },
  ];
  const axes: [Axis, Axis] = ["vertical", "horizontal"];
  return params.map(({ punches }, i) => {
    const correctHoles = computeHoles(axes, punches);
    const distractorHoleSets: [Point[], Point[], Point[]] = [
      computeHoles([axes[0]], punches), // only one fold applied — half the holes missing
      computeHoles(axes, [punches[0]]), // only the first punch reflected fully, second punch's group missing
      computeHoles(axes, [punches[0], nudge(punches[1], 5, -5)]), // second punch's whole group shifted
    ];
    const correctIndex = (i + 1) % 4;
    const { contents: optionHoleSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctHoles,
      distractorHoleSets,
      [
        { en: "Only reflects across one of the two fold lines — half of each punch's group of holes is missing.", hi: "दो में से केवल एक तह रेखा के आर-पार परावर्तित करता है — हर पंच के छेद-समूह का आधा हिस्सा गायब है।" },
        { en: "Fully reflects the first punch (4 holes), but completely forgets the second punch's group.", hi: "पहले पंच को पूरी तरह परावर्तित करता है (4 छेद), पर दूसरे पंच के समूह को पूरी तरह भूल जाता है।" },
        { en: "The first punch's group of four is correct, but the second punch's position is off, shifting its whole group.", hi: "पहले पंच के चार का समूह सही है, पर दूसरे पंच की स्थिति गलत है, जिससे उसका पूरा समूह खिसक जाता है।" },
      ]
    );
    const key = `bank-ma-punchedhole-doubletwopunch-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, foldedDiagram(axes, punches), optionHoleSets);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "The paper is folded into quarters and punched TWICE before unfolding — up to 8 holes result. Which option (A-D) is correct?",
        hi: "कागज़ को चार भागों में मोड़ा गया है और खोलने से पहले दो बार पंच किया गया है — इससे 8 तक छेद बन सकते हैं। कौन-सा विकल्प (A-D) सही है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Each punch independently produces its own group of 4 (one per quarter), for ${correctHoles.length} holes total — option ${correctOption.toUpperCase()} is the only one showing both groups completely and correctly.`,
        hi: `हर पंच स्वतंत्र रूप से अपने 4 का समूह बनाता है (हर चौथाई में एक), कुल ${correctHoles.length} छेद — विकल्प ${correctOption.toUpperCase()} ही दोनों समूहों को पूरी तरह और सही ढंग से दिखाता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (b) ×5: a DIAGONAL fold, one or two punch points ────────
function diagonalFoldQuestions(): GeneratedQuestion[] {
  const params: { axis: Axis; punches: Point[] }[] = [
    { axis: "diagonal-main", punches: [[15, 5]] },
    { axis: "diagonal-anti", punches: [[5, 15]] },
    { axis: "diagonal-main", punches: [[18, -5]] },
    { axis: "diagonal-anti", punches: [[10, 5]] },
    { axis: "diagonal-main", punches: [[8, -12]] },
  ];
  return params.map(({ axis, punches }, i) => {
    const correctHoles = computeHoles([axis], punches);
    const otherDiagonal: Axis = axis === "diagonal-main" ? "diagonal-anti" : "diagonal-main";
    const distractorHoleSets: [Point[], Point[], Point[]] = [
      [...punches], // forgot the fold — only the original punch(es) shown
      computeHoles([otherDiagonal], punches), // reflected across the OTHER diagonal instead
      computeHoles(["vertical"], punches), // treated a diagonal fold as if it were a plain vertical fold
    ];
    const correctIndex = (i + 2) % 4;
    const { contents: optionHoleSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctHoles,
      distractorHoleSets,
      [
        { en: "Shows only the original punch — forgets the diagonal fold produces a reflected partner across that line.", hi: "केवल मूल पंच दिखाता है — भूल जाता है कि विकर्ण तह उस रेखा के आर-पार एक परावर्तित साथी बनाती है।" },
        { en: "Reflects across the WRONG diagonal — the paper was folded along the other one.", hi: "गलत विकर्ण के आर-पार परावर्तित करता है — कागज़ दूसरे विकर्ण पर मोड़ा गया था।" },
        { en: "Treats this as an ordinary up-down-or-side fold instead of a diagonal one — a completely different axis.", hi: "इसे एक विकर्ण तह के बजाय एक सामान्य ऊपर-नीचे या बगल की तह मान लेता है — यह बिल्कुल अलग अक्ष है।" },
      ]
    );
    const key = `bank-ma-punchedhole-diagonal-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, foldedDiagram([axis], punches), optionHoleSets);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "This time the paper is folded along a DIAGONAL crease. Which option (A-D) shows it correctly unfolded?",
        hi: "इस बार कागज़ को एक विकर्ण तह पर मोड़ा गया है। कौन-सा विकल्प (A-D) इसे सही ढंग से खुला हुआ दिखाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Reflecting across the diagonal fold swaps a point's position across that line — option ${correctOption.toUpperCase()} is the only one with the punch's true diagonal partner.`,
        hi: `विकर्ण तह के आर-पार परावर्तित करने पर एक बिंदु की स्थिति उस रेखा के आर-पार बदल जाती है — विकल्प ${correctOption.toUpperCase()} ही पंच के सही विकर्ण साथी को दिखाता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (c) ×5: double fold, punch at the CENTER (both lines
// cross there) — the most extreme degenerate case, only 1 resulting hole ─
function centerPunchQuestions(): GeneratedQuestion[] {
  const axes: [Axis, Axis] = ["vertical", "horizontal"];
  const params: { punch: Point; isCenterCase: boolean }[] = [
    { punch: [0, 0], isCenterCase: true },
    { punch: [12, 15], isCenterCase: false },
    { punch: [0, 0], isCenterCase: true },
    { punch: [18, 10], isCenterCase: false },
    { punch: [0, 0], isCenterCase: true },
  ];
  return params.map(({ punch, isCenterCase }, i) => {
    const correctHoles = computeHoles(axes, [punch]);
    // Three of these five items share the identical [0,0] punch (that's the
    // whole point of "center case") — varying this offset by `i` keeps the
    // distractors (and so the full diagram) genuinely different between
    // repeats of the same center case, since a fixed offset would otherwise
    // make items i and i+4 render byte-identical (caught by the
    // cross-question duplicate check: (i+3)%4 collides with itself every 4
    // items, and with an identical punch there was nothing else to
    // distinguish them).
    const off = 8 + i;
    const offCenterPunch: Point = [punch[0] + off, punch[1] + off];
    // Reflecting the punch itself across just one axis is only safe as a
    // distractor when the punch is a generic point — for the center case
    // (punch = origin) that reflection is a no-op and coincides with the
    // correct 1-hole answer, so every distractor here is built from the
    // shifted offCenterPunch (or a moved copy of the punch) instead,
    // guaranteeing none of them can degenerate back to the correct set.
    const distractorHoleSets: [Point[], Point[], Point[]] = [
      computeHoles(axes, [offCenterPunch]), // treats it as a generic point (4 holes) instead of recognizing the center collapses to 1
      computeHoles([axes[0]], [offCenterPunch]), // reflects only one axis, and from the wrong (shifted) position
      [nudge(punch, 6 + i, 6 + i)], // right idea (still just 1 hole), but shifted away from the true position
    ];
    const correctIndex = (i + 3) % 4;
    const { contents: optionHoleSets, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctHoles,
      distractorHoleSets,
      [
        { en: isCenterCase
          ? "Shows 4 separate holes, as if the punch were an ordinary point — but this punch sits exactly at the center, where BOTH fold lines cross, so it reflects onto itself every time and produces just 1 hole."
          : "Shows the pattern for a punch shifted away from where it actually is.",
          hi: isCenterCase
            ? "4 अलग छेद दिखाता है, जैसे पंच एक सामान्य बिंदु हो — पर यह पंच ठीक केंद्र में है, जहाँ दोनों तह रेखाएँ मिलती हैं, इसलिए यह हर बार अपनी ही जगह लौट आता है और केवल 1 छेद बनता है।"
            : "उस स्थिति के लिए पैटर्न दिखाता है जहाँ पंच वास्तव में नहीं है, बल्कि उससे खिसका हुआ है।" },
        { en: "Reflects across only one of the two fold lines.", hi: "दो में से केवल एक तह रेखा के आर-पार परावर्तित करता है।" },
        { en: "Shows the hole shifted away from its true position.", hi: "छेद को उसकी वास्तविक स्थिति से खिसका हुआ दिखाता है।" },
      ]
    );
    const key = `bank-ma-punchedhole-center-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildDiagram(key, foldedDiagram(axes, [punch]), optionHoleSets);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "Look very carefully at exactly where the punch sits. Which option (A-D) shows the correctly unfolded paper?",
        hi: "बहुत ध्यान से देखें कि पंच ठीक कहाँ स्थित है। कौन-सा विकल्प (A-D) सही ढंग से खुला हुआ कागज़ दिखाता है?",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: isCenterCase
          ? `The punch is exactly at the center, where both fold lines meet — reflecting across either line leaves it unchanged, so only ${correctHoles.length} hole results. Option ${correctOption.toUpperCase()} is the only one showing this correctly.`
          : `The punch is a generic point, so both folds apply normally, giving ${correctHoles.length} holes — option ${correctOption.toUpperCase()} is the only one with them in the correct positions.`,
        hi: isCenterCase
          ? `पंच ठीक केंद्र में है, जहाँ दोनों तह रेखाएँ मिलती हैं — किसी भी रेखा के आर-पार परावर्तित होने पर यह अपरिवर्तित रहता है, इसलिए केवल ${correctHoles.length} छेद बनता है। विकल्प ${correctOption.toUpperCase()} ही इसे सही ढंग से दिखाता है।`
          : `पंच एक सामान्य बिंदु है, इसलिए दोनों तह सामान्य रूप से लागू होती हैं, जिससे ${correctHoles.length} छेद बनते हैं — विकल्प ${correctOption.toUpperCase()} ही उन्हें सही स्थिति में दिखाता है।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildPunchedHolePatternQuestions(): GeneratedQuestion[] {
  const all = [
    ...singleFoldQuestions(),
    ...doubleFoldQuestions(),
    ...twoPunchesQuestions(),
    ...onFoldLineQuestions(),
    ...doubleFoldTwoPunchesQuestions(),
    ...diagonalFoldQuestions(),
    ...centerPunchQuestions(),
  ];
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Punched Hole Pattern pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}
