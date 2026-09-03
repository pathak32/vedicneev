import { Difficulty, ExamType, Language, Prisma, PrismaClient } from "@prisma/client";

import { blogSeedPosts } from "./blog-seed";

const prisma = new PrismaClient();

function options(pairs: [string, string, string][]): Prisma.InputJsonValue {
  return pairs.map(([id, en, hi]) => ({ id, text: { en, hi } }));
}

async function main() {
  // ── Sections ────────────────────────────────────────────────────────
  const mentalAbility = await prisma.section.upsert({
    where: { key: "mental_ability" },
    update: {},
    create: {
      key: "mental_ability",
      name: { en: "Mental Ability", hi: "मानसिक योग्यता" },
      order: 1,
    },
  });

  const arithmetic = await prisma.section.upsert({
    where: { key: "arithmetic" },
    update: {},
    create: {
      key: "arithmetic",
      name: { en: "Arithmetic", hi: "अंकगणित" },
      order: 2,
    },
  });

  const language = await prisma.section.upsert({
    where: { key: "language" },
    update: {},
    create: {
      key: "language",
      name: { en: "Language", hi: "भाषा" },
      order: 3,
    },
  });

  await prisma.section.upsert({
    where: { key: "general_knowledge" },
    update: {},
    create: {
      key: "general_knowledge",
      name: { en: "General Knowledge", hi: "सामान्य ज्ञान" },
      order: 4,
    },
  });

  // ── Topics ──────────────────────────────────────────────────────────
  const patternCompletion = await prisma.topic.upsert({
    where: { sectionId_key: { sectionId: mentalAbility.id, key: "pattern_completion" } },
    update: {},
    create: {
      sectionId: mentalAbility.id,
      key: "pattern_completion",
      name: { en: "Pattern Completion", hi: "पैटर्न पूर्णता" },
      order: 1,
    },
  });

  const numberSeries = await prisma.topic.upsert({
    where: { sectionId_key: { sectionId: mentalAbility.id, key: "number_series" } },
    update: {},
    create: {
      sectionId: mentalAbility.id,
      key: "number_series",
      name: { en: "Number & Letter Series", hi: "संख्या एवं अक्षर श्रृंखला" },
      order: 2,
    },
  });

  const classification = await prisma.topic.upsert({
    where: { sectionId_key: { sectionId: mentalAbility.id, key: "classification" } },
    update: {},
    create: {
      sectionId: mentalAbility.id,
      key: "classification",
      name: { en: "Classification (Odd One Out)", hi: "वर्गीकरण (असंगत चुनें)" },
      order: 3,
    },
  });

  const speedCalculation = await prisma.topic.upsert({
    where: { sectionId_key: { sectionId: arithmetic.id, key: "speed_calculation" } },
    update: {},
    create: {
      sectionId: arithmetic.id,
      key: "speed_calculation",
      name: { en: "Speed Calculation", hi: "तीव्र गणना" },
      order: 1,
    },
  });

  const grammar = await prisma.topic.upsert({
    where: { sectionId_key: { sectionId: language.id, key: "grammar" } },
    update: {},
    create: {
      sectionId: language.id,
      key: "grammar",
      name: { en: "Grammar", hi: "व्याकरण" },
      order: 1,
    },
  });

  // ── Vedic speed-hack catalog (mirrors @vedicneev/engine/speedShortcuts) ─
  const hackByEleven = await prisma.vedicSpeedHack.upsert({
    where: { key: "multiply_by_eleven" },
    update: {},
    create: {
      key: "multiply_by_eleven",
      title: { en: "Multiply by 11", hi: "11 से गुणा करें" },
      description: {
        en: "Sandwich the sum of the digits between them: for a two-digit number, the answer's outer digits are the original digits and the middle digit is their sum (carry if it exceeds 9).",
        hi: "अंकों के योग को उनके बीच रखें: दो अंकों की संख्या के लिए, उत्तर के बाहरी अंक मूल अंक होते हैं और मध्य अंक उनका योग होता है (9 से अधिक होने पर कैरी करें)।",
      },
    },
  });

  const hackSquareFive = await prisma.vedicSpeedHack.upsert({
    where: { key: "square_ending_in_five" },
    update: {},
    create: {
      key: "square_ending_in_five",
      title: { en: "Square a number ending in 5", hi: "5 पर समाप्त होने वाली संख्या का वर्ग" },
      description: {
        en: "For a number 10a+5, the square is a×(a+1) followed by 25.",
        hi: "10a+5 रूप की संख्या के लिए, वर्ग a×(a+1) के बाद 25 लिखने से प्राप्त होता है।",
      },
    },
  });

  const hackNikhilamBase = await prisma.vedicSpeedHack.upsert({
    where: { key: "multiply_near_base" },
    update: {},
    create: {
      key: "multiply_near_base",
      title: { en: "Multiply numbers near a base (Nikhilam)", hi: "आधार के निकट संख्याओं का गुणा (निखिलम्)" },
      description: {
        en: "For numbers close to a power of ten, cross-add one number and the other's deviation, multiply by the base, then add the product of the two deviations.",
        hi: "दस की घात के निकट संख्याओं के लिए, एक संख्या में दूसरी के विचलन को जोड़ें, आधार से गुणा करें, फिर दोनों विचलनों का गुणनफल जोड़ें।",
      },
    },
  });

  const hackNikhilamComplement = await prisma.vedicSpeedHack.upsert({
    where: { key: "nikhilam_complement" },
    update: {},
    create: {
      key: "nikhilam_complement",
      title: { en: "All from 9, last from 10", hi: "सभी 9 से, अंतिम 10 से" },
      description: {
        en: "To subtract a number from a power of ten, subtract each digit from 9 except the last digit, which is subtracted from 10.",
        hi: "दस की घात में से किसी संख्या को घटाने के लिए, अंतिम अंक को छोड़कर प्रत्येक अंक को 9 से घटाएं; अंतिम अंक को 10 से घटाएं।",
      },
    },
  });

  await prisma.vedicSpeedHack.upsert({
    where: { key: "vertically_and_crosswise" },
    update: {},
    create: {
      key: "vertically_and_crosswise",
      title: { en: "Vertically and crosswise", hi: "ऊर्ध्वाधर एवं तिरछा" },
      description: {
        en: "A general digit-by-digit multiplication method (Urdhva-Tiryagbhyam) that works for numbers of any size.",
        hi: "किसी भी आकार की संख्याओं के लिए काम करने वाली एक सामान्य अंक-दर-अंक गुणा विधि (ऊर्ध्व-तिर्यग्भ्याम्)।",
      },
    },
  });

  // ── Exam template: JNVST Class 6 ───────────────────────────────────
  // Real JNV Selection Test Class 6 pattern: Mental Ability 40Q/50M (60 min),
  // Arithmetic 20Q/25M (30 min), Language 20Q/25M (30 min) = 80Q/100M/120 min,
  // no negative marking.
  const jnvst6 = await prisma.examTemplate.upsert({
    where: { slug: "jnvst-class-6" },
    update: {},
    create: {
      examType: "JNVST",
      slug: "jnvst-class-6",
      name: { en: "JNVST Class 6 Selection Test", hi: "जेएनवीएसटी कक्षा 6 चयन परीक्षा" },
      totalQuestions: 80,
      totalMarks: 100,
      durationMinutes: 120,
      negativeMarkingRatio: 0,
    },
  });

  await prisma.examTemplateSection.upsert({
    where: { examTemplateId_sectionId: { examTemplateId: jnvst6.id, sectionId: mentalAbility.id } },
    update: {},
    create: {
      examTemplateId: jnvst6.id,
      sectionId: mentalAbility.id,
      order: 1,
      questionCount: 40,
      marksPerQuestion: 1.25,
      timeLimitSeconds: 60 * 60,
    },
  });

  await prisma.examTemplateSection.upsert({
    where: { examTemplateId_sectionId: { examTemplateId: jnvst6.id, sectionId: arithmetic.id } },
    update: {},
    create: {
      examTemplateId: jnvst6.id,
      sectionId: arithmetic.id,
      order: 2,
      questionCount: 20,
      marksPerQuestion: 1.25,
      timeLimitSeconds: 30 * 60,
    },
  });

  await prisma.examTemplateSection.upsert({
    where: { examTemplateId_sectionId: { examTemplateId: jnvst6.id, sectionId: language.id } },
    update: {},
    create: {
      examTemplateId: jnvst6.id,
      sectionId: language.id,
      order: 3,
      questionCount: 20,
      marksPerQuestion: 1.25,
      timeLimitSeconds: 30 * 60,
    },
  });

  // ── 10 sample bilingual questions ──────────────────────────────────

  // Mental Ability — pattern/series/classification (5 questions)
  const mentalAbilityQuestions = [
    {
      topicId: numberSeries.id,
      difficulty: Difficulty.EASY,
      content: {
        en: "Find the missing number: 2, 4, 8, 16, ?, 64",
        hi: "लुप्त संख्या ज्ञात करें: 2, 4, 8, 16, ?, 64",
      },
      options: options([
        ["a", "24", "24"],
        ["b", "32", "32"],
        ["c", "48", "48"],
        ["d", "36", "36"],
      ]),
      correctOption: "b",
      explanation: {
        en: "Each number is double the previous one: 2×2=4, 4×2=8, 8×2=16, 16×2=32.",
        hi: "प्रत्येक संख्या पिछली संख्या की दोगुनी है: 2×2=4, 4×2=8, 8×2=16, 16×2=32।",
      },
    },
    {
      topicId: numberSeries.id,
      difficulty: Difficulty.EASY,
      content: {
        en: "Find the missing letter: A, C, E, G, ?",
        hi: "लुप्त अक्षर ज्ञात करें: A, C, E, G, ?",
      },
      options: options([
        ["a", "H", "H"],
        ["b", "I", "I"],
        ["c", "J", "J"],
        ["d", "F", "F"],
      ]),
      correctOption: "b",
      explanation: {
        en: "The series skips one letter each time (+2): A→C→E→G→I.",
        hi: "श्रृंखला हर बार एक अक्षर छोड़ती है (+2): A→C→E→G→I।",
      },
    },
    {
      topicId: numberSeries.id,
      difficulty: Difficulty.MEDIUM,
      content: {
        en: "Find the missing number: 5, 10, 20, 40, ?",
        hi: "लुप्त संख्या ज्ञात करें: 5, 10, 20, 40, ?",
      },
      options: options([
        ["a", "60", "60"],
        ["b", "70", "70"],
        ["c", "80", "80"],
        ["d", "45", "45"],
      ]),
      correctOption: "c",
      explanation: {
        en: "Each number doubles the previous one: 40×2=80.",
        hi: "प्रत्येक संख्या पिछली संख्या की दोगुनी है: 40×2=80।",
      },
    },
    {
      topicId: patternCompletion.id,
      difficulty: Difficulty.MEDIUM,
      content: {
        en: "Find the missing number in the pattern: 3, 9, 27, 81, ?",
        hi: "पैटर्न में लुप्त संख्या ज्ञात करें: 3, 9, 27, 81, ?",
      },
      options: options([
        ["a", "162", "162"],
        ["b", "202", "202"],
        ["c", "243", "243"],
        ["d", "324", "324"],
      ]),
      correctOption: "c",
      explanation: {
        en: "Each number is multiplied by 3 to get the next: 81×3=243.",
        hi: "अगली संख्या पाने के लिए प्रत्येक संख्या को 3 से गुणा किया जाता है: 81×3=243।",
      },
    },
    {
      topicId: classification.id,
      difficulty: Difficulty.EASY,
      content: {
        en: "Which one does not belong with the others: Apple, Banana, Carrot, Mango?",
        hi: "इनमें से कौन-सा अन्य से मेल नहीं खाता: सेब, केला, गाजर, आम?",
      },
      options: options([
        ["a", "Apple / सेब", "Apple / सेब"],
        ["b", "Banana / केला", "Banana / केला"],
        ["c", "Carrot / गाजर", "Carrot / गाजर"],
        ["d", "Mango / आम", "Mango / आम"],
      ]),
      correctOption: "c",
      explanation: {
        en: "Carrot is a vegetable; the rest are fruits.",
        hi: "गाजर एक सब्जी है; बाकी सभी फल हैं।",
      },
    },
  ];

  // Arithmetic — speed problems, several tied to a Vedic shortcut (5 questions)
  const arithmeticQuestions = [
    {
      topicId: speedCalculation.id,
      difficulty: Difficulty.EASY,
      content: { en: "Calculate quickly: 45 × 11 = ?", hi: "शीघ्र गणना करें: 45 × 11 = ?" },
      options: options([
        ["a", "485", "485"],
        ["b", "495", "495"],
        ["c", "450", "450"],
        ["d", "545", "545"],
      ]),
      correctOption: "b",
      vedicSpeedHackId: hackByEleven.id,
      explanation: {
        en: "Sandwich rule for ×11: 4_5 with the middle digit 4+5=9 → 495.",
        hi: "×11 के लिए सैंडविच नियम: 4_5 जिसमें मध्य अंक 4+5=9 है → 495।",
      },
    },
    {
      topicId: speedCalculation.id,
      difficulty: Difficulty.MEDIUM,
      content: { en: "Calculate quickly: 65² = ?", hi: "शीघ्र गणना करें: 65² = ?" },
      options: options([
        ["a", "4025", "4025"],
        ["b", "4125", "4125"],
        ["c", "4225", "4225"],
        ["d", "4325", "4325"],
      ]),
      correctOption: "c",
      vedicSpeedHackId: hackSquareFive.id,
      explanation: {
        en: "For a number ending in 5: 6×(6+1)=42, then append 25 → 4225.",
        hi: "5 पर समाप्त होने वाली संख्या के लिए: 6×(6+1)=42, फिर 25 जोड़ें → 4225।",
      },
    },
    {
      topicId: speedCalculation.id,
      difficulty: Difficulty.HARD,
      content: { en: "Calculate quickly: 98 × 97 = ?", hi: "शीघ्र गणना करें: 98 × 97 = ?" },
      options: options([
        ["a", "9406", "9406"],
        ["b", "9506", "9506"],
        ["c", "9606", "9606"],
        ["d", "9516", "9516"],
      ]),
      correctOption: "b",
      vedicSpeedHackId: hackNikhilamBase.id,
      explanation: {
        en: "Base 100, deviations -2 and -3: (98-3)×100 + (-2×-3) = 9500+6 = 9506.",
        hi: "आधार 100, विचलन -2 और -3: (98-3)×100 + (-2×-3) = 9500+6 = 9506।",
      },
    },
    {
      topicId: speedCalculation.id,
      difficulty: Difficulty.HARD,
      content: { en: "Calculate quickly: 102 × 104 = ?", hi: "शीघ्र गणना करें: 102 × 104 = ?" },
      options: options([
        ["a", "10408", "10408"],
        ["b", "10508", "10508"],
        ["c", "10608", "10608"],
        ["d", "10708", "10708"],
      ]),
      correctOption: "c",
      vedicSpeedHackId: hackNikhilamBase.id,
      explanation: {
        en: "Base 100, deviations +2 and +4: (102+4)×100 + (2×4) = 10600+8 = 10608.",
        hi: "आधार 100, विचलन +2 और +4: (102+4)×100 + (2×4) = 10600+8 = 10608।",
      },
    },
    {
      topicId: speedCalculation.id,
      difficulty: Difficulty.MEDIUM,
      content: {
        en: "Use the all-from-9-last-from-10 method: 1000 − 587 = ?",
        hi: "सभी-9-से-अंतिम-10-से विधि का उपयोग करें: 1000 − 587 = ?",
      },
      options: options([
        ["a", "313", "313"],
        ["b", "413", "413"],
        ["c", "423", "423"],
        ["d", "513", "513"],
      ]),
      correctOption: "b",
      vedicSpeedHackId: hackNikhilamComplement.id,
      explanation: {
        en: "9-5=4, 9-8=1, 10-7=3 → 413.",
        hi: "9-5=4, 9-8=1, 10-7=3 → 413।",
      },
    },
  ];

  // Question/MediaItem have no natural unique key to upsert on (unlike the
  // sections/topics/hacks/templates above), so re-running this script would
  // otherwise duplicate every row instead of crashing. Guard on existing
  // count instead: skip the bulk inserts once they've been seeded.
  const existingQuestionCount = await prisma.question.count();
  if (existingQuestionCount === 0) {
    for (const q of [...mentalAbilityQuestions, ...arithmeticQuestions]) {
      await prisma.question.create({ data: q });
    }
  } else {
    console.log(`Skipping question seed — ${existingQuestionCount} question(s) already exist.`);
  }

  // ── Media catalog ───────────────────────────────────────────────────
  // videoUrl/audioUrl/thumbnailUrl are left null: these catalog rows exist
  // (title, description, linked topic/hack) ahead of the actual asset
  // uploads, same as a real CMS workflow.
  const mediaItems = [
    {
      mediaType: "SHORT_VIDEO" as const,
      title: { en: "Nikhilam Multiplication in 40 Seconds", hi: "40 सेकंड में निखिलम् गुणा" },
      description: {
        en: "Multiply numbers near a base like 98×97 without long multiplication.",
        hi: "98×97 जैसी आधार के निकट संख्याओं को बिना लंबी गुणा प्रक्रिया के गुणा करें।",
      },
      durationSeconds: 45,
      topicId: speedCalculation.id,
      vedicSpeedHackId: hackNikhilamBase.id,
      targetExams: ["JNVST", "AISSEE"] as ExamType[],
    },
    {
      mediaType: "SHORT_VIDEO" as const,
      title: { en: "Spin the Shape: Cracking Rotation Patterns", hi: "आकृति घुमाएं: घूर्णन पैटर्न को समझें" },
      description: {
        en: "Spot the rotation angle in non-verbal reasoning figure sequences.",
        hi: "अशाब्दिक तर्क आकृति अनुक्रमों में घूर्णन कोण पहचानें।",
      },
      durationSeconds: 38,
      topicId: patternCompletion.id,
      vedicSpeedHackId: null,
      targetExams: ["JNVST", "AISSEE", "RMS"] as ExamType[],
    },
    {
      mediaType: "AUDIO_POD" as const,
      title: { en: "The ×11 Rule, Explained", hi: "×11 का नियम, समझाया गया" },
      description: {
        en: "A 2-minute bilingual walkthrough of the sandwich rule for multiplying by 11.",
        hi: "11 से गुणा करने के सैंडविच नियम का 2 मिनट का द्विभाषी विवरण।",
      },
      durationSeconds: 150,
      topicId: speedCalculation.id,
      vedicSpeedHackId: hackByEleven.id,
      targetExams: ["JNVST", "AISSEE"] as ExamType[],
      transcript: {
        en: "To multiply a two-digit number by 11, add its two digits and place the sum between them...",
        hi: "किसी दो अंकों की संख्या को 11 से गुणा करने के लिए, उसके दोनों अंकों को जोड़ें और योग को उनके बीच रखें...",
      },
    },
    {
      mediaType: "AUDIO_POD" as const,
      title: { en: "Grammar Formula: Simple Present Tense", hi: "व्याकरण सूत्र: सामान्य वर्तमान काल" },
      description: {
        en: "When to add -s or -es, and the exceptions that trip students up.",
        hi: "-s या -es कब जोड़ें, और वे अपवाद जो छात्रों को उलझाते हैं।",
      },
      durationSeconds: 200,
      topicId: grammar.id,
      vedicSpeedHackId: null,
      targetExams: ["JNVST", "AISSEE", "DPS"] as ExamType[],
      transcript: {
        en: "Third-person singular subjects — he, she, it, or a single name — take the -s form of the verb...",
        hi: "तृतीय पुरुष एकवचन कर्ता — he, she, it, या कोई एक नाम — क्रिया के -s रूप का प्रयोग करते हैं...",
      },
    },
    {
      mediaType: "CONCEPT_CLINIC" as const,
      title: { en: "Arithmetic Word Problems: Breaking Them Down", hi: "अंकगणितीय शब्द समस्याएं: चरण-दर-चरण समाधान" },
      description: {
        en: "A step-by-step remediation clinic for turning word problems into equations.",
        hi: "शब्द समस्याओं को समीकरणों में बदलने के लिए चरण-दर-चरण उपचारात्मक क्लिनिक।",
      },
      durationSeconds: 480,
      topicId: speedCalculation.id,
      vedicSpeedHackId: null,
      targetExams: ["JNVST", "AISSEE"] as ExamType[],
    },
    {
      mediaType: "CONCEPT_CLINIC" as const,
      title: { en: "Mastering Number & Letter Series", hi: "संख्या एवं अक्षर श्रृंखला में महारत" },
      description: {
        en: "A deep dive into spotting the rule behind any series question.",
        hi: "किसी भी श्रृंखला प्रश्न के पीछे के नियम को पहचानने की गहन जानकारी।",
      },
      durationSeconds: 360,
      topicId: numberSeries.id,
      vedicSpeedHackId: null,
      targetExams: ["JNVST", "AISSEE", "RMS"] as ExamType[],
    },
  ];

  const existingMediaItemCount = await prisma.mediaItem.count();
  if (existingMediaItemCount === 0) {
    for (const item of mediaItems) {
      await prisma.mediaItem.create({ data: item });
    }
  } else {
    console.log(`Skipping media item seed — ${existingMediaItemCount} item(s) already exist.`);
  }

  // ── State configurations (which languages an exam is offered in, per state) ─
  const stateConfigurations: {
    stateCode: string;
    stateName: Prisma.InputJsonValue;
    examType: ExamType;
    activeLanguages: Language[];
  }[] = [
    {
      stateCode: "MH",
      stateName: { en: "Maharashtra", hi: "महाराष्ट्र" },
      examType: "JNVST",
      activeLanguages: ["EN", "HI", "MR"],
    },
    {
      stateCode: "WB",
      stateName: { en: "West Bengal", hi: "पश्चिम बंगाल" },
      examType: "JNVST",
      activeLanguages: ["EN", "HI", "BN"],
    },
    {
      stateCode: "TN",
      stateName: { en: "Tamil Nadu", hi: "तमिलनाडु" },
      examType: "JNVST",
      activeLanguages: ["EN", "HI", "TA"],
    },
    {
      stateCode: "UP",
      stateName: { en: "Uttar Pradesh", hi: "उत्तर प्रदेश" },
      examType: "JNVST",
      activeLanguages: ["EN", "HI"],
    },
  ];

  for (const config of stateConfigurations) {
    await prisma.stateConfiguration.upsert({
      where: { stateCode_examType: { stateCode: config.stateCode, examType: config.examType } },
      update: {},
      create: config,
    });
  }
  console.log(`State configurations: ${stateConfigurations.length} processed.`);

  // ── Blog drafts (organic SEO seed content) ─────────────────────────
  // Upsert by slug (unique) so re-running this script is safe: existing
  // posts are left untouched (an admin may have edited or published them
  // since), only genuinely new slugs are inserted as DRAFT.
  let newBlogPostCount = 0;
  for (const post of blogSeedPosts) {
    const result = await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        slug: post.slug,
        category: post.category,
        excerpt: post.excerpt,
        content: post.content,
        status: "DRAFT",
      },
    });
    if (result.createdAt.getTime() === result.updatedAt.getTime()) newBlogPostCount += 1;
  }
  console.log(`Blog seed: ${blogSeedPosts.length} posts processed, ${newBlogPostCount} newly created.`);

  console.log(
    "Seed complete: 4 sections, 5 topics, 5 speed hacks, 1 exam template" +
      (existingQuestionCount === 0 ? ", 10 questions" : "") +
      (existingMediaItemCount === 0 ? ", 6 media items" : "") +
      "."
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
