import { assertDistinctOptions, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Pattern Completion pool (Mental Ability →
 * "pattern_completion" topic): 10 Easy / 15 Moderate / 15 Hard. Distinct in
 * presentation from Number Series (which is pure linear sequences) — this
 * topic covers grid/matrix patterns, letter-to-number coding, and
 * analogy-style relations, matching how this codebase's existing
 * pattern_completion example question ("1, 4, 9, 16, 25, ?") already treats
 * this topic as numeric-pattern-based rather than purely visual. Every
 * correct answer and distractor is computed by real arithmetic — never
 * hand-typed — and assertDistinctOptions guards every item.
 */

const OPTION_IDS = ["a", "b", "c", "d"] as const;

function num(n: number): LangText {
  return { en: String(n), hi: String(n) };
}

function buildOptions(correct: number, distractors: [number, number, number]): [OptionSeed, OptionSeed, OptionSeed, OptionSeed] {
  const values = [correct, ...distractors];
  const shift = ((correct % 4) + 4) % 4;
  const rotated = [...values.slice(shift), ...values.slice(0, shift)];
  return OPTION_IDS.map((id, i) => ({ id, text: num(rotated[i]!) })) as [OptionSeed, OptionSeed, OptionSeed, OptionSeed];
}

function correctOptionId(options: OptionSeed[], value: number): string {
  const match = options.find((o) => o.text.en === String(value));
  if (!match) throw new Error(`Value ${value} not found among generated options.`);
  return match.id;
}

// ── Family A (EASY, ×10): perfect squares / cubes pattern ────────────────
function powerPatternQuestions(): GeneratedQuestion[] {
  const params: { start: number; power: 2 | 3 }[] = [
    { start: 1, power: 2 }, { start: 2, power: 2 }, { start: 3, power: 2 }, { start: 1, power: 2 }, { start: 4, power: 2 },
    { start: 2, power: 2 }, { start: 5, power: 2 }, { start: 1, power: 3 }, { start: 2, power: 3 }, { start: 3, power: 2 },
  ];
  return params.map(({ start, power }, i) => {
    const terms = [0, 1, 2, 3, 4].map((k) => (start + k) ** power);
    const correct = (start + 5) ** power;
    const last = terms[4]!;
    // last: repeats the final shown term instead of advancing the pattern.
    // correct-1: a plain off-by-one slip.
    // wrongBase: multiplies the correct next base against the previous one instead of raising it to the full power.
    const wrongBase = power === 2 ? (start + 5) * (start + 4) : (start + 5) * (start + 5) * (start + 4);
    const distractors: [number, number, number] = [last, correct - 1, wrongBase];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-pattern-power-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    const label = power === 2 ? "square" : "cube";
    return {
      key,
      difficulty: "EASY",
      content: {
        en: `Find the missing number in the pattern: ${terms.join(", ")}, ?`,
        hi: `पैटर्न में लुप्त संख्या ज्ञात करें: ${terms.join(", ")}, ?`,
      },
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `These are consecutive ${label}s starting from ${start}${power === 2 ? "²" : "³"} (${terms.map((t, k) => `${start + k}${power === 2 ? "²" : "³"}`).join(", ")}); the next is ${start + 5}${power === 2 ? "²" : "³"} = ${correct}.`,
        hi: `ये ${start}${power === 2 ? "²" : "³"} से शुरू होने वाले क्रमागत ${label === "square" ? "वर्ग" : "घन"} हैं; अगला ${start + 5}${power === 2 ? "²" : "³"} = ${correct} है।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Simply repeats the last shown term instead of continuing the pattern to the next base.`,
          hi: `पैटर्न को अगले आधार तक जारी रखने के बजाय अंतिम दिखाए गए पद को ही दोहरा देता है।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Off by one from the correct ${label} — a simple arithmetic slip.`,
          hi: `सही ${label === "square" ? "वर्ग" : "घन"} से एक की गलती — एक सामान्य अंकगणितीय भूल।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Multiplies the correct next base against the previous base instead of raising it fully to the ${label === "square" ? "2nd" : "3rd"} power.`,
          hi: `सही अगले आधार को पूरी तरह ${label === "square" ? "दूसरी" : "तीसरी"} घात तक ले जाने के बजाय पिछले आधार से गुणा कर देता है।`,
        },
      },
    };
  });
}

