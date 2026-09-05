/** Multilingual text — "en" always present; hi is filled in for every item in this pilot batch, mr/bn/ta/gu are added incrementally later (same convention as pyq-seed/types.ts). */
export interface LangText {
  en: string;
  hi?: string;
  mr?: string;
  bn?: string;
  ta?: string;
  gu?: string;
}

export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface OptionSeed {
  id: string;
  text: LangText;
}

/**
 * One fully-realized Question-bank item, matching
 * packages/db/prisma/schema.prisma's Question model plus its new
 * distractorAnalysis field. Produced by the generators in this directory —
 * every numeric value is computed by real arithmetic at generation time
 * (never hand-typed), and `assertDistinctOptions` below guards against a
 * construction bug ever seeding a question with two identical options.
 */
export interface GeneratedQuestion {
  key: string;
  difficulty: QuestionDifficulty;
  content: LangText;
  options: [OptionSeed, OptionSeed, OptionSeed, OptionSeed];
  correctOption: string;
  vedicSpeedHackId?: string;
  /** Step-by-step proof or Vedic shortcut for why `correctOption` is right. */
  explanation: LangText;
  /** One entry per WRONG option id, explaining the specific trap it represents. */
  distractorAnalysis: Record<string, LangText>;
}

/**
 * Throws with a descriptive message if any two of a question's 4 options
 * share the same displayed (English) value — a real risk when options are
 * built from arithmetic formulas rather than hand-typed, since a
 * construction bug (e.g. two distractor formulas that happen to coincide
 * for a particular input) would otherwise seed a genuinely broken question
 * silently. Called by every generator right after building each item.
 */
export function assertDistinctOptions(key: string, options: OptionSeed[]): void {
  const seen = new Map<string, string>();
  for (const option of options) {
    const value = option.text.en;
    const existing = seen.get(value);
    if (existing) {
      throw new Error(
        `${key}: options "${existing}" and "${option.id}" both render as "${value}" — construction bug, fix the generator.`
      );
    }
    seen.set(value, option.id);
  }
}
