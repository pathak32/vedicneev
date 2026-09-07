export type SprintExamType = "JNVST" | "AISSEE" | "RMS" | "DPS" | "OTHER";

export interface SprintListItem {
  id: string;
  title: string;
  examType: SprintExamType;
  classLevel: number;
  templateSlug: string;
  /** ISO 8601. */
  startTime: string;
  /** ISO 8601. */
  endTime: string;
}
