import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Factors/HCF/LCM pool (Arithmetic ->
 * "factors_hcf_lcm" topic, JNVST): 10 Easy / 15 Moderate / 15 Hard. Every
 * correct answer is computed by real number theory (Euclid's algorithm for
 * gcd, divisor enumeration for factor counts, primality by trial
 * division) — never hand-typed — and assertDistinctOptions guards
 * against a construction bug seeding a broken question.
 */

const OPTION_IDS = ["a", "b", "c", "d"] as const;

function num(n: number): LangText {
  return { en: String(n), hi: String(n) };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}
function factorsOf(n: number): number[] {
  const result: number[] = [];
  for (let d = 1; d <= n; d++) if (n % d === 0) result.push(d);
  return result;
}
function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** Bounded-loop distractor padding, keyed on `attempt` (never array length) so a rejected candidate is never recomputed identically forever. */
function padDistinctPositive(base: number[], target: number, correct: number, step: number, min = 1): number[] {
  const values = Array.from(new Set(base.filter((v) => v !== correct && v >= min)));
  for (let attempt = 0; values.length < target && attempt < 30; attempt++) {
    const candidate = Math.max(min, correct + step * (attempt + 2) * (attempt % 2 === 0 ? 1 : -1));
    if (candidate !== correct && !values.includes(candidate)) values.push(candidate);
  }
  if (values.length < target) throw new Error(`padDistinctPositive: could not reach ${target} distinct values.`);
  return values.slice(0, target);
}

/** Builds the 4 lettered options from a correct number + 3 distractor numbers, shuffled into a varied position via distributeCorrectPosition. */
function buildNumericQuestion(
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
  const options = OPTION_IDS.map((id, i) => ({ id, text: num(contents[i]!) })) as [OptionSeed, OptionSeed, OptionSeed, OptionSeed];
  return { options, correctOption, distractorAnalysis };
}

