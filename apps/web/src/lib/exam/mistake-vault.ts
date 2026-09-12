import type { MistakeLogEntry, MistakeTagCategory } from "@/lib/auth/types";
import type { ExamQuestion, Multilingual, VedicSpeedHack } from "./types";

export interface ResolvedMistake {
  question: ExamQuestion;
  sectionName: Multilingual;
  speedHack: VedicSpeedHack | null;
}

/**
 * Every mistake now carries its own question/section/speed-hack snapshot
 * (see MistakeLogEntry's doc comment) — this used to re-derive that from
 * getDemoSession(entry.examId), which only ever worked for the literal demo
 * exam and fabricated a fake session (ids "q-1".."q-N") for anything else,
 * silently dropping every real attempt's mistakes. No lookup needed anymore.
 */
export function resolveMistakeQuestion(entry: MistakeLogEntry): ResolvedMistake {
  return { question: entry.question, sectionName: entry.sectionName, speedHack: entry.speedHack };
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