// ── Family B (MEDIUM, ×5): 3×3 grid, each row follows "a op b = c" ──────
function gridRowOperationQuestions(): GeneratedQuestion[] {
  const rows: { a: number; b: number }[][] = [
    [{ a: 2, b: 3 }, { a: 4, b: 5 }, { a: 6, b: 7 }],
    [{ a: 3, b: 4 }, { a: 5, b: 6 }, { a: 7, b: 8 }],
    [{ a: 2, b: 5 }, { a: 3, b: 6 }, { a: 4, b: 9 }],
    [{ a: 1, b: 6 }, { a: 2, b: 7 }, { a: 3, b: 9 }],
    [{ a: 4, b: 2 }, { a: 6, b: 3 }, { a: 8, b: 5 }],
  ];
  return rows.map((triples, i) => {
    // Rule: c = a*b + (a - b) for the first four sets; verified by direct computation, not asserted.
    const c = (a: number, b: number) => a * b + (a - b);
    const gridRows = triples.map(({ a, b }) => `${a}, ${b}, ${c(a, b)}`);
    const last = triples[2]!;
    const correct = c(last.a, last.b);
    const wrongRule1 = (a: number, b: number) => a * b; // forgets the "+(a-b)" correction
    const wrongRule2 = (a: number, b: number) => a + b + (a - b); // adds instead of multiplies
    const wrongRule3 = (a: number, b: number) => a * b + (b - a); // sign-flips the correction
    const distractors: [number, number, number] = [
      wrongRule1(last.a, last.b),
      wrongRule2(last.a, last.b),
      wrongRule3(last.a, last.b),
    ];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-pattern-grid-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    // Show only the first two rows fully and the third row's first two numbers, matching a real grid-completion item.
    const shownRows = [gridRows[0], gridRows[1], `${last.a}, ${last.b}, ?`];
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `In each row below, the same rule turns the first two numbers into the third. Find the missing number:\nRow 1: ${shownRows[0]}\nRow 2: ${shownRows[1]}\nRow 3: ${shownRows[2]}`,
        hi: `नीचे प्रत्येक पंक्ति में, एक ही नियम पहले दो अंकों को तीसरे अंक में बदलता है। लुप्त अंक ज्ञात करें:\nपंक्ति 1: ${shownRows[0]}\nपंक्ति 2: ${shownRows[1]}\nपंक्ति 3: ${shownRows[2]}`,
      },
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `The rule is: third number = (first × second) + (first − second). Checking row 1: ${triples[0]!.a}×${triples[0]!.b}+(${triples[0]!.a}−${triples[0]!.b})=${c(triples[0]!.a, triples[0]!.b)} ✓. Applying it to row 3: ${last.a}×${last.b}+(${last.a}−${last.b})=${correct}.`,
        hi: `नियम है: तीसरा अंक = (पहला × दूसरा) + (पहला − दूसरा)। पंक्ति 1 की जाँच करें: ${triples[0]!.a}×${triples[0]!.b}+(${triples[0]!.a}−${triples[0]!.b})=${c(triples[0]!.a, triples[0]!.b)} ✓। पंक्ति 3 पर लागू करें: ${last.a}×${last.b}+(${last.a}−${last.b})=${correct}।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Uses only the product (first × second) and forgets the "+(first − second)" correction the rule requires.`,
          hi: `केवल गुणनफल (पहला × दूसरा) का उपयोग करता है और नियम द्वारा आवश्यक "+(पहला − दूसरा)" सुधार को भूल जाता है।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Adds the two numbers instead of multiplying them before applying the correction term.`,
          hi: `सुधार पद लागू करने से पहले दोनों अंकों को गुणा करने के बजाय जोड़ देता है।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Flips the sign of the correction term, using (second − first) instead of (first − second).`,
          hi: `सुधार पद के चिह्न को उलट देता है, (पहला − दूसरा) के बजाय (दूसरा − पहला) का उपयोग करता है।`,
        },
      },
    };
  });
}

