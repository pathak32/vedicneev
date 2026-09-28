import { prisma } from "../src/index";

/**
 * Seeds the CDS question bank + one overview ConceptNote per topic —
 * same "Question bank + concept notes, no OMR yet" tier and same
 * Section-reuse/Topic-key pattern as seed-nda-content.ts (see that file's
 * header comment for the full rationale). Idempotent: safe to re-run.
 */

interface QuestionSeed {
  key: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  en: string;
  options: string[];
  correctIndex: number;
  explanationEn: string;
}

interface TopicSeed {
  sectionKey: "mathematics" | "language" | "general_knowledge";
  topicKey: string;
  nameEn: string;
  conceptTitleEn: string;
  conceptExplanationEn: string;
  conceptWorkedExampleEn: string;
  conceptCommonMistakeEn: string;
  questions: QuestionSeed[];
}

const OPTION_IDS = ["a", "b", "c", "d"] as const;

const CDS_TOPICS: TopicSeed[] = [
  {
    sectionKey: "mathematics",
    topicKey: "cds_math_arithmetic",
    nameEn: "Arithmetic",
    conceptTitleEn: "Arithmetic — Percentages, Ratios & LCM/HCF",
    conceptExplanationEn:
      "CDS Elementary Mathematics arithmetic covers percentages (x% of y = (x/100)×y), ratios (scaling a known ratio by a given value), and LCM/HCF of small numbers — the LCM is the smallest number divisible by both, the HCF is the largest number that divides both.",
    conceptWorkedExampleEn:
      "15% of 200 = (15/100) × 200 = 30.",
    conceptCommonMistakeEn:
      "A common slip is dividing by the wrong ratio term — e.g. scaling a 3:4 ratio from '15' by matching it to the wrong side of the ratio.",
    questions: [
      {
        key: "cds-arithmetic-01",
        difficulty: "EASY",
        en: "What is 15% of 200?",
        options: ["20", "30", "40", "50"],
        correctIndex: 1,
        explanationEn: "15% of 200 = (15/100) × 200 = 30.",
      },
      {
        key: "cds-arithmetic-02",
        difficulty: "MEDIUM",
        en: "Two numbers are in the ratio 3:4. If the first number is 15, what is the second?",
        options: ["15", "20", "25", "12"],
        correctIndex: 1,
        explanationEn: "If 3 parts = 15, then 1 part = 5, so 4 parts = 20.",
      },
      {
        key: "cds-arithmetic-03",
        difficulty: "EASY",
        en: "What is the LCM of 4 and 6?",
        options: ["12", "24", "10", "8"],
        correctIndex: 0,
        explanationEn: "The smallest number divisible by both 4 and 6 is 12.",
      },
      {
        key: "cds-arithmetic-04",
        difficulty: "EASY",
        en: "What is the HCF of 8 and 12?",
        options: ["2", "4", "6", "8"],
        correctIndex: 1,
        explanationEn: "The largest number dividing both 8 and 12 is 4.",
      },
    ],
  },
  {
    sectionKey: "mathematics",
    topicKey: "cds_math_algebra",
    nameEn: "Algebra",
    conceptTitleEn: "Algebra — Linear Equations & Basic Identities",
    conceptExplanationEn:
      "CDS Algebra at the Class 10 level covers solving simple linear equations by isolating x, square roots of perfect squares, and standard algebraic identities like (a+b)² = a² + 2ab + b².",
    conceptWorkedExampleEn:
      "Solve 2x + 3 = 11: subtract 3 from both sides (2x = 8), then divide by 2 (x = 4).",
    conceptCommonMistakeEn:
      "Students often forget to apply an operation to BOTH sides of the equation equally, e.g. subtracting 3 from only the left side.",
    questions: [
      {
        key: "cds-algebra-01",
        difficulty: "EASY",
        en: "Solve for x: 2x + 3 = 11.",
        options: ["3", "4", "5", "6"],
        correctIndex: 1,
        explanationEn: "2x + 3 = 11 → 2x = 8 → x = 4.",
      },
      {
        key: "cds-algebra-02",
        difficulty: "EASY",
        en: "If x² = 49, what is the positive value of x?",
        options: ["5", "6", "7", "8"],
        correctIndex: 2,
        explanationEn: "7 × 7 = 49, so the positive square root of 49 is 7.",
      },
      {
        key: "cds-algebra-03",
        difficulty: "MEDIUM",
        en: "What is the sum of the first 5 natural numbers (1+2+3+4+5)?",
        options: ["10", "15", "20", "25"],
        correctIndex: 1,
        explanationEn: "1+2+3+4+5 = 15.",
      },
      {
        key: "cds-algebra-04",
        difficulty: "MEDIUM",
        en: "Which expression correctly expands (a + b)²?",
        options: ["a² + b²", "a² − 2ab + b²", "a² + 2ab + b²", "a² + ab + b²"],
        correctIndex: 2,
        explanationEn: "(a+b)² = a² + 2ab + b² — a standard algebraic identity.",
      },
    ],
  },
  {
    sectionKey: "mathematics",
    topicKey: "cds_math_trigonometry",
    nameEn: "Trigonometry",
    conceptTitleEn: "Trigonometry — Ratios at 0°, 30°, 45°, 60°, 90°",
    conceptExplanationEn:
      "CDS Trigonometry needs the standard ratio values at 0°, 30°, 45°, 60°, and 90° memorized directly: sin goes from 0 to 1 as the angle rises from 0° to 90°, while cos does the reverse.",
    conceptWorkedExampleEn:
      "sin(0°) = 0 and cos(90°) = 0 — both represent the same geometric extreme (a right triangle collapsing to zero height/base) viewed from different ratios.",
    conceptCommonMistakeEn:
      "Mixing up sin(0°)=0 with cos(0°)=1, or sin(90°)=1 with cos(90°)=0, is the most frequent slip — always sanity-check against the standard-angle table.",
    questions: [
      {
        key: "cds-trig-01",
        difficulty: "EASY",
        en: "What is sin(0°)?",
        options: ["0", "1", "1/2", "Undefined"],
        correctIndex: 0,
        explanationEn: "sin(0°) = 0, a standard-angle value.",
      },
      {
        key: "cds-trig-02",
        difficulty: "EASY",
        en: "What is cos(90°)?",
        options: ["1", "1/2", "0", "√3/2"],
        correctIndex: 2,
        explanationEn: "cos(90°) = 0, a standard-angle value.",
      },
      {
        key: "cds-trig-03",
        difficulty: "MEDIUM",
        en: "What is tan(0°)?",
        options: ["0", "1", "Undefined", "-1"],
        correctIndex: 0,
        explanationEn: "tan(0°) = sin(0°)/cos(0°) = 0/1 = 0.",
      },
      {
        key: "cds-trig-04",
        difficulty: "EASY",
        en: "What is sin(90°)?",
        options: ["0", "1/2", "√3/2", "1"],
        correctIndex: 3,
        explanationEn: "sin(90°) = 1, the maximum value sine ever reaches.",
      },
    ],
  },
  {
    sectionKey: "mathematics",
    topicKey: "cds_math_geometry_mensuration",
    nameEn: "Geometry & Mensuration",
    conceptTitleEn: "Geometry & Mensuration — Area, Perimeter & Volume",
    conceptExplanationEn:
      "Key formulas: rectangle area = length × width, square perimeter = 4 × side, a triangle's interior angles always sum to 180°, and a cube's volume = side³.",
    conceptWorkedExampleEn:
      "A cube with side 3 has volume 3³ = 3×3×3 = 27.",
    conceptCommonMistakeEn:
      "Confusing area formulas (length × width, a 2D measure) with perimeter formulas (sum of side lengths, a 1D measure) is a very common mix-up.",
    questions: [
      {
        key: "cds-geometry-01",
        difficulty: "EASY",
        en: "What is the area of a rectangle with length 8 and width 5?",
        options: ["13", "26", "40", "45"],
        correctIndex: 2,
        explanationEn: "Area = length × width = 8 × 5 = 40.",
      },
      {
        key: "cds-geometry-02",
        difficulty: "EASY",
        en: "What is the perimeter of a square with side 6?",
        options: ["12", "18", "24", "36"],
        correctIndex: 2,
        explanationEn: "Perimeter of a square = 4 × side = 4 × 6 = 24.",
      },
      {
        key: "cds-geometry-03",
        difficulty: "EASY",
        en: "What is the sum of the interior angles of a triangle?",
        options: ["90°", "180°", "270°", "360°"],
        correctIndex: 1,
        explanationEn: "The interior angles of any triangle always sum to 180°.",
      },
      {
        key: "cds-geometry-04",
        difficulty: "MEDIUM",
        en: "What is the volume of a cube with side 3?",
        options: ["9", "18", "27", "81"],
        correctIndex: 2,
        explanationEn: "Volume of a cube = side³ = 3³ = 27.",
      },
    ],
  },
  {
    sectionKey: "mathematics",
    topicKey: "cds_math_statistics",
    nameEn: "Statistics",
    conceptTitleEn: "Statistics — Mean, Range, Median & Mode",
    conceptExplanationEn:
      "Mean is the sum of values divided by their count. Range is the highest value minus the lowest. Median is the middle value once sorted. Mode is the most frequently occurring value.",
    conceptWorkedExampleEn:
      "Range of 3, 7, 9, 15: highest (15) minus lowest (3) = 12.",
    conceptCommonMistakeEn:
      "Students sometimes compute range as (highest + lowest) instead of (highest − lowest).",
    questions: [
      {
        key: "cds-stats-01",
        difficulty: "EASY",
        en: "What is the mean of 5, 10, 15?",
        options: ["5", "10", "15", "30"],
        correctIndex: 1,
        explanationEn: "Sum = 30, count = 3, mean = 30/3 = 10.",
      },
      {
        key: "cds-stats-02",
        difficulty: "EASY",
        en: "What is the range of 3, 7, 9, 15?",
        options: ["6", "9", "12", "18"],
        correctIndex: 2,
        explanationEn: "Range = highest − lowest = 15 − 3 = 12.",
      },
      {
        key: "cds-stats-03",
        difficulty: "EASY",
        en: "What is the median of 4, 8, 10?",
        options: ["4", "8", "10", "22"],
        correctIndex: 1,
        explanationEn: "With 3 sorted values, the median is the middle one: 8.",
      },
      {
        key: "cds-stats-04",
        difficulty: "MEDIUM",
        en: "What is the mode of 1, 2, 2, 3, 4?",
        options: ["1", "2", "3", "4"],
        correctIndex: 1,
        explanationEn: "2 appears twice, more than any other value, so it's the mode.",
      },
    ],
  },
  {
    sectionKey: "language",
    topicKey: "cds_english",
    nameEn: "English — Grammar, Vocabulary & Comprehension",
    conceptTitleEn: "English — Grammar, Vocabulary & Comprehension",
    conceptExplanationEn:
      "CDS English tests grammar (subject-verb agreement, including the \"neither/nor\" rule where the verb agrees with the nearer subject), vocabulary (synonyms/antonyms), and spelling at a graduate level.",
    conceptWorkedExampleEn:
      "\"Neither the manager nor the employees ___ present\" — with neither/nor, the verb agrees with the subject closest to it (\"employees\", plural), so the correct verb is \"were\".",
    conceptCommonMistakeEn:
      "A frequent error is making the verb agree with the FIRST subject in a neither/nor or either/or construction, when the rule is to agree with the NEARER one.",
    questions: [
      {
        key: "cds-english-01",
        difficulty: "MEDIUM",
        en: "Choose the word closest in meaning to \"Candid\":",
        options: ["Honest", "Secretive", "Rude", "Timid"],
        correctIndex: 0,
        explanationEn: "Candid means truthful and straightforward — closest to \"honest\".",
      },
      {
        key: "cds-english-02",
        difficulty: "EASY",
        en: "Which of these is spelled correctly?",
        options: ["Neccessary", "Necesary", "Neccesary", "Necessary"],
        correctIndex: 3,
        explanationEn: "\"Necessary\" has one 'c' and two 's's — a commonly misspelled word.",
      },
      {
        key: "cds-english-03",
        difficulty: "HARD",
        en: "Fill in the blank: \"Neither the manager nor the employees ___ present.\"",
        options: ["was", "were", "is", "be"],
        correctIndex: 1,
        explanationEn: "With neither/nor, the verb agrees with the nearer subject (\"employees\", plural) — so \"were\".",
      },
      {
        key: "cds-english-04",
        difficulty: "MEDIUM",
        en: "Choose the antonym of \"Verbose\":",
        options: ["Concise", "Wordy", "Lengthy", "Elaborate"],
        correctIndex: 0,
        explanationEn: "Verbose means using more words than needed; its opposite is \"concise\".",
      },
    ],
  },
  {
    sectionKey: "general_knowledge",
    topicKey: "cds_gk_current_events",
    nameEn: "General Knowledge — Current & National Affairs",
    conceptTitleEn: "GK — National Institutions & the CDS Exam Itself",
    conceptExplanationEn:
      "CDS GK Current Events leans on durable, stable facts — who conducts the exam, how often, and basic defense-forces designations — rather than fast-changing news.",
    conceptWorkedExampleEn:
      "UPSC conducts the CDS exam twice a year, alongside NDA and other national exams.",
    conceptCommonMistakeEn:
      "Students sometimes confuse the Chief of Army Staff (the Army's own top officer) with the Chief of Defence Staff (a separate post integrating all three services, created in 2019).",
    questions: [
      {
        key: "cds-gk-current-01",
        difficulty: "EASY",
        en: "Which organization conducts the CDS entrance exam?",
        options: ["SSC", "UPSC", "NTA", "IB"],
        correctIndex: 1,
        explanationEn: "The Union Public Service Commission (UPSC) conducts the CDS exam.",
      },
      {
        key: "cds-gk-current-02",
        difficulty: "EASY",
        en: "How many times a year is the CDS exam held?",
        options: ["Once", "Twice", "Thrice", "Four times"],
        correctIndex: 1,
        explanationEn: "UPSC conducts the CDS exam twice a year.",
      },
      {
        key: "cds-gk-current-03",
        difficulty: "MEDIUM",
        en: "What is the designation of the Indian Army's top officer?",
        options: ["Chief of Army Staff", "Commander-in-Chief", "Field Marshal", "Director General"],
        correctIndex: 0,
        explanationEn: "The Indian Army's top officer holds the designation \"Chief of Army Staff\" (COAS).",
      },
      {
        key: "cds-gk-current-04",
        difficulty: "EASY",
        en: "On which date is India's Republic Day celebrated?",
        options: ["15 August", "2 October", "26 January", "26 November"],
        correctIndex: 2,
        explanationEn: "Republic Day is celebrated on 26 January, marking when the Constitution came into effect (1950).",
      },
    ],
  },
  {
    sectionKey: "general_knowledge",
    topicKey: "cds_gk_history",
    nameEn: "General Knowledge — History",
    conceptTitleEn: "GK — Indian & World History",
    conceptExplanationEn:
      "CDS GK History covers major Indian historical milestones — key battles, the 1857 revolt, and the freedom movement's institutions like the INA.",
    conceptWorkedExampleEn:
      "The Battle of Plassey (1757) marked the start of British political control in India, when the East India Company defeated the Nawab of Bengal.",
    conceptCommonMistakeEn:
      "Students often confuse the Battle of Plassey (1757, start of British political power) with the 1857 Revolt (the First War of Independence, a later and different event).",
    questions: [
      {
        key: "cds-gk-history-01",
        difficulty: "MEDIUM",
        en: "In which year was the Battle of Plassey fought?",
        options: ["1707", "1757", "1857", "1947"],
        correctIndex: 1,
        explanationEn: "The Battle of Plassey was fought in 1757.",
      },
      {
        key: "cds-gk-history-02",
        difficulty: "EASY",
        en: "The Revolt of 1857 (First War of Independence) began at:",
        options: ["Delhi", "Meerut", "Lucknow", "Kanpur"],
        correctIndex: 1,
        explanationEn: "The 1857 revolt began at Meerut before spreading to other regions.",
      },
      {
        key: "cds-gk-history-03",
        difficulty: "EASY",
        en: "On which date did the Indian Constitution come into effect?",
        options: ["15 August 1947", "26 January 1950", "26 November 1949", "2 October 1948"],
        correctIndex: 1,
        explanationEn: "The Constitution was adopted on 26 November 1949 but came into EFFECT on 26 January 1950.",
      },
      {
        key: "cds-gk-history-04",
        difficulty: "MEDIUM",
        en: "Who founded the Indian National Army (INA)?",
        options: ["Bhagat Singh", "Subhas Chandra Bose", "Lala Lajpat Rai", "Bal Gangadhar Tilak"],
        correctIndex: 1,
        explanationEn: "Subhas Chandra Bose led and revitalized the Indian National Army (Azad Hind Fauj).",
      },
    ],
  },
  {
    sectionKey: "general_knowledge",
    topicKey: "cds_gk_geography",
    nameEn: "General Knowledge — Geography",
    conceptTitleEn: "GK — Indian & World Geography",
    conceptExplanationEn:
      "CDS GK Geography covers Indian physical geography (states, rivers) alongside major world geography facts.",
    conceptWorkedExampleEn:
      "Rajasthan is India's largest state by area, dominated by the Thar Desert in its western region.",
    conceptCommonMistakeEn:
      "Students often confuse India's largest state by AREA (Rajasthan) with its largest by POPULATION (Uttar Pradesh) — these are two different superlatives.",
    questions: [
      {
        key: "cds-gk-geo-01",
        difficulty: "EASY",
        en: "Which is the largest Indian state by area?",
        options: ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Uttar Pradesh"],
        correctIndex: 2,
        explanationEn: "Rajasthan is India's largest state by area.",
      },
      {
        key: "cds-gk-geo-02",
        difficulty: "EASY",
        en: "Which ocean lies to the south of the Indian peninsula?",
        options: ["Atlantic Ocean", "Pacific Ocean", "Indian Ocean", "Arctic Ocean"],
        correctIndex: 2,
        explanationEn: "The Indian Ocean borders India to the south.",
      },
      {
        key: "cds-gk-geo-03",
        difficulty: "MEDIUM",
        en: "What is the longest mountain range in the world?",
        options: ["Himalayas", "Andes", "Rockies", "Alps"],
        correctIndex: 1,
        explanationEn: "The Andes, running along South America's western edge, is the world's longest mountain range.",
      },
      {
        key: "cds-gk-geo-04",
        difficulty: "MEDIUM",
        en: "Which river is traditionally called the \"Sorrow of Bengal\" for its frequent floods?",
        options: ["Ganga", "Brahmaputra", "Damodar", "Hooghly"],
        correctIndex: 2,
        explanationEn: "The Damodar River's historically frequent flooding earned it the nickname \"Sorrow of Bengal\".",
      },
    ],
  },
  {
    sectionKey: "general_knowledge",
    topicKey: "cds_gk_politics_constitution",
    nameEn: "General Knowledge — Politics & Constitution",
    conceptTitleEn: "GK — Indian Constitution & Governance",
    conceptExplanationEn:
      "CDS GK Politics & Constitution covers the structure of Indian governance — the President as head of state, the Preamble's core values, and key fundamental-rights articles.",
    conceptWorkedExampleEn:
      "The Preamble describes India as a \"Sovereign, Socialist, Secular, Democratic Republic\" — each word deliberately added or clarified (Socialist and Secular via the 42nd Amendment, 1976).",
    conceptCommonMistakeEn:
      "Students often confuse the President (head of STATE, largely ceremonial) with the Prime Minister (head of GOVERNMENT, who actually runs the executive).",
    questions: [
      {
        key: "cds-gk-polity-01",
        difficulty: "EASY",
        en: "Who is the head of state of India?",
        options: ["Prime Minister", "President", "Chief Justice", "Speaker of Lok Sabha"],
        correctIndex: 1,
        explanationEn: "The President is India's head of state; the Prime Minister is head of government.",
      },
      {
        key: "cds-gk-polity-02",
        difficulty: "EASY",
        en: "The Preamble declares India a Sovereign, Socialist, Secular, Democratic ___?",
        options: ["Nation", "Republic", "State", "Union"],
        correctIndex: 1,
        explanationEn: "The Preamble's exact phrase ends in \"...Democratic Republic\".",
      },
      {
        key: "cds-gk-polity-03",
        difficulty: "MEDIUM",
        en: "The Right to Equality is covered under which range of Articles?",
        options: ["Articles 12-18", "Articles 14-18", "Articles 19-22", "Articles 25-30"],
        correctIndex: 1,
        explanationEn: "Articles 14 to 18 of the Indian Constitution cover the Right to Equality.",
      },
      {
        key: "cds-gk-polity-04",
        difficulty: "MEDIUM",
        en: "On which date was the Indian Constitution adopted by the Constituent Assembly?",
        options: ["15 August 1947", "26 January 1950", "26 November 1949", "2 October 1948"],
        correctIndex: 2,
        explanationEn: "The Constituent Assembly adopted the Constitution on 26 November 1949; it came into effect later, on 26 January 1950.",
      },
    ],
  },
  {
    sectionKey: "general_knowledge",
    topicKey: "cds_gk_science",
    nameEn: "General Knowledge — Science",
    conceptTitleEn: "GK — General Science Essentials",
    conceptExplanationEn:
      "CDS GK Science covers basic chemistry (chemical formulas), biology (organ functions), and physics (SI units) at a general-awareness level.",
    conceptWorkedExampleEn:
      "Water's chemical formula, H₂O, reflects its composition: 2 hydrogen atoms bonded to 1 oxygen atom.",
    conceptCommonMistakeEn:
      "Students sometimes confuse the heart's role (pumping blood) with the lungs' role (gas exchange) when asked generic \"which organ does X\" questions.",
    questions: [
      {
        key: "cds-gk-sci-01",
        difficulty: "EASY",
        en: "What is the chemical formula of water?",
        options: ["CO2", "H2O", "O2", "NaCl"],
        correctIndex: 1,
        explanationEn: "Water is composed of 2 hydrogen atoms and 1 oxygen atom: H₂O.",
      },
      {
        key: "cds-gk-sci-02",
        difficulty: "EASY",
        en: "Which organ pumps blood throughout the human body?",
        options: ["Lungs", "Liver", "Heart", "Kidney"],
        correctIndex: 2,
        explanationEn: "The heart pumps blood throughout the circulatory system.",
      },
      {
        key: "cds-gk-sci-03",
        difficulty: "MEDIUM",
        en: "What is the process by which plants make their own food called?",
        options: ["Respiration", "Photosynthesis", "Digestion", "Transpiration"],
        correctIndex: 1,
        explanationEn: "Photosynthesis is how plants convert sunlight, water, and CO2 into food (glucose).",
      },
      {
        key: "cds-gk-sci-04",
        difficulty: "MEDIUM",
        en: "What is the SI unit of electrical resistance?",
        options: ["Volt", "Ampere", "Ohm", "Watt"],
        correctIndex: 2,
        explanationEn: "Electrical resistance is measured in Ohms (Ω).",
      },
    ],
  },
];

