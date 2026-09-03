export type LanguageCode = "en" | "hi" | "mr" | "bn" | "ta";

/**
 * "en" is always present — the guaranteed fallback for a language that
 * hasn't been translated yet. Other languages are filled in incrementally
 * (see StateConfiguration in packages/db/prisma/schema.prisma), so they're
 * optional rather than required like the old two-language `Bilingual` shape.
 */
export type Multilingual = Partial<Record<LanguageCode, string>> & { en: string };

export type QuestionStatus =
  | "UNVISITED"
  | "VISITED"
  | "ANSWERED"
  | "MARKED_FOR_REVIEW"
  | "ANSWERED_AND_MARKED";

export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface ExamOption {
  id: string;
  text?: Multilingual;
  imageUrl?: string;
}

/** Vector/SVG figure metadata for non-verbal reasoning items. */
export interface FigureMetadata {
  type: "svg" | "image";
  /**
   * Inline SVG markup. Must only ever come from trusted, admin-authored
   * question-bank content (never end-user input) — it is rendered via
   * dangerouslySetInnerHTML.
   */
  markup?: string;
  url?: string;
  transform?: string;
}

export interface ExamQuestion {
  id: string;
  sectionKey: string;
  topicKey: string;
  difficulty: QuestionDifficulty;
  content: Multilingual;
  options: ExamOption[];
  correctOption: string;
  figureMetadata?: FigureMetadata | null;
  vedicSpeedHackId?: string | null;
  explanation?: Multilingual | null;
  explanationVideoUrl?: string | null;
  timeLimitSeconds: number;
}

export interface VedicSpeedHack {
  id: string;
  key: string;
  title: Multilingual;
  description: Multilingual;
}

export interface ExamSectionConfig {
  key: string;
  name: Multilingual;
  order: number;
  /** Sectional time limit in seconds; null shares the exam's overall timer. */
  timeLimitSeconds: number | null;
  questionIds: string[];
}

export type ExamType = "JNVST" | "AISSEE" | "RMS" | "DPS";

export interface ExamSessionData {
  examId: string;
  examType: ExamType;
  templateName: Multilingual;
  totalDurationSeconds: number;
  negativeMarkingRatio: number;
  sections: ExamSectionConfig[];
  questionsById: Record<string, ExamQuestion>;
  speedHacksById: Record<string, VedicSpeedHack>;
}
