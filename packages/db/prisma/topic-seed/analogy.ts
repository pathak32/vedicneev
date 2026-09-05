import { labeledCell, separator, shapeMarkup, svgDocument, transformed, type ShapeName } from "./svg-shapes";
import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question visual Analogy pool (Mental Ability →
 * "analogy" topic, new): 10 Easy / 15 Moderate / 15 Hard. Each item is
 * "A is to B as C is to ?" — the SAME rule that turns A into B (a
 * rotation, a mirror, a shape-count change, or a fixed shape-identity
 * mapping) must be applied to C. Reuses figure-matching.ts/figure-series
 * .ts's shared shape/transform primitives; see svg-shapes.ts for the
 * symmetry caveat on "arrow" (fine for every family here, all of which
 * are rotation/count/identity based, never a horizontal-axis reflection).
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

/** Lays out A, →, B, gap, C, →, ?, gap, then the 4 lettered option cells. */
function buildAnalogyDiagram(key: string, aMarkup: string, bMarkup: string, cMarkup: string, optionMarkups: string[]): { type: "svg"; markup: string } {
  assertDistinctFigures(key, optionMarkups);
  const row = [
    labeledCell(0, "A", aMarkup),
    separator(115),
    labeledCell(140, "B", bMarkup),
    labeledCell(260, "C", cMarkup),
    separator(375),
    labeledCell(400, "?", ""),
  ];
  const gap = 520;
  const optionCells = optionMarkups.map((m, i) => labeledCell(gap + i * 100, OPTION_IDS[i]!.toUpperCase(), m));
  const width = gap + optionMarkups.length * 100;
  return { type: "svg", markup: svgDocument([...row, ...optionCells].join(""), width) };
}

function countMarkup(shape: ShapeName, count: number): string {
  const maxSpan = 64;
  const spacing = count > 1 ? Math.min(22, maxSpan / (count - 1)) : 0;
  const scale = count > 4 ? 0.4 : 0.55;
  const startX = -((count - 1) * spacing) / 2;
  const copies = Array.from({ length: count }, (_, i) => `<g transform="translate(${startX + i * spacing},0) scale(${scale})">${shapeMarkup(shape)}</g>`);
  return `<g>${copies.join("")}</g>`;
}

/** Finds an angle (base + one of several fixed offsets, mod 360) not already in `avoid`. */
function pickDistinctAngle(avoid: number[], base: number): number {
  const offsets = [90, 60, 120, 45, 135, 150, 30, 15];
  for (const off of offsets) {
    const candidate = (base + off) % 360;
    if (!avoid.includes(candidate)) return candidate;
  }
  throw new Error(`pickDistinctAngle: exhausted offsets avoiding [${avoid.join(",")}] from base ${base}.`);
}

function padDistinct(base: number[], target: number, correct: number, step: number): number[] {
  const values = Array.from(new Set(base));
  for (let attempt = 0; values.length < target && attempt < 30; attempt++) {
    const candidate = (correct + step * (attempt + 1)) % 360;
    if (candidate !== correct && !values.includes(candidate)) values.push(candidate);
  }
  if (values.length < target) throw new Error(`padDistinct: could not reach ${target} distinct values.`);
  return values.slice(0, target);
}

