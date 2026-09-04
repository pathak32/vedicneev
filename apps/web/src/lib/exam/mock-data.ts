import type { ExamQuestion, ExamSessionData, Multilingual, VedicSpeedHack } from "./types";

export const TOPIC_NAMES: Record<string, Multilingual> = {
  number_series: { en: "Number & Letter Series", hi: "संख्या एवं अक्षर श्रृंखला" },
  pattern_completion: { en: "Pattern Completion", hi: "पैटर्न पूर्णता" },
  classification: { en: "Classification", hi: "वर्गीकरण" },
  speed_calculation: { en: "Speed Calculation", hi: "तीव्र गणना" },
  vocabulary: { en: "Vocabulary", hi: "शब्दावली" },
  grammar: { en: "Grammar", hi: "व्याकरण" },
  // PreviousYearQuestion (see jnvstMockService.ts) tracks section-level
  // granularity only, not a real Topic — every PYQ-bank question is
  // stamped with this fixed topicKey instead of a genuine Topic.key.
  pyq: { en: "Previous-Year Practice", hi: "पिछले वर्ष का अभ्यास" },
};

/**
 * Standalone demo data for the `/exam/demo-jnvst` route. Shaped to mirror
 * packages/db's Prisma models (Section → Topic → Question, VedicSpeedHack)
 * and packages/db/prisma/seed.ts's JNVST Class 6 sample content, so wiring
 * this route to @vedicneev/db later is a drop-in swap of the data source.
 *
 * Section/question durations are scaled down from the real JNVST pattern
 * (120 minutes) to a few minutes so the countdown and auto-advance behavior
 * can actually be observed in a demo run.
 */

const speedHacks: VedicSpeedHack[] = [
  {
    id: "hack-x11",
    key: "multiply_by_eleven",
    title: { en: "Multiply by 11", hi: "11 से गुणा करें" },
    description: {
      en: "Sandwich the sum of the digits between them: for a two-digit number, the outer digits stay put and the middle digit is their sum (carry if it exceeds 9).",
      hi: "अंकों के योग को उनके बीच रखें: दो अंकों की संख्या के लिए बाहरी अंक वही रहते हैं और मध्य अंक उनका योग होता है (9 से अधिक होने पर कैरी करें)।",
    },
  },
  {
    id: "hack-sq5",
    key: "square_ending_in_five",
    title: { en: "Square a number ending in 5", hi: "5 पर समाप्त होने वाली संख्या का वर्ग" },
    description: {
      en: "For a number 10a+5, the square is a×(a+1) followed by 25.",
      hi: "10a+5 रूप की संख्या के लिए, वर्ग a×(a+1) के बाद 25 लिखने से प्राप्त होता है।",
    },
  },
  {
    id: "hack-near-base",
    key: "multiply_near_base",
    title: { en: "Multiply numbers near a base (Nikhilam)", hi: "आधार के निकट संख्याओं का गुणा (निखिलम्)" },
    description: {
      en: "For numbers close to a power of ten, add one number's deviation to the other number, multiply by the base, then add the product of the two deviations.",
      hi: "दस की घात के निकट संख्याओं के लिए, एक संख्या के विचलन को दूसरी संख्या में जोड़ें, आधार से गुणा करें, फिर दोनों विचलनों का गुणनफल जोड़ें।",
    },
  },
  {
    id: "hack-complement",
    key: "nikhilam_complement",
    title: { en: "All from 9, last from 10", hi: "सभी 9 से, अंतिम 10 से" },
    description: {
      en: "To subtract a number from a power of ten, subtract each digit from 9 except the last digit, which is subtracted from 10.",
      hi: "दस की घात में से किसी संख्या को घटाने के लिए, अंतिम अंक को छोड़कर प्रत्येक अंक को 9 से घटाएं; अंतिम अंक को 10 से घटाएं।",
    },
  },
];

const rotatingTriangleSvg = `
<svg viewBox="0 0 320 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A triangle rotating 90 degrees at each step: 0, 90, 180, then a mystery next step">
  <g transform="translate(10,15)"><polygon points="30,0 60,60 0,60" fill="#f97316"/></g>
  <text x="40" y="100" font-size="13" text-anchor="middle" fill="currentColor">0°</text>
  <g transform="translate(90,45) rotate(90)"><polygon points="30,0 60,60 0,60" fill="#f97316" transform="translate(-30,-30)"/></g>
  <text x="120" y="100" font-size="13" text-anchor="middle" fill="currentColor">90°</text>
  <g transform="translate(170,45) rotate(180)"><polygon points="30,0 60,60 0,60" fill="#f97316" transform="translate(-30,-30)"/></g>
  <text x="200" y="100" font-size="13" text-anchor="middle" fill="currentColor">180°</text>
  <text x="280" y="60" font-size="30" text-anchor="middle" fill="currentColor">?</text>
</svg>
`.trim();

