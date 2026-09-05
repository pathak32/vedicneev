import { assertDistinctOptions, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Number Series pool (Mental Ability →
 * "number_series" topic): 10 Easy / 15 Moderate / 15 Hard, per
 * packages/db/prisma/seed.ts's `numberSeries` topic. Every correct answer
 * and every distractor is computed by real arithmetic below — never
 * hand-typed — so correctness is guaranteed by construction; each item is
 * checked for duplicate options via assertDistinctOptions before it's
 * returned. Six families, one per specific "why this trap is wrong"
 * reasoning; parameters are curated (not random) so the numbers stay
 * classroom-realistic.
 */

const OPTION_IDS = ["a", "b", "c", "d"] as const;

function num(n: number): LangText {
  return { en: String(n), hi: String(n) };
}

function buildOptions(correct: number, distractors: [number, number, number]): [OptionSeed, OptionSeed, OptionSeed, OptionSeed] {
  const values = [correct, ...distractors];
  // Deterministic shuffle so the correct answer isn't always option "a" —
  // rotates by the correct value itself, which varies per item.
  const rotated = [...values.slice(correct % 4 === 0 ? 0 : correct % 4), ...values.slice(0, correct % 4 === 0 ? 0 : correct % 4)];
  return OPTION_IDS.map((id, i) => ({ id, text: num(rotated[i]!) })) as [OptionSeed, OptionSeed, OptionSeed, OptionSeed];
}

function correctOptionId(options: OptionSeed[], correct: number): string {
  const match = options.find((o) => o.text.en === String(correct));
  if (!match) throw new Error(`Correct value ${correct} not found among generated options.`);
  return match.id;
}

function seriesStem(terms: number[]): LangText {
  const joined = terms.join(", ");
  return {
    en: `Find the missing number in the series: ${joined}, ?`,
    hi: `श्रृंखला में लुप्त संख्या ज्ञात करें: ${joined}, ?`,
  };
}

// ── Family A (EASY, ×10): plain arithmetic progression ──────────────────
function arithmeticProgressionQuestions(): GeneratedQuestion[] {
  const params: { a: number; d: number }[] = [
    { a: 3, d: 2 }, { a: 5, d: 3 }, { a: 7, d: 4 }, { a: 2, d: 5 }, { a: 6, d: 6 },
    { a: 4, d: 7 }, { a: 9, d: 8 }, { a: 3, d: 9 }, { a: 8, d: 11 }, { a: 5, d: 12 },
  ];
  return params.map(({ a, d }, i) => {
    const terms = [0, 1, 2, 3, 4].map((k) => a + k * d);
    const n5 = terms[4]!;
    const correct = n5 + d;
    const distractors: [number, number, number] = [n5 + (d - 1), n5 + (d + 1), n5 - d];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-numseries-ap-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY",
      content: seriesStem(terms),
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `The series increases by a fixed common difference of ${d} each time (${terms.join(" → ")} → ${correct}). Continue the pattern: ${n5} + ${d} = ${correct}.`,
        hi: `यह श्रृंखला हर बार ${d} की स्थिर सामान्य अंतर से बढ़ती है (${terms.join(" → ")} → ${correct})। पैटर्न जारी रखें: ${n5} + ${d} = ${correct}।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Uses a common difference of ${d - 1} instead of the actual ${d} — one less than the real gap between terms.`,
          hi: `वास्तविक अंतर ${d} के स्थान पर ${d - 1} का उपयोग करता है — पदों के बीच वास्तविक अंतर से एक कम।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Uses a common difference of ${d + 1} instead of the actual ${d} — one more than the real gap between terms.`,
          hi: `वास्तविक अंतर ${d} के स्थान पर ${d + 1} का उपयोग करता है — पदों के बीच वास्तविक अंतर से एक अधिक।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Subtracts the common difference instead of adding it — a direction error that reverses the series.`,
          hi: `सामान्य अंतर को जोड़ने के बजाय घटाता है — एक दिशा त्रुटि जो श्रृंखला को उलट देती है।`,
        },
      },
    };
  });
}

