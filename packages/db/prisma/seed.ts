import { Difficulty, ExamType, Language, Prisma, PrismaClient } from "@prisma/client";

import { blogSeedPosts } from "./blog-seed";
import { loadAuditQuestions, type AuditFile } from "./topic-seed/audit-loader";
import grammarAudit from "./topic-seed/audit/grammar.json";
import generalAwarenessAudit from "./topic-seed/audit/general-awareness.json";
import generalMathematicsAudit from "./topic-seed/audit/general-mathematics.json";
import generalScienceAudit from "./topic-seed/audit/general-science.json";
import socialAwarenessAudit from "./topic-seed/audit/social-awareness.json";
import figureMatchingAudit from "./topic-seed/audit/figure-matching.json";
import figureSeriesAudit from "./topic-seed/audit/figure-series.json";
import analogyAudit from "./topic-seed/audit/analogy.json";
import { buildClassificationQuestions } from "./topic-seed/classification";
import { buildNumberSeriesQuestions } from "./topic-seed/number-series";
import { buildPatternCompletionQuestions } from "./topic-seed/pattern-completion";
import { buildSpeedCalculationQuestions } from "./topic-seed/speed-calculation";
import type { GeneratedQuestion } from "./topic-seed/types";

const prisma = new PrismaClient();

// ── Multilingual JSONB helpers ──────────────────────────────────────────
// "en" is always required as the guaranteed fallback the app renders when
// a question hasn't been translated into the student's chosen language
// yet; the rest are filled in incrementally (see StateConfiguration,
// which maps each state/exam pair to the languages it actually needs).
type LangText = { en: string; hi?: string; mr?: string; bn?: string; ta?: string; gu?: string };

function ml(text: LangText): Prisma.InputJsonValue {
  return text as Prisma.InputJsonValue;
}

function opt(id: string, text: LangText): Prisma.InputJsonValue {
  return { id, text };
}

