/** Multilingual text — "en" always present, others filled in as translated. */
export interface LangText {
  en: string;
  hi?: string;
  mr?: string;
  bn?: string;
  ta?: string;
}

/**
 * One JNVST Class 6 PYQ-bank practice item. Matches
 * packages/db/prisma/schema.prisma's PreviousYearQuestion model.
 */
export interface PyqSeedItem {
  /** Stable natural key to upsert on, e.g. "jnvst-2021-ma-01". */
  key: string;
  year: number;
  /** Matches an existing Section.key row (seeded in prisma/seed.ts). */
  sectionKey: "mental_ability" | "arithmetic" | "language";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionJson: LangText;
  /** Exactly 4 entries — correctAnswer below is a 0-based index into this array. */
  optionsJson: [LangText, LangText, LangText, LangText];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: LangText;
}
