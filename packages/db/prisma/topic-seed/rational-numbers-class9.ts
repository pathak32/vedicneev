import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Class 9 Rational Numbers pool (Mathematics ->
 * "rational_numbers_class9" topic): 10 Easy / 15 Moderate / 15 Hard,
 * covering signed rational-number arithmetic (add/subtract/multiply/
 * divide with negatives), finding a rational number between two given
 * ones, multi-step expressions respecting order of operations, and
 * comparing fractions by cross-multiplication. Every correct answer is
 * computed by real fraction arithmetic (gcd-simplified) — never
 * hand-typed — and assertDistinctOptions guards against a construction
 * bug seeding a broken question.
 */

const OPTION_IDS = ["a", "b", "c", "d"] as const;

interface Fraction {
  n: number;
  d: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

function simplify(n: number, d: number): Fraction {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

function add(a: Fraction, b: Fraction): Fraction {
  return simplify(a.n * b.d + b.n * a.d, a.d * b.d);
}
function sub(a: Fraction, b: Fraction): Fraction {
  return simplify(a.n * b.d - b.n * a.d, a.d * b.d);
}
function mul(a: Fraction, b: Fraction): Fraction {
  return simplify(a.n * b.n, a.d * b.d);
}
function div(a: Fraction, b: Fraction): Fraction {
  return simplify(a.n * b.d, a.d * b.n);
}
function halve(a: Fraction): Fraction {
  return simplify(a.n, a.d * 2);
}
function eq(a: Fraction, b: Fraction): boolean {
  return a.n === b.n && a.d === b.d;
}

function fracText(f: Fraction): LangText {
  const s = f.d === 1 ? String(f.n) : `${f.n}/${f.d}`;
  return { en: s, hi: s };
}

function fracLabel(f: Fraction): string {
  return f.d === 1 ? String(f.n) : `${f.n}/${f.d}`;
}

function buildFractionQuestion(
  correctIndex: number,
  correctValue: Fraction,
  distractorValues: [Fraction, Fraction, Fraction],
  distractorReasons: [LangText, LangText, LangText]
) {
  const { contents, correctOption, distractorAnalysis } = distributeCorrectPosition(
    correctIndex,
    correctValue,
    distractorValues,
    distractorReasons
  );
  const options = OPTION_IDS.map((id, i) => ({ id, text: fracText(contents[i]!) })) as [
    OptionSeed,
    OptionSeed,
    OptionSeed,
    OptionSeed,
  ];
  return { options, correctOption, distractorAnalysis };
}

/** Ensures 3 distractor fractions are distinct from the correct value and from each other (by simplified n/d), padding with a small nudge if a collision happens — collisions are rare given how the callers construct these, but this guards against it silently producing a broken question. */
function distinctFractionTriplet(correct: Fraction, candidates: Fraction[]): [Fraction, Fraction, Fraction] {
  const seen = [correct];
  const out: Fraction[] = [];
  for (const c of candidates) {
    if (out.length === 3) break;
    if (seen.some((s) => eq(s, c))) continue;
    out.push(c);
    seen.push(c);
  }
  let bump = 1;
  while (out.length < 3) {
    const candidate = simplify(correct.n + bump, correct.d);
    if (!seen.some((s) => eq(s, candidate))) {
      out.push(candidate);
      seen.push(candidate);
    }
    bump++;
  }
  return out as [Fraction, Fraction, Fraction];
}

// ── EASY (×10): add/subtract two signed rationals ────────────────────────
function addSubtractQuestions(): GeneratedQuestion[] {
  const params: { a: Fraction; b: Fraction; op: "+" | "−" }[] = [
    { a: { n: 1, d: 2 }, b: { n: 1, d: 3 }, op: "+" },
    { a: { n: -2, d: 3 }, b: { n: 1, d: 4 }, op: "+" },
    { a: { n: 3, d: 4 }, b: { n: 1, d: 6 }, op: "−" },
    { a: { n: -1, d: 2 }, b: { n: 1, d: 3 }, op: "−" },
    { a: { n: 2, d: 5 }, b: { n: 3, d: 10 }, op: "+" },
    { a: { n: -3, d: 8 }, b: { n: 1, d: 2 }, op: "+" },
    { a: { n: 5, d: 6 }, b: { n: 1, d: 2 }, op: "−" },
    { a: { n: -1, d: 4 }, b: { n: 1, d: 8 }, op: "−" },
    { a: { n: 7, d: 9 }, b: { n: 2, d: 3 }, op: "−" },
    { a: { n: -5, d: 6 }, b: { n: 2, d: 3 }, op: "+" },
  ];
  return params.map(({ a, b, op }, i) => {
    const correct = op === "+" ? add(a, b) : sub(a, b);
    const oppositeOp = op === "+" ? sub(a, b) : add(a, b);
    const wrongAddDenom = simplify(a.n + b.n, a.d + b.d);
    const wrongKeepFirstDenom = simplify(op === "+" ? a.n + b.n : a.n - b.n, a.d);
    const distractors = distinctFractionTriplet(correct, [oppositeOp, wrongAddDenom, wrongKeepFirstDenom]);
    const { options, correctOption, distractorAnalysis } = buildFractionQuestion(i % 4, correct, distractors, [
      { en: `Uses the opposite operation — computes a${op === "+" ? "−" : "+"}b instead of a${op}b.`, hi: `विपरीत संक्रिया का उपयोग करता है — a${op}b के बजाय a${op === "+" ? "−" : "+"}b की गणना करता है।` },
      { en: `Adds numerators and denominators separately instead of finding a common denominator first.`, hi: `पहले उभयनिष्ठ हर ज्ञात करने के बजाय अंश और हर को अलग-अलग जोड़ देता है।` },
      { en: `Keeps the first fraction's denominator instead of converting both to a common denominator.`, hi: `दोनों को उभयनिष्ठ हर में बदलने के बजाय पहली भिन्न का हर ही रखे रखता है।` },
    ]);
    const key = `bank-math9-rational-addsub-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY" as const,
      content: {
        en: `Evaluate: ${fracLabel(a)} ${op} ${fracLabel(b)}`,
        hi: `मान ज्ञात करें: ${fracLabel(a)} ${op} ${fracLabel(b)}`,
      },
      options,
      correctOption,
      explanation: {
        en: `Converting to a common denominator of ${a.d * b.d === a.d ? a.d : a.d * b.d}: the sum simplifies to ${fracLabel(correct)}.`,
        hi: `${a.d}×${b.d}=${a.d * b.d} के उभयनिष्ठ हर में बदलने पर: योग सरल होकर ${fracLabel(correct)} बनता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM (×8): multiply/divide signed rationals ────────────────────────
function multiplyDivideQuestions(): GeneratedQuestion[] {
  const params: { a: Fraction; b: Fraction; op: "×" | "÷" }[] = [
    { a: { n: -2, d: 3 }, b: { n: 3, d: 4 }, op: "×" },
    { a: { n: 5, d: 6 }, b: { n: -2, d: 3 }, op: "÷" },
    { a: { n: -3, d: 5 }, b: { n: -2, d: 9 }, op: "×" },
    { a: { n: 4, d: 7 }, b: { n: 2, d: 3 }, op: "÷" },
    { a: { n: -7, d: 8 }, b: { n: 4, d: 21 }, op: "×" },
    { a: { n: 9, d: 10 }, b: { n: -3, d: 5 }, op: "÷" },
    { a: { n: -5, d: 12 }, b: { n: -8, d: 15 }, op: "×" },
    { a: { n: 7, d: 9 }, b: { n: -14, d: 27 }, op: "÷" },
  ];
  return params.map(({ a, b, op }, i) => {
    const bInv = { n: b.d, d: b.n };
    const correct = op === "×" ? mul(a, b) : div(a, b);
    const droppedSign = { n: Math.abs(correct.n), d: correct.d };
    const forgotFlip = op === "÷" ? mul(a, b) : div(a, b);
    const crossedWrong = op === "×" ? simplify(a.n * b.d, a.d * b.n) : simplify(a.n * bInv.n, a.d * bInv.d);
    const distractors = distinctFractionTriplet(correct, [droppedSign, forgotFlip, crossedWrong]);
    const { options, correctOption, distractorAnalysis } = buildFractionQuestion(i % 4, correct, distractors, [
      { en: `Drops the negative sign — computes the right magnitude but the wrong sign.`, hi: `ऋण चिह्न को छोड़ देता है — परिमाण तो सही है पर चिह्न गलत है।` },
      {
        en:
          op === "÷"
            ? `Multiplies directly instead of flipping the second fraction (finding its reciprocal) first.`
            : `Divides instead of multiplying — uses the wrong operation entirely.`,
        hi:
          op === "÷"
            ? `पहले दूसरी भिन्न का व्युत्क्रम लेने के बजाय सीधे गुणा कर देता है।`
            : `गुणा के बजाय भाग कर देता है — पूरी तरह गलत संक्रिया का उपयोग।`,
      },
      { en: `Cross-multiplies numerator with the wrong denominator — a mismatched pairing.`, hi: `अंश को गलत हर के साथ आड़ा-तिरछा गुणा कर देता है — एक बेमेल जोड़ी।` },
    ]);
    const key = `bank-math9-rational-muldiv-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM" as const,
      content: {
        en: `Evaluate: ${fracLabel(a)} ${op} ${fracLabel(b)}`,
        hi: `मान ज्ञात करें: ${fracLabel(a)} ${op} ${fracLabel(b)}`,
      },
      options,
      correctOption,
      explanation: {
        en:
          op === "×"
            ? `Multiply numerators and denominators: (${a.n}×${b.n})/(${a.d}×${b.d}) = ${a.n * b.n}/${a.d * b.d}, which simplifies to ${fracLabel(correct)}.`
            : `Dividing by a fraction means multiplying by its reciprocal: ${fracLabel(a)} × ${fracLabel(bInv)} = ${a.n * bInv.n}/${a.d * bInv.d}, which simplifies to ${fracLabel(correct)}.`,
        hi:
          op === "×"
            ? `अंश और हर को गुणा करें: (${a.n}×${b.n})/(${a.d}×${b.d}) = ${a.n * b.n}/${a.d * b.d}, जो सरल होकर ${fracLabel(correct)} बनता है।`
            : `किसी भिन्न से भाग देने का अर्थ है उसके व्युत्क्रम से गुणा करना: ${fracLabel(a)} × ${fracLabel(bInv)} = ${a.n * bInv.n}/${a.d * bInv.d}, जो सरल होकर ${fracLabel(correct)} बनता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM (×7): a rational number between two given rationals (mean) ───
function betweenQuestions(): GeneratedQuestion[] {
  const params: { a: Fraction; b: Fraction }[] = [
    { a: { n: 1, d: 4 }, b: { n: 1, d: 2 } },
    { a: { n: 1, d: 3 }, b: { n: 2, d: 3 } },
    { a: { n: -3, d: 4 }, b: { n: -1, d: 4 } },
    { a: { n: 1, d: 5 }, b: { n: 2, d: 5 } },
    { a: { n: -3, d: 10 }, b: { n: 1, d: 10 } },
    { a: { n: 3, d: 8 }, b: { n: 7, d: 8 } },
    { a: { n: -5, d: 6 }, b: { n: -1, d: 6 } },
  ];
  return params.map(({ a, b }, i) => {
    const correct = halve(add(a, b));
    const forgotHalve = add(a, b);
    const distractors = distinctFractionTriplet(correct, [forgotHalve, a, b]);
    const { options, correctOption, distractorAnalysis } = buildFractionQuestion(i % 4, correct, distractors, [
      { en: `Adds the two rationals but forgets to divide the sum by 2 to find the midpoint.`, hi: `दोनों परिमेय संख्याओं को जोड़ता है पर मध्यबिंदु ज्ञात करने के लिए योग को 2 से भाग देना भूल जाता है।` },
      { en: `Just restates the first given rational number instead of finding one BETWEEN the two.`, hi: `दोनों के बीच की संख्या ज्ञात करने के बजाय पहली दी गई परिमेय संख्या को ही दोहरा देता है।` },
      { en: `Just restates the second given rational number instead of finding one BETWEEN the two.`, hi: `दोनों के बीच की संख्या ज्ञात करने के बजाय दूसरी दी गई परिमेय संख्या को ही दोहरा देता है।` },
    ]);
    const key = `bank-math9-rational-between-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM" as const,
      content: {
        en: `Find a rational number between ${fracLabel(a)} and ${fracLabel(b)}.`,
        hi: `${fracLabel(a)} और ${fracLabel(b)} के बीच एक परिमेय संख्या ज्ञात करें।`,
      },
      options,
      correctOption,
      explanation: {
        en: `The mean of two rationals always lies between them: (${fracLabel(a)} + ${fracLabel(b)}) ÷ 2 = ${fracLabel(correct)}.`,
        hi: `दो परिमेय संख्याओं का माध्य हमेशा उनके बीच होता है: (${fracLabel(a)} + ${fracLabel(b)}) ÷ 2 = ${fracLabel(correct)}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD (×8): multi-step expression "a + b × c" — order of operations ──
function orderOfOperationsQuestions(): GeneratedQuestion[] {
  const params: { a: Fraction; b: Fraction; c: Fraction }[] = [
    { a: { n: 1, d: 2 }, b: { n: 1, d: 3 }, c: { n: 3, d: 4 } },
    { a: { n: 2, d: 5 }, b: { n: 1, d: 2 }, c: { n: 1, d: 3 } },
    { a: { n: -1, d: 3 }, b: { n: 2, d: 5 }, c: { n: 1, d: 2 } },
    { a: { n: 3, d: 4 }, b: { n: -1, d: 2 }, c: { n: 2, d: 3 } },
    { a: { n: 1, d: 6 }, b: { n: 3, d: 4 }, c: { n: -2, d: 3 } },
    { a: { n: -2, d: 3 }, b: { n: 1, d: 4 }, c: { n: 5, d: 6 } },
    { a: { n: 5, d: 8 }, b: { n: -3, d: 4 }, c: { n: 1, d: 6 } },
    { a: { n: -1, d: 2 }, b: { n: -2, d: 5 }, c: { n: 3, d: 4 } },
  ];
  return params.map(({ a, b, c }, i) => {
    const bc = mul(b, c);
    const correct = add(a, bc);
    const naiveLeftToRight = mul(add(a, b), c);
    const wrongGrouping = add(mul(a, b), c);
    const signFlip = sub(a, bc);
    const distractors = distinctFractionTriplet(correct, [naiveLeftToRight, wrongGrouping, signFlip]);
    const { options, correctOption, distractorAnalysis } = buildFractionQuestion(i % 4, correct, distractors, [
      { en: `Works strictly left-to-right — adds a and b first, then multiplies by c — instead of doing multiplication before addition.`, hi: `बाएं-से-दाएं क्रम में काम करता है — पहले जोड़ फिर गुणा — जबकि जोड़ से पहले गुणा किया जाना चाहिए।` },
      { en: `Multiplies a and b together instead of b and c, then adds c — the wrong pair grouped.`, hi: `b और c के बजाय a और b को गुणा करता है, फिर c जोड़ देता है — गलत जोड़ी को समूहित करना।` },
      { en: `Subtracts the (b×c) product instead of adding it.`, hi: `(b×c) गुणनफल को जोड़ने के बजाय घटा देता है।` },
    ]);
    const key = `bank-math9-rational-orderops-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD" as const,
      content: {
        en: `Evaluate, following the correct order of operations: ${fracLabel(a)} + ${fracLabel(b)} × ${fracLabel(c)}`,
        hi: `सही संक्रिया क्रम का पालन करते हुए मान ज्ञात करें: ${fracLabel(a)} + ${fracLabel(b)} × ${fracLabel(c)}`,
      },
      options,
      correctOption,
      explanation: {
        en: `Multiplication comes before addition: ${fracLabel(b)} × ${fracLabel(c)} = ${fracLabel(bc)}, then ${fracLabel(a)} + ${fracLabel(bc)} = ${fracLabel(correct)}.`,
        hi: `जोड़ से पहले गुणा किया जाता है: ${fracLabel(b)} × ${fracLabel(c)} = ${fracLabel(bc)}, फिर ${fracLabel(a)} + ${fracLabel(bc)} = ${fracLabel(correct)}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD (×7): compare two positive fractions by cross-multiplication ───
function compareByLangText(
  correctIndex: number,
  correctText: LangText,
  distractorTexts: [LangText, LangText, LangText],
  distractorReasons: [LangText, LangText, LangText]
) {
  const { contents, correctOption, distractorAnalysis } = distributeCorrectPosition(
    correctIndex,
    correctText,
    distractorTexts,
    distractorReasons
  );
  const options = OPTION_IDS.map((id, i) => ({ id, text: contents[i]! })) as [OptionSeed, OptionSeed, OptionSeed, OptionSeed];
  return { options, correctOption, distractorAnalysis };
}

function compareQuestions(): GeneratedQuestion[] {
  const params: { a: Fraction; b: Fraction }[] = [
    { a: { n: 3, d: 4 }, b: { n: 5, d: 7 } },
    { a: { n: 2, d: 5 }, b: { n: 3, d: 8 } },
    { a: { n: 5, d: 9 }, b: { n: 7, d: 12 } },
    { a: { n: 4, d: 7 }, b: { n: 5, d: 9 } },
    { a: { n: 7, d: 10 }, b: { n: 5, d: 8 } },
    { a: { n: 3, d: 11 }, b: { n: 2, d: 7 } },
    { a: { n: 9, d: 13 }, b: { n: 5, d: 8 } },
  ];
  const FIRST_LARGER: LangText = { en: "The first fraction is larger", hi: "पहली भिन्न बड़ी है" };
  const SECOND_LARGER: LangText = { en: "The second fraction is larger", hi: "दूसरी भिन्न बड़ी है" };
  const EQUAL: LangText = { en: "They are equal", hi: "वे बराबर हैं" };
  const CANNOT_COMPARE: LangText = { en: "Cannot be compared without a common denominator", hi: "उभयनिष्ठ हर के बिना तुलना नहीं की जा सकती" };

  return params.map(({ a, b }, i) => {
    const crossA = a.n * b.d;
    const crossB = b.n * a.d;
    const firstIsLarger = crossA > crossB;
    const correctText = firstIsLarger ? FIRST_LARGER : SECOND_LARGER;
    const wrongPick = firstIsLarger ? SECOND_LARGER : FIRST_LARGER;
    const distractorTexts: [LangText, LangText, LangText] = [wrongPick, EQUAL, CANNOT_COMPARE];
    const { options, correctOption, distractorAnalysis } = compareByLangText(i % 4, correctText, distractorTexts, [
      { en: `This is the SMALLER fraction — cross-multiplying (${a.n}×${b.d}=${crossA} vs ${b.n}×${a.d}=${crossB}) points the other way.`, hi: `यह छोटी भिन्न है — आड़ा-तिरछा गुणा करने पर (${a.n}×${b.d}=${crossA} बनाम ${b.n}×${a.d}=${crossB}) परिणाम दूसरी ओर इशारा करता है।` },
      { en: `They are NOT equal — the cross products ${crossA} and ${crossB} are different numbers.`, hi: `वे बराबर नहीं हैं — आड़े-तिरछे गुणनफल ${crossA} और ${crossB} अलग-अलग संख्याएँ हैं।` },
      { en: `A common denominator can always be found (their LCM) and is exactly how this comparison works — this option wrongly claims it's impossible.`, hi: `उभयनिष्ठ हर हमेशा (उनका ल.स. लेकर) निकाला जा सकता है, और यही तुलना का सही तरीका है — यह विकल्प गलत ढंग से इसे असंभव बताता है।` },
    ]);
    const key = `bank-math9-rational-compare-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD" as const,
      content: {
        en: `Compare ${fracLabel(a)} and ${fracLabel(b)} by cross-multiplication. Which is larger?`,
        hi: `आड़े-तिरछे गुणा (cross-multiplication) द्वारा ${fracLabel(a)} और ${fracLabel(b)} की तुलना करें। कौन-सी बड़ी है?`,
      },
      options,
      correctOption,
      explanation: {
        en: `Cross-multiply: ${a.n}×${b.d} = ${crossA} and ${b.n}×${a.d} = ${crossB}. Since ${crossA} ${firstIsLarger ? ">" : "<"} ${crossB}, ${firstIsLarger ? `${fracLabel(a)} is larger.` : `${fracLabel(b)} is larger.`}`,
        hi: `आड़ा-तिरछा गुणा करें: ${a.n}×${b.d} = ${crossA} और ${b.n}×${a.d} = ${crossB}। चूंकि ${crossA} ${firstIsLarger ? ">" : "<"} ${crossB}, इसलिए ${firstIsLarger ? `${fracLabel(a)} बड़ी है।` : `${fracLabel(b)} बड़ी है।`}`,
      },
      distractorAnalysis,
    };
  });
}

export function buildRationalNumbersClass9Questions(): GeneratedQuestion[] {
  const all = [
    ...addSubtractQuestions(),
    ...multiplyDivideQuestions(),
    ...betweenQuestions(),
    ...orderOfOperationsQuestions(),
    ...compareQuestions(),
  ].map((q) => ({ ...q, targetClass: "CLASS_9" as const }));
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(
      `Rational Numbers Class 9 pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`
    );
  }
  return all;
}
