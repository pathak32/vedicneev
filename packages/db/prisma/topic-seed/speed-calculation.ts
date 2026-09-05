import { assertDistinctOptions, type GeneratedQuestion, type LangText, type OptionSeed } from "./types";

/**
 * Generates the 40-question Speed Calculation pool (Arithmetic →
 * "speed_calculation" topic): 10 Easy / 15 Moderate / 15 Hard, tied to the
 * 5 Vedic speed hacks already seeded in prisma/seed.ts (8 items per hack:
 * 2 Easy + 3 Moderate + 3 Hard = 40 total, 10/15/15 overall). Every
 * correct answer and distractor is computed by real arithmetic below —
 * never hand-typed — and assertDistinctOptions guards against a
 * construction bug seeding a broken question.
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

interface HackDifficultyPlan<T> {
  hackId: string;
  keyPrefix: string;
  easy: T[];
  medium: T[];
  hard: T[];
  build: (params: T, index: number, difficulty: "EASY" | "MEDIUM" | "HARD") => GeneratedQuestion;
}

function runPlan<T>(plan: HackDifficultyPlan<T>): GeneratedQuestion[] {
  const tiers: ["EASY" | "MEDIUM" | "HARD", T[]][] = [
    ["EASY", plan.easy],
    ["MEDIUM", plan.medium],
    ["HARD", plan.hard],
  ];
  const out: GeneratedQuestion[] = [];
  for (const [difficulty, items] of tiers) {
    items.forEach((params, i) => out.push(plan.build(params, i, difficulty)));
  }
  return out;
}

// ── Hack 1: multiply_by_eleven — N × 11 ──────────────────────────────────
function multiplyByElevenQuestions(hackId: string): GeneratedQuestion[] {
  return runPlan<number>({
    hackId,
    keyPrefix: "bank-ar-speed-x11",
    easy: [23, 41],
    medium: [68, 57, 75],
    hard: [234, 456, 123],
    build: (N, i, difficulty) => {
      const correct = N * 11;
      const distractors: [number, number, number] = [N + 11, N * 10, N * 12];
      const options = buildOptions(correct, distractors);
      const key = `bank-ar-speed-x11-${difficulty.toLowerCase()}-${String(i + 1).padStart(2, "0")}`;
      assertDistinctOptions(key, options);
      return {
        key,
        difficulty,
        content: { en: `Calculate quickly using the ×11 shortcut: ${N} × 11 = ?`, hi: `×11 शॉर्टकट का उपयोग करके शीघ्र गणना करें: ${N} × 11 = ?` },
        options,
        correctOption: correctOptionId(options, correct),
        vedicSpeedHackId: hackId,
        explanation: {
          en: `Sandwich the digit sum of ${N} between its own digits (carrying if the sum reaches 10 or more): ${N} × 11 = ${correct}.`,
          hi: `${N} के अंकों के योग को उन्हीं अंकों के बीच रखें (यदि योग 10 या अधिक हो तो कैरी करें): ${N} × 11 = ${correct}।`,
        },
        distractorAnalysis: {
          [correctOptionId(options, distractors[0])]: {
            en: `Misreads "× 11" as "+ 11" — adds eleven instead of multiplying by it.`,
            hi: `"× 11" को "+ 11" समझ लेता है — गुणा करने के बजाय ग्यारह जोड़ देता है।`,
          },
          [correctOptionId(options, distractors[1])]: {
            en: `Only shifts ${N} by one place (×10) and forgets to add ${N} itself, which the ×11 sandwich rule requires.`,
            hi: `केवल ${N} को एक स्थान खिसकाता है (×10) और ×11 सैंडविच नियम के अनुसार ${N} को जोड़ना भूल जाता है।`,
          },
          [correctOptionId(options, distractors[2])]: {
            en: `Uses an off-by-one multiplier (×12) instead of ×11.`,
            hi: `×11 के स्थान पर एक गलत गुणक (×12) का उपयोग करता है।`,
          },
        },
      };
    },
  });
}

// ── Hack 2: square_ending_in_five — (10a+5)² ─────────────────────────────
function squareEndingInFiveQuestions(hackId: string): GeneratedQuestion[] {
  return runPlan<number>({
    hackId,
    keyPrefix: "bank-ar-speed-sq5",
    easy: [1, 2],
    medium: [6, 7, 8],
    hard: [10, 11, 12],
    build: (a, i, difficulty) => {
      const N = 10 * a + 5;
      const correct = a * (a + 1) * 100 + 25;
      const distractors: [number, number, number] = [a * a * 100 + 25, a * (a - 1) * 100 + 25, a * (a + 1) * 100 + 20];
      const options = buildOptions(correct, distractors);
      const key = `bank-ar-speed-sq5-${difficulty.toLowerCase()}-${String(i + 1).padStart(2, "0")}`;
      assertDistinctOptions(key, options);
      return {
        key,
        difficulty,
        content: { en: `Calculate quickly using the "square ending in 5" shortcut: ${N}² = ?`, hi: `"5 पर समाप्त होने वाली संख्या के वर्ग" शॉर्टकट का उपयोग करके शीघ्र गणना करें: ${N}² = ?` },
        options,
        correctOption: correctOptionId(options, correct),
        vedicSpeedHackId: hackId,
        explanation: {
          en: `For a number 10a+5 (here a=${a}), the square is a×(a+1) followed by 25: ${a}×${a + 1}=${a * (a + 1)}, so ${N}² = ${correct}.`,
          hi: `10a+5 रूप की संख्या के लिए (यहाँ a=${a}), वर्ग a×(a+1) के बाद 25 लिखने से प्राप्त होता है: ${a}×${a + 1}=${a * (a + 1)}, इसलिए ${N}² = ${correct}।`,
        },
        distractorAnalysis: {
          [correctOptionId(options, distractors[0])]: {
            en: `Uses a×a instead of a×(a+1) — forgets the shortcut's "multiply by the next integer" step.`,
            hi: `a×(a+1) के बजाय a×a का उपयोग करता है — शॉर्टकट के "अगले पूर्णांक से गुणा" चरण को भूल जाता है।`,
          },
          [correctOptionId(options, distractors[1])]: {
            en: `Uses a×(a−1) instead of a×(a+1) — a direction error on which integer to multiply by.`,
            hi: `a×(a+1) के बजाय a×(a−1) का उपयोग करता है — किस पूर्णांक से गुणा करना है इसमें दिशा त्रुटि।`,
          },
          [correctOptionId(options, distractors[2])]: {
            en: `Misremembers the fixed trailing digits as "20" instead of the correct "25".`,
            hi: `स्थिर अंतिम अंकों को सही "25" के बजाय गलती से "20" याद रखता है।`,
          },
        },
      };
    },
  });
}

// ── Hack 3: multiply_near_base — Nikhilam for numbers near a power of 10 ─
interface NearBaseParams {
  x: number;
  y: number;
  base: number;
}
function multiplyNearBaseQuestions(hackId: string): GeneratedQuestion[] {
  return runPlan<NearBaseParams>({
    hackId,
    keyPrefix: "bank-ar-speed-nearbase",
    easy: [
      { x: 98, y: 97, base: 100 },
      { x: 99, y: 96, base: 100 },
    ],
    medium: [
      { x: 103, y: 104, base: 100 },
      { x: 92, y: 88, base: 100 },
      { x: 107, y: 102, base: 100 },
    ],
    hard: [
      { x: 998, y: 997, base: 1000 },
      { x: 1003, y: 1008, base: 1000 },
      { x: 994, y: 991, base: 1000 },
    ],
    build: ({ x, y, base }, i, difficulty) => {
      const dx = x - base;
      const dy = y - base;
      const correct = x * y;
      const distractors: [number, number, number] = [
        base * (x + dy) - dx * dy,
        base * (x + dy),
        base * (x - dy) + dx * dy,
      ];
      const options = buildOptions(correct, distractors);
      const key = `bank-ar-speed-nearbase-${difficulty.toLowerCase()}-${String(i + 1).padStart(2, "0")}`;
      assertDistinctOptions(key, options);
      const dxLabel = dx >= 0 ? `+${dx}` : `${dx}`;
      const dyLabel = dy >= 0 ? `+${dy}` : `${dy}`;
      return {
        key,
        difficulty,
        content: { en: `Calculate quickly using the Nikhilam near-base shortcut: ${x} × ${y} = ?`, hi: `निखिलम् आधार-निकट शॉर्टकट का उपयोग करके शीघ्र गणना करें: ${x} × ${y} = ?` },
        options,
        correctOption: correctOptionId(options, correct),
        vedicSpeedHackId: hackId,
        explanation: {
          en: `Both numbers are close to ${base}, with deviations ${dxLabel} and ${dyLabel}. Cross-add one number and the other's deviation (${x}${dyLabel} = ${x + dy}), multiply by the base, then add the product of the deviations (${dx}×${dy}=${dx * dy}): ${base}×${x + dy} + ${dx * dy} = ${correct}.`,
          hi: `दोनों संख्याएँ ${base} के निकट हैं, विचलन ${dxLabel} और ${dyLabel} के साथ। एक संख्या में दूसरी के विचलन को जोड़ें (${x}${dyLabel} = ${x + dy}), आधार से गुणा करें, फिर विचलनों का गुणनफल जोड़ें (${dx}×${dy}=${dx * dy}): ${base}×${x + dy} + ${dx * dy} = ${correct}।`,
        },
        distractorAnalysis: {
          [correctOptionId(options, distractors[0])]: {
            en: `Subtracts the product of the deviations instead of adding it — a sign error on the correction term.`,
            hi: `विचलनों के गुणनफल को जोड़ने के बजाय घटाता है — सुधार पद पर एक चिह्न त्रुटि।`,
          },
          [correctOptionId(options, distractors[1])]: {
            en: `Forgets the deviation-product correction term entirely, leaving the result one step short.`,
            hi: `विचलन-गुणनफल सुधार पद को पूरी तरह भूल जाता है, जिससे परिणाम एक कदम अधूरा रह जाता है।`,
          },
          [correctOptionId(options, distractors[2])]: {
            en: `Flips the sign of the cross-add step, using the wrong deviation direction before multiplying by the base.`,
            hi: `आधार से गुणा करने से पहले क्रॉस-जोड़ चरण के चिह्न को उलट देता है, गलत विचलन दिशा का उपयोग करता है।`,
          },
        },
      };
    },
  });
}

// ── Hack 4: nikhilam_complement — subtract from a power of 10 ───────────
interface ComplementParams {
  base: number;
  n: number;
}
function nikhilamComplementQuestions(hackId: string): GeneratedQuestion[] {
  return runPlan<ComplementParams>({
    hackId,
    keyPrefix: "bank-ar-speed-complement",
    easy: [
      { base: 100, n: 63 },
      { base: 100, n: 38 },
    ],
    medium: [
      { base: 1000, n: 587 },
      { base: 1000, n: 234 },
      { base: 1000, n: 456 },
    ],
    hard: [
      { base: 10000, n: 6789 },
      { base: 10000, n: 4321 },
      { base: 10000, n: 9876 },
    ],
    build: ({ base, n }, i, difficulty) => {
      const correct = base - n;
      const distractors: [number, number, number] = [correct - 1, correct + 1, correct + 10];
      const options = buildOptions(correct, distractors);
      const key = `bank-ar-speed-complement-${difficulty.toLowerCase()}-${String(i + 1).padStart(2, "0")}`;
      assertDistinctOptions(key, options);
      return {
        key,
        difficulty,
        content: { en: `Calculate quickly using the "all from 9, last from 10" shortcut: ${base} − ${n} = ?`, hi: `"सभी 9 से, अंतिम 10 से" शॉर्टकट का उपयोग करके शीघ्र गणना करें: ${base} − ${n} = ?` },
        options,
        correctOption: correctOptionId(options, correct),
        vedicSpeedHackId: hackId,
        explanation: {
          en: `Subtract every digit of ${n} from 9 except the last, which is subtracted from 10: ${base} − ${n} = ${correct}.`,
          hi: `${n} के अंतिम अंक को छोड़कर प्रत्येक अंक को 9 से घटाएं; अंतिम अंक को 10 से घटाएं: ${base} − ${n} = ${correct}।`,
        },
        distractorAnalysis: {
          [correctOptionId(options, distractors[0])]: {
            en: `Off by one on the borrow — one less than the correct complement.`,
            hi: `उधार (borrow) में एक की गलती — सही पूरक से एक कम।`,
          },
          [correctOptionId(options, distractors[1])]: {
            en: `Off by one the other way — one more than the correct complement.`,
            hi: `दूसरी दिशा में एक की गलती — सही पूरक से एक अधिक।`,
          },
          [correctOptionId(options, distractors[2])]: {
            en: `A tens-place transcription slip — ten more than the correct complement.`,
            hi: `दहाई के स्थान की एक भूल — सही पूरक से दस अधिक।`,
          },
        },
      };
    },
  });
}

// ── Hack 5: vertically_and_crosswise — general 2-digit × 2-digit ────────
interface CrosswiseParams {
  a: number;
  b: number;
  c: number;
  d: number;
}
function verticallyCrosswiseQuestions(hackId: string): GeneratedQuestion[] {
  return runPlan<CrosswiseParams>({
    hackId,
    keyPrefix: "bank-ar-speed-crosswise",
    easy: [
      { a: 1, b: 2, c: 4, d: 3 },
      { a: 2, b: 1, c: 1, d: 4 },
    ],
    medium: [
      { a: 3, b: 4, c: 5, d: 6 },
      { a: 4, b: 7, c: 6, d: 8 },
      { a: 6, b: 3, c: 4, d: 2 },
    ],
    hard: [
      { a: 8, b: 9, c: 7, d: 6 },
      { a: 9, b: 3, c: 8, d: 7 },
      { a: 9, b: 8, c: 6, d: 7 },
    ],
    build: ({ a, b, c, d }, i, difficulty) => {
      const x = 10 * a + b;
      const y = 10 * c + d;
      const correct = x * y;
      const distractors: [number, number, number] = [(10 * a + d) * (10 * c + b), correct + 10, correct - 10];
      const options = buildOptions(correct, distractors);
      const key = `bank-ar-speed-crosswise-${difficulty.toLowerCase()}-${String(i + 1).padStart(2, "0")}`;
      assertDistinctOptions(key, options);
      const units = b * d;
      const cross = a * d + b * c;
      return {
        key,
        difficulty,
        content: { en: `Calculate quickly using vertically-and-crosswise multiplication: ${x} × ${y} = ?`, hi: `ऊर्ध्वाधर-एवं-तिरछा गुणा विधि का उपयोग करके शीघ्र गणना करें: ${x} × ${y} = ?` },
        options,
        correctOption: correctOptionId(options, correct),
        vedicSpeedHackId: hackId,
        explanation: {
          en: `Units: ${b}×${d}=${units}. Cross-multiply and add: ${a}×${d}+${b}×${c}=${cross}. Leading: ${a}×${c}=${a * c}. Combine with carries: ${x} × ${y} = ${correct}.`,
          hi: `इकाई: ${b}×${d}=${units}। तिरछा गुणा करके जोड़ें: ${a}×${d}+${b}×${c}=${cross}। अग्रणी: ${a}×${c}=${a * c}। कैरी के साथ मिलाएं: ${x} × ${y} = ${correct}।`,
        },
        distractorAnalysis: {
          [correctOptionId(options, distractors[0])]: {
            en: `Mixes up the units digits between the two numbers before cross-multiplying (computes ${10 * a + d}×${10 * c + b} instead of ${x}×${y}).`,
            hi: `तिरछा गुणा करने से पहले दोनों संख्याओं के इकाई अंकों को आपस में बदल देता है (${x}×${y} के बजाय ${10 * a + d}×${10 * c + b} की गणना करता है)।`,
          },
          [correctOptionId(options, distractors[1])]: {
            en: `Carries one extra ten into the final total — a place-value slip while combining the three parts.`,
            hi: `अंतिम योग में एक अतिरिक्त दहाई कैरी कर देता है — तीन भागों को मिलाते समय स्थानीय मान की भूल।`,
          },
          [correctOptionId(options, distractors[2])]: {
            en: `Drops ten from the final total — a place-value slip in the other direction while combining the three parts.`,
            hi: `अंतिम योग से दस घटा देता है — तीन भागों को मिलाते समय दूसरी दिशा में स्थानीय मान की भूल।`,
          },
        },
      };
    },
  });
}

export function buildSpeedCalculationQuestions(hackIds: {
  byEleven: string;
  squareFive: string;
  nikhilamBase: string;
  nikhilamComplement: string;
  verticallyCrosswise: string;
}): GeneratedQuestion[] {
  const all = [
    ...multiplyByElevenQuestions(hackIds.byEleven),
    ...squareEndingInFiveQuestions(hackIds.squareFive),
    ...multiplyNearBaseQuestions(hackIds.nikhilamBase),
    ...nikhilamComplementQuestions(hackIds.nikhilamComplement),
    ...verticallyCrosswiseQuestions(hackIds.verticallyCrosswise),
  ];
  const easy = all.filter((q) => q.difficulty === "EASY").length;
  const medium = all.filter((q) => q.difficulty === "MEDIUM").length;
  const hard = all.filter((q) => q.difficulty === "HARD").length;
  if (all.length !== 40 || easy !== 10 || medium !== 15 || hard !== 15) {
    throw new Error(
      `Speed Calculation pool must be 40 (10 Easy/15 Medium/15 Hard); got ${all.length} (${easy}/${medium}/${hard}).`
    );
  }
  return all;
}
