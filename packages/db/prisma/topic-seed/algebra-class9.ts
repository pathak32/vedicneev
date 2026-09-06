import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Class 9 Algebra pool (Mathematics ->
 * "algebra_class9" topic): 10 Easy / 15 Moderate / 15 Hard. Every correct
 * answer is computed by real algebra (linear equations, the (a+b)²/(a-b)²/
 * difference-of-squares identities, and polynomial evaluation) — never
 * hand-typed — and assertDistinctOptions guards against a construction bug
 * seeding a broken question.
 */

const OPTION_IDS = ["a", "b", "c", "d"] as const;

function numText(n: number): LangText {
  return { en: String(n), hi: String(n) };
}

function padDistinctNumbers(base: number[], target: number, correct: number, step: number): number[] {
  const values = Array.from(new Set(base.filter((v) => v !== correct)));
  for (let attempt = 0; values.length < target && attempt < 30; attempt++) {
    const candidate = correct + step * (attempt + 2) * (attempt % 2 === 0 ? 1 : -1);
    if (candidate !== correct && !values.includes(candidate)) values.push(candidate);
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

// ── EASY (×10): solve ax + b = c for x ────────────────────────────────────
function linearEquationQuestions(): GeneratedQuestion[] {
  const params: { a: number; b: number; c: number }[] = [
    { a: 2, b: 3, c: 11 },
    { a: 3, b: -4, c: 11 },
    { a: 4, b: 5, c: 25 },
    { a: 5, b: -6, c: 24 },
    { a: 6, b: 7, c: 43 },
    { a: 2, b: -9, c: 5 },
    { a: 3, b: 8, c: 26 },
    { a: 7, b: -2, c: 33 },
    { a: 4, b: -3, c: 17 },
    { a: 5, b: 10, c: 45 },
  ];
  return params.map(({ a, b, c }, i) => {
    const correct = (c - b) / a;
    const distractorBase = [c - b, (c + b) / a, correct + a];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 1) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(i % 4, correct, distractors, [
      { en: `Forgets to divide by ${a} after moving ${b} to the other side.`, hi: `${b} को दूसरी ओर ले जाने के बाद ${a} से भाग देना भूल जाता है।` },
      { en: `Adds ${b} instead of subtracting it when isolating the ${a}x term.`, hi: `${a}x पद को अलग करते समय ${b} को घटाने के बजाय जोड़ देता है।` },
      { en: `An off-by-${a} slip after correctly setting up the equation.`, hi: `समीकरण सही ढंग से बनाने के बाद ${a} की एक चूक।` },
    ]);
    const key = `bank-math9-algebra-linear-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    const bTerm = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
    return {
      key,
      difficulty: "EASY" as const,
      content: { en: `Solve for x: ${a}x ${bTerm} = ${c}`, hi: `x के लिए हल करें: ${a}x ${bTerm} = ${c}` },
      options,
      correctOption,
      explanation: {
        en: `${a}x = ${c} − (${b}) = ${c - b}, so x = ${c - b} ÷ ${a} = ${correct}.`,
        hi: `${a}x = ${c} − (${b}) = ${c - b}, इसलिए x = ${c - b} ÷ ${a} = ${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM (×8): (a+b)² / (a-b)² identity evaluation ─────────────────────
function squareIdentityQuestions(): GeneratedQuestion[] {
  const params: { a: number; b: number; sign: "+" | "-" }[] = [
    { a: 12, b: 3, sign: "+" },
    { a: 15, b: 4, sign: "-" },
    { a: 20, b: 5, sign: "+" },
    { a: 18, b: 7, sign: "-" },
    { a: 25, b: 6, sign: "+" },
    { a: 30, b: 8, sign: "-" },
    { a: 22, b: 9, sign: "+" },
    { a: 40, b: 10, sign: "-" },
  ];
  return params.map(({ a, b, sign }, i) => {
    const correct = sign === "+" ? (a + b) * (a + b) : (a - b) * (a - b);
    const crossTerm = 2 * a * b;
    const noCross = a * a + b * b;
    const wrongSign = sign === "+" ? (a - b) * (a - b) : (a + b) * (a + b);
    const distractorBase = [noCross, wrongSign, correct + 2 * b];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 4) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(i % 4, correct, distractors, [
      { en: `Uses a²+b² and forgets the middle "2ab" cross term entirely (${a}²+${b}²=${noCross}).`, hi: `a²+b² का उपयोग करता है और बीच का "2ab" पद पूरी तरह भूल जाता है (${a}²+${b}²=${noCross})।` },
      { en: `Applies the opposite identity — uses (a${sign === "+" ? "−" : "+"}b)² instead of (a${sign}b)².`, hi: `विपरीत सर्वसमिका का उपयोग करता है — (a${sign}b)² के बजाय (a${sign === "+" ? "−" : "+"}b)² का प्रयोग करता है।` },
      { en: `Gets the cross term right but makes an arithmetic slip in the final addition.`, hi: `क्रॉस पद सही निकालता है पर अंतिम जोड़ में एक अंकगणितीय चूक करता है।` },
    ]);
    const key = `bank-math9-algebra-squareid-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM" as const,
      content: {
        en: `Using the identity (a${sign}b)² = a²${sign === "+" ? "+2ab+" : "−2ab+"}b², find (${a}${sign}${b})².`,
        hi: `सर्वसमिका (a${sign}b)² = a²${sign === "+" ? "+2ab+" : "−2ab+"}b² का उपयोग करके, (${a}${sign}${b})² ज्ञात करें।`,
      },
      options,
      correctOption,
      explanation: {
        en: `a²=${a * a}, b²=${b * b}, 2ab=${crossTerm}. (a${sign}b)² = ${a * a} ${sign === "+" ? "+" : "−"} ${crossTerm} + ${b * b} = ${correct}.`,
        hi: `a²=${a * a}, b²=${b * b}, 2ab=${crossTerm}। (a${sign}b)² = ${a * a} ${sign === "+" ? "+" : "−"} ${crossTerm} + ${b * b} = ${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM (×7): evaluate p(x) = ax² + bx + c at x = k ───────────────────
function polynomialEvaluationQuestions(): GeneratedQuestion[] {
  const params: { a: number; b: number; c: number; k: number }[] = [
    { a: 1, b: 2, c: 3, k: 4 },
    { a: 2, b: -3, c: 5, k: 3 },
    { a: 1, b: -4, c: 6, k: 5 },
    { a: 3, b: 2, c: -1, k: 2 },
    { a: 2, b: 5, c: 1, k: 3 },
    { a: 1, b: 6, c: -2, k: 4 },
    { a: 4, b: -1, c: 2, k: 2 },
  ];
  return params.map(({ a, b, c, k }, i) => {
    const correct = a * k * k + b * k + c;
    const forgotSquare = a * k + b * k + c;
    const signSlip = a * k * k - b * k + c;
    const droppedConstant = a * k * k + b * k;
    const distractorBase = [forgotSquare, signSlip, droppedConstant];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 3) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(i % 4, correct, distractors, [
      { en: `Computes a×k instead of a×k² — forgets to square k in the first term.`, hi: `पहले पद में k का वर्ग करना भूल जाता है — a×k² के बजाय a×k की गणना करता है।` },
      { en: `Flips the sign of the "bx" term.`, hi: `"bx" पद के चिह्न को उलट देता है।` },
      { en: `Drops the constant term "c" entirely from the final sum.`, hi: `अंतिम योग से स्थिरांक पद "c" को पूरी तरह हटा देता है।` },
    ]);
    const key = `bank-math9-algebra-polyeval-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    const bTerm = b >= 0 ? `+ ${b}x` : `− ${Math.abs(b)}x`;
    const cTerm = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
    return {
      key,
      difficulty: "MEDIUM" as const,
      content: {
        en: `If p(x) = ${a}x² ${bTerm} ${cTerm}, find p(${k}).`,
        hi: `यदि p(x) = ${a}x² ${bTerm} ${cTerm}, तो p(${k}) ज्ञात करें।`,
      },
      options,
      correctOption,
      explanation: {
        en: `p(${k}) = ${a}×${k}² ${bTerm.replace("x", `×${k}`)} ${cTerm} = ${a * k * k} ${b >= 0 ? "+" : "−"} ${Math.abs(b * k)} ${cTerm} = ${correct}.`,
        hi: `p(${k}) = ${a}×${k}² ${bTerm.replace("x", `×${k}`)} ${cTerm} = ${a * k * k} ${b >= 0 ? "+" : "−"} ${Math.abs(b * k)} ${cTerm} = ${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD (×7): two-bracket linear equation a(x+p) − b(x−q) = r ───────────
function twoBracketEquationQuestions(): GeneratedQuestion[] {
  const params: { a: number; p: number; b: number; q: number; targetX: number }[] = [
    { a: 3, p: 2, b: 1, q: 1, targetX: 5 },
    { a: 4, p: 1, b: 2, q: 3, targetX: 6 },
    { a: 5, p: 3, b: 2, q: 2, targetX: 4 },
    { a: 2, p: 4, b: 1, q: 5, targetX: 7 },
    { a: 6, p: 1, b: 3, q: 1, targetX: 3 },
    { a: 3, p: 5, b: 2, q: 3, targetX: 8 },
    { a: 4, p: 2, b: 3, q: 4, targetX: 5 },
  ];
  return params.map(({ a, p, b, q, targetX }, i) => {
    // a(x+p) - b(x-q) = (a-b)x + (a*p + b*q); solve for r at x = targetX so the answer is clean.
    // Requires q > 0 so the rendered "(x − q)" below matches this expansion — a
    // negative q would need "(x + |q|)" instead, which this family never uses.
    if (q <= 0) throw new Error(`twoBracketEquationQuestions: q must be positive, got ${q}.`);
    const coefX = a - b;
    const constant = a * p + b * q;
    const r = coefX * targetX + constant;
    const correct = targetX;
    const distractorBase = [
      (r - constant) / coefX + 2,
      (r + constant) / coefX,
      correct - 1,
    ].map((v) => Math.round(v));
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 1) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(i % 4, correct, distractors, [
      { en: `An arithmetic slip while isolating x after correctly expanding both brackets.`, hi: `दोनों कोष्ठकों को सही ढंग से खोलने के बाद x को अलग करते समय एक अंकगणितीय चूक।` },
      { en: `Adds the constant term instead of subtracting it when moving it to the other side.`, hi: `स्थिरांक पद को दूसरी ओर ले जाते समय घटाने के बजाय जोड़ देता है।` },
      { en: `Off by one after an otherwise correct solution.`, hi: `अन्यथा सही हल के बाद एक की चूक।` },
    ]);
    const key = `bank-math9-algebra-twobracket-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    const pTerm = p >= 0 ? `+ ${p}` : `− ${Math.abs(p)}`;
    return {
      key,
      difficulty: "HARD" as const,
      content: {
        en: `Solve for x: ${a}(x ${pTerm}) − ${b}(x − ${q}) = ${r}`,
        hi: `x के लिए हल करें: ${a}(x ${pTerm}) − ${b}(x − ${q}) = ${r}`,
      },
      options,
      correctOption,
      explanation: {
        en: `Expanding: ${a}x + ${a * p} − ${b}x − ${b * q} = ${r}, so ${coefX}x + ${constant} = ${r}, giving ${coefX}x = ${r - constant}, so x = ${correct}.`,
        hi: `विस्तार करने पर: ${a}x + ${a * p} − ${b}x − ${b * q} = ${r}, इसलिए ${coefX}x + ${constant} = ${r}, जिससे ${coefX}x = ${r - constant}, अतः x = ${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD (×8): difference-of-squares identity to compute a product ──────
function differenceOfSquaresQuestions(): GeneratedQuestion[] {
  const params: { base: number; dev: number }[] = [
    { base: 50, dev: 3 },
    { base: 100, dev: 4 },
    { base: 40, dev: 2 },
    { base: 60, dev: 5 },
    { base: 200, dev: 6 },
    { base: 80, dev: 7 },
    { base: 30, dev: 4 },
    { base: 500, dev: 8 },
  ];
  return params.map(({ base, dev }, i) => {
    const x = base - dev;
    const y = base + dev;
    const correct = base * base - dev * dev;
    const forgotSubtract = base * base + dev * dev;
    const wrongBase = base * base - dev;
    const wrongDevSquare = base * base - dev * dev * 2;
    const distractorBase = [forgotSubtract, wrongBase, wrongDevSquare];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 10) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(i % 4, correct, distractors, [
      { en: `Adds the squares instead of subtracting — uses a²+b² instead of a²−b².`, hi: `घटाने के बजाय वर्गों को जोड़ देता है — a²−b² के बजाय a²+b² का उपयोग करता है।` },
      { en: `Subtracts ${dev} directly instead of ${dev}² from ${base}².`, hi: `${base}² से ${dev}² के बजाय सीधे ${dev} घटा देता है।` },
      { en: `Doubles the deviation's square by mistake before subtracting.`, hi: `घटाने से पहले गलती से विचलन के वर्ग को दोगुना कर देता है।` },
    ]);
    const key = `bank-math9-algebra-diffsquares-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD" as const,
      content: {
        en: `Using the identity (a−b)(a+b) = a²−b², quickly find ${x} × ${y}.`,
        hi: `सर्वसमिका (a−b)(a+b) = a²−b² का उपयोग करके, शीघ्रता से ${x} × ${y} ज्ञात करें।`,
      },
      options,
      correctOption,
      explanation: {
        en: `${x} = ${base}−${dev} and ${y} = ${base}+${dev}, so ${x}×${y} = ${base}²−${dev}² = ${base * base}−${dev * dev} = ${correct}.`,
        hi: `${x} = ${base}−${dev} और ${y} = ${base}+${dev}, इसलिए ${x}×${y} = ${base}²−${dev}² = ${base * base}−${dev * dev} = ${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildAlgebraClass9Questions(): GeneratedQuestion[] {
  const all = [
    ...linearEquationQuestions(),
    ...squareIdentityQuestions(),
    ...polynomialEvaluationQuestions(),
    ...twoBracketEquationQuestions(),
    ...differenceOfSquaresQuestions(),
  ].map((q) => ({ ...q, targetClass: "CLASS_9" as const }));
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Algebra Class 9 pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}