// ── Family C (MEDIUM, ×5): letter-to-number coding (position sum) ───────
function positionSumCodeQuestions(): GeneratedQuestion[] {
  const words: string[] = ["CAT", "DOG", "SUN", "BAT", "MAP"];
  function positionSum(word: string): number {
    return word
      .toUpperCase()
      .split("")
      .reduce((sum, ch) => sum + (ch.charCodeAt(0) - 64), 0);
  }
  return words.map((sampleWord, i) => {
    const targetWord = ["DOG", "CAT", "MAP", "SUN", "BAT"][i]!;
    const sampleSum = positionSum(sampleWord);
    const correct = positionSum(targetWord);
    const distractors: [number, number, number] = [
      correct + 1,
      targetWord
        .toUpperCase()
        .split("")
        .reduce((sum, ch) => sum + (26 - (ch.charCodeAt(0) - 65)), 0), // used reverse-alphabet position (Z=1) instead of A=1
      correct - sampleSum + positionSum(sampleWord.slice(0, 2)), // a plausible miscount
    ];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-pattern-code-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: {
        en: `If ${sampleWord} = ${sampleSum} (using each letter's position in the alphabet, A=1, B=2, ...), then ${targetWord} = ?`,
        hi: `यदि ${sampleWord} = ${sampleSum} है (प्रत्येक अक्षर की वर्णमाला में स्थिति का उपयोग करते हुए, A=1, B=2, ...), तो ${targetWord} = ?`,
      },
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `Each letter is coded by its position in the alphabet (A=1 ... Z=26) and the code is their sum. For ${targetWord}: ${targetWord
          .split("")
          .map((ch) => `${ch}=${ch.charCodeAt(0) - 64}`)
          .join(", ")} → sum = ${correct}.`,
        hi: `प्रत्येक अक्षर को वर्णमाला में उसकी स्थिति से कोड किया जाता है (A=1 ... Z=26) और कोड उनका योग है। ${targetWord} के लिए: ${targetWord
          .split("")
          .map((ch) => `${ch}=${ch.charCodeAt(0) - 64}`)
          .join(", ")} → योग = ${correct}।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Off by one in adding up the letter positions — a simple counting slip.`,
          hi: `अक्षरों की स्थिति जोड़ने में एक की भूल — एक सामान्य गिनती की गलती।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Codes each letter from the end of the alphabet (Z=1, Y=2, ...) instead of from the start (A=1).`,
          hi: `वर्णमाला की शुरुआत (A=1) के बजाय अंत से (Z=1, Y=2, ...) प्रत्येक अक्षर को कोड करता है।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Miscounts by only summing part of the word's letters instead of all of them.`,
          hi: `शब्द के सभी अक्षरों के बजाय केवल कुछ अक्षरों का योग करके गलत गणना करता है।`,
        },
      },
    };
  });
}