const mentalAbilityQuestions: ExamQuestion[] = [
  {
    id: "q-ma-1",
    sectionKey: "mental_ability",
    topicKey: "number_series",
    difficulty: "EASY",
    // Fully translated into every supported language as a demonstration of
    // the multilingual pipeline; the rest of the demo bank intentionally
    // stays en/hi-only so the runner's fallback-to-English behavior (for a
    // language a question hasn't been translated into yet) is also exercised.
    content: {
      en: "Find the missing number: 2, 4, 8, 16, ?, 64",
      hi: "लुप्त संख्या ज्ञात करें: 2, 4, 8, 16, ?, 64",
      mr: "लुप्त संख्या शोधा: 2, 4, 8, 16, ?, 64",
      bn: "অনুপস্থিত সংখ্যাটি খুঁজুন: 2, 4, 8, 16, ?, 64",
      ta: "விடுபட்ட எண்ணைக் கண்டறியவும்: 2, 4, 8, 16, ?, 64",
      gu: "ખૂટતી સંખ્યા શોધો: 2, 4, 8, 16, ?, 64",
    },
    options: [
      { id: "a", text: { en: "24", hi: "24", mr: "24", bn: "24", ta: "24", gu: "24" } },
      { id: "b", text: { en: "32", hi: "32", mr: "32", bn: "32", ta: "32", gu: "32" } },
      { id: "c", text: { en: "48", hi: "48", mr: "48", bn: "48", ta: "48", gu: "48" } },
      { id: "d", text: { en: "36", hi: "36", mr: "36", bn: "36", ta: "36", gu: "36" } },
    ],
    correctOption: "b",
    explanation: {
      en: "Each number is double the previous one: 8×2=16, 16×2=32.",
      hi: "प्रत्येक संख्या पिछली संख्या की दोगुनी है: 8×2=16, 16×2=32।",
      mr: "प्रत्येक संख्या मागील संख्येच्या दुप्पट आहे: 8×2=16, 16×2=32.",
      bn: "প্রতিটি সংখ্যা আগেরটির দ্বিগুণ: 8×2=16, 16×2=32।",
      ta: "ஒவ்வொரு எண்ணும் முந்தைய எண்ணின் இரு மடங்கு: 8×2=16, 16×2=32.",
      gu: "દરેક સંખ્યા પાછલી સંખ્યા કરતાં બમણી છે: 8×2=16, 16×2=32.",
    },
    timeLimitSeconds: 45,
  },
  {
    id: "q-ma-2",
    sectionKey: "mental_ability",
    topicKey: "number_series",
    difficulty: "EASY",
    content: { en: "Find the missing letter: A, C, E, G, ?", hi: "लुप्त अक्षर ज्ञात करें: A, C, E, G, ?" },
    options: [
      { id: "a", text: { en: "H", hi: "H" } },
      { id: "b", text: { en: "I", hi: "I" } },
      { id: "c", text: { en: "J", hi: "J" } },
      { id: "d", text: { en: "F", hi: "F" } },
    ],
    correctOption: "b",
    explanation: {
      en: "The series skips one letter each time (+2): A→C→E→G→I.",
      hi: "श्रृंखला हर बार एक अक्षर छोड़ती है (+2): A→C→E→G→I।",
    },
    timeLimitSeconds: 45,
  },
  {
    id: "q-ma-3",
    sectionKey: "mental_ability",
    topicKey: "pattern_completion",
    difficulty: "MEDIUM",
    content: {
      en: "Find the missing number in the pattern: 3, 9, 27, 81, ?",
      hi: "पैटर्न में लुप्त संख्या ज्ञात करें: 3, 9, 27, 81, ?",
    },
    options: [
      { id: "a", text: { en: "162", hi: "162" } },
      { id: "b", text: { en: "202", hi: "202" } },
      { id: "c", text: { en: "243", hi: "243" } },
      { id: "d", text: { en: "324", hi: "324" } },
    ],
    correctOption: "c",
    explanation: {
      en: "Each number is multiplied by 3 to get the next: 81×3=243.",
      hi: "अगली संख्या पाने के लिए प्रत्येक संख्या को 3 से गुणा किया जाता है: 81×3=243।",
    },
    timeLimitSeconds: 45,
  },
  {
    id: "q-ma-4",
    sectionKey: "mental_ability",
    topicKey: "classification",
    difficulty: "EASY",
    content: {
      en: "Which one does not belong with the others: Apple, Banana, Carrot, Mango?",
      hi: "इनमें से कौन-सा अन्य से मेल नहीं खाता: सेब, केला, गाजर, आम?",
    },
    options: [
      { id: "a", text: { en: "Apple", hi: "सेब" } },
      { id: "b", text: { en: "Banana", hi: "केला" } },
      { id: "c", text: { en: "Carrot", hi: "गाजर" } },
      { id: "d", text: { en: "Mango", hi: "आम" } },
    ],
    correctOption: "c",
    explanation: {
      en: "Carrot is a vegetable; the rest are fruits.",
      hi: "गाजर एक सब्जी है; बाकी सभी फल हैं।",
    },
    timeLimitSeconds: 30,
  },
  {
    id: "q-ma-5",
    sectionKey: "mental_ability",
    topicKey: "pattern_completion",
    difficulty: "HARD",
    content: {
      en: "The figure shows a triangle rotating 90° at each step: 0°, 90°, 180°. What is the next rotation?",
      hi: "आकृति में एक त्रिभुज प्रत्येक चरण में 90° घूम रहा है: 0°, 90°, 180°। अगला घुमाव क्या होगा?",
    },
    figureMetadata: { type: "svg", markup: rotatingTriangleSvg },
    options: [
      { id: "a", text: { en: "0°", hi: "0°" } },
      { id: "b", text: { en: "90°", hi: "90°" } },
      { id: "c", text: { en: "180°", hi: "180°" } },
      { id: "d", text: { en: "270°", hi: "270°" } },
    ],
    correctOption: "d",
    explanation: {
      en: "The triangle rotates by +90° at every step, so after 180° comes 270°.",
      hi: "त्रिभुज हर चरण में +90° घूमता है, इसलिए 180° के बाद 270° आता है।",
    },
    timeLimitSeconds: 60,
  },
];

