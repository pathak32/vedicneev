export type ComingSoonBoardType = "nda" | "cds" | "upsainik";

export interface ComingSoonSubsection {
  name: string;
  blurb: string;
  // Set once a real Question bank + ConceptNote exist for this subsection
  // (packages/db/prisma/seed-nda-content.ts) — links straight into the
  // same /practice/[topicKey] flow JNVST/AISSEE/RMS topics already use
  // (topicPracticeService.ts is topic-key-driven, not exam-gated, so this
  // needed no new route). Omitted means still syllabus-only.
  topicKey?: string;
}

export interface ComingSoonSubject {
  name: string;
  subsections: ComingSoonSubsection[];
}

export interface ComingSoonPaper {
  name: string;
  detail: string;
}

export interface ComingSoonBoardInfo {
  name: string;
  // Short label used in the "coming soon" copy; falls back to the first word of `name`.
  shortName?: string;
  badge: string;
  description: string;
  conductedBy: string;
  eligibility: string;
  papers: ComingSoonPaper[];
  subjects: ComingSoonSubject[];
}

/**
 * A lighter-weight sibling to examBoards.ts's BOARD_DATA — for exam boards
 * where only the real syllabus structure (subject/subsection + a one-line
 * explanation each) is ready, not the full question bank/mock-test/OMR
 * pipeline the other three boards already have. English-only by design
 * (not wired into dictionary.ts's Record<LanguageCode,string> entries,
 * which would force inventing unreviewed translations for exam-specific
 * terminology) — see ComingSoonBoardDetail.tsx for how this renders.
 */
