/**
 * Shared topic catalog for the externally-authored question bank (see
 * D:\Projects\notes handwritten\questions\{class6,class9}\{en,hi}\topic-N.json
 * — outside this repo, produced/fixed by a separate authoring pass). This
 * is the SAME 1-72-per-class-level numbering and sectionKey assignment as
 * TopicNotePdf/seed-study-note-pdfs.ts's CLASS_6_RANGES/CLASS_9_RANGES
 * (verified live against the DB there) — duplicated here rather than
 * imported because that file lives in packages/db/prisma (a seed script,
 * not an importable module) while this needs to be usable from a pure
 * packaging script with no Prisma/DB dependency. Keep the two in sync if
 * the numbering ever changes.
 */

export type QuestionBookletClassLevel = 6 | 9;

/** Matches Purchase/Product's existing ExamType string values for these four exam boards. */
export type QuestionBookletExamType = "JNVST" | "RMS" | "AISSEE" | "UPSS";

export const QUESTION_BOOKLET_EXAM_TYPES: readonly QuestionBookletExamType[] = ["JNVST", "RMS", "AISSEE", "UPSS"];

interface TopicRangeRule {
  from: number;
  to: number;
  sectionKey: string;
}

const CLASS_6_RANGES: TopicRangeRule[] = [
  { from: 1, to: 7, sectionKey: "mental_ability" },
  { from: 8, to: 12, sectionKey: "arithmetic" },
  { from: 13, to: 20, sectionKey: "language" },
  { from: 21, to: 24, sectionKey: "general_knowledge" },
  { from: 25, to: 39, sectionKey: "mental_ability" },
  { from: 40, to: 60, sectionKey: "arithmetic" },
  { from: 61, to: 69, sectionKey: "general_knowledge" },
  { from: 70, to: 72, sectionKey: "arithmetic" },
];

const CLASS_9_RANGES: TopicRangeRule[] = [
  { from: 1, to: 12, sectionKey: "mental_ability" },
  { from: 13, to: 48, sectionKey: "mathematics" },
  { from: 49, to: 58, sectionKey: "language" },
  { from: 59, to: 69, sectionKey: "science" },
  { from: 70, to: 72, sectionKey: "social_science" },
];

/**
 * JNVST's real syllabus has no General Knowledge / Science / Social
 * Science section (confirmed against its official pattern during the
 * study-notes product's packaging — see upload-split-study-notes.mts's
 * `hasGK` volumes, where only JNVST passes `false`) — RMS/AISSEE/UPSS all
 * include it. Expressed as section exclusion rather than a hardcoded
 * number range so it self-documents *why* a topic is dropped.
 */
const JNVST_EXCLUDED_SECTION_KEYS = new Set(["general_knowledge", "science", "social_science"]);

function resolveRange(classLevel: QuestionBookletClassLevel, topicNumber: number): TopicRangeRule {
  const ranges = classLevel === 6 ? CLASS_6_RANGES : CLASS_9_RANGES;
  const match = ranges.find((r) => topicNumber >= r.from && topicNumber <= r.to);
  if (!match) throw new Error(`No section range covers class ${classLevel} topic ${topicNumber} (expected 1-72).`);
  return match;
}

/** The subject-area key (e.g. "mental_ability", "general_knowledge") this topic number falls under. */
export function sectionKeyForTopic(classLevel: QuestionBookletClassLevel, topicNumber: number): string {
  return resolveRange(classLevel, topicNumber).sectionKey;
}

/**
 * Whether this topic belongs in a given exam board's compiled book. Every
 * exam gets every topic except JNVST, which drops GK/Science/Social
 * Science topics entirely (they're not on its syllabus) rather than
 * shipping content a JNVST aspirant was never going to be tested on.
 */
export function isTopicInExamSyllabus(
  examType: QuestionBookletExamType,
  classLevel: QuestionBookletClassLevel,
  topicNumber: number
): boolean {
  if (examType !== "JNVST") return true;
  return !JNVST_EXCLUDED_SECTION_KEYS.has(sectionKeyForTopic(classLevel, topicNumber));
}

/** Every topic number (1-72) included in this exam's syllabus for this class level, in order. */
export function topicNumbersForExam(examType: QuestionBookletExamType, classLevel: QuestionBookletClassLevel): number[] {
  const numbers: number[] = [];
  for (let topicNumber = 1; topicNumber <= 72; topicNumber++) {
    if (isTopicInExamSyllabus(examType, classLevel, topicNumber)) numbers.push(topicNumber);
  }
  return numbers;
}