// ── Family B (MEDIUM, ×5): geometric progression ─────────────────────────
function geometricProgressionQuestions(): GeneratedQuestion[] {
  const params: { a: number; r: number }[] = [
    { a: 2, r: 2 }, { a: 3, r: 2 }, { a: 1, r: 3 }, { a: 4, r: 2 }, { a: 2, r: 3 },
  ];
  return params.map(({ a, r }, i) => {
    const terms = [0, 1, 2, 3, 4].map((k) => a * r ** k);
    const n4 = terms[3]!;
    const n5 = terms[4]!;
    const correct = n5 * r;
    const distractors: [number, number, number] = [n5 + n4, n5 * (r + 1), n4 * r];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-numseries-gp-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: seriesStem(terms),
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `Each term is ${r} times the one before it (a geometric series), so the next term is ${n5} × ${r} = ${correct}.`,
        hi: `प्रत्येक पद अपने पिछले पद का ${r} गुना है (एक गुणोत्तर श्रृंखला), इसलिए अगला पद ${n5} × ${r} = ${correct} है।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Treats the series as additive (adds the last two terms, ${n5} + ${n4}) instead of noticing it's multiplicative.`,
          hi: `श्रृंखला को योगात्मक मानता है (अंतिम दो पदों को जोड़ता है, ${n5} + ${n4}) जबकि यह गुणात्मक है।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Uses a ratio of ${r + 1} instead of the actual ${r} — one more than the real common ratio.`,
          hi: `वास्तविक अनुपात ${r} के स्थान पर ${r + 1} का उपयोग करता है — वास्तविक सामान्य अनुपात से एक अधिक।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Multiplies the second-to-last term (${n4}) by the ratio instead of the actual last term (${n5}).`,
          hi: `वास्तविक अंतिम पद (${n5}) के बजाय अंतिम से पहले वाले पद (${n4}) को अनुपात से गुणा करता है।`,
        },
      },
    };
  });
}

// ── Family C (MEDIUM, ×5): quadratic — differences increase by a constant ─
function increasingDifferenceQuestions(): GeneratedQuestion[] {
  const params: { a: number; d0: number; e: number }[] = [
    { a: 1, d0: 2, e: 2 }, { a: 2, d0: 3, e: 2 }, { a: 0, d0: 1, e: 3 }, { a: 3, d0: 2, e: 3 }, { a: 1, d0: 4, e: 2 },
  ];
  return params.map(({ a, d0, e }, i) => {
    const diffs = [0, 1, 2, 3, 4].map((k) => d0 + k * e); // d1..d5
    const terms: number[] = [a];
    for (let k = 0; k < 4; k++) terms.push(terms[k]! + diffs[k]!);
    const n5 = terms[4]!;
    const d4 = diffs[3]!; // last difference actually used to reach n5 (between n4 and n5)
    const d5 = diffs[4]!; // difference to apply next
    const correct = n5 + d5;
    const distractors: [number, number, number] = [n5 + d4, n5 + d5 + 1, terms[3]! + d5];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-numseries-quad-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: seriesStem(terms),
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `The differences between consecutive terms themselves increase by ${e} each time (${diffs.slice(0, 4).join(", ")}, ...), so the next difference is ${d5}: ${n5} + ${d5} = ${correct}.`,
        hi: `लगातार पदों के बीच का अंतर स्वयं हर बार ${e} से बढ़ता है (${diffs.slice(0, 4).join(", ")}, ...), इसलिए अगला अंतर ${d5} है: ${n5} + ${d5} = ${correct}।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Reuses the last visible difference (${d4}) unchanged, missing that the differences are themselves growing by ${e}.`,
          hi: `अंतिम दिखने वाले अंतर (${d4}) को अपरिवर्तित पुनः उपयोग करता है, यह चूक जाता है कि अंतर स्वयं ${e} से बढ़ रहे हैं।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Advances the growing difference one step too far (uses ${d5 + 1} instead of ${d5}).`,
          hi: `बढ़ते हुए अंतर को एक कदम अधिक आगे बढ़ाता है (${d5} के स्थान पर ${d5 + 1} का उपयोग करता है)।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Applies the correct next difference to the wrong (second-to-last) term instead of the actual last term ${n5}.`,
          hi: `सही अगले अंतर को गलत (अंतिम से पहले वाले) पद पर लागू करता है, वास्तविक अंतिम पद ${n5} के बजाय।`,
        },
      },
    };
  });
}