function options(pairs: [string, LangText][]): Prisma.InputJsonValue {
  return pairs.map(([id, text]) => opt(id, text));
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

  const generalKnowledge = await prisma.section.upsert({
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

  const figureMatching = await prisma.topic.upsert({
    where: { sectionId_key: { sectionId: mentalAbility.id, key: "figure_matching" } },
    update: {},
    create: {
      sectionId: mentalAbility.id,
      key: "figure_matching",
      name: { en: "Figure Matching", hi: "आकृति मिलान" },
      order: 4,
    },
  });

  const figureSeries = await prisma.topic.upsert({
    where: { sectionId_key: { sectionId: mentalAbility.id, key: "figure_series" } },
    update: {},
    create: {
      sectionId: mentalAbility.id,
      key: "figure_series",
      name: { en: "Figure Series Completion", hi: "आकृति श्रृंखला पूर्णता" },
      order: 5,
    },
  });

  const analogy = await prisma.topic.upsert({
    where: { sectionId_key: { sectionId: mentalAbility.id, key: "analogy" } },
    update: {},
    create: {
      sectionId: mentalAbility.id,
      key: "analogy",
      name: { en: "Analogy", hi: "सादृश्य" },
      order: 6,
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

  const generalAwareness = await prisma.topic.upsert({
    where: { sectionId_key: { sectionId: generalKnowledge.id, key: "general_awareness" } },
    update: {},
    create: {
      sectionId: generalKnowledge.id,
      key: "general_awareness",
      name: { en: "General Awareness", hi: "सामान्य जागरूकता" },
      order: 1,
    },
  });

  // ── Sections: Class 9 lateral-entry subjects ──────────────────────────
  // JNVST/AISSEE/RMS Class 9 papers test materially different subject
  // matter than the Class 6 papers above (a distinct "Mathematics" and
  // "Science" curriculum, plus JNVST 9 adds "Social Science"), so these are
  // new sections/topics rather than reusing the Class 6 ones.
  const mathematics = await prisma.section.upsert({
    where: { key: "mathematics" },
    update: {},
    create: {
      key: "mathematics",
      name: { en: "Mathematics", hi: "गणित" },
      order: 5,
    },
  });

  const science = await prisma.section.upsert({
    where: { key: "science" },
    update: {},
    create: {
      key: "science",
      name: { en: "Science", hi: "विज्ञान" },
      order: 6,
    },
  });

  const socialScience = await prisma.section.upsert({
    where: { key: "social_science" },
    update: {},
    create: {
      key: "social_science",
      name: { en: "Social Science", hi: "सामाजिक विज्ञान" },
      order: 7,
    },
  });

  const generalMathematics = await prisma.topic.upsert({
    where: { sectionId_key: { sectionId: mathematics.id, key: "general_mathematics" } },
    update: {},
    create: {
      sectionId: mathematics.id,
      key: "general_mathematics",
      name: { en: "General Mathematics", hi: "सामान्य गणित" },
      order: 1,
    },
  });

  const generalScience = await prisma.topic.upsert({
    where: { sectionId_key: { sectionId: science.id, key: "general_science" } },
    update: {},
    create: {
      sectionId: science.id,
      key: "general_science",
      name: { en: "General Science", hi: "सामान्य विज्ञान" },
      order: 1,
    },
  });

  const socialAwareness = await prisma.topic.upsert({
    where: { sectionId_key: { sectionId: socialScience.id, key: "social_awareness" } },
    update: {},
    create: {
      sectionId: socialScience.id,
      key: "social_awareness",
      name: { en: "Social & Civic Awareness", hi: "सामाजिक एवं नागरिक जागरूकता" },
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

  const hackVerticallyCrosswise = await prisma.vedicSpeedHack.upsert({
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

  // ── Exam template: AISSEE Class 6 (Sainik School) ───────────────────
  // Commonly published AISSEE Class 6 pattern: Mathematics 50Q/150M (60
  // min), Intelligence 25Q/50M (30 min), Language 25Q/50M (30 min),
  // General Knowledge 25Q/50M (30 min) = 125Q/300M/150 min, no negative
  // marking. Structural pattern only (question/marks/duration counts) —
  // verify against the current year's official AISSEE notification before
  // treating as authoritative, same caveat as the JNVST template above.
  const aissee6 = await prisma.examTemplate.upsert({
    where: { slug: "aissee-class-6" },
    update: {},
    create: {
      examType: "AISSEE",
      slug: "aissee-class-6",
      name: { en: "AISSEE Class 6 (Sainik School) Entrance Exam", hi: "एआईएसएसई कक्षा 6 (सैनिक स्कूल) प्रवेश परीक्षा" },
      totalQuestions: 125,
      totalMarks: 300,
      durationMinutes: 150,
      negativeMarkingRatio: 0,
    },
  });

  const aisseeSections: { section: typeof mentalAbility; order: number; questionCount: number; marksPerQuestion: number; minutes: number }[] = [
    { section: arithmetic, order: 1, questionCount: 50, marksPerQuestion: 3, minutes: 60 },
    { section: mentalAbility, order: 2, questionCount: 25, marksPerQuestion: 2, minutes: 30 },
    { section: language, order: 3, questionCount: 25, marksPerQuestion: 2, minutes: 30 },
    { section: generalKnowledge, order: 4, questionCount: 25, marksPerQuestion: 2, minutes: 30 },
  ];
  for (const s of aisseeSections) {
    await prisma.examTemplateSection.upsert({
      where: { examTemplateId_sectionId: { examTemplateId: aissee6.id, sectionId: s.section.id } },
      update: {},
      create: {
        examTemplateId: aissee6.id,
        sectionId: s.section.id,
        order: s.order,
        questionCount: s.questionCount,
        marksPerQuestion: s.marksPerQuestion,
        timeLimitSeconds: s.minutes * 60,
      },
    });
  }

  // ── Exam template: RMS Class 6 ──────────────────────────────────────
  // Commonly published RMS (Rashtriya Military School) Class 6 pattern
  // mirrors AISSEE's structure — same caveat: verify against the current
  // year's official RMS notification before treating as authoritative.
  const rms6 = await prisma.examTemplate.upsert({
    where: { slug: "rms-class-6" },
    update: {},
    create: {
      examType: "RMS",
      slug: "rms-class-6",
      name: { en: "RMS Class 6 Entrance Exam", hi: "आरएमएस कक्षा 6 प्रवेश परीक्षा" },
      totalQuestions: 125,
      totalMarks: 300,
      durationMinutes: 150,
      negativeMarkingRatio: 0,
    },
  });

  const rmsSections = aisseeSections;
  for (const s of rmsSections) {
    await prisma.examTemplateSection.upsert({
      where: { examTemplateId_sectionId: { examTemplateId: rms6.id, sectionId: s.section.id } },
      update: {},
      create: {
        examTemplateId: rms6.id,
        sectionId: s.section.id,
        order: s.order,
        questionCount: s.questionCount,
        marksPerQuestion: s.marksPerQuestion,
        timeLimitSeconds: s.minutes * 60,
      },
    });
  }

  // ── Exam template: JNVST Class 9 (lateral entry) ────────────────────
  // JNVST's primary intake is Class 6, but NVS also runs a smaller Class 9
  // lateral-entry selection test to backfill Class 6 vacancies. Pattern
  // below (Mathematics 35Q/35M, Science 35Q/35M, Social Science 30Q/30M =
  // 100Q/100M/150 min, no negative marking) is a commonly cited
  // approximation of that paper's structure — confidence here is LOWER
  // than the Class 6 templates above; verify against the current year's
  // official NVS Class 9 lateral-entry notification before treating any of
  // these numbers as authoritative.
  const jnvst9 = await prisma.examTemplate.upsert({
    where: { slug: "jnvst-class-9" },
    update: {},
    create: {
      examType: "JNVST",
      classLevel: 9,
      slug: "jnvst-class-9",
      name: { en: "JNVST Class 9 Lateral Entry Selection Test", hi: "जेएनवीएसटी कक्षा 9 पार्श्व प्रवेश चयन परीक्षा" },
      totalQuestions: 100,
      totalMarks: 100,
      durationMinutes: 150,
      negativeMarkingRatio: 0,
    },
  });

  const jnvst9Sections = [
    { section: mathematics, order: 1, questionCount: 35, marksPerQuestion: 1, minutes: 53 },
    { section: science, order: 2, questionCount: 35, marksPerQuestion: 1, minutes: 53 },
    { section: socialScience, order: 3, questionCount: 30, marksPerQuestion: 1, minutes: 44 },
  ];
  for (const s of jnvst9Sections) {
    await prisma.examTemplateSection.upsert({
      where: { examTemplateId_sectionId: { examTemplateId: jnvst9.id, sectionId: s.section.id } },
      update: {},
      create: {
        examTemplateId: jnvst9.id,
        sectionId: s.section.id,
        order: s.order,
        questionCount: s.questionCount,
        marksPerQuestion: s.marksPerQuestion,
        timeLimitSeconds: s.minutes * 60,
      },
    });
  }

  // ── Exam template: AISSEE Class 9 (Sainik School lateral entry) ─────
  // Same overall structure as AISSEE Class 6 above (125Q/300M/150 min),
  // but the Class 6 paper's "Language" section is commonly replaced by
  // "General Science" for the Class 9 paper — the subject swap generally
  // cited for the older-student AISSEE/RMS papers. Structural pattern
  // only, same caveat as Class 6: verify against the current year's
  // official AISSEE notification before treating as authoritative.
  const aissee9 = await prisma.examTemplate.upsert({
    where: { slug: "aissee-class-9" },
    update: {},
    create: {
      examType: "AISSEE",
      classLevel: 9,
      slug: "aissee-class-9",
      name: { en: "AISSEE Class 9 (Sainik School) Lateral Entry Exam", hi: "एआईएसएसई कक्षा 9 (सैनिक स्कूल) पार्श्व प्रवेश परीक्षा" },
      totalQuestions: 125,
      totalMarks: 300,
      durationMinutes: 150,
      negativeMarkingRatio: 0,
    },
  });

  const sainik9Sections = [
    { section: mathematics, order: 1, questionCount: 50, marksPerQuestion: 3, minutes: 60 },
    { section: mentalAbility, order: 2, questionCount: 25, marksPerQuestion: 2, minutes: 30 },
    { section: science, order: 3, questionCount: 25, marksPerQuestion: 2, minutes: 30 },
    { section: generalKnowledge, order: 4, questionCount: 25, marksPerQuestion: 2, minutes: 30 },
  ];
  for (const s of sainik9Sections) {
    await prisma.examTemplateSection.upsert({
      where: { examTemplateId_sectionId: { examTemplateId: aissee9.id, sectionId: s.section.id } },
      update: {},
      create: {
        examTemplateId: aissee9.id,
        sectionId: s.section.id,
        order: s.order,
        questionCount: s.questionCount,
        marksPerQuestion: s.marksPerQuestion,
        timeLimitSeconds: s.minutes * 60,
      },
    });
  }

  // ── Exam template: RMS Class 9 (lateral entry) ───────────────────────
  // Mirrors AISSEE Class 9's structure — same caveat as RMS Class 6.
  const rms9 = await prisma.examTemplate.upsert({
    where: { slug: "rms-class-9" },
    update: {},
    create: {
      examType: "RMS",
      classLevel: 9,
      slug: "rms-class-9",
      name: { en: "RMS Class 9 Lateral Entry Exam", hi: "आरएमएस कक्षा 9 पार्श्व प्रवेश परीक्षा" },
      totalQuestions: 125,
      totalMarks: 300,
      durationMinutes: 150,
      negativeMarkingRatio: 0,
    },
  });

  for (const s of sainik9Sections) {
    await prisma.examTemplateSection.upsert({
      where: { examTemplateId_sectionId: { examTemplateId: rms9.id, sectionId: s.section.id } },
      update: {},
      create: {
        examTemplateId: rms9.id,
        sectionId: s.section.id,
        order: s.order,
        questionCount: s.questionCount,
        marksPerQuestion: s.marksPerQuestion,
        timeLimitSeconds: s.minutes * 60,
      },
    });
  }

  // ── Question bank ────────────────────────────────────────────────────
  // Every question upserts on its `key` (packages/db/prisma/schema.prisma),
  // not `create()` — safe to re-run, and editing a question's text here and
  // re-seeding will update the live row instead of creating a duplicate.
  // Questions aren't owned by a single ExamTemplate: JNVST, AISSEE, and RMS
  // all draw from the same shared Section/Topic pool, differentiated only
  // by each template's question count/marks/timing above.

  interface QuestionSeed {
    key: string;
    topicId: string;
    difficulty: Difficulty;
    content: Prisma.InputJsonValue;
    options: Prisma.InputJsonValue;
    correctOption: string;
    vedicSpeedHackId?: string;
    explanation: Prisma.InputJsonValue;
    /** Per wrong-option-id breakdown of why it's a common trap answer — see Question.distractorAnalysis. */
    distractorAnalysis?: Prisma.InputJsonValue;
    /** Inline-SVG diagram for visual/non-verbal reasoning question stems — see Question.figureMetadata. */
    figureMetadata?: Prisma.InputJsonValue;
  }

  /** Adapts a topic-seed/*.ts generator's output (packages/db/prisma/topic-seed/types.ts) into this file's QuestionSeed shape. */
  function fromGenerated(topicId: string, questions: GeneratedQuestion[]): QuestionSeed[] {
    return questions.map((q) => ({
      key: q.key,
      topicId,
      difficulty: q.difficulty as Difficulty,
      content: q.content as unknown as Prisma.InputJsonValue,
      options: q.options as unknown as Prisma.InputJsonValue,
      correctOption: q.correctOption,
      vedicSpeedHackId: q.vedicSpeedHackId,
      explanation: q.explanation as unknown as Prisma.InputJsonValue,
      distractorAnalysis: q.distractorAnalysis as unknown as Prisma.InputJsonValue,
      figureMetadata: q.figureMetadata as unknown as Prisma.InputJsonValue | undefined,
    }));
  }

  // Mental Ability — pattern/series/classification (5 questions, en/hi).
  const mentalAbilityQuestions: QuestionSeed[] = [
    {
      key: "jnvst6-ma-series-01",
      topicId: numberSeries.id,
      difficulty: Difficulty.EASY,
      content: ml({
        en: "Find the missing number: 2, 4, 8, 16, ?, 64",
        hi: "लुप्त संख्या ज्ञात करें: 2, 4, 8, 16, ?, 64",
      }),
      options: options([
        ["a", { en: "24", hi: "24" }],
        ["b", { en: "32", hi: "32" }],
        ["c", { en: "48", hi: "48" }],
        ["d", { en: "36", hi: "36" }],
      ]),
      correctOption: "b",
      explanation: ml({
        en: "Each number is double the previous one: 2×2=4, 4×2=8, 8×2=16, 16×2=32.",
        hi: "प्रत्येक संख्या पिछली संख्या की दोगुनी है: 2×2=4, 4×2=8, 8×2=16, 16×2=32।",
      }),
    },
    {
      key: "jnvst6-ma-series-02",
      topicId: numberSeries.id,
      difficulty: Difficulty.EASY,
      content: ml({
        en: "Find the missing letter: A, C, E, G, ?",
        hi: "लुप्त अक्षर ज्ञात करें: A, C, E, G, ?",
      }),
      options: options([
        ["a", { en: "H", hi: "H" }],
        ["b", { en: "I", hi: "I" }],
        ["c", { en: "J", hi: "J" }],
        ["d", { en: "F", hi: "F" }],
      ]),
      correctOption: "b",
      explanation: ml({
        en: "The series skips one letter each time (+2): A→C→E→G→I.",
        hi: "श्रृंखला हर बार एक अक्षर छोड़ती है (+2): A→C→E→G→I।",
      }),
    },
    {
      key: "jnvst6-ma-series-03",
      topicId: numberSeries.id,
      difficulty: Difficulty.MEDIUM,
      content: ml({
        en: "Find the missing number: 5, 10, 20, 40, ?",
        hi: "लुप्त संख्या ज्ञात करें: 5, 10, 20, 40, ?",
      }),
      options: options([
        ["a", { en: "60", hi: "60" }],
        ["b", { en: "70", hi: "70" }],
        ["c", { en: "80", hi: "80" }],
        ["d", { en: "45", hi: "45" }],
      ]),
      correctOption: "c",
      explanation: ml({
        en: "Each number doubles the previous one: 40×2=80.",
        hi: "प्रत्येक संख्या पिछली संख्या की दोगुनी है: 40×2=80।",
      }),
    },
    {
      key: "jnvst6-ma-pattern-01",
      topicId: patternCompletion.id,
      difficulty: Difficulty.MEDIUM,
      content: ml({
        en: "Find the missing number in the pattern: 3, 9, 27, 81, ?",
        hi: "पैटर्न में लुप्त संख्या ज्ञात करें: 3, 9, 27, 81, ?",
      }),
      options: options([
        ["a", { en: "162", hi: "162" }],
        ["b", { en: "202", hi: "202" }],
        ["c", { en: "243", hi: "243" }],
        ["d", { en: "324", hi: "324" }],
      ]),
      correctOption: "c",
      explanation: ml({
        en: "Each number is multiplied by 3 to get the next: 81×3=243.",
        hi: "अगली संख्या पाने के लिए प्रत्येक संख्या को 3 से गुणा किया जाता है: 81×3=243।",
      }),
    },
    {
      key: "jnvst6-ma-classify-01",
      topicId: classification.id,
      difficulty: Difficulty.EASY,
      content: ml({
        en: "Which one does not belong with the others: Apple, Banana, Carrot, Mango?",
        hi: "इनमें से कौन-सा अन्य से मेल नहीं खाता: सेब, केला, गाजर, आम?",
      }),
      options: options([
        ["a", { en: "Apple / सेब", hi: "Apple / सेब" }],
        ["b", { en: "Banana / केला", hi: "Banana / केला" }],
        ["c", { en: "Carrot / गाजर", hi: "Carrot / गाजर" }],
        ["d", { en: "Mango / आम", hi: "Mango / आम" }],
      ]),
      correctOption: "c",
      explanation: ml({
        en: "Carrot is a vegetable; the rest are fruits.",
        hi: "गाजर एक सब्जी है; बाकी सभी फल हैं।",
      }),
    },
  ];

  // Arithmetic — speed problems, several tied to a Vedic shortcut (5 questions, en/hi).
  const arithmeticQuestions: QuestionSeed[] = [
    {
      key: "jnvst6-ar-speed-01",
      topicId: speedCalculation.id,
      difficulty: Difficulty.EASY,
      content: ml({ en: "Calculate quickly: 45 × 11 = ?", hi: "शीघ्र गणना करें: 45 × 11 = ?" }),
      options: options([
        ["a", { en: "485", hi: "485" }],
        ["b", { en: "495", hi: "495" }],
        ["c", { en: "450", hi: "450" }],
        ["d", { en: "545", hi: "545" }],
      ]),
      correctOption: "b",
      vedicSpeedHackId: hackByEleven.id,
      explanation: ml({
        en: "Sandwich rule for ×11: 4_5 with the middle digit 4+5=9 → 495.",
        hi: "×11 के लिए सैंडविच नियम: 4_5 जिसमें मध्य अंक 4+5=9 है → 495।",
      }),
    },
    {
      key: "jnvst6-ar-speed-02",
      topicId: speedCalculation.id,
      difficulty: Difficulty.MEDIUM,
      content: ml({ en: "Calculate quickly: 65² = ?", hi: "शीघ्र गणना करें: 65² = ?" }),
      options: options([
        ["a", { en: "4025", hi: "4025" }],
        ["b", { en: "4125", hi: "4125" }],
        ["c", { en: "4225", hi: "4225" }],
        ["d", { en: "4325", hi: "4325" }],
      ]),
      correctOption: "c",
      vedicSpeedHackId: hackSquareFive.id,
      explanation: ml({
        en: "For a number ending in 5: 6×(6+1)=42, then append 25 → 4225.",
        hi: "5 पर समाप्त होने वाली संख्या के लिए: 6×(6+1)=42, फिर 25 जोड़ें → 4225।",
      }),
    },
    {
      key: "jnvst6-ar-speed-03",
      topicId: speedCalculation.id,
      difficulty: Difficulty.HARD,
      content: ml({ en: "Calculate quickly: 98 × 97 = ?", hi: "शीघ्र गणना करें: 98 × 97 = ?" }),
      options: options([
        ["a", { en: "9406", hi: "9406" }],
        ["b", { en: "9506", hi: "9506" }],
        ["c", { en: "9606", hi: "9606" }],
        ["d", { en: "9516", hi: "9516" }],
      ]),
      correctOption: "b",
      vedicSpeedHackId: hackNikhilamBase.id,
      explanation: ml({
        en: "Base 100, deviations -2 and -3: (98-3)×100 + (-2×-3) = 9500+6 = 9506.",
        hi: "आधार 100, विचलन -2 और -3: (98-3)×100 + (-2×-3) = 9500+6 = 9506।",
      }),
    },
    {
      key: "jnvst6-ar-speed-04",
      topicId: speedCalculation.id,
      difficulty: Difficulty.HARD,
      content: ml({ en: "Calculate quickly: 102 × 104 = ?", hi: "शीघ्र गणना करें: 102 × 104 = ?" }),
      options: options([
        ["a", { en: "10408", hi: "10408" }],
        ["b", { en: "10508", hi: "10508" }],
        ["c", { en: "10608", hi: "10608" }],
        ["d", { en: "10708", hi: "10708" }],
      ]),
      correctOption: "c",
      vedicSpeedHackId: hackNikhilamBase.id,
      explanation: ml({
        en: "Base 100, deviations +2 and +4: (102+4)×100 + (2×4) = 10600+8 = 10608.",
        hi: "आधार 100, विचलन +2 और +4: (102+4)×100 + (2×4) = 10600+8 = 10608।",
      }),
    },
    {
      key: "jnvst6-ar-speed-05",
      topicId: speedCalculation.id,
      difficulty: Difficulty.MEDIUM,
      content: ml({
        en: "Use the all-from-9-last-from-10 method: 1000 − 587 = ?",
        hi: "सभी-9-से-अंतिम-10-से विधि का उपयोग करें: 1000 − 587 = ?",
      }),
      options: options([
        ["a", { en: "313", hi: "313" }],
        ["b", { en: "413", hi: "413" }],
        ["c", { en: "423", hi: "423" }],
        ["d", { en: "513", hi: "513" }],
      ]),
      correctOption: "b",
      vedicSpeedHackId: hackNikhilamComplement.id,
      explanation: ml({ en: "9-5=4, 9-8=1, 10-7=3 → 413.", hi: "9-5=4, 9-8=1, 10-7=3 → 413।" }),
    },
  ];

  // New 5-language (en/hi/mr/bn/ta) question bank, one per section/topic —
  // demonstrates the full JSONB shape the exam runner's language picker
  // reads (apps/web/src/lib/exam/localize.ts falls back to "en" for any
  // key not present, so partially-translated content like the 10 above is
  // expected, not a bug).
  const multilingualQuestions: QuestionSeed[] = [
    {
      key: "bank-ma-classify-ml-01",
      topicId: classification.id,
      difficulty: Difficulty.EASY,
      content: ml({
        en: "Which one does not belong with the others: Triangle, Square, Circle, Sphere?",
        hi: "इनमें से कौन-सा अन्य से मेल नहीं खाता: त्रिभुज, वर्ग, वृत्त, गोला?",
        mr: "यापैकी कोणता इतरांशी जुळत नाही: त्रिकोण, चौरस, वर्तुळ, गोल?",
        bn: "এর মধ্যে কোনটি অন্যদের সাথে মেলে না: ত্রিভুজ, বর্গক্ষেত্র, বৃত্ত, গোলক?",
        ta: "இவற்றில் எது மற்றவற்றுடன் பொருந்தவில்லை: முக்கோணம், சதுரம், வட்டம், கோளம்?",
      }),
      options: options([
        ["a", { en: "Triangle", hi: "त्रिभुज", mr: "त्रिकोण", bn: "ত্রিভুজ", ta: "முக்கோணம்" }],
        ["b", { en: "Square", hi: "वर्ग", mr: "चौरस", bn: "বর্গক্ষেত্র", ta: "சதுரம்" }],
        ["c", { en: "Circle", hi: "वृत्त", mr: "वर्तुळ", bn: "বৃত্ত", ta: "வட்டம்" }],
        ["d", { en: "Sphere", hi: "गोला", mr: "गोल", bn: "গোলক", ta: "கோளம்" }],
      ]),
      correctOption: "d",
      explanation: ml({
        en: "Triangle, Square, and Circle are flat (2D) shapes; a Sphere is a solid (3D) shape.",
        hi: "त्रिभुज, वर्ग और वृत्त समतल (2D) आकृतियाँ हैं; गोला एक ठोस (3D) आकृति है।",
        mr: "त्रिकोण, चौरस आणि वर्तुळ सपाट (2D) आकार आहेत; गोल हा घन (3D) आकार आहे.",
        bn: "ত্রিভুজ, বর্গক্ষেত্র এবং বৃত্ত সমতল (2D) আকৃতি; গোলক একটি নিরেট (3D) আকৃতি।",
        ta: "முக்கோணம், சதுரம், வட்டம் ஆகியவை தட்டையான (2D) வடிவங்கள்; கோளம் ஒரு திண்மையான (3D) வடிவம்.",
      }),
    },
    {
      key: "bank-ma-pattern-ml-01",
      topicId: patternCompletion.id,
      difficulty: Difficulty.MEDIUM,
      content: ml({
        en: "Find the missing number in the pattern: 1, 4, 9, 16, 25, ?",
        hi: "पैटर्न में लुप्त संख्या ज्ञात करें: 1, 4, 9, 16, 25, ?",
        mr: "पॅटर्नमधील लुप्त संख्या शोधा: 1, 4, 9, 16, 25, ?",
        bn: "প্যাটার্নে অনুপস্থিত সংখ্যাটি খুঁজুন: 1, 4, 9, 16, 25, ?",
        ta: "வடிவத்தில் விடுபட்ட எண்ணைக் கண்டறியவும்: 1, 4, 9, 16, 25, ?",
      }),
      options: options([
        ["a", { en: "30", hi: "30", mr: "30", bn: "30", ta: "30" }],
        ["b", { en: "36", hi: "36", mr: "36", bn: "36", ta: "36" }],
        ["c", { en: "32", hi: "32", mr: "32", bn: "32", ta: "32" }],
        ["d", { en: "49", hi: "49", mr: "49", bn: "49", ta: "49" }],
      ]),
      correctOption: "b",
      explanation: ml({
        en: "These are perfect squares (1²,2²,3²,4²,5²,6²); the next is 6²=36.",
        hi: "ये पूर्ण वर्ग हैं (1²,2²,3²,4²,5²,6²); अगला 6²=36 है।",
        mr: "हे पूर्ण वर्ग आहेत (1²,2²,3²,4²,5²,6²); पुढील 6²=36 आहे.",
        bn: "এগুলি পূর্ণ বর্গ (1²,2²,3²,4²,5²,6²); পরেরটি 6²=36।",
        ta: "இவை முழு வர்க்கங்கள் (1²,2²,3²,4²,5²,6²); அடுத்தது 6²=36.",
      }),
    },
    {
      key: "bank-ar-speed-ml-01",
      topicId: speedCalculation.id,
      difficulty: Difficulty.EASY,
      content: ml({
        en: "Calculate quickly: 72 × 11 = ?",
        hi: "शीघ्र गणना करें: 72 × 11 = ?",
        mr: "शीघ्र गणना करा: 72 × 11 = ?",
        bn: "দ্রুত হিসাব করুন: 72 × 11 = ?",
        ta: "விரைவாகக் கணக்கிடுங்கள்: 72 × 11 = ?",
      }),
      options: options([
        ["a", { en: "772", hi: "772", mr: "772", bn: "772", ta: "772" }],
        ["b", { en: "792", hi: "792", mr: "792", bn: "792", ta: "792" }],
        ["c", { en: "702", hi: "702", mr: "702", bn: "702", ta: "702" }],
        ["d", { en: "812", hi: "812", mr: "812", bn: "812", ta: "812" }],
      ]),
      correctOption: "b",
      vedicSpeedHackId: hackByEleven.id,
      explanation: ml({
        en: "Sandwich rule for ×11: 7_2 with the middle digit 7+2=9 → 792.",
        hi: "×11 के लिए सैंडविच नियम: 7_2 जिसमें मध्य अंक 7+2=9 है → 792।",
        mr: "×11 साठी सँडविच नियम: 7_2 ज्यामध्ये मधला अंक 7+2=9 आहे → 792.",
        bn: "×11-এর জন্য স্যান্ডউইচ নিয়ম: 7_2 যার মাঝের অঙ্কটি 7+2=9 → 792।",
        ta: "×11க்கான சாண்ட்விச் விதி: 7_2 நடு இலக்கம் 7+2=9 → 792.",
      }),
    },
    {
      key: "bank-lang-grammar-ml-01",
      topicId: grammar.id,
      difficulty: Difficulty.MEDIUM,
      content: ml({
        en: "Choose the correct plural form of 'Child':",
        hi: "'Child' का सही बहुवचन रूप चुनें:",
        mr: "'Child' चे योग्य अनेकवचन रूप निवडा:",
        bn: "'Child'-এর সঠিক বহুবচন রূপ নির্বাচন করুন:",
        ta: "'Child' இன் சரியான பன்மை வடிவத்தைத் தேர்ந்தெடுக்கவும்:",
      }),
      options: options([
        ["a", { en: "Childs", hi: "Childs", mr: "Childs", bn: "Childs", ta: "Childs" }],
        ["b", { en: "Childes", hi: "Childes", mr: "Childes", bn: "Childes", ta: "Childes" }],
        ["c", { en: "Children", hi: "Children", mr: "Children", bn: "Children", ta: "Children" }],
        ["d", { en: "Childrens", hi: "Childrens", mr: "Childrens", bn: "Childrens", ta: "Childrens" }],
      ]),
      correctOption: "c",
      explanation: ml({
        en: "'Child' has an irregular plural: 'Children', not '-s' or '-es'.",
        hi: "'Child' का अनियमित बहुवचन 'Children' होता है, न कि '-s' या '-es' जोड़कर।",
        mr: "'Child' चे अनियमित अनेकवचन 'Children' आहे, '-s' किंवा '-es' जोडून नाही.",
        bn: "'Child'-এর অনিয়মিত বহুবচন হল 'Children', '-s' বা '-es' যোগ করে নয়।",
        ta: "'Child' இன் ஒழுங்கற்ற பன்மை 'Children' ஆகும், '-s' அல்லது '-es' சேர்த்து அல்ல.",
      }),
    },
    {
      key: "bank-gk-awareness-ml-01",
      topicId: generalAwareness.id,
      difficulty: Difficulty.EASY,
      content: ml({
        en: "Which is the largest planet in our solar system?",
        hi: "हमारे सौरमंडल का सबसे बड़ा ग्रह कौन-सा है?",
        mr: "आपल्या सूर्यमालेतील सर्वात मोठा ग्रह कोणता आहे?",
        bn: "আমাদের সৌরজগতের বৃহত্তম গ্রহ কোনটি?",
        ta: "நமது சூரிய குடும்பத்தில் மிகப்பெரிய கிரகம் எது?",
      }),
      options: options([
        ["a", { en: "Earth", hi: "पृथ्वी", mr: "पृथ्वी", bn: "পৃথিবী", ta: "பூமி" }],
        ["b", { en: "Jupiter", hi: "बृहस्पति", mr: "बृहस्पति", bn: "বৃহস্পতি", ta: "வியாழன்" }],
        ["c", { en: "Mars", hi: "मंगल", mr: "मंगळ", bn: "মঙ্গল", ta: "செவ்வாய்" }],
        ["d", { en: "Venus", hi: "शुक्र", mr: "शुक्र", bn: "শুক্র", ta: "வெள்ளி" }],
      ]),
      correctOption: "b",
      explanation: ml({
        en: "Jupiter is the largest planet in the solar system by both mass and volume.",
        hi: "बृहस्पति द्रव्यमान और आयतन दोनों में सौरमंडल का सबसे बड़ा ग्रह है।",
        mr: "बृहस्पति वस्तुमान आणि आकारमान या दोन्हीमध्ये सूर्यमालेतील सर्वात मोठा ग्रह आहे.",
        bn: "ভর ও আয়তন উভয় দিক থেকেই বৃহস্পতি সৌরজগতের বৃহত্তম গ্রহ।",
        ta: "நிறை மற்றும் அளவு ஆகிய இரண்டிலும் வியாழன் சூரிய குடும்பத்தின் மிகப்பெரிய கிரகம் ஆகும்.",
      }),
    },
  ];

  // ── Class 9 lateral-entry question bank (Mathematics / Science / Social
  // Science) — a small sample set, not a full bank, covering the new
  // subjects those papers test that Class 6's taxonomy doesn't. Fully
  // translated across all 6 supported languages including Gujarati.
  const class9Questions: QuestionSeed[] = [
    {
      key: "bank-math9-general-ml-01",
      topicId: generalMathematics.id,
      difficulty: Difficulty.MEDIUM,
      content: ml({
        en: "Simplify: 3(x + 4) − 2x = ?",
        hi: "सरल कीजिए: 3(x + 4) − 2x = ?",
        mr: "सुलभ करा: 3(x + 4) − 2x = ?",
        bn: "সরলীকরণ করুন: 3(x + 4) − 2x = ?",
        ta: "எளிமையாக்குக: 3(x + 4) − 2x = ?",
        gu: "સરળ કરો: 3(x + 4) − 2x = ?",
      }),
      options: options([
        ["a", { en: "x + 12", hi: "x + 12", mr: "x + 12", bn: "x + 12", ta: "x + 12", gu: "x + 12" }],
        ["b", { en: "x − 12", hi: "x − 12", mr: "x − 12", bn: "x − 12", ta: "x − 12", gu: "x − 12" }],
        ["c", { en: "5x + 12", hi: "5x + 12", mr: "5x + 12", bn: "5x + 12", ta: "5x + 12", gu: "5x + 12" }],
        ["d", { en: "x + 4", hi: "x + 4", mr: "x + 4", bn: "x + 4", ta: "x + 4", gu: "x + 4" }],
      ]),
      correctOption: "a",
      explanation: ml({
        en: "Distribute: 3x + 12 − 2x = x + 12.",
        hi: "वितरित करें: 3x + 12 − 2x = x + 12।",
        mr: "वितरित करा: 3x + 12 − 2x = x + 12.",
        bn: "বিতরণ করুন: 3x + 12 − 2x = x + 12।",
        ta: "பரவலாக்குக: 3x + 12 − 2x = x + 12.",
        gu: "વિતરણ કરો: 3x + 12 − 2x = x + 12.",
      }),
    },
    {
      key: "bank-math9-general-ml-02",
      topicId: generalMathematics.id,
      difficulty: Difficulty.MEDIUM,
      content: ml({
        en: "The value of √225 is:",
        hi: "√225 का मान है:",
        mr: "√225 चे मूल्य आहे:",
        bn: "√225-এর মান হল:",
        ta: "√225 இன் மதிப்பு:",
        gu: "√225 નું મૂલ્ય છે:",
      }),
      options: options([
        ["a", { en: "12", hi: "12", mr: "12", bn: "12", ta: "12", gu: "12" }],
        ["b", { en: "15", hi: "15", mr: "15", bn: "15", ta: "15", gu: "15" }],
        ["c", { en: "18", hi: "18", mr: "18", bn: "18", ta: "18", gu: "18" }],
        ["d", { en: "25", hi: "25", mr: "25", bn: "25", ta: "25", gu: "25" }],
      ]),
      correctOption: "b",
      vedicSpeedHackId: hackSquareFive.id,
      explanation: ml({
        en: "15 × 15 = 225, so √225 = 15.",
        hi: "15 × 15 = 225, अतः √225 = 15।",
        mr: "15 × 15 = 225, म्हणून √225 = 15.",
        bn: "15 × 15 = 225, তাই √225 = 15।",
        ta: "15 × 15 = 225, எனவே √225 = 15.",
        gu: "15 × 15 = 225, તેથી √225 = 15.",
      }),
    },
    {
      key: "bank-sci9-general-ml-01",
      topicId: generalScience.id,
      difficulty: Difficulty.MEDIUM,
      content: ml({
        en: "The basic functional unit of all living organisms is the:",
        hi: "सभी सजीवों की मूल क्रियात्मक इकाई है:",
        mr: "सर्व सजीवांचे मूलभूत कार्यात्मक एकक आहे:",
        bn: "সমস্ত জীবের মৌলিক কার্যকরী একক হল:",
        ta: "அனைத்து உயிரினங்களின் அடிப்படை செயல்பாட்டு அலகு:",
        gu: "તમામ સજીવોનું મૂળભૂત કાર્યકારી એકમ છે:",
      }),
      options: options([
        ["a", { en: "Tissue", hi: "ऊतक", mr: "ऊती", bn: "কলা", ta: "திசு", gu: "પેશી" }],
        ["b", { en: "Cell", hi: "कोशिका", mr: "पेशी", bn: "কোষ", ta: "செல்", gu: "કોષ" }],
        ["c", { en: "Organ", hi: "अंग", mr: "अवयव", bn: "অঙ্গ", ta: "உறுப்பு", gu: "અંગ" }],
        ["d", { en: "Nucleus", hi: "केंद्रक", mr: "केंद्रक", bn: "নিউক্লিয়াস", ta: "உட்கரு", gu: "કેન્દ્રક" }],
      ]),
      correctOption: "b",
      explanation: ml({
        en: "The cell is the smallest structural and functional unit of life; tissues and organs are built from groups of cells.",
        hi: "कोशिका जीवन की सबसे छोटी संरचनात्मक और क्रियात्मक इकाई है; ऊतक और अंग कोशिकाओं के समूहों से बनते हैं।",
        mr: "पेशी ही जीवनाची सर्वात लहान संरचनात्मक आणि कार्यात्मक एकक आहे; ऊती आणि अवयव पेशींच्या समूहांपासून बनतात.",
        bn: "কোষ হল জীবনের ক্ষুদ্রতম গঠনগত ও কার্যকরী একক; কলা ও অঙ্গ কোষের গোষ্ঠী থেকে তৈরি হয়।",
        ta: "செல் என்பது உயிரின மிகச்சிறிய கட்டமைப்பு மற்றும் செயல்பாட்டு அலகு; திசுக்களும் உறுப்புகளும் செல் தொகுதிகளிலிருந்து உருவாகின்றன.",
        gu: "કોષ એ જીવનનું સૌથી નાનું રચનાત્મક અને કાર્યકારી એકમ છે; પેશીઓ અને અંગો કોષોના જૂથોમાંથી બને છે.",
      }),
    },
    {
      key: "bank-sci9-general-ml-02",
      topicId: generalScience.id,
      difficulty: Difficulty.EASY,
      content: ml({
        en: "Which gas do plants absorb from the air during photosynthesis?",
        hi: "प्रकाश संश्लेषण के दौरान पौधे हवा से कौन-सी गैस लेते हैं?",
        mr: "प्रकाशसंश्लेषणादरम्यान वनस्पती हवेतून कोणता वायू शोषून घेतात?",
        bn: "সালোকসংশ্লেষণের সময় গাছপালা বাতাস থেকে কোন গ্যাস শোষণ করে?",
        ta: "ஒளிச்சேர்க்கையின் போது தாவரங்கள் காற்றிலிருந்து எந்த வாயுவை உறிஞ்சுகின்றன?",
        gu: "પ્રકાશસંશ્લેષણ દરમિયાન છોડ હવામાંથી કયો વાયુ શોષે છે?",
      }),
      options: options([
        ["a", { en: "Oxygen", hi: "ऑक्सीजन", mr: "ऑक्सिजन", bn: "অক্সিজেন", ta: "ஆக்ஸிஜன்", gu: "ઓક્સિજન" }],
        ["b", { en: "Nitrogen", hi: "नाइट्रोजन", mr: "नायट्रोजन", bn: "নাইট্রোজেন", ta: "நைட்ரஜன்", gu: "નાઇટ્રોજન" }],
        ["c", { en: "Carbon Dioxide", hi: "कार्बन डाइऑक्साइड", mr: "कार्बन डायऑक्साइड", bn: "কার্বন ডাই অক্সাইড", ta: "கார்பன் டை ஆக்சைடு", gu: "કાર્બન ડાયોક્સાઇડ" }],
        ["d", { en: "Hydrogen", hi: "हाइड्रोजन", mr: "हायड्रोजन", bn: "হাইড্রোজেন", ta: "ஹைட்ரஜன்", gu: "હાઇડ્રોજન" }],
      ]),
      correctOption: "c",
      explanation: ml({
        en: "Plants take in carbon dioxide and release oxygen during photosynthesis.",
        hi: "प्रकाश संश्लेषण के दौरान पौधे कार्बन डाइऑक्साइड लेते हैं और ऑक्सीजन छोड़ते हैं।",
        mr: "प्रकाशसंश्लेषणादरम्यान वनस्पती कार्बन डायऑक्साइड घेतात आणि ऑक्सिजन सोडतात.",
        bn: "সালোকসংশ্লেষণের সময় গাছপালা কার্বন ডাই অক্সাইড গ্রহণ করে এবং অক্সিজেন ত্যাগ করে।",
        ta: "ஒளிச்சேர்க்கையின் போது தாவரங்கள் கார்பன் டை ஆக்சைடை எடுத்து ஆக்ஸிஜனை வெளியிடுகின்றன.",
        gu: "પ્રકાશસંશ્લેષણ દરમિયાન છોડ કાર્બન ડાયોક્સાઇડ લે છે અને ઓક્સિજન છોડે છે.",
      }),
    },
    {
      key: "bank-social9-awareness-ml-01",
      topicId: socialAwareness.id,
      difficulty: Difficulty.EASY,
      content: ml({
        en: "Who is regarded as the Father of the Indian Constitution?",
        hi: "भारतीय संविधान के जनक किसे माना जाता है?",
        mr: "भारतीय राज्यघटनेचे जनक कोणाला मानले जाते?",
        bn: "ভারতীয় সংবিধানের জনক হিসেবে কাকে গণ্য করা হয়?",
        ta: "இந்திய அரசியலமைப்பின் தந்தை என யார் கருதப்படுகிறார்?",
        gu: "ભારતીય બંધારણના પિતા તરીકે કોને ગણવામાં આવે છે?",
      }),
      options: options([
        ["a", { en: "Mahatma Gandhi", hi: "महात्मा गांधी", mr: "महात्मा गांधी", bn: "মহাত্মা গান্ধী", ta: "மகாத்மா காந்தி", gu: "મહાત્મા ગાંધી" }],
        ["b", { en: "Dr. B. R. Ambedkar", hi: "डॉ. बी. आर. अंबेडकर", mr: "डॉ. बी. आर. आंबेडकर", bn: "ড. বি. আর. আম্বেদকর", ta: "டாக்டர் பி. ஆர். அம்பேத்கார்", gu: "ડૉ. બી. આર. આંબેડકર" }],
        ["c", { en: "Jawaharlal Nehru", hi: "जवाहरलाल नेहरू", mr: "जवाहरलाल नेहरू", bn: "জওহরলাল নেহেরু", ta: "ஜவஹர்லால் நேரு", gu: "જવાહરલાલ નહેરુ" }],
        ["d", { en: "Sardar Vallabhbhai Patel", hi: "सरदार वल्लभभाई पटेल", mr: "सरदार वल्लभभाई पटेल", bn: "সর্দার বল্লভভাই প্যাটেল", ta: "சர்தார் வல்லபாய் படேல்", gu: "સરદાર વલ્લભભાઈ પટેલ" }],
        ],
      ),
      correctOption: "b",
      explanation: ml({
        en: "Dr. B. R. Ambedkar chaired the Constitution Drafting Committee and is widely regarded as the chief architect of the Indian Constitution.",
        hi: "डॉ. बी. आर. अंबेडकर ने संविधान प्रारूप समिति की अध्यक्षता की और उन्हें भारतीय संविधान का प्रमुख शिल्पकार माना जाता है।",
        mr: "डॉ. बी. आर. आंबेडकर यांनी घटना मसुदा समितीचे अध्यक्षपद भूषवले आणि त्यांना भारतीय राज्यघटनेचे प्रमुख शिल्पकार मानले जाते.",
        bn: "ড. বি. আর. আম্বেদকর সংবিধান খসড়া কমিটির সভাপতিত্ব করেছিলেন এবং তাঁকে ভারতীয় সংবিধানের প্রধান স্থপতি হিসেবে গণ্য করা হয়।",
        ta: "டாக்டர் பி. ஆர். அம்பேத்கார் அரசியலமைப்பு வரைவுக் குழுவின் தலைவராக இருந்தார், இந்திய அரசியலமைப்பின் முதன்மை சிற்பியாகக் கருதப்படுகிறார்.",
        gu: "ડૉ. બી. આર. આંબેડકરે બંધારણ મુસદ્દા સમિતિનું અધ્યક્ષપદ સંભાળ્યું હતું અને તેમને ભારતીય બંધારણના મુખ્ય શિલ્પી ગણવામાં આવે છે.",
      }),
    },
    {
      key: "bank-social9-awareness-ml-02",
      topicId: socialAwareness.id,
      difficulty: Difficulty.MEDIUM,
      content: ml({
        en: "The Tropic of Cancer does NOT pass through which of these Indian states?",
        hi: "कर्क रेखा इनमें से किस भारतीय राज्य से होकर नहीं गुजरती?",
        mr: "कर्कवृत्त खालीलपैकी कोणत्या भारतीय राज्यातून जात नाही?",
        bn: "কর্কটক্রান্তি রেখা নিম্নলিখিত কোন ভারতীয় রাজ্যের মধ্য দিয়ে যায় না?",
        ta: "கடகரேகை பின்வரும் எந்த இந்திய மாநிலத்தின் வழியாக செல்லவில்லை?",
        gu: "કર્કવૃત્ત નીચેનામાંથી કયા ભારતીય રાજ્યમાંથી પસાર થતું નથી?",
      }),
      options: options([
        ["a", { en: "Gujarat", hi: "गुजरात", mr: "गुजरात", bn: "গুজরাট", ta: "குஜராத்", gu: "ગુજરાત" }],
        ["b", { en: "Madhya Pradesh", hi: "मध्य प्रदेश", mr: "मध्य प्रदेश", bn: "মধ্যপ্রদেশ", ta: "மத்தியப் பிரதேசம்", gu: "મધ્ય પ્રદેશ" }],
        ["c", { en: "Punjab", hi: "पंजाब", mr: "पंजाब", bn: "পাঞ্জাব", ta: "பஞ்சாப்", gu: "પંજાબ" }],
        ["d", { en: "West Bengal", hi: "पश्चिम बंगाल", mr: "पश्चिम बंगाल", bn: "পশ্চিমবঙ্গ", ta: "மேற்கு வங்காளம்", gu: "પશ્ચિમ બંગાળ" }],
      ]),
      correctOption: "c",
      explanation: ml({
        en: "The Tropic of Cancer passes through 8 Indian states including Gujarat, Madhya Pradesh, and West Bengal, but not Punjab, which lies further north.",
        hi: "कर्क रेखा गुजरात, मध्य प्रदेश और पश्चिम बंगाल सहित 8 भारतीय राज्यों से होकर गुजरती है, लेकिन पंजाब से नहीं, जो इससे उत्तर में स्थित है।",
        mr: "कर्कवृत्त गुजरात, मध्य प्रदेश आणि पश्चिम बंगालसह 8 भारतीय राज्यांतून जाते, पण पंजाबमधून जात नाही, जे याहून उत्तरेला आहे.",
        bn: "কর্কটক্রান্তি রেখা গুজরাট, মধ্যপ্রদেশ ও পশ্চিমবঙ্গ সহ 8টি ভারতীয় রাজ্যের মধ্য দিয়ে গেছে, কিন্তু পাঞ্জাবের মধ্য দিয়ে নয়, যা এর আরও উত্তরে অবস্থিত।",
        ta: "கடகரேகை குஜராத், மத்தியப் பிரதேசம், மேற்கு வங்காளம் உள்பட 8 இந்திய மாநிலங்கள் வழியாகச் செல்கிறது, ஆனால் அதற்கு வடக்கே அமைந்துள்ள பஞ்சாப் வழியாக செல்லவில்லை.",
        gu: "કર્કવૃત્ત ગુજરાત, મધ્ય પ્રદેશ અને પશ્ચિમ બંગાળ સહિત 8 ભારતીય રાજ્યોમાંથી પસાર થાય છે, પરંતુ પંજાબમાંથી નહીં, જે તેનાથી વધુ ઉત્તરમાં આવેલું છે.",
      }),
    },
  ];

  // Difficulty-tiered pools (10 Easy / 15 Moderate / 15 Hard = 40 each) for
  // Number Series and Speed Calculation — every correct answer and
  // distractor is computed by real arithmetic in packages/db/prisma/
  // topic-seed/*.ts, not hand-typed, with correctExplanation (the existing
  // `explanation` field) and a full distractorAnalysis breakdown for every
  // item. en/hi fully authored; mr/bn/ta/gu incremental, same convention as
  // the rest of this file.
  const numberSeriesPool = fromGenerated(numberSeries.id, buildNumberSeriesQuestions());
  const speedCalculationPool = fromGenerated(
    speedCalculation.id,
    buildSpeedCalculationQuestions({
      byEleven: hackByEleven.id,
      squareFive: hackSquareFive.id,
      nikhilamBase: hackNikhilamBase.id,
      nikhilamComplement: hackNikhilamComplement.id,
      verticallyCrosswise: hackVerticallyCrosswise.id,
    })
  );
  const patternCompletionPool = fromGenerated(patternCompletion.id, buildPatternCompletionQuestions());
  // Classification is categorical, not arithmetic — every item is
  // hand-authored (packages/db/prisma/topic-seed/classification.ts), not
  // computed, since correctness here can't be verified by computation the
  // way the number-based pools above can.
  const classificationPool = fromGenerated(classification.id, buildClassificationQuestions());

  // Remaining sub-sections: Grammar, General Awareness, General Mathematics,
  // General Science, and Social Awareness are categorical/factual rather
  // than arithmetic, so each was drafted by an agent, hand-verified by a
  // human against packages/db/prisma/topic-seed/audit/_check.ts plus a full
  // factual read-through, and signed off before being wired in here.
  // loadAuditQuestions re-runs the same structural checks at seed time as a
  // defense-in-depth safety net — sign-off is not a substitute for it.
  const grammarPool = fromGenerated(grammar.id, loadAuditQuestions(grammarAudit as unknown as AuditFile));
  const generalAwarenessPool = fromGenerated(generalAwareness.id, loadAuditQuestions(generalAwarenessAudit as unknown as AuditFile));
  const generalMathematicsPool = fromGenerated(generalMathematics.id, loadAuditQuestions(generalMathematicsAudit as unknown as AuditFile));
  const generalSciencePool = fromGenerated(generalScience.id, loadAuditQuestions(generalScienceAudit as unknown as AuditFile));
  const socialAwarenessPool = fromGenerated(socialAwareness.id, loadAuditQuestions(socialAwarenessAudit as unknown as AuditFile));

  // Visual/non-verbal reasoning: Figure Matching, Figure Series Completion,
  // Analogy — every option is a real inline-SVG diagram (figureMetadata),
  // computed by construction (packages/db/prisma/topic-seed/figure-matching.ts,
  // figure-series.ts, analogy.ts) and visually verified in a browser before
  // export, same audit + loadAuditQuestions defense-in-depth as the pools above.
  const figureMatchingPool = fromGenerated(figureMatching.id, loadAuditQuestions(figureMatchingAudit as unknown as AuditFile));
  const figureSeriesPool = fromGenerated(figureSeries.id, loadAuditQuestions(figureSeriesAudit as unknown as AuditFile));
  const analogyPool = fromGenerated(analogy.id, loadAuditQuestions(analogyAudit as unknown as AuditFile));

  const allQuestions = [
    ...mentalAbilityQuestions,
    ...arithmeticQuestions,
    ...multilingualQuestions,
    ...class9Questions,
    ...numberSeriesPool,
    ...speedCalculationPool,
    ...patternCompletionPool,
    ...classificationPool,
    ...grammarPool,
    ...generalAwarenessPool,
    ...generalMathematicsPool,
    ...generalSciencePool,
    ...socialAwarenessPool,
    ...figureMatchingPool,
    ...figureSeriesPool,
    ...analogyPool,
  ];

  let newQuestionCount = 0;
  for (const q of allQuestions) {
    const result = await prisma.question.upsert({
      where: { key: q.key },
      update: {
        topicId: q.topicId,
        difficulty: q.difficulty,
        content: q.content,
        options: q.options,
        correctOption: q.correctOption,
        vedicSpeedHackId: q.vedicSpeedHackId ?? null,
        explanation: q.explanation,
        distractorAnalysis: q.distractorAnalysis ?? Prisma.JsonNull,
        figureMetadata: q.figureMetadata ?? Prisma.JsonNull,
      },
      create: q,
    });
    if (result.createdAt.getTime() === result.updatedAt.getTime()) newQuestionCount += 1;
  }
  console.log(`Questions: ${allQuestions.length} processed, ${newQuestionCount} newly created.`);

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
    "Seed complete: 7 sections, 9 topics, 5 speed hacks, 6 exam templates (JNVST/AISSEE/RMS × Class 6 & Class 9)" +
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
