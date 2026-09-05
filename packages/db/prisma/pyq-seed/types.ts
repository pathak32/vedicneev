/** Multilingual text — "en" always present, others filled in as translated. */
export interface LangText {
  en: string;
  hi?: string;
  mr?: string;
  bn?: string;
  ta?: string;
  gu?: string;
}

/**
 * One PYQ-bank practice item (JNVST Class 6, or any other board/class
 * combination — see `examType`/`classLevel` below). Matches
 * packages/db/prisma/schema.prisma's PreviousYearQuestion model.
 */
export interface PyqSeedItem {
  /** Stable natural key to upsert on, e.g. "jnvst-2021-ma-01". */
  key: string;
  /** Defaults to "JNVST" when omitted — every pre-existing Class 6 file relies on this default. */
  examType?: "JNVST" | "AISSEE" | "RMS" | "DPS" | "OTHER";
  /** Defaults to 6 when omitted, matching PreviousYearQuestion.classLevel's own default. */
  classLevel?: number;
  year: number;
  /** Matches an existing Section.key row (seeded in prisma/seed.ts) — not a closed set, since new exam/class combinations introduce new sections. */
  sectionKey: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionJson: LangText;
  /** Exactly 4 entries — correctAnswer below is a 0-based index into this array. */
  optionsJson: [LangText, LangText, LangText, LangText];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: LangText;
}
