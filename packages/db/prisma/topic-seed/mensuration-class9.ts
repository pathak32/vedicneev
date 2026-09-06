import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Class 9 Mensuration pool (Mathematics ->
 * "mensuration_class9" topic): 10 Easy / 15 Moderate / 15 Hard, covering
 * the real Class 9 "Surface Areas and Volumes" chapter — cylinders, cones
 * (including slant height via Pythagorean triples), and spheres — a step
 * up from the Class 6 area-perimeter-volume pool's rectangles/circles/
 * cuboids. π = 22/7 throughout (same convention as the Class 6 pool), and
 * every radius is chosen so the arithmetic cancels cleanly against the /7.
 * Every correct answer is computed by the real mensuration formulas —
 * never hand-typed — and assertDistinctOptions guards against a
 * construction bug seeding a broken question.
 */

const OPTION_IDS = ["a", "b", "c", "d"] as const;
const PI = 22 / 7;

/** Rounds to 2 decimal places — every value derived from π = 22/7 must go through this before being displayed anywhere (options AND explanation text), since raw floating-point arithmetic leaves noise like 461.99999999999994 for what should read as a clean 462. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Formats a rounded value as a string, dropping a trailing ".00" for a clean whole-number display. Used for both option text and explanation text so the two always agree. */
function fmt(n: number): string {
  const rounded = round2(n);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

function numText(n: number): LangText {
  const s = fmt(n);
  return { en: s, hi: s };
}

function padDistinctNumbers(base: number[], target: number, correct: number, step: number): number[] {
  const values = Array.from(new Set(base.map(round2).filter((v) => v !== round2(correct))));
  for (let attempt = 0; values.length < target && attempt < 30; attempt++) {
    const candidate = round2(correct + step * (attempt + 2) * (attempt % 2 === 0 ? 1 : -1));
    if (candidate !== round2(correct) && !values.includes(candidate)) values.push(candidate);
  }
  if (values.length < target) throw new Error(`padDistinctNumbers: could not reach ${target} distinct values.`);
  return values.slice(0, target);
}

function buildQuestion(
  correctIndex: number,
  correctValue: number,
  distractorValues: [number, number, number],
  distractorReasons: [LangText, LangText, LangText]
) {
  const { contents, correctOption, distractorAnalysis } = distributeCorrectPosition(
    correctIndex,
    correctValue,
    distractorValues,
    distractorReasons
  );
  const options = OPTION_IDS.map((id, i) => ({ id, text: numText(contents[i]!) })) as [
    OptionSeed,
    OptionSeed,
    OptionSeed,
    OptionSeed,
  ];
  return { options, correctOption, distractorAnalysis };
}

// ── EASY (×10): curved surface area of a cylinder, 2πrh ──────────────────
function cylinderCsaQuestions(): GeneratedQuestion[] {
  const params: { r: number; h: number }[] = [
    { r: 7, h: 10 },
    { r: 14, h: 6 },
    { r: 21, h: 4 },
    { r: 7, h: 15 },
    { r: 14, h: 8 },
    { r: 21, h: 5 },
    { r: 7, h: 20 },
    { r: 28, h: 3 },
    { r: 14, h: 10 },
    { r: 7, h: 25 },
  ];
  return params.map(({ r, h }, i) => {
    const correct = 2 * PI * r * h;
    const forgotTwo = PI * r * h;
    const usedTsa = 2 * PI * r * (r + h);
    const usedVolume = PI * r * r * h;
    const distractors = padDistinctNumbers([forgotTwo, usedTsa, usedVolume], 3, correct, 20) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(i % 4, correct, distractors, [
      { en: `Forgets the factor of 2 — computes πrh instead of 2πrh.`, hi: `2 के गुणांक को भूल जाता है — 2πrh के बजाय πrh की गणना करता है।` },
      { en: `Uses the Total Surface Area formula 2πr(r+h) instead of the Curved Surface Area formula 2πrh.`, hi: `वक्र पृष्ठीय क्षेत्रफल सूत्र 2πrh के बजाय कुल पृष्ठीय क्षेत्रफल सूत्र 2πr(r+h) का उपयोग करता है।` },
      { en: `Uses the Volume formula πr²h instead of the Curved Surface Area formula.`, hi: `वक्र पृष्ठीय क्षेत्रफल सूत्र के बजाय आयतन सूत्र πr²h का उपयोग करता है।` },
    ]);
    const key = `bank-math9-mensuration-cylindercsa-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY" as const,
      content: {
        en: `Find the curved surface area of a cylinder with radius ${r} cm and height ${h} cm. (Use π = 22/7)`,
        hi: `${r} सेमी त्रिज्या और ${h} सेमी ऊंचाई वाले एक बेलन का वक्र पृष्ठीय क्षेत्रफल ज्ञात करें। (π = 22/7 का उपयोग करें)`,
      },
      options,
      correctOption,
      explanation: {
        en: `CSA = 2πrh = 2 × 22/7 × ${r} × ${h} = ${fmt(correct)} cm².`,
        hi: `वक्र पृष्ठीय क्षेत्रफल = 2πrh = 2 × 22/7 × ${r} × ${h} = ${fmt(correct)} सेमी²।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM (×8): volume of a cone, (1/3)πr²h, r = 7 throughout ───────────
function coneVolumeQuestions(): GeneratedQuestion[] {
  const hValues = [3, 6, 9, 12, 15, 18, 21, 24];
  const r = 7;
  return hValues.map((h, i) => {
    const correct = (1 / 3) * PI * r * r * h;
    const forgotOneThird = PI * r * r * h;
    const forgotSquareR = (1 / 3) * PI * r * h;
    const usedFourThirds = (4 / 3) * PI * r * r * h;
    const distractors = padDistinctNumbers([forgotOneThird, forgotSquareR, usedFourThirds], 3, correct, 22) as [
      number,
      number,
      number,
    ];
    const { options, correctOption, distractorAnalysis } = buildQuestion(i % 4, correct, distractors, [
      { en: `Forgets the ⅓ factor — computes the full cylinder volume πr²h instead of the cone's ⅓ of it.`, hi: `⅓ के गुणांक को भूल जाता है — बेलन का पूरा आयतन πr²h निकाल देता है, शंकु के ⅓ के बजाय।` },
      { en: `Forgets to square the radius — uses πrh instead of πr²h.`, hi: `त्रिज्या का वर्ग करना भूल जाता है — πr²h के बजाय πrh का उपयोग करता है।` },
      { en: `Uses ⁴⁄₃ (the sphere-volume constant) instead of ⅓.`, hi: `⅓ के बजाय ⁴⁄₃ (गोले के आयतन का गुणांक) का उपयोग करता है।` },
    ]);
    const key = `bank-math9-mensuration-conevolume-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM" as const,
      content: {
        en: `Find the volume of a cone with radius ${r} cm and height ${h} cm. (Use π = 22/7)`,
        hi: `${r} सेमी त्रिज्या और ${h} सेमी ऊंचाई वाले एक शंकु का आयतन ज्ञात करें। (π = 22/7 का उपयोग करें)`,
      },
      options,
      correctOption,
      explanation: {
        en: `Volume = ⅓πr²h = ⅓ × 22/7 × ${r}² × ${h} = ${fmt(correct)} cm³.`,
        hi: `आयतन = ⅓πr²h = ⅓ × 22/7 × ${r}² × ${h} = ${fmt(correct)} सेमी³।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM (×7): surface area of a sphere, 4πr², r a multiple of 7 ───────
function sphereSurfaceAreaQuestions(): GeneratedQuestion[] {
  const kValues = [1, 2, 3, 4, 5, 6, 7];
  return kValues.map((k, i) => {
    const r = 7 * k;
    const correct = 4 * PI * r * r;
    const forgotFour = correct / 4;
    const usedHemisphereCsa = correct / 2;
    const wrongCube = correct * r;
    const distractors = padDistinctNumbers([forgotFour, usedHemisphereCsa, wrongCube], 3, correct, 44) as [
      number,
      number,
      number,
    ];
    const { options, correctOption, distractorAnalysis } = buildQuestion(i % 4, correct, distractors, [
      { en: `Forgets the factor of 4 — computes πr² instead of 4πr².`, hi: `4 के गुणांक को भूल जाता है — 4πr² के बजाय πr² की गणना करता है।` },
      { en: `Uses the hemisphere curved surface area formula 2πr² instead of the full sphere's 4πr².`, hi: `पूर्ण गोले के 4πr² के बजाय अर्धगोले के वक्र पृष्ठीय क्षेत्रफल सूत्र 2πr² का उपयोग करता है।` },
      { en: `Uses r³ instead of r² — confuses the surface area formula with a volume-shaped one.`, hi: `r² के बजाय r³ का उपयोग करता है — पृष्ठीय क्षेत्रफल सूत्र को आयतन-जैसे सूत्र से भ्रमित कर देता है।` },
    ]);
    const key = `bank-math9-mensuration-spheresa-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM" as const,
      content: {
        en: `Find the surface area of a sphere with radius ${r} cm. (Use π = 22/7)`,
        hi: `${r} सेमी त्रिज्या वाले एक गोले का पृष्ठीय क्षेत्रफल ज्ञात करें। (π = 22/7 का उपयोग करें)`,
      },
      options,
      correctOption,
      explanation: {
        en: `Surface Area = 4πr² = 4 × 22/7 × ${r}² = ${fmt(correct)} cm².`,
        hi: `पृष्ठीय क्षेत्रफल = 4πr² = 4 × 22/7 × ${r}² = ${fmt(correct)} सेमी²।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD (×8): total surface area of a cone via Pythagorean slant height ─
// r = 7k, h = 24k, l = 25k (scaled 7-24-25 triples, k = 1..8) so the
// slant height l = √(r²+h²) is always a clean integer.
function coneTsaQuestions(): GeneratedQuestion[] {
  const kValues = [1, 2, 3, 4, 5, 6, 7, 8];
  return kValues.map((k, i) => {
    const r = 7 * k;
    const h = 24 * k;
    const l = 25 * k;
    const correct = PI * r * (r + l);
    const forgotBaseArea = PI * r * l;
    const usedHeightNotSlant = PI * r * (r + h);
    const usedConeVolume = (1 / 3) * PI * r * r * h;
    const distractors = padDistinctNumbers([forgotBaseArea, usedHeightNotSlant, usedConeVolume], 3, correct, 55) as [
      number,
      number,
      number,
    ];
    const { options, correctOption, distractorAnalysis } = buildQuestion(i % 4, correct, distractors, [
      { en: `Computes only the Curved Surface Area (πrl) and forgets to add the base's area (πr²) for the TOTAL surface area.`, hi: `केवल वक्र पृष्ठीय क्षेत्रफल (πrl) की गणना करता है और कुल पृष्ठीय क्षेत्रफल के लिए आधार का क्षेत्रफल (πr²) जोड़ना भूल जाता है।` },
      { en: `Uses the vertical height (h) in place of the slant height (l) — the surface-area formula needs the SLANT height, not h.`, hi: `तिर्यक ऊंचाई (l) के स्थान पर ऊर्ध्वाधर ऊंचाई (h) का उपयोग करता है — पृष्ठीय क्षेत्रफल सूत्र में तिर्यक ऊंचाई चाहिए, h नहीं।` },
      { en: `Computes the cone's VOLUME instead of its surface area — an entirely different formula.`, hi: `पृष्ठीय क्षेत्रफल के बजाय शंकु का आयतन निकाल देता है — पूरी तरह अलग सूत्र।` },
    ]);
    const key = `bank-math9-mensuration-conetsa-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD" as const,
      content: {
        en: `A cone has radius ${r} cm and height ${h} cm. First find its slant height, then find its total surface area. (Use π = 22/7)`,
        hi: `एक शंकु की त्रिज्या ${r} सेमी और ऊंचाई ${h} सेमी है। पहले इसकी तिर्यक ऊंचाई ज्ञात करें, फिर इसका कुल पृष्ठीय क्षेत्रफल ज्ञात करें। (π = 22/7 का उपयोग करें)`,
      },
      options,
      correctOption,
      explanation: {
        en: `Slant height l = √(r²+h²) = √(${r}²+${h}²) = √(${r * r}+${h * h}) = √${r * r + h * h} = ${l} cm. Total Surface Area = πr(r+l) = 22/7 × ${r} × (${r}+${l}) = ${fmt(correct)} cm².`,
        hi: `तिर्यक ऊंचाई l = √(r²+h²) = √(${r}²+${h}²) = √(${r * r}+${h * h}) = √${r * r + h * h} = ${l} सेमी। कुल पृष्ठीय क्षेत्रफल = πr(r+l) = 22/7 × ${r} × (${r}+${l}) = ${fmt(correct)} सेमी²।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD (×7): volume of a sphere, (4/3)πr³, r a multiple of 7 ──────────
function sphereVolumeQuestions(): GeneratedQuestion[] {
  const kValues = [1, 2, 3, 4, 5, 6, 7];
  return kValues.map((k, i) => {
    const r = 7 * k;
    const correct = (4 / 3) * PI * r * r * r;
    const usedSurfaceAreaFormula = 4 * PI * r * r;
    const usedOneThirdNotFourThirds = correct / 4;
    const forgotToCube = (4 / 3) * PI * r * r;
    const distractors = padDistinctNumbers([usedSurfaceAreaFormula, usedOneThirdNotFourThirds, forgotToCube], 3, correct, 90) as [
      number,
      number,
      number,
    ];
    const { options, correctOption, distractorAnalysis } = buildQuestion(i % 4, correct, distractors, [
      { en: `Computes the sphere's SURFACE AREA (4πr²) instead of its volume — confuses the two formulas.`, hi: `गोले का आयतन निकालने के बजाय पृष्ठीय क्षेत्रफल (4πr²) निकाल देता है — दोनों सूत्रों को भ्रमित कर देता है।` },
      { en: `Uses ⅓ (the cone-volume constant) instead of ⁴⁄₃.`, hi: `⁴⁄₃ के बजाय ⅓ (शंकु के आयतन का गुणांक) का उपयोग करता है।` },
      { en: `Forgets to cube the radius — uses r² instead of r³.`, hi: `त्रिज्या का घन करना भूल जाता है — r³ के बजाय r² का उपयोग करता है।` },
    ]);
    const key = `bank-math9-mensuration-spherevolume-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD" as const,
      content: {
        en: `Find the volume of a sphere with radius ${r} cm. (Use π = 22/7)`,
        hi: `${r} सेमी त्रिज्या वाले एक गोले का आयतन ज्ञात करें। (π = 22/7 का उपयोग करें)`,
      },
      options,
      correctOption,
      explanation: {
        en: `Volume = ⁴⁄₃πr³ = ⁴⁄₃ × 22/7 × ${r}³ = ${fmt(correct)} cm³.`,
        hi: `आयतन = ⁴⁄₃πr³ = ⁴⁄₃ × 22/7 × ${r}³ = ${fmt(correct)} सेमी³।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildMensurationClass9Questions(): GeneratedQuestion[] {
  const all = [
    ...cylinderCsaQuestions(),
    ...coneVolumeQuestions(),
    ...sphereSurfaceAreaQuestions(),
    ...coneTsaQuestions(),
    ...sphereVolumeQuestions(),
  ].map((q) => ({ ...q, targetClass: "CLASS_9" as const }));
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Mensuration Class 9 pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}
