export type LanguageCode = "en" | "hi";

export type Bilingual = Record<LanguageCode, string>;

export type QuestionStatus =
  | "UNVISITED"
  | "VISITED"
  | "ANSWERED"
  | "MARKED_FOR_REVIEW"
  | "ANSWERED_AND_MARKED";

export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface ExamOption {
  id: string;
  text?: Bilingual;
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
  content: Bilingual;
  options: ExamOption[];
  correctOption: string;
  figureMetadata?: FigureMetadata | null;
  vedicSpeedHackId?: string | null;
  explanation?: Bilingual | null;
  explanationVideoUrl?: string | null;
  timeLimitSeconds: number;
}

export interface VedicSpeedHack {
  id: string;
  key: string;
  title: Bilingual;
  description: Bilingual;
}

export interface ExamSectionConfig {
  key: string;
  name: Bilingual;
  order: number;
  /** Sectional time limit in seconds; null shares the exam's overall timer. */
  timeLimitSeconds: number | null;
  questionIds: string[];
}

export interface ExamSessionData {
  examId: string;
  templateName: Bilingual;
  totalDurationSeconds: number;
  negativeMarkingRatio: number;
  sections: ExamSectionConfig[];
  questionsById: Record<string, ExamQuestion>;
  speedHacksById: Record<string, VedicSpeedHack>;
}