const arithmeticQuestions: ExamQuestion[] = [
  {
    id: "q-ar-1",
    sectionKey: "arithmetic",
    topicKey: "speed_calculation",
    difficulty: "EASY",
    content: { en: "Calculate quickly: 45 × 11 = ?", hi: "शीघ्र गणना करें: 45 × 11 = ?" },
    options: [
      { id: "a", text: { en: "485", hi: "485" } },
      { id: "b", text: { en: "495", hi: "495" } },
      { id: "c", text: { en: "450", hi: "450" } },
      { id: "d", text: { en: "545", hi: "545" } },
    ],
    correctOption: "b",
    vedicSpeedHackId: "hack-x11",
    explanation: {
      en: "Sandwich rule for ×11: 4_5 with the middle digit 4+5=9 → 495.",
      hi: "×11 के लिए सैंडविच नियम: 4_5 जिसमें मध्य अंक 4+5=9 है → 495।",
    },
    timeLimitSeconds: 40,
  },
  {
    id: "q-ar-2",
    sectionKey: "arithmetic",
    topicKey: "speed_calculation",
    difficulty: "MEDIUM",
    content: { en: "Calculate quickly: 65² = ?", hi: "शीघ्र गणना करें: 65² = ?" },
    options: [
      { id: "a", text: { en: "4025", hi: "4025" } },
      { id: "b", text: { en: "4125", hi: "4125" } },
      { id: "c", text: { en: "4225", hi: "4225" } },
      { id: "d", text: { en: "4325", hi: "4325" } },
    ],
    correctOption: "c",
    vedicSpeedHackId: "hack-sq5",
    explanation: {
      en: "For a number ending in 5: 6×(6+1)=42, then append 25 → 4225.",
      hi: "5 पर समाप्त होने वाली संख्या के लिए: 6×(6+1)=42, फिर 25 जोड़ें → 4225।",
    },
    timeLimitSeconds: 40,
  },
  {
    id: "q-ar-3",
    sectionKey: "arithmetic",
    topicKey: "speed_calculation",
    difficulty: "HARD",
    content: { en: "Calculate quickly: 98 × 97 = ?", hi: "शीघ्र गणना करें: 98 × 97 = ?" },
    options: [
      { id: "a", text: { en: "9406", hi: "9406" } },
      { id: "b", text: { en: "9506", hi: "9506" } },
      { id: "c", text: { en: "9606", hi: "9606" } },
      { id: "d", text: { en: "9516", hi: "9516" } },
    ],
    correctOption: "b",
    vedicSpeedHackId: "hack-near-base",
    explanation: {
      en: "Base 100, deviations -2 and -3: (98-3)×100 + (-2×-3) = 9500+6 = 9506.",
      hi: "आधार 100, विचलन -2 और -3: (98-3)×100 + (-2×-3) = 9500+6 = 9506।",
    },
    timeLimitSeconds: 60,
  },
  {
    id: "q-ar-4",
    sectionKey: "arithmetic",
    topicKey: "speed_calculation",
    difficulty: "HARD",
    content: { en: "Calculate quickly: 102 × 104 = ?", hi: "शीघ्र गणना करें: 102 × 104 = ?" },
    options: [
      { id: "a", text: { en: "10408", hi: "10408" } },
      { id: "b", text: { en: "10508", hi: "10508" } },
      { id: "c", text: { en: "10608", hi: "10608" } },
      { id: "d", text: { en: "10708", hi: "10708" } },
    ],
    correctOption: "c",
    vedicSpeedHackId: "hack-near-base",
    explanation: {
      en: "Base 100, deviations +2 and +4: (102+4)×100 + (2×4) = 10600+8 = 10608.",
      hi: "आधार 100, विचलन +2 और +4: (102+4)×100 + (2×4) = 10600+8 = 10608।",
    },
    timeLimitSeconds: 60,
  },
  {
    id: "q-ar-5",
    sectionKey: "arithmetic",
    topicKey: "speed_calculation",
    difficulty: "MEDIUM",
    content: {
      en: "Use the all-from-9-last-from-10 method: 1000 − 587 = ?",
      hi: "सभी-9-से-अंतिम-10-से विधि का उपयोग करें: 1000 − 587 = ?",
    },
    options: [
      { id: "a", text: { en: "313", hi: "313" } },
      { id: "b", text: { en: "413", hi: "413" } },
      { id: "c", text: { en: "423", hi: "423" } },
      { id: "d", text: { en: "513", hi: "513" } },
    ],
    correctOption: "b",
    vedicSpeedHackId: "hack-complement",
    explanation: { en: "9-5=4, 9-8=1, 10-7=3 → 413.", hi: "9-5=4, 9-8=1, 10-7=3 → 413।" },
    timeLimitSeconds: 45,
  },
];