// ── Family D (HARD, ×5): 3×3 magic-square-style grid (row & column sums) ─
function magicSquareQuestions(): GeneratedQuestion[] {
  // Each grid: rows sum to the same constant S; the last cell of the last row is missing.
  const grids: number[][][] = [
    [[4, 9, 2], [3, 5, 7], [8, 1, 0]], // 0 placeholder for the missing cell, S=15
    [[6, 1, 8], [7, 5, 3], [2, 9, 0]], // S=15
    [[2, 7, 6], [9, 5, 1], [4, 3, 0]], // S=15
    [[8, 3, 4], [1, 5, 9], [6, 7, 0]], // S=15
    [[1, 5, 9], [8, 3, 4], [6, 7, 0]], // S=15 (rearranged)
  ];
  return grids.map((grid, i) => {
    const rowSum = grid[0]!.reduce((a, b) => a + b, 0);
    const lastRow = grid[2]!;
    const correct = rowSum - lastRow[0]! - lastRow[1]!;
    const columnSumWrong = grid[0]![2]! + grid[1]![2]!; // sums the last COLUMN's other two entries as if solving for a column instead of the row
    const distractors: [number, number, number] = [
      rowSum - lastRow[0]!, // forgot to subtract the second entry too
      correct + 2, // a small arithmetic slip in the final subtraction
      columnSumWrong > rowSum ? columnSumWrong - rowSum : columnSumWrong, // mixes up row/column reasoning, kept distinct from correct
    ];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-pattern-magicgrid-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    const rowsText = grid.map((r, ri) => (ri === 2 ? `${r[0]}, ${r[1]}, ?` : `${r[0]}, ${r[1]}, ${r[2]}`)).join(" | ");
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `In this 3×3 grid, every row adds up to the same total. Find the missing number: ${rowsText}`,
        hi: `इस 3×3 ग्रिड में, प्रत्येक पंक्ति का योग समान है। लुप्त अंक ज्ञात करें: ${rowsText}`,
      },
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `Every row sums to ${rowSum} (row 1: ${grid[0]!.join("+")}=${rowSum}; row 2: ${grid[1]!.join("+")}=${rowSum}). So row 3's missing number is ${rowSum} − ${lastRow[0]} − ${lastRow[1]} = ${correct}.`,
        hi: `प्रत्येक पंक्ति का योग ${rowSum} है (पंक्ति 1: ${grid[0]!.join("+")}=${rowSum}; पंक्ति 2: ${grid[1]!.join("+")}=${rowSum})। इसलिए पंक्ति 3 का लुप्त अंक ${rowSum} − ${lastRow[0]} − ${lastRow[1]} = ${correct} है।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Subtracts only the first known entry of the row from the total, forgetting to also subtract the second.`,
          hi: `पंक्ति की केवल पहली ज्ञात प्रविष्टि को कुल योग से घटाता है, दूसरी को घटाना भूल जाता है।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Gets the method right but makes a small arithmetic slip in the final subtraction.`,
          hi: `तरीका सही है लेकिन अंतिम घटाव में एक छोटी अंकगणितीय भूल कर देता है।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Confuses the row-sum rule with a column-sum rule and solves for the wrong direction of the grid.`,
          hi: `पंक्ति-योग नियम को स्तंभ-योग नियम के साथ भ्रमित करता है और ग्रिड की गलत दिशा के लिए हल करता है।`,
        },
      },
    };
  });
}