// ── Family D (MEDIUM, ×5): alternating add/subtract ──────────────────────
function alternatingQuestions(): GeneratedQuestion[] {
  const params: { a: number; s1: number; s2: number }[] = [
    { a: 10, s1: 6, s2: 2 }, { a: 5, s1: 8, s2: 3 }, { a: 20, s1: 5, s2: 9 }, { a: 15, s1: 7, s2: 4 }, { a: 8, s1: 10, s2: 3 },
  ];
  return params.map(({ a, s1, s2 }, i) => {
    // n1=a, then alternately +s1, -s2, +s1, -s2 to build n2..n5; next op is +s1 (5th step, odd → +s1).
    const ops = [s1, -s2, s1, -s2];
    const terms: number[] = [a];
    for (const op of ops) terms.push(terms[terms.length - 1]! + op);
    const n5 = terms[4]!;
    const correct = n5 + s1;
    const distractors: [number, number, number] = [n5 - s2, n5 - s1, n5 + Math.round((s1 + s2) / 2)];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-numseries-alt-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: seriesStem(terms),
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `The series alternates between adding ${s1} and subtracting ${s2} (+${s1}, −${s2}, +${s1}, −${s2}, ...). The last step was −${s2}, so the next step adds ${s1}: ${n5} + ${s1} = ${correct}.`,
        hi: `यह श्रृंखला ${s1} जोड़ने और ${s2} घटाने के बीच बदलती रहती है (+${s1}, −${s2}, +${s1}, −${s2}, ...)। अंतिम चरण −${s2} था, इसलिए अगला चरण ${s1} जोड़ता है: ${n5} + ${s1} = ${correct}।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Repeats the same operation as the last step (−${s2}) instead of switching back to +${s1} — fails to alternate.`,
          hi: `अंतिम चरण जैसा ही संचालन दोहराता है (−${s2}) और +${s1} पर वापस नहीं जाता — बदलाव करने में विफल रहता है।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Subtracts ${s1} instead of adding it — swaps which of the two operations comes next.`,
          hi: `${s1} जोड़ने के बजाय घटाता है — यह तय करने में गलती करता है कि अगला कौन-सा संचालन आएगा।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Averages the two step sizes instead of alternating them exactly.`,
          hi: `दोनों चरणों को ठीक-ठीक बदलने के बजाय उनका औसत निकाल लेता है।`,
        },
      },
    };
  });
}

// ── Family E (HARD, ×5): two interleaved arithmetic series ───────────────
function interleavedQuestions(): GeneratedQuestion[] {
  const params: { aOdd: number; dOdd: number; aEven: number; dEven: number }[] = [
    { aOdd: 1, dOdd: 2, aEven: 10, dEven: 5 },
    { aOdd: 3, dOdd: 3, aEven: 20, dEven: 4 },
    { aOdd: 2, dOdd: 4, aEven: 15, dEven: 6 },
    { aOdd: 5, dOdd: 2, aEven: 8, dEven: 7 },
    { aOdd: 1, dOdd: 5, aEven: 12, dEven: 3 },
  ];
  return params.map(({ aOdd, dOdd, aEven, dEven }, i) => {
    // n1,n3,n5 = odd series; n2,n4 = even series.
    const n1 = aOdd, n3 = aOdd + dOdd, n5 = aOdd + 2 * dOdd;
    const n2 = aEven, n4 = aEven + dEven;
    const terms = [n1, n2, n3, n4, n5];
    const correct = n4 + dEven; // n6 continues the even-position series
    const distractors: [number, number, number] = [n5 + dOdd, n4 + dOdd, n5 + dEven];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-numseries-interleave-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: seriesStem(terms),
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `This is actually two interleaved series: the 1st/3rd/5th positions (${n1}, ${n3}, ${n5}) rise by ${dOdd}, and the 2nd/4th positions (${n2}, ${n4}) rise by ${dEven}. The missing 6th term continues the second series: ${n4} + ${dEven} = ${correct}.`,
        hi: `यह वास्तव में दो परस्पर गुंथी हुई श्रृंखलाएँ हैं: पहला/तीसरा/पाँचवाँ स्थान (${n1}, ${n3}, ${n5}) ${dOdd} से बढ़ता है, और दूसरा/चौथा स्थान (${n2}, ${n4}) ${dEven} से बढ़ता है। लुप्त छठा पद दूसरी श्रृंखला को जारी रखता है: ${n4} + ${dEven} = ${correct}।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Wrongly continues the odd-position series (+${dOdd} from ${n5}) instead of switching to the even-position series that the 6th term actually belongs to.`,
          hi: `छठे पद के लिए गलती से विषम-स्थिति श्रृंखला (${n5} से +${dOdd}) को जारी रखता है, जबकि इसे सम-स्थिति श्रृंखला से संबंधित होना चाहिए।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Uses the correct term (${n4}) but the wrong series' difference (${dOdd} instead of ${dEven}).`,
          hi: `सही पद (${n4}) का उपयोग करता है लेकिन गलत श्रृंखला का अंतर (${dEven} के बजाय ${dOdd})।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Uses the correct even-series difference (${dEven}) but applied to the wrong term (${n5} instead of ${n4}).`,
          hi: `सही सम-श्रृंखला अंतर (${dEven}) का उपयोग करता है लेकिन गलत पद पर लागू करता है (${n4} के बजाय ${n5})।`,
        },
      },
    };
  });
}