// ── EASY (×10): rotation analogy, 90°-multiple, same shape throughout ────
function rightAngleAnalogyQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; angleAB: 90 | 180 | 270; startC: number }[] = [
    { shape: "arrow", angleAB: 90, startC: 0 }, { shape: "arrow", angleAB: 90, startC: 90 },
    { shape: "flag", angleAB: 180, startC: 0 }, { shape: "flag", angleAB: 90, startC: 180 },
    { shape: "triangle", angleAB: 90, startC: 0 }, { shape: "triangle", angleAB: 270, startC: 90 },
    { shape: "ltromino", angleAB: 90, startC: 0 }, { shape: "ltromino", angleAB: 180, startC: 90 },
    { shape: "arrow", angleAB: 270, startC: 0 }, { shape: "flag", angleAB: 270, startC: 90 },
  ];
  return params.map(({ shape, angleAB, startC }, i) => {
    const aAngle = 0;
    const bAngle = angleAB;
    const cAngle = startC;
    const correctAngle = (startC + angleAB) % 360;
    const aMarkup = transformed(shape, aAngle, false);
    const bMarkup = transformed(shape, bAngle, false);
    const cMarkup = transformed(shape, cAngle, false);
    const distractorBase = [cAngle, (correctAngle + angleAB) % 360, bAngle].filter((v) => v !== correctAngle);
    const distractorAngles = padDistinct(distractorBase, 3, correctAngle, 45) as [number, number, number];
    const correctMarkup = transformed(shape, correctAngle, false);
    const distractorMarkups = distractorAngles.map((a) => transformed(shape, a, false)) as [string, string, string];
    const correctIndex = i % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Shows C left unrotated, or rotated by a different amount than the A→B rule — the analogy's rule was not applied correctly.", hi: "C को बिना घुमाए या A→B के नियम से भिन्न मात्रा में घुमाकर दिखाता है — सादृश्य का नियम सही ढंग से लागू नहीं किया गया।" },
        { en: "Applies the rotation twice instead of once, overshooting past the correct answer.", hi: "घुमाव को एक बार के बजाय दो बार लागू कर देता है, जिससे सही उत्तर से आगे निकल जाता है।" },
        { en: "Copies figure B directly instead of applying the A→B rule to C — confuses 'what B looks like' with 'what rule to apply'.", hi: "C पर A→B का नियम लागू करने के बजाय सीधे आकृति B की नकल कर देता है — 'B कैसा दिखता है' और 'कौन-सा नियम लागू करना है' में भ्रम।" },
      ]
    );
    const key = `bank-ma-analogy-rightangle-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildAnalogyDiagram(key, aMarkup, bMarkup, cMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY",
      content: {
        en: `A is to B as C is to ? The same rule that turns A into B (a ${angleAB}° clockwise rotation) must be applied to C.`,
        hi: `A का B से वही संबंध है जो C का ? से है। जो नियम A को B में बदलता है (${angleAB}° दक्षिणावर्त घुमाव), वही नियम C पर लागू करना है।`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `A becomes B by rotating ${angleAB}° clockwise. Applying the same ${angleAB}° rotation to C gives ${correctAngle}° (mod 360°), shown in option ${correctOption.toUpperCase()}.`,
        hi: `A, ${angleAB}° दक्षिणावर्त घुमाकर B बनता है। C पर वही ${angleAB}° घुमाव लागू करने पर ${correctAngle}° (mod 360°) मिलता है, जो विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (a) ×5: rotation analogy, non-right-angle ─────────────
function obliqueAnalogyQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; angleAB: number; startC: number }[] = [
    { shape: "arrow", angleAB: 30, startC: 0 },
    { shape: "flag", angleAB: 45, startC: 90 },
    { shape: "triangle", angleAB: 60, startC: 0 },
    { shape: "ltromino", angleAB: 72, startC: 45 },
    { shape: "arrow", angleAB: 40, startC: 10 },
  ];
  return params.map(({ shape, angleAB, startC }, i) => {
    const bMarkup = transformed(shape, angleAB, false);
    const aMarkup = transformed(shape, 0, false);
    const cMarkup = transformed(shape, startC, false);
    const correctAngle = (startC + angleAB) % 360;
    const distractorBase = [startC, (correctAngle + angleAB) % 360, angleAB].filter((v) => v !== correctAngle);
    const distractorAngles = padDistinct(distractorBase, 3, correctAngle, 17) as [number, number, number];
    const correctMarkup = transformed(shape, correctAngle, false);
    const distractorMarkups = distractorAngles.map((a) => transformed(shape, a, false)) as [string, string, string];
    const correctIndex = (i + 1) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Shows C left unrotated instead of applying the A→B rule to it.", hi: "C पर A→B का नियम लागू करने के बजाय उसे बिना घुमाए दिखाता है।" },
        { en: "Applies the rotation twice instead of once.", hi: "घुमाव को एक बार के बजाय दो बार लागू कर देता है।" },
        { en: "Uses the A→B angle itself as the answer, instead of adding it to C's own starting angle.", hi: "C के अपने आरंभिक कोण में जोड़ने के बजाय A→B के कोण को ही उत्तर मान लेता है।" },
      ]
    );
    const key = `bank-ma-analogy-oblique-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildAnalogyDiagram(key, aMarkup, bMarkup, cMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `A is to B as C is to ? The same rule that turns A into B (a ${angleAB}° clockwise rotation) must be applied to C.`,
        hi: `A का B से वही संबंध है जो C का ? से है। जो नियम A को B में बदलता है (${angleAB}° दक्षिणावर्त घुमाव), वही C पर लागू करना है।`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `A becomes B by rotating ${angleAB}° clockwise. Applying the same rotation to C gives ${correctAngle}° (mod 360°), shown in option ${correctOption.toUpperCase()}.`,
        hi: `A, ${angleAB}° घुमाकर B बनता है। C पर वही घुमाव लागू करने पर ${correctAngle}° (mod 360°) मिलता है, जो विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (b) ×5: mirror analogy ─────────────────────────────────
