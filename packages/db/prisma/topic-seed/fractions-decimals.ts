import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Fractions/Decimals pool (Arithmetic ->
 * "fractions_decimals" topic, JNVST): 10 Easy / 15 Moderate / 15 Hard.
 * Every correct answer is computed by real fraction/decimal arithmetic —
 * never hand-typed — and assertDistinctOptions guards against a
 * construction bug seeding a broken question.
 */

const OPTION_IDS = ["a", "b", "c", "d"] as const;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

interface Fraction {
  n: number;
  d: number;
}

function simplify({ n, d }: Fraction): Fraction {
  const g = gcd(Math.abs(n), Math.abs(d)) || 1;
  return { n: n / g, d: d / g };
}
function addFrac(a: Fraction, b: Fraction): Fraction {
  return simplify({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
}
function subFrac(a: Fraction, b: Fraction): Fraction {
  return simplify({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
}
function mulFrac(a: Fraction, b: Fraction): Fraction {
  return simplify({ n: a.n * b.n, d: a.d * b.d });
}
function divFrac(a: Fraction, b: Fraction): Fraction {
  return simplify({ n: a.n * b.d, d: a.d * b.n });
}
function fracText(f: Fraction): LangText {
  return { en: `${f.n}/${f.d}`, hi: `${f.n}/${f.d}` };
}
function fracEq(a: Fraction, b: Fraction): boolean {
  return a.n === b.n && a.d === b.d;
}
function fracToDecimal(f: Fraction): number {
  return Math.round((f.n / f.d) * 100) / 100;
}

function buildOptions() {
  return OPTION_IDS.map((id) => ({ id, text: { en: id.toUpperCase(), hi: id.toUpperCase() } }));
}

/** Ensures a set of Fraction distractors reaches `target` distinct values (comparing simplified n/d pairs), keyed on `attempt` so a rejected candidate is never recomputed identically forever. */
function padDistinctFractions(base: Fraction[], target: number, correct: Fraction, denomPool: number[]): Fraction[] {
  const values: Fraction[] = [];
  for (const f of base) if (!fracEq(f, correct) && !values.some((v) => fracEq(v, f))) values.push(f);
  for (let attempt = 0; values.length < target && attempt < 30; attempt++) {
    const d = denomPool[attempt % denomPool.length]!;
    const n = correct.n + (attempt + 1) * (attempt % 2 === 0 ? 1 : -1);
    const candidate = simplify({ n, d });
    if (!fracEq(candidate, correct) && !values.some((v) => fracEq(v, candidate))) values.push(candidate);
  }
  if (values.length < target) throw new Error(`padDistinctFractions: could not reach ${target} distinct values.`);
  return values.slice(0, target);
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
  const options = OPTION_IDS.map((id, i) => ({ id, text: fracText(contents[i]!) })) as [OptionSeed, OptionSeed, OptionSeed, OptionSeed];
  return { options, correctOption, distractorAnalysis };
}

// ── EASY (×10): add/subtract fractions with the SAME denominator ─────────
function likeDenominatorQuestions(): GeneratedQuestion[] {
  const params: { a: Fraction; b: Fraction; op: "+" | "-" }[] = [
    { a: { n: 2, d: 7 }, b: { n: 3, d: 7 }, op: "+" },
    { a: { n: 5, d: 9 }, b: { n: 2, d: 9 }, op: "-" },
    { a: { n: 1, d: 5 }, b: { n: 2, d: 5 }, op: "+" },
    { a: { n: 7, d: 10 }, b: { n: 3, d: 10 }, op: "-" },
    { a: { n: 3, d: 8 }, b: { n: 2, d: 8 }, op: "+" },
    { a: { n: 4, d: 11 }, b: { n: 1, d: 11 }, op: "+" },
    { a: { n: 6, d: 13 }, b: { n: 2, d: 13 }, op: "-" },
    { a: { n: 2, d: 9 }, b: { n: 5, d: 9 }, op: "+" },
    { a: { n: 8, d: 15 }, b: { n: 3, d: 15 }, op: "-" },
    { a: { n: 1, d: 6 }, b: { n: 2, d: 6 }, op: "+" },
  ];
  return params.map(({ a, b, op }, i) => {
    const correct = op === "+" ? addFrac(a, b) : subFrac(a, b);
    const wrongDenom = simplify({ n: a.n + b.n, d: a.d + b.d }); // classic trap: adds denominators too
    const swappedOp = op === "+" ? subFrac(a, b) : addFrac(a, b);
    const distractorBase = [wrongDenom, swappedOp, simplify({ n: correct.n + 1, d: correct.d })];
    const distractors = padDistinctFractions(distractorBase, 3, correct, [a.d, a.d * 2]) as [Fraction, Fraction, Fraction];
    const { options, correctOption, distractorAnalysis } = buildFractionQuestion(
      i % 4,
      correct,
      distractors,
      [
        { en: "Adds the denominators together too, instead of keeping the common denominator unchanged.", hi: "हरों को भी आपस में जोड़ देता है, जबकि उभयनिष्ठ हर को अपरिवर्तित रखना चाहिए था।" },
        { en: `Performs the opposite operation (${op === "+" ? "subtracts" : "adds"} instead of ${op === "+" ? "adding" : "subtracting"}).`, hi: `विपरीत संक्रिया करता है (${op === "+" ? "जोड़ने" : "घटाने"} के बजाय ${op === "+" ? "घटा" : "जोड़"} देता है)।` },
        { en: "Off by one in the numerator after combining — a simple arithmetic slip.", hi: "जोड़ने/घटाने के बाद अंश में एक की गलती — एक साधारण अंकगणितीय चूक।" },
      ]
    );
    const key = `bank-ar-fracdec-likedenom-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY",
      content: { en: `Calculate: ${a.n}/${a.d} ${op} ${b.n}/${b.d} = ?`, hi: `गणना करें: ${a.n}/${a.d} ${op} ${b.n}/${b.d} = ?` },
      options,
      correctOption,
      explanation: {
        en: `The denominators are already the same, so just ${op === "+" ? "add" : "subtract"} the numerators: ${a.n} ${op} ${b.n} = ${a.n + (op === "+" ? b.n : -b.n)}, giving ${a.n + (op === "+" ? b.n : -b.n)}/${a.d}, which simplifies to ${correct.n}/${correct.d}.`,
        hi: `हर पहले से समान हैं, इसलिए बस अंशों को ${op === "+" ? "जोड़ें" : "घटाएँ"}: ${a.n} ${op} ${b.n} = ${a.n + (op === "+" ? b.n : -b.n)}, जिससे ${a.n + (op === "+" ? b.n : -b.n)}/${a.d} मिलता है, जो सरल करने पर ${correct.n}/${correct.d} होता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (a) ×5: convert a fraction to a decimal ────────────────
function toDecimalQuestions(): GeneratedQuestion[] {
  const fracs: Fraction[] = [{ n: 1, d: 4 }, { n: 3, d: 5 }, { n: 7, d: 20 }, { n: 9, d: 25 }, { n: 3, d: 4 }];
  return fracs.map((f, i) => {
    const correctDec = fracToDecimal(f);
    const distractorBase = [
      Math.round((f.d / f.n) * 100) / 100, // inverted
      Math.round(correctDec * 10 * 100) / 100, // decimal-point slip
      Math.round((correctDec + 0.1) * 100) / 100,
    ];
    const dSet = new Set<number>();
    for (const v of distractorBase) if (v !== correctDec) dSet.add(v);
    for (let attempt = 0; dSet.size < 3 && attempt < 20; attempt++) {
      const candidate = Math.round((correctDec + 0.05 * (attempt + 2)) * 100) / 100;
      if (candidate !== correctDec) dSet.add(candidate);
    }
    const distractors = Array.from(dSet).slice(0, 3) as [number, number, number];
    const { contents, correctOption, distractorAnalysis } = distributeCorrectPosition(
      (i + 1) % 4,
      correctDec,
      distractors,
      [
        { en: "Inverts the fraction before converting — divides the denominator by the numerator instead of the other way around.", hi: "परिवर्तित करने से पहले भिन्न को उलट देता है — अंश को हर से भाग देने के बजाय हर को अंश से भाग दे देता है।" },
        { en: "Misplaces the decimal point by one position (off by a factor of 10).", hi: "दशमलव बिंदु को एक स्थान गलत रख देता है (10 के गुणक से चूक)।" },
        { en: "Off by a small amount — a rounding or arithmetic slip during the division.", hi: "थोड़ी सी चूक — भाग देते समय पूर्णांकन या अंकगणितीय गलती।" },
      ]
    );
    const options = OPTION_IDS.map((id, idx) => ({ id, text: { en: String(contents[idx]), hi: String(contents[idx]) } })) as [
      OptionSeed,
      OptionSeed,
      OptionSeed,
      OptionSeed
    ];
    const key = `bank-ar-fracdec-todecimal-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: { en: `Convert the fraction ${f.n}/${f.d} to a decimal.`, hi: `भिन्न ${f.n}/${f.d} को दशमलव में बदलें।` },
      options,
      correctOption,
      explanation: {
        en: `${f.n}/${f.d} means ${f.n} ÷ ${f.d} = ${correctDec}.`,
        hi: `${f.n}/${f.d} का अर्थ है ${f.n} ÷ ${f.d} = ${correctDec}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (b) ×5: multiply two fractions ─────────────────────────
function multiplyFractionQuestions(): GeneratedQuestion[] {
  const pairs: [Fraction, Fraction][] = [
    [{ n: 2, d: 3 }, { n: 3, d: 4 }],
    [{ n: 5, d: 6 }, { n: 2, d: 5 }],
    [{ n: 3, d: 7 }, { n: 7, d: 9 }],
    [{ n: 4, d: 5 }, { n: 5, d: 8 }],
    [{ n: 2, d: 9 }, { n: 3, d: 4 }],
  ];
  return pairs.map(([a, b], i) => {
    const correct = mulFrac(a, b);
    const wrongAdd = addFrac(a, b); // classic trap: adds instead of multiplying
    const noSimplify = simplify({ n: a.n * b.n, d: a.d * b.d + 1 }); // slightly-off denominator
    const invertedOne = mulFrac({ n: a.d, d: a.n }, b);
    const distractors = padDistinctFractions([wrongAdd, noSimplify, invertedOne], 3, correct, [a.d * b.d, a.d]) as [
      Fraction,
      Fraction,
      Fraction
    ];
    const { options, correctOption, distractorAnalysis } = buildFractionQuestion(
      (i + 2) % 4,
      correct,
      distractors,
      [
        { en: "Adds the two fractions instead of multiplying them.", hi: "दोनों भिन्नों को गुणा करने के बजाय जोड़ देता है।" },
        { en: "Makes a small slip in the denominator while multiplying across.", hi: "गुणा करते समय हर में एक छोटी सी चूक कर देता है।" },
        { en: "Inverts the first fraction before multiplying, as if this were a division problem instead.", hi: "गुणा करने से पहले पहली भिन्न को उलट देता है, जैसे यह भाग की समस्या हो।" },
      ]
    );
    const key = `bank-ar-fracdec-multiply-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: { en: `Calculate: ${a.n}/${a.d} × ${b.n}/${b.d} = ?`, hi: `गणना करें: ${a.n}/${a.d} × ${b.n}/${b.d} = ?` },
      options,
      correctOption,
      explanation: {
        en: `Multiply numerators together and denominators together: (${a.n} × ${b.n})/(${a.d} × ${b.d}) = ${a.n * b.n}/${a.d * b.d}, which simplifies to ${correct.n}/${correct.d}.`,
        hi: `अंशों को आपस में और हरों को आपस में गुणा करें: (${a.n} × ${b.n})/(${a.d} × ${b.d}) = ${a.n * b.n}/${a.d * b.d}, जो सरल करने पर ${correct.n}/${correct.d} होता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (c) ×5: which fraction is larger ───────────────────────
function compareQuestions(): GeneratedQuestion[] {
  const params: { a: Fraction; b: Fraction; c: Fraction; d: Fraction }[] = [
    { a: { n: 2, d: 3 }, b: { n: 1, d: 2 }, c: { n: 3, d: 8 }, d: { n: 1, d: 4 } },
    { a: { n: 5, d: 6 }, b: { n: 2, d: 3 }, c: { n: 1, d: 2 }, d: { n: 3, d: 10 } },
    { a: { n: 3, d: 5 }, b: { n: 7, d: 10 }, c: { n: 2, d: 5 }, d: { n: 1, d: 3 } },
    { a: { n: 4, d: 9 }, b: { n: 5, d: 6 }, c: { n: 1, d: 4 }, d: { n: 2, d: 9 } },
    { a: { n: 5, d: 8 }, b: { n: 3, d: 4 }, c: { n: 1, d: 2 }, d: { n: 3, d: 8 } },
  ];
  return params.map(({ a, b, c, d }, i) => {
    const items = [a, b, c, d];
    const decimals = items.map(fracToDecimal);
    const maxDec = Math.max(...decimals);
    const correctIdx = decimals.indexOf(maxDec);
    const correct = items[correctIdx]!;
    const wrongItems = items.filter((_, idx) => idx !== correctIdx) as [Fraction, Fraction, Fraction];
    const correctIndex = (i + 3) % 4;
    const { contents, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correct,
      wrongItems,
      [
        { en: "A larger fraction, but not the LARGEST of the four options.", hi: "एक बड़ी भिन्न है, पर चारों विकल्पों में सबसे बड़ी नहीं।" },
        { en: "A smaller fraction — easy to mistake for large if you only compare numerators without checking denominators.", hi: "एक छोटी भिन्न — यदि केवल अंशों की तुलना करें और हरों की जाँच न करें, तो इसे बड़ा समझने की भूल हो सकती है।" },
        { en: "The smallest of the four — the exact opposite of what was asked.", hi: "चारों में सबसे छोटी — जो पूछा गया था उसके बिल्कुल विपरीत।" },
      ]
    );
    const options = OPTION_IDS.map((id, idx) => ({ id, text: fracText(contents[idx]!) })) as [OptionSeed, OptionSeed, OptionSeed, OptionSeed];
    const key = `bank-ar-fracdec-compare-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `Which of these fractions is the LARGEST: ${a.n}/${a.d}, ${b.n}/${b.d}, ${c.n}/${c.d}, ${d.n}/${d.d}?`,
        hi: `इनमें से कौन-सी भिन्न सबसे बड़ी है: ${a.n}/${a.d}, ${b.n}/${b.d}, ${c.n}/${c.d}, ${d.n}/${d.d}?`,
      },
      options,
      correctOption,
      explanation: {
        en: `Converting each to a decimal: ${a.n}/${a.d}=${fracToDecimal(a)}, ${b.n}/${b.d}=${fracToDecimal(b)}, ${c.n}/${c.d}=${fracToDecimal(c)}, ${d.n}/${d.d}=${fracToDecimal(d)}. The largest is ${correct.n}/${correct.d}.`,
        hi: `प्रत्येक को दशमलव में बदलने पर: ${a.n}/${a.d}=${fracToDecimal(a)}, ${b.n}/${b.d}=${fracToDecimal(b)}, ${c.n}/${c.d}=${fracToDecimal(c)}, ${d.n}/${d.d}=${fracToDecimal(d)}। सबसे बड़ी ${correct.n}/${correct.d} है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (a) ×5: divide two fractions ─────────────────────────────
function divideFractionQuestions(): GeneratedQuestion[] {
  const pairs: [Fraction, Fraction][] = [
    [{ n: 2, d: 3 }, { n: 4, d: 9 }],
    [{ n: 5, d: 6 }, { n: 5, d: 12 }],
    [{ n: 3, d: 4 }, { n: 9, d: 16 }],
    [{ n: 7, d: 8 }, { n: 7, d: 4 }],
    [{ n: 2, d: 5 }, { n: 4, d: 15 }],
  ];
  return pairs.map(([a, b], i) => {
    const correct = divFrac(a, b);
    const forgotInvert = mulFrac(a, b); // classic trap: multiplies straight across instead of inverting b
    const invertedA = divFrac({ n: a.d, d: a.n }, b);
    const swapped = divFrac(b, a);
    const distractors = padDistinctFractions([forgotInvert, invertedA, swapped], 3, correct, [a.d * b.d, b.d]) as [
      Fraction,
      Fraction,
      Fraction
    ];
    const { options, correctOption, distractorAnalysis } = buildFractionQuestion(
      i % 4,
      correct,
      distractors,
      [
        { en: "Multiplies the two fractions straight across instead of first flipping the second fraction.", hi: "पहले दूसरी भिन्न को पलटने के बजाय दोनों भिन्नों को सीधे गुणा कर देता है।" },
        { en: "Flips the wrong fraction (the first one) instead of the second.", hi: "दूसरी के बजाय गलत भिन्न (पहली) को पलट देता है।" },
        { en: "Divides in the reverse order — computes the second fraction ÷ the first instead of the first ÷ the second.", hi: "उल्टे क्रम में भाग देता है — पहली ÷ दूसरी के बजाय दूसरी ÷ पहली की गणना करता है।" },
      ]
    );
    const key = `bank-ar-fracdec-divide-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: { en: `Calculate: ${a.n}/${a.d} ÷ ${b.n}/${b.d} = ?`, hi: `गणना करें: ${a.n}/${a.d} ÷ ${b.n}/${b.d} = ?` },
      options,
      correctOption,
      explanation: {
        en: `Dividing by a fraction means multiplying by its reciprocal: ${a.n}/${a.d} × ${b.d}/${b.n} = ${a.n * b.d}/${a.d * b.n}, which simplifies to ${correct.n}/${correct.d}.`,
        hi: `किसी भिन्न से भाग देने का अर्थ है उसके व्युत्क्रम से गुणा करना: ${a.n}/${a.d} × ${b.d}/${b.n} = ${a.n * b.d}/${a.d * b.n}, जो सरल करने पर ${correct.n}/${correct.d} होता है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (b) ×5: mixed-number word problem ────────────────────────
function wordProblemQuestions(): GeneratedQuestion[] {
  const params: { total: number; used: Fraction; unit: string; unitHi: string }[] = [
    { total: 60, used: { n: 3, d: 4 }, unit: "litres of water in a tank", unitHi: "टंकी में लीटर पानी" },
    { total: 80, used: { n: 2, d: 5 }, unit: "marbles in a bag", unitHi: "थैले में कंचे" },
    { total: 96, used: { n: 5, d: 8 }, unit: "pages in a book", unitHi: "किताब के पृष्ठ" },
    { total: 45, used: { n: 1, d: 3 }, unit: "students in a class", unitHi: "कक्षा में छात्र" },
    { total: 120, used: { n: 3, d: 5 }, unit: "seats in a hall", unitHi: "हॉल में सीटें" },
  ];
  return params.map(({ total, used, unit, unitHi }, i) => {
    const usedAmount = (total * used.n) / used.d;
    const correct = total - usedAmount;
    const distractorBase = [usedAmount, total - usedAmount / 2, total - usedAmount * 2];
    const dSet = new Set<number>();
    for (const v of distractorBase) if (v !== correct && v >= 0) dSet.add(v);
    for (let attempt = 0; dSet.size < 3 && attempt < 20; attempt++) {
      const candidate = correct + (attempt + 1) * 3 * (attempt % 2 === 0 ? 1 : -1);
      if (candidate !== correct && candidate >= 0) dSet.add(candidate);
    }
    const distractors = Array.from(dSet).slice(0, 3) as [number, number, number];
    const { contents, correctOption, distractorAnalysis } = distributeCorrectPosition(
      (i + 1) % 4,
      correct,
      distractors,
      [
        { en: `This is the amount USED (${used.n}/${used.d} of the total), not what remains.`, hi: `यह उपयोग की गई मात्रा (कुल का ${used.n}/${used.d}) है, जो शेष है वह नहीं।` },
        { en: "Only accounts for half the fraction used before subtracting.", hi: "घटाने से पहले उपयोग की गई भिन्न का केवल आधा हिसाब रखता है।" },
        { en: "Subtracts twice the actual amount used, overcorrecting.", hi: "वास्तव में उपयोग की गई मात्रा से दोगुना घटा देता है, अधिक सुधार कर देता है।" },
      ]
    );
    const options = OPTION_IDS.map((id, idx) => ({ id, text: { en: String(contents[idx]), hi: String(contents[idx]) } })) as [
      OptionSeed,
      OptionSeed,
      OptionSeed,
      OptionSeed
    ];
    const key = `bank-ar-fracdec-wordproblem-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `There are ${total} ${unit}. If ${used.n}/${used.d} of them have been used, how many are left?`,
        hi: `${unitHi} कुल ${total} हैं। यदि उनमें से ${used.n}/${used.d} उपयोग हो चुके हैं, तो कितने शेष हैं?`,
      },
      options,
      correctOption,
      explanation: {
        en: `Used: ${used.n}/${used.d} × ${total} = ${usedAmount}. Remaining: ${total} − ${usedAmount} = ${correct}.`,
        hi: `उपयोग किए गए: ${used.n}/${used.d} × ${total} = ${usedAmount}। शेष: ${total} − ${usedAmount} = ${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (c) ×5: convert a decimal to a simplified fraction ───────
function decimalToFractionQuestions(): GeneratedQuestion[] {
  const decimals: { value: number; denom: number }[] = [
    { value: 0.75, denom: 100 },
    { value: 0.4, denom: 10 },
    { value: 0.36, denom: 100 },
    { value: 0.15, denom: 100 },
    { value: 0.6, denom: 10 },
  ];
  return decimals.map(({ value, denom }, i) => {
    const numerator = Math.round(value * denom);
    const correct = simplify({ n: numerator, d: denom });
    const unsimplified = { n: numerator, d: denom }; // classic trap: correct numerator/denom but never reduced
    const wrongNumerator = simplify({ n: numerator + 1, d: denom });
    const invertedFrac = simplify({ n: denom, d: numerator });
    const distractors = padDistinctFractions([unsimplified, wrongNumerator, invertedFrac], 3, correct, [denom, denom * 2]) as [
      Fraction,
      Fraction,
      Fraction
    ];
    const { options, correctOption, distractorAnalysis } = buildFractionQuestion(
      (i + 3) % 4,
      correct,
      distractors,
      [
        { en: "The right fraction, but never reduced to its simplest (lowest) terms.", hi: "सही भिन्न है, पर इसे सरलतम (निम्नतम) रूप में कभी सरल नहीं किया गया।" },
        { en: "Off by one in the numerator before simplifying — a small reading slip.", hi: "सरल करने से पहले अंश में एक की गलती — एक छोटी सी पठन चूक।" },
        { en: "Inverts the fraction — flips numerator and denominator.", hi: "भिन्न को उलट देता है — अंश और हर को बदल देता है।" },
      ]
    );
    const key = `bank-ar-fracdec-decimaltofrac-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: { en: `Convert ${value} to a fraction in its simplest form.`, hi: `${value} को सरलतम रूप में भिन्न में बदलें।` },
      options,
      correctOption,
      explanation: {
        en: `${value} = ${numerator}/${denom}, which simplifies (dividing both by their HCF) to ${correct.n}/${correct.d}.`,
        hi: `${value} = ${numerator}/${denom}, जिसे (दोनों को उनके HCF से भाग देकर) सरल करने पर ${correct.n}/${correct.d} मिलता है।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildFractionsDecimalsQuestions(): GeneratedQuestion[] {
  const all = [
    ...likeDenominatorQuestions(),
    ...toDecimalQuestions(),
    ...multiplyFractionQuestions(),
    ...compareQuestions(),
    ...divideFractionQuestions(),
    ...wordProblemQuestions(),
    ...decimalToFractionQuestions(),
  ].map((q) => ({ ...q, targetExam: "JNVST" as const }));
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Fractions/Decimals pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}