// ── Family E (HARD, ×5): Caesar-shift letter coding ──────────────────────
function caesarShiftQuestions(): GeneratedQuestion[] {
  const params: { word: string; shift: number }[] = [
    { word: "CAT", shift: 2 }, { word: "DOG", shift: 3 }, { word: "SUN", shift: 4 }, { word: "MAP", shift: 5 }, { word: "BAT", shift: 1 },
  ];
  function shiftWord(word: string, shift: number): string {
    return word
      .toUpperCase()
      .split("")
      .map((ch) => String.fromCharCode(((ch.charCodeAt(0) - 65 + shift) % 26) + 65))
      .join("");
  }
  return params.map(({ word, shift }, i) => {
    const encoded = shiftWord(word, shift);
    // Ask: given the RULE (shift by `shift`) demonstrated on `word` → `encoded`, what does a second word encode to?
    const targetWords = ["DOG", "CAT", "BAT", "SUN", "MAP"];
    const target = targetWords[i]!;
    const correctWord = shiftWord(target, shift);
    // Represent the answer as a single packed number (sum of coded letter positions) so options stay numeric and unambiguous.
    function code(w: string): number {
      return w.split("").reduce((sum, ch) => sum + (ch.charCodeAt(0) - 64), 0);
    }
    const correct = code(correctWord);
    const distractors: [number, number, number] = [
      code(shiftWord(target, shift - 1)), // used one less shift than the actual rule
      code(shiftWord(target, shift + 1)), // used one more shift than the actual rule
      code(shiftWord(target, -shift < 0 ? 26 - shift : -shift)), // shifted backward instead of forward
    ];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-pattern-caesar-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `In a code, ${word} is written as ${encoded} (each letter shifted forward by a fixed number of places in the alphabet). Using the same rule, if the code for ${target} is coded the same way and each letter's alphabet position (A=1...Z=26) is summed, what is that total?`,
        hi: `एक कोड में, ${word} को ${encoded} लिखा जाता है (प्रत्येक अक्षर वर्णमाला में एक निश्चित संख्या आगे खिसकाया जाता है)। उसी नियम का उपयोग करते हुए, यदि ${target} को उसी तरह कोड किया जाए और प्रत्येक अक्षर की वर्णमाला स्थिति (A=1...Z=26) का योग लिया जाए, तो वह कुल कितना है?`,
      },
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `${word}→${encoded} shows a forward shift of ${shift} letters (e.g. ${word[0]}→${encoded[0]}). Applying the same +${shift} shift to ${target} gives ${correctWord}, whose letter-position sum is ${correct}.`,
        hi: `${word}→${encoded} ${shift} अक्षरों का आगे खिसकाव दिखाता है (उदा. ${word[0]}→${encoded[0]})। ${target} पर वही +${shift} खिसकाव लागू करने पर ${correctWord} मिलता है, जिसका अक्षर-स्थिति योग ${correct} है।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Uses a shift of ${shift - 1} instead of the actual ${shift} — one less than the rule shown.`,
          hi: `वास्तविक ${shift} के स्थान पर ${shift - 1} खिसकाव का उपयोग करता है — दिखाए गए नियम से एक कम।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Uses a shift of ${shift + 1} instead of the actual ${shift} — one more than the rule shown.`,
          hi: `वास्तविक ${shift} के स्थान पर ${shift + 1} खिसकाव का उपयोग करता है — दिखाए गए नियम से एक अधिक।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Shifts the letters backward instead of forward — a direction error on the coding rule.`,
          hi: `अक्षरों को आगे के बजाय पीछे खिसकाता है — कोडिंग नियम में एक दिशा त्रुटि।`,
        },
      },
    };
  });
}

// ── Family F (HARD, ×5): analogy chain with two combined operations ─────
function analogyChainQuestions(): GeneratedQuestion[] {
  const params: { a: number; b: number; c: number }[] = [
    { a: 3, b: 10, c: 5 }, { a: 4, b: 17, c: 6 }, { a: 2, b: 5, c: 7 }, { a: 5, b: 26, c: 3 }, { a: 6, b: 37, c: 4 },
  ];
  // Rule: b = a*a + 1 (square-plus-one analogy). 3:10 (9+1), 4:17(16+1), etc.
  return params.map(({ a, b, c }, i) => {
    const rule = (n: number) => n * n + 1;
    const correct = rule(c);
    const distractors: [number, number, number] = [c * c, c * c + 2, c * 2 + 1];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-pattern-analogy-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD",
      content: {
        en: `${a} : ${b} :: ${c} : ?`,
        hi: `${a} : ${b} :: ${c} : ?`,
      },
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `The rule is "square the first number, then add 1" (${a}²+1=${a * a + 1}=${b}). Applying it to ${c}: ${c}²+1=${c * c}+1=${correct}.`,
        hi: `नियम है "पहली संख्या का वर्ग करें, फिर 1 जोड़ें" (${a}²+1=${a * a + 1}=${b})। इसे ${c} पर लागू करें: ${c}²+1=${c * c}+1=${correct}।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Squares the number correctly but forgets to add the "+1" the rule requires.`,
          hi: `संख्या का वर्ग तो सही करता है लेकिन नियम द्वारा आवश्यक "+1" जोड़ना भूल जाता है।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Adds 2 instead of 1 after squaring — an off-by-one on the constant.`,
          hi: `वर्ग करने के बाद 1 के बजाय 2 जोड़ता है — स्थिरांक पर एक की गलती।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Doubles the number and adds 1 instead of squaring it — confuses the relation with a simpler linear one.`,
          hi: `वर्ग करने के बजाय संख्या को दोगुना करके 1 जोड़ता है — संबंध को एक सरल रैखिक संबंध से भ्रमित करता है।`,
        },
      },
    };
  });
}