// ── EASY (×10): HCF of two numbers ────────────────────────────────────
function hcfTwoQuestions(): GeneratedQuestion[] {
  const pairs: [number, number][] = [
    [12, 18], [24, 36], [15, 25], [8, 20], [14, 21],
    [16, 40], [18, 30], [27, 45], [10, 15], [22, 33],
  ];
  return pairs.map(([a, b], i) => {
    const correct = gcd(a, b);
    const distractorBase = [gcd(a, b) + 2, a % b !== 0 ? a % b : b % a, Math.max(1, correct - 2)];
    const distractors = padDistinctPositive(distractorBase, 3, correct, 3) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildNumericQuestion(
      i % 4,
      correct,
      distractors,
      [
        { en: "Overshoots the true HCF by a small amount — not actually a common factor of both numbers.", hi: "वास्तविक HCF से थोड़ा अधिक — यह दोनों संख्याओं का वास्तविक उभयनिष्ठ गुणनखंड नहीं है।" },
        { en: "Confuses the HCF with the remainder from dividing one number by the other.", hi: "HCF को एक संख्या को दूसरे से भाग देने पर मिले शेषफल से भ्रमित कर देता है।" },
        { en: "Undershoots the true HCF — a common factor, but not the HIGHEST one.", hi: "वास्तविक HCF से कम — एक उभयनिष्ठ गुणनखंड तो है, पर सबसे बड़ा नहीं।" },
      ]
    );
    const key = `bank-ar-hcflcm-hcftwo-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY",
      content: { en: `What is the HCF (Highest Common Factor) of ${a} and ${b}?`, hi: `${a} और ${b} का HCF (महत्तम समापवर्तक) क्या है?` },
      options,
      correctOption,
      explanation: {
        en: `The factors of ${a} are {${factorsOf(a).join(", ")}} and of ${b} are {${factorsOf(b).join(", ")}}. The largest number common to both lists is ${correct}.`,
        hi: `${a} के गुणनखंड {${factorsOf(a).join(", ")}} हैं और ${b} के {${factorsOf(b).join(", ")}}। दोनों सूचियों में उभयनिष्ठ सबसे बड़ी संख्या ${correct} है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (a) ×5: LCM of two numbers ─────────────────────────────
function lcmTwoQuestions(): GeneratedQuestion[] {
  const pairs: [number, number][] = [
    [4, 6], [8, 12], [9, 15], [6, 10], [14, 21],
  ];
  return pairs.map(([a, b], i) => {
    const correct = lcm(a, b);
    const distractorBase = [a * b, correct + Math.min(a, b), Math.max(a, b)];
    const distractors = padDistinctPositive(distractorBase, 3, correct, Math.min(a, b)) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildNumericQuestion(
      (i + 1) % 4,
      correct,
      distractors,
      [
        { en: `Just multiplies ${a} × ${b} directly, forgetting to divide out their common factor — that only works when the two numbers share no common factor.`, hi: `केवल ${a} × ${b} को सीधे गुणा कर देता है, उनके उभयनिष्ठ गुणनखंड को हटाना भूल जाता है — यह तभी काम करता है जब दोनों संख्याओं में कोई उभयनिष्ठ गुणनखंड न हो।` },
        { en: "Adds the smaller number once more instead of finding the true least common multiple.", hi: "वास्तविक लघुत्तम समापवर्त्य खोजने के बजाय छोटी संख्या को एक बार और जोड़ देता है।" },
        { en: "Picks the larger of the two original numbers — a common multiple only of itself, not necessarily of the other number.", hi: "दोनों मूल संख्याओं में से बड़ी संख्या चुन लेता है — यह केवल अपना ही गुणज है, दूसरी संख्या का ज़रूरी नहीं।" },
      ]
    );
    const key = `bank-ar-hcflcm-lcmtwo-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: { en: `What is the LCM (Lowest Common Multiple) of ${a} and ${b}?`, hi: `${a} और ${b} का LCM (लघुत्तम समापवर्त्य) क्या है?` },
      options,
      correctOption,
      explanation: {
        en: `LCM(${a}, ${b}) = (${a} × ${b}) ÷ HCF(${a}, ${b}) = (${a * b}) ÷ ${gcd(a, b)} = ${correct}.`,
        hi: `LCM(${a}, ${b}) = (${a} × ${b}) ÷ HCF(${a}, ${b}) = (${a * b}) ÷ ${gcd(a, b)} = ${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (b) ×5: how many factors does N have ──────────────────
function countFactorsQuestions(): GeneratedQuestion[] {
  const numbers = [12, 18, 24, 20, 28];
  return numbers.map((n, i) => {
    const factors = factorsOf(n);
    const correct = factors.length;
    const distractorBase = [correct - 1, correct + 1, correct + 2];
    const distractors = padDistinctPositive(distractorBase, 3, correct, 2) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildNumericQuestion(
      (i + 2) % 4,
      correct,
      distractors,
      [
        { en: "Misses one factor when listing them out — an easy slip if you forget to check both ends of the list (1 and the number itself).", hi: "गुणनखंड सूचीबद्ध करते समय एक गुणनखंड छूट जाता है — यह तब आसानी से हो सकता है जब सूची के दोनों छोर (1 और स्वयं संख्या) की जाँच न की जाए।" },
        { en: "Counts one factor twice, often by double-counting a repeated pair near the square root.", hi: "एक गुणनखंड को दो बार गिन लेता है, अक्सर वर्गमूल के पास एक दोहराए गए जोड़े को दोबारा गिनकर।" },
        { en: "Counts two extra numbers that are not actually factors of this number.", hi: "दो अतिरिक्त संख्याएँ गिन लेता है जो वास्तव में इस संख्या के गुणनखंड नहीं हैं।" },
      ]
    );
    const key = `bank-ar-hcflcm-countfactors-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: { en: `How many factors does ${n} have (including 1 and ${n} itself)?`, hi: `${n} के कितने गुणनखंड हैं (1 और ${n} को शामिल करते हुए)?` },
      options,
      correctOption,
      explanation: {
        en: `The factors of ${n} are {${factors.join(", ")}} — that's ${correct} in total.`,
        hi: `${n} के गुणनखंड {${factors.join(", ")}} हैं — कुल मिलाकर ${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM family (c) ×5: is N prime, or which option is a factor ───────
function primeOrFactorQuestions(): GeneratedQuestion[] {
  const numbers = [17, 21, 29, 33, 41];
  return numbers.map((n, i) => {
    const factors = factorsOf(n);
    const nIsPrime = isPrime(n);
    const correctText = nIsPrime ? "Prime" : "Composite";
    const distractorTexts = nIsPrime ? ["Composite", "Even", "A perfect square"] : ["Prime", "Even", "A perfect square"];
    const correctItem: LangText = { en: correctText, hi: correctText === "Prime" ? "अभाज्य" : "भाज्य (यौगिक)" };
    const distractorItems: [LangText, LangText, LangText] = [
      { en: distractorTexts[0]!, hi: distractorTexts[0] === "Prime" ? "अभाज्य" : "भाज्य (यौगिक)" },
      { en: distractorTexts[1]!, hi: "सम संख्या" },
      { en: distractorTexts[2]!, hi: "एक पूर्ण वर्ग" },
    ];
    const correctIndex = (i + 3) % 4;
    const { contents, correctOption, distractorAnalysis } = distributeCorrectPosition(
      correctIndex,
      correctItem,
      distractorItems,
      [
        { en: `${n} only has the factors 1 and ${n} itself — the opposite classification is wrong.`, hi: `${n} के केवल गुणनखंड 1 और स्वयं ${n} हैं — विपरीत वर्गीकरण गलत है।` },
        { en: `${n} is odd (it does not divide evenly by 2), so this is a wrong classification entirely.`, hi: `${n} विषम है (यह 2 से पूर्ण रूप से विभाजित नहीं होती), इसलिए यह वर्गीकरण पूरी तरह गलत है।` },
        { en: `${n} is not a perfect square — no whole number multiplied by itself gives ${n}.`, hi: `${n} एक पूर्ण वर्ग नहीं है — कोई भी पूर्ण संख्या स्वयं से गुणा करने पर ${n} नहीं देती।` },
      ]
    );
    const options = OPTION_IDS.map((id, idx) => ({ id, text: contents[idx]! })) as [OptionSeed, OptionSeed, OptionSeed, OptionSeed];
    const key = `bank-ar-hcflcm-primefactor-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: { en: `Is ${n} a Prime or a Composite number?`, hi: `क्या ${n} एक अभाज्य (Prime) या भाज्य (Composite) संख्या है?` },
      options,
      correctOption,
      explanation: {
        en: nIsPrime
          ? `${n} has no factors other than 1 and itself (checking all numbers up to √${n} confirms none divide it evenly), so it is Prime.`
          : `${n} = ${factors.filter((f) => f !== 1 && f !== n).length > 0 ? `${factors.find((f) => f !== 1 && f !== n)} × ${n / factors.find((f) => f !== 1 && f !== n)!}` : n} — it has factors beyond 1 and itself, so it is Composite.`,
        hi: nIsPrime
          ? `${n} के 1 और स्वयं के अलावा कोई गुणनखंड नहीं है (√${n} तक सभी संख्याओं की जाँच करने पर कोई भी इसे पूर्ण रूप से विभाजित नहीं करती), इसलिए यह अभाज्य है।`
          : `${n} के 1 और स्वयं के अलावा भी गुणनखंड हैं, इसलिए यह भाज्य (यौगिक) है।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (a) ×5: HCF of three numbers ─────────────────────────────
function hcfThreeQuestions(): GeneratedQuestion[] {
  const triples: [number, number, number][] = [
    [12, 18, 24], [16, 24, 40], [20, 30, 50], [14, 21, 28], [18, 27, 45],
  ];
  return triples.map(([a, b, c], i) => {
    const correct = gcd(gcd(a, b), c);
    const distractorBase = [gcd(a, b), gcd(b, c), correct + 2];
    const distractors = padDistinctPositive(distractorBase, 3, correct, 2) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildNumericQuestion(
      i % 4,
      correct,
      distractors,
      [
        { en: `This is only the HCF of the first two numbers (${a} and ${b}) — it stops before checking the third number ${c}.`, hi: `यह केवल पहली दो संख्याओं (${a} और ${b}) का HCF है — यह तीसरी संख्या ${c} की जाँच करने से पहले ही रुक जाता है।` },
        { en: `This is only the HCF of the last two numbers (${b} and ${c}) — it skips the first number ${a}.`, hi: `यह केवल अंतिम दो संख्याओं (${b} और ${c}) का HCF है — यह पहली संख्या ${a} को छोड़ देता है।` },
        { en: "Overshoots the true HCF by a small amount — not actually a common factor of all three numbers.", hi: "वास्तविक HCF से थोड़ा अधिक — यह तीनों संख्याओं का वास्तविक उभयनिष्ठ गुणनखंड नहीं है।" },
      ]
    );
    const key = `bank-ar-hcflcm-hcfthree-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: { en: `What is the HCF of ${a}, ${b}, and ${c}?`, hi: `${a}, ${b}, और ${c} का HCF क्या है?` },
      options,
      correctOption,
      explanation: {
        en: `First find HCF(${a}, ${b}) = ${gcd(a, b)}, then HCF(${gcd(a, b)}, ${c}) = ${correct}. So HCF(${a}, ${b}, ${c}) = ${correct}.`,
        hi: `पहले HCF(${a}, ${b}) = ${gcd(a, b)} निकालें, फिर HCF(${gcd(a, b)}, ${c}) = ${correct}। इसलिए HCF(${a}, ${b}, ${c}) = ${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (b) ×5: LCM of three numbers ─────────────────────────────
function lcmThreeQuestions(): GeneratedQuestion[] {
  const triples: [number, number, number][] = [
    [2, 3, 4], [3, 4, 6], [4, 5, 10], [2, 5, 6], [3, 5, 9],
  ];
  return triples.map(([a, b, c], i) => {
    const correct = lcm(lcm(a, b), c);
    const distractorBase = [lcm(a, b), lcm(b, c), a * b * c];
    const distractors = padDistinctPositive(distractorBase, 3, correct, Math.min(a, b, c)) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildNumericQuestion(
      (i + 1) % 4,
      correct,
      distractors,
      [
        { en: `This is only the LCM of the first two numbers (${a} and ${b}) — it stops before checking the third number ${c}.`, hi: `यह केवल पहली दो संख्याओं (${a} और ${b}) का LCM है — यह तीसरी संख्या ${c} की जाँच करने से पहले ही रुक जाता है।` },
        { en: `This is only the LCM of the last two numbers (${b} and ${c}) — it skips the first number ${a}.`, hi: `यह केवल अंतिम दो संख्याओं (${b} और ${c}) का LCM है — यह पहली संख्या ${a} को छोड़ देता है।` },
        { en: "Just multiplies all three numbers together, forgetting to divide out their shared common factors.", hi: "बस तीनों संख्याओं को एक साथ गुणा कर देता है, उनके साझा उभयनिष्ठ गुणनखंडों को हटाना भूल जाता है।" },
      ]
    );
    const key = `bank-ar-hcflcm-lcmthree-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: { en: `What is the LCM of ${a}, ${b}, and ${c}?`, hi: `${a}, ${b}, और ${c} का LCM क्या है?` },
      options,
      correctOption,
      explanation: {
        en: `First find LCM(${a}, ${b}) = ${lcm(a, b)}, then LCM(${lcm(a, b)}, ${c}) = ${correct}. So LCM(${a}, ${b}, ${c}) = ${correct}.`,
        hi: `पहले LCM(${a}, ${b}) = ${lcm(a, b)} निकालें, फिर LCM(${lcm(a, b)}, ${c}) = ${correct}। इसलिए LCM(${a}, ${b}, ${c}) = ${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD family (c) ×5: word problem — bells/lights ringing together (LCM) ─
function bellsWordProblemQuestions(): GeneratedQuestion[] {
  const params: [number, number, number][] = [
    [4, 6, 8], [5, 10, 15], [6, 9, 12], [3, 4, 6], [8, 12, 16],
  ];
  return params.map(([a, b, c], i) => {
    const correct = lcm(lcm(a, b), c);
    const distractorBase = [a + b + c, lcm(a, b), Math.max(a, b, c) * 2];
    const distractors = padDistinctPositive(distractorBase, 3, correct, Math.min(a, b, c)) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildNumericQuestion(
      (i + 2) % 4,
      correct,
      distractors,
      [
        { en: "Simply adds up the three intervals instead of finding when they genuinely coincide again.", hi: "तीनों अंतरालों को केवल जोड़ देता है, इसके बजाय यह पता लगाए कि वे वास्तव में फिर कब एक साथ होते हैं।" },
        { en: "Only accounts for two of the three bells lining up, forgetting the third one has its own separate interval.", hi: "तीन में से केवल दो घंटियों के मेल का हिसाब रखता है, यह भूलकर कि तीसरी का अपना अलग अंतराल है।" },
        { en: "Just doubles the longest interval, which doesn't guarantee all three bells actually ring together at that moment.", hi: "बस सबसे लंबे अंतराल को दोगुना कर देता है, जो यह गारंटी नहीं देता कि उस क्षण तीनों घंटियाँ वास्तव में एक साथ बजेंगी।" },
      ]
    );
    const key = `bank-ar-hcflcm-bells-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `Three bells ring at intervals of ${a}, ${b}, and ${c} minutes respectively. If they all ring together now, after how many minutes will they next ring together?`,
        hi: `तीन घंटियाँ क्रमशः ${a}, ${b}, और ${c} मिनट के अंतराल पर बजती हैं। यदि वे अभी सभी एक साथ बजती हैं, तो वे अगली बार कितने मिनट बाद एक साथ बजेंगी?`,
      },
      options,
      correctOption,
      explanation: {
        en: `The bells ring together again after the LCM of their intervals: LCM(${a}, ${b}, ${c}) = ${correct} minutes.`,
        hi: `घंटियाँ अपने अंतरालों के LCM के बाद फिर एक साथ बजेंगी: LCM(${a}, ${b}, ${c}) = ${correct} मिनट।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildFactorsHcfLcmQuestions(): GeneratedQuestion[] {
  const all = [
    ...hcfTwoQuestions(),
    ...lcmTwoQuestions(),
    ...countFactorsQuestions(),
    ...primeOrFactorQuestions(),
    ...hcfThreeQuestions(),
    ...lcmThreeQuestions(),
    ...bellsWordProblemQuestions(),
  ].map((q) => ({ ...q, targetExam: "JNVST" as const }));
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(`Factors/HCF/LCM pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}