// ── Family F (HARD, ×5): Fibonacci-like (sum of previous two) ───────────
function fibonacciLikeQuestions(): GeneratedQuestion[] {
  const params: { n1: number; n2: number }[] = [
    { n1: 1, n2: 1 }, { n1: 2, n2: 3 }, { n1: 1, n2: 4 }, { n1: 3, n2: 5 }, { n1: 2, n2: 2 },
  ];
  return params.map(({ n1, n2 }, i) => {
    const n3 = n1 + n2, n4 = n2 + n3, n5 = n3 + n4;
    const terms = [n1, n2, n3, n4, n5];
    const correct = n4 + n5;
    const distractors: [number, number, number] = [n3 + n4, n5 * 2, n5 + n4 - n3];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-numseries-fib-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: seriesStem(terms),
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `Each term is the sum of the two terms before it (${n1}+${n2}=${n3}, ${n2}+${n3}=${n4}, ${n3}+${n4}=${n5}), so the next term is ${n4}+${n5}=${correct}.`,
        hi: `प्रत्येक पद अपने पिछले दो पदों का योग है (${n1}+${n2}=${n3}, ${n2}+${n3}=${n4}, ${n3}+${n4}=${n5}), इसलिए अगला पद ${n4}+${n5}=${correct} है।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Sums the wrong pair (${n3}+${n4}, one step behind) instead of the actual last two terms ${n4} and ${n5}.`,
          hi: `वास्तविक अंतिम दो पदों ${n4} और ${n5} के बजाय एक कदम पीछे के गलत जोड़े (${n3}+${n4}) का योग करता है।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Simply doubles the last term (${n5}×2) instead of adding it to the term before it.`,
          hi: `पिछले पद में जोड़ने के बजाय बस अंतिम पद को दोगुना कर देता है (${n5}×2)।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Miscombines the last three terms (${n5}+${n4}−${n3}) instead of the correct sum of just the last two.`,
          hi: `केवल अंतिम दो के सही योग के बजाय अंतिम तीन पदों को गलत तरीके से मिलाता है (${n5}+${n4}−${n3})।`,
        },
      },
    };
  });
}

// ── Family G (HARD, ×5): mixed operation, "double and add one" ──────────
function mixedOperationQuestions(): GeneratedQuestion[] {
  const params: { a: number; c: number }[] = [
    { a: 1, c: 1 }, { a: 2, c: 1 }, { a: 1, c: 2 }, { a: 3, c: 2 }, { a: 2, c: 3 },
  ];
  return params.map(({ a, c }, i) => {
    const terms: number[] = [a];
    for (let k = 0; k < 4; k++) terms.push(terms[k]! * 2 + c);
    const n5 = terms[4]!;
    const correct = n5 * 2 + c;
    const distractors: [number, number, number] = [n5 * 2, n5 * 2 - c, n5 * 2 + c + 1];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-numseries-mixedop-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: seriesStem(terms),
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `Each term is double the previous term plus ${c} (n → 2n+${c}), so the next term is ${n5}×2+${c} = ${correct}.`,
        hi: `प्रत्येक पद पिछले पद का दोगुना और ${c} अधिक है (n → 2n+${c}), इसलिए अगला पद ${n5}×2+${c} = ${correct} है।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Doubles the last term but forgets to add the constant ${c} at the end.`,
          hi: `अंतिम पद को दोगुना करता है लेकिन अंत में स्थिरांक ${c} जोड़ना भूल जाता है।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Subtracts ${c} instead of adding it after doubling — a sign error on the constant.`,
          hi: `दोगुना करने के बाद ${c} जोड़ने के बजाय घटाता है — स्थिरांक पर एक चिह्न त्रुटि।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Adds one more than the actual constant (${c + 1} instead of ${c}) after doubling.`,
          hi: `दोगुना करने के बाद वास्तविक स्थिरांक से एक अधिक जोड़ता है (${c} के बजाय ${c + 1})।`,
        },
      },
    };
  });
}

export function buildNumberSeriesQuestions(): GeneratedQuestion[] {
  const all = [
    ...arithmeticProgressionQuestions(),
    ...geometricProgressionQuestions(),
    ...increasingDifferenceQuestions(),
    ...alternatingQuestions(),
    ...interleavedQuestions(),
    ...fibonacciLikeQuestions(),
    ...mixedOperationQuestions(),
  ];
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(
      `Number Series pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`
    );
  }
  return all;
}
