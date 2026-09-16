/**
 * Seeds a small starter catalog for typingtest.vedicneev.com — enough
 * exams/passages/logic questions to exercise every code path end-to-end
 * (catalog, test-taking, grading, dual-mode logic quiz, leaderboard).
 * Independent of prisma/seed.ts, same re-runnable-on-its-own precedent as
 * seed-store.ts: exams are upserted by slug, passages/logic questions are
 * only created when none exist yet for their parent (re-running this
 * script won't duplicate passages, but also won't pick up hand edits made
 * directly in the DB — same tradeoff seed-store.ts accepts for products).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ENGLISH_PASSAGE_1 =
  "Government examinations across India require candidates to demonstrate accurate and efficient typing skills under strict time limits. A well-prepared candidate practices daily, focusing equally on speed and precision, since a single careless mistake can cost valuable marks in the final evaluation. Consistent practice with real exam-format passages builds the muscle memory needed to perform confidently on the actual test day.";

const ENGLISH_PASSAGE_2 =
  "The recruitment process for most government departments includes a mandatory typing test as part of the skill test stage. Candidates are expected to type a given passage within a fixed duration while maintaining high accuracy. Regular practice, proper finger placement, and familiarity with the keyboard layout are the three pillars of consistent typing performance across attempts.";

const HINDI_PASSAGE_1 =
  "सरकारी परीक्षाओं में उम्मीदवारों से यह अपेक्षा की जाती है कि वे निर्धारित समय सीमा के भीतर सटीक और तेज गति से टाइपिंग करें। नियमित अभ्यास से ही गति और शुद्धता दोनों में सुधार संभव है। हर उम्मीदवार को चाहिए कि वह प्रतिदिन अभ्यास करे और अपनी गलतियों से सीखे।";

const HINDI_PASSAGE_2 =
  "उच्च न्यायालयों तथा अधीनस्थ सेवा चयन आयोगों की टंकण परीक्षा में शुद्धता का विशेष महत्व है। उम्मीदवार को चाहिए कि वह दिए गए गद्यांश को निर्धारित समय में बिना किसी टाइपिंग त्रुटि के पूरा करे। बार-बार अभ्यास करने से टंकण गति स्वाभाविक रूप से बढ़ती है।";

const ENGLISH_PASSAGE_3 =
  "Police recruitment boards conduct typing and computer proficiency tests to assess a candidate's readiness for administrative duties. Applicants must maintain composure under a strict countdown while transcribing an unfamiliar passage exactly as printed, including every punctuation mark and capitalization pattern in the source text.";

const ENGLISH_PASSAGE_4 =
  "Railway recruitment examinations place equal weight on typing speed and error-free transcription, since clerical staff routinely handle time-sensitive correspondence and official notices. A candidate who rushes through a passage without checking for dropped words or repeated letters often loses more marks to accuracy penalties than to a slower but steadier pace would have cost.";

const ENGLISH_PASSAGE_5 =
  "Subordinate services selection boards require typists to reproduce official notices, tender documents, and administrative circulars verbatim, down to the exact spacing and punctuation of the source. This discipline of exact transcription, rather than paraphrased typing, is precisely what the skill test is designed to measure before a candidate is cleared for clerical duties.";

const HINDI_PASSAGE_3 =
  "रेलवे भर्ती बोर्ड की टंकण परीक्षा में उम्मीदवार से अपेक्षा की जाती है कि वह दिए गए गद्यांश को बिना किसी शब्द को छोड़े, ठीक उसी क्रम और विराम चिह्नों के साथ टाइप करे। गति के साथ-साथ शुद्धता बनाए रखना ही परीक्षा में सफलता की कुंजी है।";

function wordStats(content: string) {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return { wordCount, keyDepressionCount: content.length };
}

const EXAMS = [
  {
    slug: "rrb-ntpc-english",
    name: { en: "RRB NTPC — English", hi: "आरआरबी एनटीपीसी — अंग्रेज़ी" },
    organization: "Railway Recruitment Board (NTPC)",
    language: "EN" as const,
    layout: "QWERTY" as const,
    durationSeconds: 600,
    backspacePolicy: "ENABLED_WITH_PENALTY" as const,
    difficulty: "MEDIUM" as const,
    passages: [ENGLISH_PASSAGE_1, ENGLISH_PASSAGE_2, ENGLISH_PASSAGE_4, ENGLISH_PASSAGE_5],
  },
  {
    slug: "upsssc-hindi",
    name: { en: "UPSSSC — Hindi", hi: "यूपीएसएसएससी — हिंदी" },
    organization: "UP Subordinate Services Selection Commission",
    language: "HI" as const,
    layout: "INSCRIPT" as const,
    durationSeconds: 600,
    backspacePolicy: "ENABLED_WITH_PENALTY" as const,
    difficulty: "MEDIUM" as const,
    passages: [HINDI_PASSAGE_1, HINDI_PASSAGE_2, HINDI_PASSAGE_3],
  },
  {
    slug: "high-court-english",
    name: { en: "Allahabad High Court — English", hi: "इलाहाबाद उच्च न्यायालय — अंग्रेज़ी" },
    organization: "Allahabad High Court",
    language: "EN" as const,
    layout: "QWERTY" as const,
    durationSeconds: 900,
    backspacePolicy: "DISABLED" as const,
    difficulty: "HARD" as const,
    passages: [ENGLISH_PASSAGE_1, ENGLISH_PASSAGE_5],
  },
  {
    slug: "allahabad-hc-ro-aro-hindi",
    name: { en: "Allahabad High Court — RO/ARO (Hindi)", hi: "इलाहाबाद उच्च न्यायालय — आरओ/एआरओ (हिंदी)" },
    organization: "Allahabad High Court",
    language: "HI" as const,
    layout: "REMINGTON" as const,
    durationSeconds: 900,
    backspacePolicy: "DISABLED" as const,
    difficulty: "HARD" as const,
    passages: [HINDI_PASSAGE_1, HINDI_PASSAGE_2, HINDI_PASSAGE_3],
  },
  {
    slug: "patna-hc-english",
    name: { en: "Patna High Court — English", hi: "पटना उच्च न्यायालय — अंग्रेज़ी" },
    organization: "Patna High Court",
    language: "EN" as const,
    layout: "QWERTY" as const,
    durationSeconds: 900,
    backspacePolicy: "DISABLED" as const,
    difficulty: "HARD" as const,
    passages: [ENGLISH_PASSAGE_2, ENGLISH_PASSAGE_3],
  },
  {
    slug: "upsssc-junior-assistant-hindi",
    name: { en: "UPSSSC Junior Assistant — Hindi", hi: "यूपीएसएसएससी कनिष्ठ सहायक — हिंदी" },
    organization: "UP Subordinate Services Selection Commission",
    language: "HI" as const,
    layout: "INSCRIPT" as const,
    durationSeconds: 600,
    backspacePolicy: "ENABLED_WITH_PENALTY" as const,
    difficulty: "MEDIUM" as const,
    passages: [HINDI_PASSAGE_2, HINDI_PASSAGE_3],
  },
  {
    slug: "up-police-si-aso-english",
    name: { en: "UP Police SI/ASI — English", hi: "यूपी पुलिस एसआई/एएसआई — अंग्रेज़ी" },
    organization: "UP Police Recruitment and Promotion Board",
    language: "EN" as const,
    layout: "QWERTY" as const,
    durationSeconds: 300,
    backspacePolicy: "ENABLED_WITH_PENALTY" as const,
    difficulty: "EASY" as const,
    passages: [ENGLISH_PASSAGE_3],
  },
  {
    slug: "rrb-ntpc-hindi-remington",
    name: { en: "RRB NTPC — Hindi (Remington)", hi: "आरआरबी एनटीपीसी — हिंदी (रेमिंगटन)" },
    organization: "Railway Recruitment Board (NTPC)",
    language: "HI" as const,
    layout: "REMINGTON" as const,
    durationSeconds: 600,
    backspacePolicy: "ENABLED_WITH_PENALTY" as const,
    difficulty: "MEDIUM" as const,
    passages: [HINDI_PASSAGE_1],
  },
];

const LOGIC_QUESTIONS = [
  {
    prompt: { en: "If CAT is coded as 24-1-20, how is DOG coded?", hi: "यदि CAT को 24-1-20 कोड किया जाता है, तो DOG कैसे कोड होगा?" },
    options: { en: ["4-15-7", "3-14-6", "4-14-7", "5-15-8"], hi: ["4-15-7", "3-14-6", "4-14-7", "5-15-8"] },
    correctIndex: 0,
    topic: "coding-decoding",
  },
  {
    prompt: { en: "Find the next number: 2, 6, 12, 20, 30, ?", hi: "अगली संख्या ज्ञात करें: 2, 6, 12, 20, 30, ?" },
    options: { en: ["36", "40", "42", "44"], hi: ["36", "40", "42", "44"] },
    correctIndex: 2,
    topic: "number-series",
  },
  {
    prompt: { en: "A clock shows 3:15. What is the angle between the hands?", hi: "एक घड़ी 3:15 दिखाती है। सुइयों के बीच का कोण क्या है?" },
    options: { en: ["0°", "7.5°", "15°", "30°"], hi: ["0°", "7.5°", "15°", "30°"] },
    correctIndex: 1,
    topic: "clocks",
  },
  {
    prompt: { en: "Odd one out: Apple, Banana, Carrot, Mango", hi: "विषम चुनें: सेब, केला, गाजर, आम" },
    options: { en: ["Apple", "Banana", "Carrot", "Mango"], hi: ["सेब", "केला", "गाजर", "आम"] },
    correctIndex: 2,
    topic: "classification",
  },
  {
    prompt: { en: "If today is Wednesday, what day will it be after 17 days?", hi: "यदि आज बुधवार है, तो 17 दिनों बाद कौन सा दिन होगा?" },
    options: { en: ["Friday", "Saturday", "Sunday", "Monday"], hi: ["शुक्रवार", "शनिवार", "रविवार", "सोमवार"] },
    correctIndex: 0,
    topic: "calendar",
  },
  {
    prompt: { en: "Pointing to a man, Reena said, 'He is the son of my grandfather's only son.' How is the man related to Reena?", hi: "एक आदमी की ओर इशारा करते हुए रीना ने कहा, 'वह मेरे दादा के इकलौते बेटे का बेटा है।' वह आदमी रीना से कैसे संबंधित है?" },
    options: { en: ["Father", "Brother", "Uncle", "Cousin"], hi: ["पिता", "भाई", "चाचा", "चचेरा भाई"] },
    correctIndex: 1,
    topic: "blood-relations",
  },
];

async function main() {
  let passageCount = 0;

  for (const exam of EXAMS) {
    const record = await prisma.typingExam.upsert({
      where: { slug: exam.slug },
      update: {
        name: exam.name,
        organization: exam.organization,
        language: exam.language,
        layout: exam.layout,
        durationSeconds: exam.durationSeconds,
        totalKeyDepressionsRequired: Math.round((exam.durationSeconds / 60) * 5 * 25),
        backspacePolicy: exam.backspacePolicy,
        difficulty: exam.difficulty,
        isActive: true,
      },
      create: {
        slug: exam.slug,
        name: exam.name,
        organization: exam.organization,
        language: exam.language,
        layout: exam.layout,
        durationSeconds: exam.durationSeconds,
        // 25 wpm at 5 depressions/word is a reasonable government-exam target speed.
        totalKeyDepressionsRequired: Math.round((exam.durationSeconds / 60) * 5 * 25),
        backspacePolicy: exam.backspacePolicy,
        difficulty: exam.difficulty,
      },
    });

    // Per-content dedup (not just "does this exam have any passages at
    // all") so re-running this script after adding new passage strings to
    // an already-seeded exam picks up only the new ones, without
    // duplicating what's already there.
    for (const content of exam.passages) {
      const existing = await prisma.typingPassage.findFirst({ where: { examId: record.id, content } });
      if (existing) continue;
      const { wordCount, keyDepressionCount } = wordStats(content);
      await prisma.typingPassage.create({
        data: { examId: record.id, content, wordCount, keyDepressionCount },
      });
      passageCount++;
    }
  }

  let logicQuestionCount = 0;
  for (const question of LOGIC_QUESTIONS) {
    const existing = await prisma.typingLogicQuestion.findFirst({ where: { topic: question.topic, isActive: true } });
    if (!existing) {
      await prisma.typingLogicQuestion.create({
        data: {
          prompt: question.prompt,
          options: question.options,
          correctIndex: question.correctIndex,
          topic: question.topic,
        },
      });
      logicQuestionCount++;
    }
  }

  console.log(`Typing seed: ${EXAMS.length} exam(s), ${passageCount} new passage(s), ${logicQuestionCount} new logic question(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
