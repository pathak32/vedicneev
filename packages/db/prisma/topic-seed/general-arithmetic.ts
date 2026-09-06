import { assertDistinctOptions, distributeCorrectPosition, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates a small 12-question exam-agnostic Arithmetic top-up pool
 * (Arithmetic -> "general_arithmetic" topic): 4 Easy (averages) / 4 Medium
 * (ratio & proportion) / 4 Hard (percentage word problems). Unlike
 * factors-hcf-lcm/fractions-decimals/profit-loss-interest/area-perimeter-
 * volume (all JNVST-tagged), every question here is left exam-agnostic on
 * purpose: AISSEE/RMS Class 6 full-length mocks assemble their Arithmetic
 * section from the Question bank (see apps/web/src/lib/exam/
 * jnvstMockService.ts's Question-bank assembly path) filtered to
 * exam-agnostic-or-matching-exam content, and the pre-existing agnostic
 * Arithmetic pool (speed_calculation, 46 questions) alone falls short of
 * AISSEE/RMS's 50-question Arithmetic quota. This file closes that gap.
 * Every correct answer is computed by real arithmetic — never hand-typed —
 * and assertDistinctOptions guards against a construction bug.
 */

const OPTION_IDS = ["a", "b", "c", "d"] as const;

function numText(n: number, suffix = ""): LangText {
  const rounded = Math.round(n * 100) / 100;
  return { en: `${rounded}${suffix}`, hi: `${rounded}${suffix}` };
}

function padDistinctNumbers(base: number[], target: number, correct: number, step: number, min = 0): number[] {
  const values = Array.from(new Set(base.filter((v) => v !== correct && v >= min)));
  for (let attempt = 0; values.length < target && attempt < 30; attempt++) {
    const candidate = Math.max(min, Math.round((correct + step * (attempt + 2) * (attempt % 2 === 0 ? 1 : -1)) * 100) / 100);
    if (candidate !== correct && !values.includes(candidate)) values.push(candidate);
  }
  if (values.length < target) throw new Error(`padDistinctNumbers: could not reach ${target} distinct values.`);
  return values.slice(0, target);
}

function buildQuestion(
  correctIndex: number,
  correctValue: number,
  distractorValues: [number, number, number],
  distractorReasons: [LangText, LangText, LangText],
  suffix = ""
) {
  const { contents, correctOption, distractorAnalysis } = distributeCorrectPosition(
    correctIndex,
    correctValue,
    distractorValues,
    distractorReasons
  );
  const options = OPTION_IDS.map((id, i) => ({ id, text: numText(contents[i]!, suffix) })) as [
    OptionSeed,
    OptionSeed,
    OptionSeed,
    OptionSeed,
  ];
  return { options, correctOption, distractorAnalysis };
}

// ── EASY (×4): average of a small list of numbers ────────────────────────
function averageQuestions(): GeneratedQuestion[] {
  const params: number[][] = [
    [10, 20, 30],
    [15, 25, 35, 45],
    [8, 12, 16, 20],
    [40, 50, 60, 70, 80],
  ];
  return params.map((nums, i) => {
    const sum = nums.reduce((a, b) => a + b, 0);
    const correct = sum / nums.length;
    const distractorBase = [sum, correct + nums.length, sum / (nums.length - 1)];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 2) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(i % 4, correct, distractors, [
      { en: "This is the SUM of the numbers, not their average.", hi: "यह संख्याओं का योग है, औसत नहीं।" },
      { en: "Divides by the count but then adds the count back on — a leftover addition error.", hi: "गिनती से भाग तो देता है पर फिर गिनती को वापस जोड़ देता है — एक बचा हुआ जोड़ की गलती।" },
      { en: "Divides by one fewer number than there actually are in the list.", hi: "सूची में वास्तविक संख्याओं से एक कम से भाग देता है।" },
    ]);
    const key = `bank-ar-genarith-average-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "EASY" as const,
      content: {
        en: `Find the average of: ${nums.join(", ")}.`,
        hi: `इनका औसत ज्ञात करें: ${nums.join(", ")}।`,
      },
      options,
      correctOption,
      explanation: {
        en: `Average = sum ÷ count = ${sum} ÷ ${nums.length} = ${correct}.`,
        hi: `औसत = योग ÷ गिनती = ${sum} ÷ ${nums.length} = ${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── MEDIUM (×4): ratio & proportion — dividing a total in a given ratio ──
function ratioQuestions(): GeneratedQuestion[] {
  const params: { total: number; a: number; b: number }[] = [
    { total: 60, a: 2, b: 3 },
    { total: 100, a: 3, b: 2 },
    { total: 90, a: 4, b: 5 },
    { total: 120, a: 5, b: 7 },
  ];
  return params.map(({ total, a, b }, i) => {
    const parts = a + b;
    const correct = (total * a) / parts;
    const distractorBase = [(total * b) / parts, total / parts, correct + a];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, a) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(i % 4, correct, distractors, [
      { en: `Computes the OTHER person's share (using ${b} instead of ${a}) instead of the one asked for.`, hi: `${a} के बजाय ${b} का उपयोग करके दूसरे व्यक्ति का हिस्सा निकाल देता है।` },
      { en: "Divides the total by the number of ratio parts, but forgets to multiply back by the requested part.", hi: "कुल को अनुपात के भागों की संख्या से भाग देता है, पर वापस अपेक्षित भाग से गुणा करना भूल जाता है।" },
      { en: "Adds one extra share's worth to the correct amount — an off-by-one-part error.", hi: "सही राशि में एक अतिरिक्त हिस्से के बराबर जोड़ देता है — एक हिस्से की गलती।" },
    ]);
    const key = `bank-ar-genarith-ratio-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "MEDIUM" as const,
      content: {
        en: `₹${total} is divided between A and B in the ratio ${a}:${b}. How much does A get?`,
        hi: `₹${total} को A और B के बीच ${a}:${b} के अनुपात में बांटा गया है। A को कितना मिलेगा?`,
      },
      options,
      correctOption,
      explanation: {
        en: `Total parts = ${a}+${b} = ${parts}. A's share = (${a}/${parts}) × ${total} = ${correct}.`,
        hi: `कुल भाग = ${a}+${b} = ${parts}। A का हिस्सा = (${a}/${parts}) × ${total} = ${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

// ── HARD (×4): percentage word problems ──────────────────────────────────
function percentageQuestions(): GeneratedQuestion[] {
  const params: { base: number; percent: number }[] = [
    { base: 250, percent: 20 },
    { base: 480, percent: 25 },
    { base: 720, percent: 15 },
    { base: 360, percent: 35 },
  ];
  return params.map(({ base, percent }, i) => {
    const correct = (base * percent) / 100;
    const distractorBase = [base * (percent / 100 + 0.1), base / percent, correct + 10];
    const distractors = padDistinctNumbers(distractorBase, 3, correct, 5) as [number, number, number];
    const { options, correctOption, distractorAnalysis } = buildQuestion(i % 4, correct, distractors, [
      { en: `Uses ${percent + 10}% instead of ${percent}% — a misread percentage.`, hi: `${percent}% के बजाय ${percent + 10}% का उपयोग करता है — प्रतिशत को गलत पढ़ना।` },
      { en: "Divides the base by the percentage number directly instead of converting the percentage to a fraction first.", hi: "प्रतिशत को पहले भिन्न में बदले बिना सीधे आधार को प्रतिशत संख्या से भाग देता है।" },
      { en: "Adds a flat 10 to the correct value — an arithmetic slip after finding the right percentage.", hi: "सही मान में सीधे 10 जोड़ देता है — सही प्रतिशत निकालने के बाद एक अंकगणितीय चूक।" },
    ]);
    const key = `bank-ar-genarith-percentage-${String(i + 1).padStart(2, "0")}`;
    assertDistinctOptions(key, options);
    return {
      key,
      difficulty: "HARD" as const,
      content: {
        en: `What is ${percent}% of ${base}?`,
        hi: `${base} का ${percent}% कितना है?`,
      },
      options,
      correctOption,
      explanation: {
        en: `${percent}% of ${base} = (${percent}/100) × ${base} = ${correct}.`,
        hi: `${base} का ${percent}% = (${percent}/100) × ${base} = ${correct}।`,
      },
      distractorAnalysis,
    };
  });
}

export function buildGeneralArithmeticQuestions(): GeneratedQuestion[] {
  const all = [...averageQuestions(), ...ratioQuestions(), ...percentageQuestions()];
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 12 || easy !== 4 || medium !== 4 || hard !== 4) {
    throw new Error(`General Arithmetic pool must be 12 (4 Easy/4 Medium/4 Hard); got ${all.length} (${easy}/${medium}/${hard}).`);
  }
  return all;
}