const languageQuestions: ExamQuestion[] = [
  {
    id: "q-lang-1",
    sectionKey: "language",
    topicKey: "vocabulary",
    difficulty: "EASY",
    content: { en: "Choose the synonym of 'Happy':", hi: "'Happy' का समानार्थी शब्द चुनें:" },
    options: [
      { id: "a", text: { en: "Sad", hi: "उदास" } },
      { id: "b", text: { en: "Joyful", hi: "आनंदित" } },
      { id: "c", text: { en: "Angry", hi: "क्रोधित" } },
      { id: "d", text: { en: "Tired", hi: "थका हुआ" } },
    ],
    correctOption: "b",
    explanation: { en: "'Joyful' means feeling great happiness, same as 'Happy'.", hi: "'Joyful' का अर्थ अत्यंत खुशी महसूस करना है, जो 'Happy' के समान है।" },
    timeLimitSeconds: 30,
  },
  {
    id: "q-lang-2",
    sectionKey: "language",
    topicKey: "vocabulary",
    difficulty: "EASY",
    content: { en: "Choose the antonym of 'Brave':", hi: "'Brave' का विलोम शब्द चुनें:" },
    options: [
      { id: "a", text: { en: "Courageous", hi: "साहसी" } },
      { id: "b", text: { en: "Bold", hi: "निडर" } },
      { id: "c", text: { en: "Cowardly", hi: "कायर" } },
      { id: "d", text: { en: "Strong", hi: "मजबूत" } },
    ],
    correctOption: "c",
    explanation: { en: "'Cowardly' means lacking courage — the opposite of 'Brave'.", hi: "'Cowardly' का अर्थ साहस की कमी है — यह 'Brave' का विपरीत है।" },
    timeLimitSeconds: 30,
  },
  {
    id: "q-lang-3",
    sectionKey: "language",
    topicKey: "grammar",
    difficulty: "MEDIUM",
    content: { en: "Fill in the blank: \"She ___ to school every day.\"", hi: "रिक्त स्थान भरें: \"She ___ to school every day.\"" },
    options: [
      { id: "a", text: { en: "go", hi: "go" } },
      { id: "b", text: { en: "goes", hi: "goes" } },
      { id: "c", text: { en: "going", hi: "going" } },
      { id: "d", text: { en: "gone", hi: "gone" } },
    ],
    correctOption: "b",
    explanation: { en: "Third-person singular subjects ('She') take the -s verb form in the simple present: 'goes'.", hi: "तृतीय पुरुष एकवचन कर्ता ('She') के साथ सामान्य वर्तमान काल में क्रिया के -s रूप का प्रयोग होता है: 'goes'।" },
    timeLimitSeconds: 30,
  },
  {
    id: "q-lang-4",
    sectionKey: "language",
    topicKey: "grammar",
    difficulty: "MEDIUM",
    content: { en: "Choose the correctly spelled word:", hi: "सही वर्तनी वाला शब्द चुनें:" },
    options: [
      { id: "a", text: { en: "Recieve", hi: "Recieve" } },
      { id: "b", text: { en: "Receive", hi: "Receive" } },
      { id: "c", text: { en: "Receeve", hi: "Receeve" } },
      { id: "d", text: { en: "Receve", hi: "Receve" } },
    ],
    correctOption: "b",
    explanation: { en: "\"i before e except after c\" — Receive follows the rule correctly.", hi: "\"c के बाद को छोड़कर i, e से पहले आता है\" — Receive इस नियम का सही पालन करता है।" },
    timeLimitSeconds: 30,
  },
];

