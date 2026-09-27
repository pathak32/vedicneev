import { prisma, type ExamType } from "@vedicneev/db";

export interface TaxonomySubsectionRef {
  id: string;
  name: string;
}

export interface TaxonomySubject {
  id: string;
  name: string;
  subsections: TaxonomySubsectionRef[];
}

const KNOWN_EXAM_BOARDS: readonly ExamType[] = ["JNVST", "AISSEE", "RMS", "DPS", "OTHER"];

function parseExamBoard(examCategory: string | null | undefined): ExamType | null {
  if (!examCategory) return null;
  const normalized = examCategory.trim().toUpperCase();
  return (KNOWN_EXAM_BOARDS as readonly string[]).includes(normalized) ? (normalized as ExamType) : null;
}

/**
 * The Subject/Subsection taxonomy for one exam board — global, not
 * institute-scoped (see Subject's own schema comment). Returns an empty
 * list rather than throwing when examCategory doesn't match a known
 * board (an untagged/legacy batch, or "OTHER"/unseeded) — tagging is
 * always optional, never a hard dependency for the rest of the question
 * upload flow.
 */
export async function getTaxonomyForExamBoard(examCategory: string | null | undefined): Promise<TaxonomySubject[]> {
  const examBoard = parseExamBoard(examCategory);
  if (!examBoard) return [];

  const subjects = await prisma.subject.findMany({
    where: { examBoard },
    include: { subsections: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  return subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    subsections: subject.subsections.map((s) => ({ id: s.id, name: s.name })),
  }));
}

/** Flattens a taxonomy tree into the shape subsectionHeuristic.ts's guesser wants. */
export function flattenSubsections(subjects: TaxonomySubject[]): { id: string; name: string; subjectId: string }[] {
  return subjects.flatMap((subject) => subject.subsections.map((s) => ({ ...s, subjectId: subject.id })));
}
