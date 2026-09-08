import type { DictionaryKey } from "@/lib/i18n/dictionary";

export type BoardType = "jnvst" | "aissee" | "rms";
export type ClassType = "6" | "9";

export interface SectionInfo {
  nameKey: DictionaryKey;
  q: string;
  marks: string;
}

export interface ClassInfo {
  eligibilityKey: DictionaryKey;
  duration: string;
  totalMarks: string;
  sections: SectionInfo[];
  link: string;
}

export interface BoardInfo {
  nameKey: DictionaryKey;
  badgeKey: DictionaryKey;
  descKey: DictionaryKey;
  classes: Record<ClassType, ClassInfo>;
}

/**
 * Single source of truth for exam board/class data — used by both
 * ExamTracksHub (homepage picker) and app/exam-boards/[board]/page.tsx
 * (dedicated per-board info pages linked from the header dropdown). See
 * dictionary.ts's "ExamTracksHub" section for the translated strings each
 * *Key here resolves to.
 */
export const BOARD_DATA: Record<BoardType, BoardInfo> = {
  jnvst: {
    nameKey: "boardJnvstName",
    badgeKey: "boardJnvstBadge",
    descKey: "boardJnvstDesc",
    classes: {
      "6": {
        eligibilityKey: "eligJnvst6",
        duration: "120 Minutes",
        totalMarks: "100 Marks (80 Questions)",
        sections: [
          { nameKey: "secMentalAbility", q: "40 Qs", marks: "50 M" },
          { nameKey: "secArithmeticTest", q: "20 Qs", marks: "25 M" },
          { nameKey: "secLanguageTest", q: "20 Qs", marks: "25 M" },
        ],
        link: "/exam/jnvst-live-mock",
      },
      "9": {
        eligibilityKey: "eligJnvst9",
        duration: "150 Minutes",
        totalMarks: "100 Marks (100 Questions)",
        sections: [
          { nameKey: "secMathematics", q: "35 Qs", marks: "35 M" },
          { nameKey: "secEnglish", q: "15 Qs", marks: "15 M" },
          { nameKey: "secScience", q: "35 Qs", marks: "35 M" },
          { nameKey: "secSocialScience", q: "15 Qs", marks: "15 M" },
        ],
        link: "/exam/live/jnvst-class-9",
      },
    },
  },
  aissee: {
    nameKey: "boardAisseeName",
    badgeKey: "boardAisseeBadge",
    descKey: "boardAisseeDesc",
    classes: {
      "6": {
        eligibilityKey: "eligAissee6",
        duration: "150 Minutes",
        totalMarks: "300 Marks (125 Questions)",
        sections: [
          { nameKey: "secMathematics", q: "50 Qs", marks: "150 M" },
          { nameKey: "secIntelligenceReasoning", q: "25 Qs", marks: "50 M" },
          { nameKey: "secLanguageEnglishRegional", q: "25 Qs", marks: "50 M" },
          { nameKey: "secGeneralKnowledge", q: "25 Qs", marks: "50 M" },
        ],
        link: "/exam/live/aissee-class-6",
      },
      "9": {
        eligibilityKey: "eligAissee9",
        duration: "180 Minutes",
        totalMarks: "400 Marks (150 Questions)",
        sections: [
          { nameKey: "secMathematics", q: "50 Qs", marks: "200 M" },
          { nameKey: "secIntelligence", q: "25 Qs", marks: "50 M" },
          { nameKey: "secEnglish", q: "25 Qs", marks: "50 M" },
          { nameKey: "secGeneralScience", q: "25 Qs", marks: "50 M" },
          { nameKey: "secSocialStudies", q: "25 Qs", marks: "50 M" },
        ],
        link: "/exam/live/aissee-class-9",
      },
    },
  },
  rms: {
    nameKey: "boardRmsName",
    badgeKey: "boardRmsBadge",
    descKey: "boardRmsDesc",
    classes: {
      "6": {
        eligibilityKey: "eligRms6",
        duration: "150 Minutes",
        totalMarks: "150 Marks",
        sections: [
          { nameKey: "secIntelligenceTest", q: "50 Qs", marks: "50 M" },
          { nameKey: "secArithmetic", q: "50 Qs", marks: "50 M" },
          { nameKey: "secGeneralKnowledge", q: "50 Qs", marks: "50 M" },
        ],
        link: "/exam/live/rms-class-6",
      },
      "9": {
        eligibilityKey: "eligRms9",
        duration: "180 Minutes",
        totalMarks: "200 Marks",
        sections: [
          { nameKey: "secEnglish", q: "50 Qs", marks: "50 M" },
          { nameKey: "secHindi", q: "50 Qs", marks: "50 M" },
          { nameKey: "secSocialScienceScience", q: "100 Qs", marks: "100 M" },
        ],
        link: "/exam/live/rms-class-9",
      },
    },
  },
};