export const COMING_SOON_BOARD_DATA: Record<ComingSoonBoardType, ComingSoonBoardInfo> = {
  nda: {
    name: "NDA (National Defence Academy)",
    badge: "UPSC Exam · After Class 12",
    description:
      "Entry into the National Defence Academy — the joint training academy for the Army, Navy, and Air Force — for students who've completed (or are appearing for) Class 12.",
    conductedBy: "Union Public Service Commission (UPSC), twice a year",
    eligibility: "Unmarried, Class 12 pass (or appearing) — Physics & Mathematics required for Air Force/Navy wings",
    papers: [
      { name: "Paper 1 — Mathematics", detail: "120 questions · 300 marks · 2.5 hours" },
      { name: "Paper 2 — General Ability Test (GAT)", detail: "150 questions · 600 marks · 2.5 hours" },
    ],
    subjects: [
      {
        name: "Mathematics",
        subsections: [
          { name: "Algebra", blurb: "Sets, relations, quadratic equations, logarithms, and complex numbers.", topicKey: "nda_algebra" },
          { name: "Matrices & Determinants", blurb: "Basic operations and solving simultaneous equations using matrices.", topicKey: "nda_matrices_determinants" },
          { name: "Trigonometry", blurb: "Trigonometric ratios, identities, and heights & distances applications.", topicKey: "nda_trigonometry" },
          { name: "Analytical Geometry", blurb: "Straight lines, circles, and 3D geometry of planes and lines.", topicKey: "nda_analytical_geometry" },
          { name: "Differential Calculus", blurb: "Limits, continuity, and differentiation of functions.", topicKey: "nda_differential_calculus" },
          { name: "Integral Calculus & Differential Equations", blurb: "Integration techniques and simple differential equations.", topicKey: "nda_integral_calculus" },
          { name: "Vectors", blurb: "Vector algebra and its applications to geometry and mechanics.", topicKey: "nda_vectors" },
          { name: "Statistics & Probability", blurb: "Measures of central tendency, dispersion, and basic probability.", topicKey: "nda_statistics_probability" },
        ],
      },
      {
        name: "English",
        subsections: [{ name: "Grammar, Vocabulary & Comprehension", blurb: "Testing grasp of English through usage, error-spotting, and passages.", topicKey: "nda_english" }],
      },
      {
        name: "General Knowledge",
        subsections: [
          { name: "Physics", blurb: "Class 11-12 level mechanics, heat, light, and electricity.", topicKey: "nda_gk_physics" },
          { name: "Chemistry", blurb: "Basic chemical reactions, the periodic table, and everyday chemistry.", topicKey: "nda_gk_chemistry" },
          { name: "General Science", blurb: "Biology, human body, and environmental science basics.", topicKey: "nda_gk_general_science" },
          { name: "History & Freedom Movement", blurb: "Indian history with emphasis on the independence movement.", topicKey: "nda_gk_history" },
          { name: "Geography", blurb: "Physical, Indian, and world geography.", topicKey: "nda_gk_geography" },
          { name: "Current Events", blurb: "National and international events, especially defense-related.", topicKey: "nda_gk_current_events" },
        ],
      },
    ],
  },
  cds: {
    name: "CDS (Combined Defence Services)",
    badge: "UPSC Exam · After Graduation",
    description:
      "Entry into the Indian Military Academy, Indian Naval Academy, Air Force Academy, and Officers Training Academy — for graduates seeking a commission as an officer.",
    conductedBy: "Union Public Service Commission (UPSC), twice a year",
    eligibility: "Graduate (or final-year appearing) — OTA has no Mathematics paper, unlike IMA/INA/AFA",
    papers: [
      { name: "English", detail: "100 marks · 2 hours" },
      { name: "General Knowledge", detail: "100 marks · 2 hours" },
      { name: "Elementary Mathematics", detail: "100 marks · 2 hours · IMA/INA/AFA only, not OTA" },
    ],
    subjects: [
      {
        name: "English",
        subsections: [{ name: "Grammar, Vocabulary & Comprehension", blurb: "Sentence correction, synonyms/antonyms, and reading comprehension.", topicKey: "cds_english" }],
      },
      {
        name: "General Knowledge",
        subsections: [
          { name: "Current Events", blurb: "National and international news, especially defense and government affairs.", topicKey: "cds_gk_current_events" },
          { name: "History", blurb: "Indian and world history, with focus on the freedom struggle.", topicKey: "cds_gk_history" },
          { name: "Geography", blurb: "Physical, Indian, and world geography.", topicKey: "cds_gk_geography" },
          { name: "Politics & Constitution", blurb: "The Indian Constitution, governance, and civics.", topicKey: "cds_gk_politics_constitution" },
          { name: "Science", blurb: "General science across physics, chemistry, and biology.", topicKey: "cds_gk_science" },
        ],
      },
      {
        name: "Elementary Mathematics",
        subsections: [
          { name: "Arithmetic", blurb: "Number systems, ratios, percentages, and basic computation.", topicKey: "cds_math_arithmetic" },
          { name: "Algebra", blurb: "Basic equations, sets, and progressions at a Class 10 level.", topicKey: "cds_math_algebra" },
          { name: "Trigonometry", blurb: "Trigonometric ratios and simple identities.", topicKey: "cds_math_trigonometry" },
          { name: "Geometry & Mensuration", blurb: "Lines, angles, area, and volume of standard shapes.", topicKey: "cds_math_geometry_mensuration" },
          { name: "Statistics", blurb: "Basic data interpretation, mean, median, and mode.", topicKey: "cds_math_statistics" },
        ],
      },
    ],
  },
  upsainik: {
    name: "UP Sainik School",
    shortName: "UP Sainik School",
    badge: "Sainik School Entrance · Class 6 & 9",
    description:
      "A preparation guide for entrance to Sainik Schools in Uttar Pradesh. The topic list below is indicative, drawn from the areas Sainik-style entrance papers usually cover, so students can start building basics now. Always confirm the exact pattern, eligibility and dates in the current official notification.",
    conductedBy: "Conducting authority, dates and pattern: see the current official notification",
    eligibility:
      "Age, class and domicile rules are set each year by the admitting authority. Read the current official notification before applying.",
    papers: [{ name: "Paper pattern", detail: "Published in the official notification each year" }],
    subjects: [
      {
        name: "Mathematics",
        subsections: [
          { name: "Number Sense & Arithmetic", blurb: "Whole numbers, fractions, decimals, percentages, ratio and everyday calculation." },
          { name: "Mensuration & Geometry Basics", blurb: "Perimeter, area, angles, and properties of common shapes." },
          { name: "Word Problems", blurb: "Turning a short story into the right sum, step by step." },
        ],
      },
      {
        name: "Language",
        subsections: [
          { name: "Reading Comprehension", blurb: "Understanding a short passage and answering questions from it." },
          { name: "Grammar & Vocabulary", blurb: "Usage, sentence correction, synonyms and antonyms." },
        ],
      },
      {
        name: "Intelligence & Reasoning",
        subsections: [
          { name: "Series, Analogies & Odd One Out", blurb: "Spotting the rule behind a pattern of numbers, letters or figures." },
          { name: "Coding-Decoding & Direction Sense", blurb: "Short logic puzzles that reward a calm, step-by-step approach." },
        ],
      },
      {
        name: "General Knowledge & Science",
        subsections: [
          { name: "Everyday Science & Environment", blurb: "Basic ideas about the world around us, at school level." },
          { name: "General Awareness", blurb: "India, geography, history and current events at a child-friendly level." },
        ],
      },
    ],
  },
};