async function main() {
  const sectionCache = new Map<string, string>();
  async function sectionId(key: TopicSeed["sectionKey"]): Promise<string> {
    const cached = sectionCache.get(key);
    if (cached) return cached;
    const section = await prisma.section.findUniqueOrThrow({ where: { key } });
    sectionCache.set(key, section.id);
    return section.id;
  }

  let topicCount = 0;
  let questionCount = 0;
  let noteCount = 0;

  for (const t of CDS_TOPICS) {
    const secId = await sectionId(t.sectionKey);

    const topic = await prisma.topic.upsert({
      where: { sectionId_key: { sectionId: secId, key: t.topicKey } },
      update: { name: { en: t.nameEn }, targetExam: "CDS" },
      create: {
        sectionId: secId,
        key: t.topicKey,
        name: { en: t.nameEn },
        targetExam: "CDS",
      },
    });
    topicCount++;

    for (const q of t.questions) {
      await prisma.question.upsert({
        where: { key: q.key },
        update: {
          topicId: topic.id,
          difficulty: q.difficulty,
          content: { en: q.en },
          options: q.options.map((text, i) => ({ id: OPTION_IDS[i] ?? OPTION_IDS[0], text: { en: text } })),
          correctOption: OPTION_IDS[q.correctIndex] ?? OPTION_IDS[0],
          explanation: { en: q.explanationEn },
          targetExam: "CDS",
        },
        create: {
          key: q.key,
          topicId: topic.id,
          difficulty: q.difficulty,
          content: { en: q.en },
          options: q.options.map((text, i) => ({ id: OPTION_IDS[i] ?? OPTION_IDS[0], text: { en: text } })),
          correctOption: OPTION_IDS[q.correctIndex] ?? OPTION_IDS[0],
          explanation: { en: q.explanationEn },
          targetExam: "CDS",
        },
      });
      questionCount++;
    }

    await prisma.conceptNote.upsert({
      where: { topicId_subConceptKey: { topicId: topic.id, subConceptKey: "overview" } },
      update: {
        title: { en: t.conceptTitleEn },
        body: {
          en: {
            explanation: t.conceptExplanationEn,
            workedExample: t.conceptWorkedExampleEn,
            commonMistake: t.conceptCommonMistakeEn,
          },
        },
      },
      create: {
        topicId: topic.id,
        subConceptKey: "overview",
        title: { en: t.conceptTitleEn },
        body: {
          en: {
            explanation: t.conceptExplanationEn,
            workedExample: t.conceptWorkedExampleEn,
            commonMistake: t.conceptCommonMistakeEn,
          },
        },
        status: "DRAFT",
      },
    });
    noteCount++;
  }

  console.log(`Seeded ${topicCount} CDS topics, ${questionCount} questions, ${noteCount} concept notes.`);
}

main().finally(() => prisma.$disconnect());
