export type ComingSoonBoardType = "nda" | "cds";

export interface ComingSoonSubsection {
  name: string;
  blurb: string;
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
          { name: "Algebra", blurb: "Sets, relations, quadratic equations, logarithms, and complex numbers." },
          { name: "Matrices & Determinants", blurb: "Basic operations and solving simultaneous equations using matrices." },
          { name: "Trigonometry", blurb: "Trigonometric ratios, identities, and heights & distances applications." },
          { name: "Analytical Geometry", blurb: "Straight lines, circles, and 3D geometry of planes and lines." },
          { name: "Differential Calculus", blurb: "Limits, continuity, and differentiation of functions." },
          { name: "Integral Calculus & Differential Equations", blurb: "Integration techniques and simple differential equations." },
          { name: "Vectors", blurb: "Vector algebra and its applications to geometry and mechanics." },
          { name: "Statistics & Probability", blurb: "Measures of central tendency, dispersion, and basic probability." },
        ],
      },
      {
        name: "English",
        subsections: [{ name: "Grammar, Vocabulary & Comprehension", blurb: "Testing grasp of English through usage, error-spotting, and passages." }],
      },
      {
        name: "General Knowledge",
        subsections: [
          { name: "Physics", blurb: "Class 11-12 level mechanics, heat, light, and electricity." },
          { name: "Chemistry", blurb: "Basic chemical reactions, the periodic table, and everyday chemistry." },
          { name: "General Science", blurb: "Biology, human body, and environmental science basics." },
          { name: "History & Freedom Movement", blurb: "Indian history with emphasis on the independence movement." },
          { name: "Geography", blurb: "Physical, Indian, and world geography." },
          { name: "Current Events", blurb: "National and international events, especially defense-related." },
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
        subsections: [{ name: "Grammar, Vocabulary & Comprehension", blurb: "Sentence correction, synonyms/antonyms, and reading comprehension." }],
      },
      {
        name: "General Knowledge",
        subsections: [
          { name: "Current Events", blurb: "National and international news, especially defense and government affairs." },
          { name: "History", blurb: "Indian and world history, with focus on the freedom struggle." },
          { name: "Geography", blurb: "Physical, Indian, and world geography." },
          { name: "Politics & Constitution", blurb: "The Indian Constitution, governance, and civics." },
          { name: "Science", blurb: "General science across physics, chemistry, and biology." },
        ],
      },
      {
        name: "Elementary Mathematics",
        subsections: [
          { name: "Arithmetic", blurb: "Number systems, ratios, percentages, and basic computation." },
          { name: "Algebra", blurb: "Basic equations, sets, and progressions at a Class 10 level." },
          { name: "Trigonometry", blurb: "Trigonometric ratios and simple identities." },
          { name: "Geometry & Mensuration", blurb: "Lines, angles, area, and volume of standard shapes." },
          { name: "Statistics", blurb: "Basic data interpretation, mean, median, and mode." },
        ],
      },
    ],
  },
};