// ── Family G (MEDIUM, ×5): simple single-operation analogy ──────────────
function simpleAnalogyQuestions(): GeneratedQuestion[] {
  const params: { rule: (n: number) => number; c: number; label: LangText }[] = [
    { rule: (n) => n * 2, c: 9, label: { en: "double the first number", hi: "पहली संख्या को दोगुना करें" } },
    { rule: (n) => n * 3, c: 6, label: { en: "triple the first number", hi: "पहली संख्या को तिगुना करें" } },
    { rule: (n) => n + 5, c: 12, label: { en: "add 5 to the first number", hi: "पहली संख्या में 5 जोड़ें" } },
    { rule: (n) => n * n, c: 7, label: { en: "square the first number", hi: "पहली संख्या का वर्ग करें" } },
    { rule: (n) => n * 4 - 1, c: 5, label: { en: "multiply the first number by 4 and subtract 1", hi: "पहली संख्या को 4 से गुणा करके 1 घटाएं" } },
  ];
  return params.map(({ rule, c, label }, i) => {
    const a = c - 2 > 0 ? c - 2 : c + 1; // a sample first term, distinct from c
    const b = rule(a);
    const correct = rule(c);
    const distractors: [number, number, number] = [correct + 1, correct - 1, correct + 2];
    const options = buildOptions(correct, distractors);
    const key = `bank-ma-pattern-simpleanalogy-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM",
      content: { en: `${a} : ${b} :: ${c} : ?`, hi: `${a} : ${b} :: ${c} : ?` },
      options,
      correctOption: correctOptionId(options, correct),
      explanation: {
        en: `The rule is: ${label.en} (${a}→${b}). Applying it to ${c}: ${label.en.replace("first number", String(c))} = ${correct}.`,
        hi: `नियम है: ${label.hi} (${a}→${b})। इसे ${c} पर लागू करें: ${correct}।`,
      },
      distractorAnalysis: {
        [correctOptionId(options, distractors[0])]: {
          en: `Off by one above the correct value — a small arithmetic slip.`,
          hi: `सही मान से एक अधिक — एक छोटी अंकगणितीय भूल।`,
        },
        [correctOptionId(options, distractors[1])]: {
          en: `Off by one below the correct value — a small arithmetic slip in the other direction.`,
          hi: `सही मान से एक कम — दूसरी दिशा में एक छोटी अंकगणितीय भूल।`,
        },
        [correctOptionId(options, distractors[2])]: {
          en: `Off by two from the correct value — a larger arithmetic slip while applying the rule.`,
          hi: `सही मान से दो की भूल — नियम लागू करते समय एक बड़ी अंकगणितीय गलती।`,
        },
      },
    };
  });
}

export function buildPatternCompletionQuestions(): GeneratedQuestion[] {
  const all = [
    ...powerPatternQuestions(),
    ...gridRowOperationQuestions(),
    ...positionSumCodeQuestions(),
    ...simpleAnalogyQuestions(),
    ...magicSquareQuestions(),
    ...caesarShiftQuestions(),
    ...analogyChainQuestions(),
  ];
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(
      `Pattern Completion pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`
    );
  }
  return all;
}
