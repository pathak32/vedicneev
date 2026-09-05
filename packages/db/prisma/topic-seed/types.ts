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
 * Inline-SVG diagram for the question stem — mirrors
 * apps/web/src/lib/exam/types.ts's FigureMetadata and
 * QuestionCanvas.tsx's existing (already-implemented, just never
 * populated) rendering path for it. NOT yet a column on the Question
 * model — packages/db/prisma/schema.prisma needs an additive
 * `figureMetadata Json?` field before any question carrying this can be
 * wired into seed.ts, matching the same pattern distractorAnalysis
 * followed. Used only by the visual Mental Ability generators
 * (figure-matching.ts, figure-series.ts, analogy.ts); every other
 * generator in this directory leaves it unset.
 */
export interface FigureMetadataSeed {
  type: "svg";
  markup: string;
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
  /** Question-level diagram — see FigureMetadataSeed. Only set by the visual reasoning generators. */
  figureMetadata?: FigureMetadataSeed;
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

const OPTION_LETTER_IDS = ["a", "b", "c", "d"] as const;

/**
 * Places one correct item and 3 distractors into the 4 lettered slots so the
 * correct answer isn't always "a" — a real risk for visual generators that
 * naturally construct the correct figure first and pad distractors after it.
 * `correctIndex` (0-3) picks which slot holds the correct content; the 3
 * distractors fill the remaining slots in their given order. Returns the
 * slotted contents (index 0..3 = option a..d) plus the resulting
 * `correctOption` id and a `distractorAnalysis` map already keyed by each
 * distractor's final slot id.
 */
export function distributeCorrectPosition<T>(
  correctIndex: number,
  correctContent: T,
  distractorContents: [T, T, T],
  distractorReasons: [LangText, LangText, LangText]
): { contents: T[]; correctOption: string; distractorAnalysis: Record<string, LangText> } {
  const contents: T[] = new Array(4);
  contents[correctIndex] = correctContent;
  const distractorAnalysis: Record<string, LangText> = {};
  let d = 0;
  for (let pos = 0; pos < 4; pos++) {
    if (pos === correctIndex) continue;
    contents[pos] = distractorContents[d]!;
    distractorAnalysis[OPTION_LETTER_IDS[pos]!] = distractorReasons[d]!;
    d++;
  }
  return { contents, correctOption: OPTION_LETTER_IDS[correctIndex]!, distractorAnalysis };
}
