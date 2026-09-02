import type { MistakeLogEntry, MistakeTagCategory } from "@/lib/auth/types";
import { getDemoSession } from "./mock-data";
import type { ExamQuestion, ExamSessionData } from "./types";

export interface ResolvedMistake {
  question: ExamQuestion;
  session: ExamSessionData;
}

/** Persisted mistakes only store ids — this recovers the question/session content from mock data at render time. */
export function resolveMistakeQuestion(entry: MistakeLogEntry): ResolvedMistake | null {
  const session = getDemoSession(entry.examId);
  const question = session?.questionsById[entry.questionId];
  if (!session || !question) return null;
  return { question, session };
}

export const MISTAKE_TAG_META: Record<MistakeTagCategory, { label: string; className: string }> = {
  CARELESS_RUSHED: {
    label: "Careless / Rushed",
    className: "bg-amber-500/15 text-amber-700 border-amber-500/40 dark:text-amber-400",
  },
  CONCEPT_GAP: {
    label: "Concept Gap",
    className: "bg-red-500/15 text-red-700 border-red-500/40 dark:text-red-400",
  },
  CALCULATION_GAP: {
    label: "Calculation Gap",
    className: "bg-blue-500/15 text-blue-700 border-blue-500/40 dark:text-blue-400",
  },
};