// "arrow" is excluded here: it has one line of symmetry along its own shaft,
// and at a 90° rotation (used for C below) a vertical mirror (scale(-1,1))
// leaves it pixel-identical to the unmirrored figure — verified by comparing
// rotated point sets directly, not by eye. flag/triangle/ltromino have no
// symmetry axis at all, so they're safe for any rotation+mirror combination.
function mirrorAnalogyQuestions(): GeneratedQuestion[] {
  const shapes: ShapeName[] = ["flag", "triangle", "ltromino", "flag", "triangle"];
  return shapes.map((shape, i) => {
    const aMarkup = transformed(shape, 0, false);
    const bMarkup = transformed(shape, 0, true); // A -> B is a plain mirror
    const cMarkup = transformed(shape, 90, false); // C starts at a different angle, to check the RULE (mirror) is applied, not a copy of B
    const correctMarkup = transformed(shape, 90, true);
    const distractorMarkups: [string, string, string] = [
      transformed(shape, 90, false), // unmirrored — rule not applied
      transformed(shape, 0, true), // mirrored but reverted to A's angle instead of C's
      transformed(shape, 180, true), // mirrored, but at the wrong angle entirely
    ];
    const correctIndex = (i + 2) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Keeps C's orientation but forgets to apply the mirror flip at all.", hi: "C की दिशा तो बनाए रखता है पर दर्पण-पलट लागू करना पूरी तरह भूल जाता है।" },
        { en: "Applies the mirror flip but incorrectly reverts to A's angle instead of keeping C's own starting angle.", hi: "दर्पण-पलट तो लागू करता है पर गलती से C के अपने आरंभिक कोण के बजाय A के कोण पर वापस चला जाता है।" },
        { en: "Applies the mirror flip but at a completely wrong angle, unrelated to C's actual orientation.", hi: "दर्पण-पलट तो लागू करता है पर एक बिल्कुल गलत कोण पर, जिसका C की वास्तविक दिशा से कोई संबंध नहीं है।" },
      ]
    );
    const key = `bank-ma-analogy-mirror-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildAnalogyDiagram(key, aMarkup, bMarkup, cMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: "A is to B as C is to ? The same rule that turns A into B (a mirror flip) must be applied to C.",
        hi: "A का B से वही संबंध है जो C का ? से है। जो नियम A को B में बदलता है (दर्पण-पलट), वही C पर लागू करना है।",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `A becomes B by a mirror flip, with no rotation. Applying the same mirror flip to C (keeping C's own orientation) gives the figure in option ${correctOption.toUpperCase()}.`,
        hi: `A बिना किसी घुमाव के दर्पण-पलट से B बनता है। C पर वही दर्पण-पलट लागू करने पर (C की अपनी दिशा बनाए रखते हुए) विकल्प ${correctOption.toUpperCase()} में दिखाई गई आकृति मिलती है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (c) ×5: shape-count analogy ────────────────────────────
function countAnalogyQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; nA: number; delta: number; nC: number }[] = [
    { shape: "arrow", nA: 1, delta: 1, nC: 2 },
    { shape: "flag", nA: 2, delta: 2, nC: 1 },
    { shape: "triangle", nA: 1, delta: 2, nC: 3 },
    { shape: "ltromino", nA: 2, delta: 1, nC: 4 },
    { shape: "arrow", nA: 3, delta: 1, nC: 1 },
  ];
  return params.map(({ shape, nA, delta, nC }, i) => {
    const nB = nA + delta;
    const correctCount = nC + delta;
    const aMarkup = countMarkup(shape, nA);
    const bMarkup = countMarkup(shape, nB);
    const cMarkup = countMarkup(shape, nC);
    const distractorCountBase = [nC, Math.max(1, correctCount - 1), correctCount + 1].filter((v) => v !== correctCount);
    const distractorCounts: number[] = Array.from(new Set(distractorCountBase));
    for (let attempt = 0; distractorCounts.length < 3 && attempt < 20; attempt++) {
      const candidate = correctCount + attempt + 2;
      if (candidate !== correctCount && !distractorCounts.includes(candidate)) distractorCounts.push(candidate);
    }
    if (distractorCounts.length < 3) throw new Error(`${shape}: could not find 3 distinct distractor counts.`);
    const correctMarkup = countMarkup(shape, correctCount);
    const distractorMarkups = distractorCounts.slice(0, 3).map((c) => countMarkup(shape, c)) as [string, string, string];
    const correctIndex = (i + 3) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Repeats C's own count instead of applying the change observed between A and B.", hi: "A और B के बीच देखे गए परिवर्तन को लागू करने के बजाय C की अपनी संख्या को ही दोहरा देता है।" },
        { en: "Applies one less than the correct change to C's count.", hi: "C की संख्या पर सही परिवर्तन से एक कम लागू करता है।" },
        { en: "Applies one more than the correct change to C's count.", hi: "C की संख्या पर सही परिवर्तन से एक अधिक लागू करता है।" },
      ]
    );
    const key = `bank-ma-analogy-count-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildAnalogyDiagram(key, aMarkup, bMarkup, cMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `A is to B as C is to ? The number of figures changes from A to B by ${delta >= 0 ? "+" : ""}${delta}; apply the same change to C.`,
        hi: `A का B से वही संबंध है जो C का ? से है। A से B तक आकृतियों की संख्या ${delta >= 0 ? "+" : ""}${delta} से बदलती है; वही परिवर्तन C पर लागू करें।`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `A has ${nA} and B has ${nB} — a change of ${delta}. C has ${nC}, so the answer has ${nC} + ${delta} = ${correctCount}, shown in option ${correctOption.toUpperCase()}.`,
        hi: `A में ${nA} और B में ${nB} हैं — ${delta} का परिवर्तन। C में ${nC} हैं, इसलिए उत्तर में ${nC} + ${delta} = ${correctCount} होने चाहिए, जो विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (d) ×5: combined rotation + mirror analogy ──────────────
function combinedAnalogyQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; angleAB: number; startC: number }[] = [
    { shape: "flag", angleAB: 90, startC: 0 },
    { shape: "triangle", angleAB: 180, startC: 45 },
    { shape: "ltromino", angleAB: 90, startC: 90 },
    { shape: "flag", angleAB: 45, startC: 180 },
    { shape: "triangle", angleAB: 270, startC: 0 },
  ];
  return params.map(({ shape, angleAB, startC }, i) => {
    // A->B is: rotate by angleAB AND mirror.
    const aMarkup = transformed(shape, 0, false);
    const bMarkup = transformed(shape, angleAB, true);
    const cMarkup = transformed(shape, startC, false);
    const correctAngle = (startC + angleAB) % 360;
    const overshootAngle = pickDistinctAngle([correctAngle, startC], correctAngle);
    const correctMarkup = transformed(shape, correctAngle, true);
    const distractorMarkups: [string, string, string] = [
      transformed(shape, correctAngle, false), // rotated but NOT mirrored — forgot half the rule
      transformed(shape, startC, true), // mirrored but NOT rotated — forgot the other half
      transformed(shape, overshootAngle, true), // rotate+mirror but a different (wrong) rotation amount
    ];
    const correctIndex = i % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Applies the rotation correctly but forgets the mirror flip — only half the rule.", hi: "घुमाव तो सही लागू करता है पर दर्पण-पलट भूल जाता है — नियम का केवल आधा हिस्सा।" },
        { en: "Applies the mirror flip correctly but forgets the rotation — only the other half of the rule.", hi: "दर्पण-पलट तो सही लागू करता है पर घुमाव भूल जाता है — नियम का दूसरा आधा हिस्सा।" },
        { en: "Applies both parts of the rule, but rotates by a different (wrong) amount.", hi: "नियम के दोनों हिस्से लागू करता है, पर घुमाव एक भिन्न (गलत) मात्रा में करता है।" },
      ]
    );
    const key = `bank-ma-analogy-combined-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildAnalogyDiagram(key, aMarkup, bMarkup, cMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `A is to B as C is to ? The rule from A to B combines a ${angleAB}° clockwise rotation AND a mirror flip; apply BOTH to C.`,
        hi: `A का B से वही संबंध है जो C का ? से है। A से B का नियम ${angleAB}° दक्षिणावर्त घुमाव और दर्पण-पलट दोनों को मिलाता है; दोनों को C पर लागू करें।`,
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `A becomes B by rotating ${angleAB}° AND mirroring. Applying both to C gives it rotated to ${correctAngle}° (mod 360°) and mirrored, shown in option ${correctOption.toUpperCase()}.`,
        hi: `A, ${angleAB}° घुमाकर और दर्पण-पलट करके B बनता है। C पर दोनों लागू करने पर वह ${correctAngle}° (mod 360°) पर घुमा हुआ और दर्पण-प्रतिबिंबित मिलता है, जो विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (e) ×5: extract-the-rule (different starting angles) ────
function extractRuleAnalogyQuestions(): GeneratedQuestion[] {
  const params: { shape: ShapeName; startA: number; angleAB: number; startC: number }[] = [
    { shape: "arrow", startA: 20, angleAB: 50, startC: 100 },
    { shape: "flag", startA: 10, angleAB: 70, startC: 200 },
    { shape: "triangle", startA: 0, angleAB: 35, startC: 250 },
    { shape: "ltromino", startA: 15, angleAB: 90, startC: 60 },
    { shape: "arrow", startA: 5, angleAB: 100, startC: 150 },
  ];
  return params.map(({ shape, startA, angleAB, startC }, i) => {
    const aMarkup = transformed(shape, startA, false);
    const bMarkup = transformed(shape, (startA + angleAB) % 360, false);
    const cMarkup = transformed(shape, startC, false);
    const correctAngle = (startC + angleAB) % 360;
    const distractorBase = [(startA + angleAB) % 360, startC, (correctAngle + angleAB) % 360].filter((v) => v !== correctAngle);
    const distractorAngles = padDistinct(distractorBase, 3, correctAngle, 13) as [number, number, number];
    const correctMarkup = transformed(shape, correctAngle, false);
    const distractorMarkups = distractorAngles.map((a) => transformed(shape, a, false)) as [string, string, string];
    const correctIndex = (i + 1) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      [
        { en: "Mistakenly copies B's own absolute angle onto C, instead of extracting and re-applying the +angle RULE from A to B.", hi: "A से B तक के +कोण नियम को निकालकर पुनः लागू करने के बजाय, गलती से B के स्वयं के निरपेक्ष कोण को C पर कॉपी कर देता है।" },
        { en: "Leaves C completely unrotated, as if no rule needed to be applied at all.", hi: "C को बिल्कुल बिना घुमाए छोड़ देता है, जैसे कोई नियम लागू करने की आवश्यकता ही न हो।" },
        { en: "Applies the correct rule but one extra time, overshooting past the right answer.", hi: "सही नियम तो लागू करता है पर एक बार अतिरिक्त, जिससे सही उत्तर से आगे निकल जाता है।" },
      ]
    );
    const key = `bank-ma-analogy-extractrule-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildAnalogyDiagram(key, aMarkup, bMarkup, cMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "A is to B as C is to ? Find the rotation rule from A to B (it is NOT simply B's own angle), then apply that same amount of rotation to C.",
        hi: "A का B से वही संबंध है जो C का ? से है। पहले A से B तक का घुमाव नियम पता करें (यह केवल B का अपना कोण नहीं है), फिर उतना ही घुमाव C पर लागू करें।",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `A is at ${startA}° and B is at ${(startA + angleAB) % 360}°, so the rule is "add ${angleAB}°". Applying that to C's own ${startC}° gives ${correctAngle}° (mod 360°), shown in option ${correctOption.toUpperCase()}.`,
        hi: `A ${startA}° पर है और B ${(startA + angleAB) % 360}° पर है, इसलिए नियम है "${angleAB}° जोड़ें"। C के अपने ${startC}° पर यह लागू करने पर ${correctAngle}° (mod 360°) मिलता है, जो विकल्प ${correctOption.toUpperCase()} में दिखाया गया है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (f) ×5: fixed shape-identity mapping analogy ────────────
const IDENTITY_MAP: Record<ShapeName, ShapeName> = {
  arrow: "flag",
  flag: "triangle",
  triangle: "ltromino",
  ltromino: "arrow",
};

function identityMappingAnalogyQuestions(): GeneratedQuestion[] {
  const starts: ShapeName[] = ["arrow", "flag", "triangle", "ltromino", "arrow"];
  return starts.map((startShape, i) => {
    const aShape = startShape;
    const bShape = IDENTITY_MAP[aShape]!;
    // Pick a different starting shape for C so the answer can't be copied from B.
    const cShape = IDENTITY_MAP[bShape]!; // one step further around the cycle, still distinct from aShape/bShape
    const correctShape = IDENTITY_MAP[cShape]!;
    const aMarkup = transformed(aShape, 0, false);
    const bMarkup = transformed(bShape, 0, false);
    const cMarkup = transformed(cShape, 0, false);
    const wrongShapes: ShapeName[] = (Object.keys(IDENTITY_MAP) as ShapeName[]).filter((s) => s !== correctShape);
    // Ensure exactly 3 distinct distractor shapes (distinct from correctShape and each other).
    const distractorShapes: ShapeName[] = [];
    for (const candidate of [aShape, bShape, cShape, ...wrongShapes]) {
      if (distractorShapes.length >= 3) break;
      if (candidate !== correctShape && !distractorShapes.includes(candidate)) distractorShapes.push(candidate);
    }
    const reasonFor = (s: ShapeName): LangText => {
      if (s === aShape) return { en: "Repeats A's own figure instead of applying the mapping rule to C.", hi: "C पर मानचित्रण नियम लागू करने के बजाय A की अपनी आकृति को ही दोहरा देता है।" };
      if (s === bShape) return { en: "Repeats B's figure — correct for the A pair, but not the figure C maps to.", hi: "B की आकृति को दोहरा देता है — यह A के जोड़े के लिए सही है, पर C जिस आकृति में बदलती है वह नहीं।" };
      if (s === cShape) return { en: "Repeats C's own figure, as if no mapping rule needed to be applied at all.", hi: "C की अपनी आकृति को ही दोहरा देता है, जैसे कोई मानचित्रण नियम लागू करने की आवश्यकता ही न हो।" };
      return { en: "A figure unrelated to any step in the mapping chain from A, B, or C.", hi: "A, B या C से मानचित्रण श्रृंखला के किसी भी चरण से असंबंधित एक आकृति।" };
    };
    const correctMarkup = transformed(correctShape, 0, false);
    const distractorMarkups = distractorShapes.map((s) => transformed(s, 0, false)) as [string, string, string];
    const distractorReasons = distractorShapes.map(reasonFor) as [LangText, LangText, LangText];
    const correctIndex = (i + 2) % 4;
    const { contents: optionMarkups, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctMarkup,
      distractorMarkups,
      distractorReasons
    );
    const key = `bank-ma-analogy-identitymap-${String(i + 1).padStart(2, "0")}`;
    const diagram = buildAnalogyDiagram(key, aMarkup, bMarkup, cMarkup, optionMarkups);
    const options = buildOptions();
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: "A is to B as C is to ? Figure out which figure A always becomes, then apply that same figure-to-figure rule to C.",
        hi: "A का B से वही संबंध है जो C का ? से है। पता करें कि आकृति A हमेशा किस आकृति में बदलती है, फिर वही आकृति-से-आकृति नियम C पर लागू करें।",
      },
      options: options as [OptionSeed, OptionSeed, OptionSeed, OptionSeed],
      correctOption,
      figureMetadata: diagram,
      explanation: {
        en: `Each figure always maps to one specific other figure, regardless of rotation. Applying C's mapping gives the figure shown in option ${correctOption.toUpperCase()}.`,
        hi: `प्रत्येक आकृति हमेशा एक विशेष अन्य आकृति में बदलती है, घुमाव से स्वतंत्र। C पर यह मानचित्रण लागू करने पर विकल्प ${correctOption.toUpperCase()} में दिखाई गई आकृति मिलती है।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildAnalogyQuestions(): GeneratedQuestion[] {
  const all = [
    ...rightAngleAnalogyQuestions(),
    ...obliqueAnalogyQuestions(),
    ...mirrorAnalogyQuestions(),
    ...countAnalogyQuestions(),
    ...combinedAnalogyQuestions(),
    ...extractRuleAnalogyQuestions(),
    ...identityMappingAnalogyQuestions(),
  ];
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Analogy pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}