const questionsById: Record<string, ExamQuestion> = {};
for (const q of [...mentalAbilityQuestions, ...arithmeticQuestions, ...languageQuestions]) {
  questionsById[q.id] = q;
}

const speedHacksById: Record<string, VedicSpeedHack> = {};
for (const hack of speedHacks) speedHacksById[hack.id] = hack;

export const demoJnvstSession: ExamSessionData = {
  examId: "demo-jnvst",
  examType: "JNVST",
  templateName: {
    en: "JNVST Class 6 Selection Test (Demo)",
    hi: "जेएनवीएसटी कक्षा 6 चयन परीक्षा (डेमो)",
    mr: "जेएनव्हीएसटी इयत्ता 6 निवड चाचणी (डेमो)",
    bn: "জেএনভিএসটি ষষ্ঠ শ্রেণির নির্বাচন পরীক্ষা (ডেমো)",
    ta: "ஜேஎன்விஎஸ்டி 6ஆம் வகுப்பு தேர்வுத் தேர்வு (டெமோ)",
    gu: "જેએનવીએસટી ધોરણ 6 પસંદગી કસોટી (ડેમો)",
  },
  // Scaled-down demo timing (real JNVST Class 6 is 120 minutes / 80 questions).
  totalDurationSeconds: 5 * 60 + 3 * 60 + 3 * 60,
  negativeMarkingRatio: 0,
  sections: [
    {
      key: "mental_ability",
      name: {
        en: "Mental Ability",
        hi: "मानसिक योग्यता",
        mr: "मानसिक क्षमता",
        bn: "মানসিক দক্ষতা",
        ta: "மனத் திறன்",
        gu: "માનસિક ક્ષમતા",
      },
      order: 1,
      timeLimitSeconds: 5 * 60,
      questionIds: mentalAbilityQuestions.map((q) => q.id),
    },
    {
      key: "arithmetic",
      name: { en: "Arithmetic", hi: "अंकगणित" },
      order: 2,
      timeLimitSeconds: 3 * 60,
      questionIds: arithmeticQuestions.map((q) => q.id),
    },
    {
      key: "language",
      name: { en: "Language", hi: "भाषा" },
      order: 3,
      timeLimitSeconds: 3 * 60,
      questionIds: languageQuestions.map((q) => q.id),
    },
  ],
  questionsById,
  speedHacksById,
};

export function getDemoSession(examId: string): ExamSessionData | null {
  if (examId === "demo-jnvst") return demoJnvstSession;
  return null;
}
