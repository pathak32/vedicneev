/**
 * Shared topic catalog for the externally-authored question bank (see
 * D:\Projects\notes handwritten\questions\{class6,class9}\{en,hi}\topic-N.json
 * — outside this repo, produced/fixed by a separate authoring pass). This
 * was originally the SAME 1-72-per-class-level numbering and sectionKey
 * assignment as TopicNotePdf/seed-study-note-pdfs.ts's CLASS_6_RANGES/
 * CLASS_9_RANGES (verified live against the DB there) — duplicated here
 * rather than imported because that file lives in packages/db/prisma (a
 * seed script, not an importable module) while this needs to be usable
 * from a pure packaging script with no Prisma/DB dependency.
 *
 * Class 9 topics 73+ (added to close a General Knowledge coverage gap) are
 * NEW to this catalog only — they intentionally do NOT exist in
 * seed-study-note-pdfs.ts, which seeds a separate markdown-based study-notes
 * product from its own externally-authored topic-N.md files. Adding topics
 * here does not add them there; that's separate content work for that
 * product if it's ever wanted. Keep the two in sync for topics 1-72 only.
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
  // New topics authored to close the General Knowledge coverage gap found
  // against a real UPSS Class IX question booklet (class9 previously had
  // only 3 GK-adjacent topics — 70-72 — against that exam's broad GK
  // section: world geography, full-forms/abbreviations, space & science
  // facts, sports & awards, government schemes).
  { from: 73, to: 77, sectionKey: "general_knowledge" },
  // New non-verbal/figural reasoning topics — class9 previously had zero
  // (class6 has rich coverage at topics 25-38, never carried forward).
  // All written as plain text (no diagrams), the same way dice/mirror/
  // paper-folding questions already appear in real text-only exam banks.
  { from: 78, to: 81, sectionKey: "mental_ability" },
  // New Polygons topic (interior/exterior angles, diagonals, regular
  // polygon properties) — a real UPSS booklet has several such questions
  // that didn't cleanly belong to any existing Triangles/Quadrilaterals topic.
  { from: 82, to: 82, sectionKey: "mathematics" },
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

function rangesFor(classLevel: QuestionBookletClassLevel): TopicRangeRule[] {
  return classLevel === 6 ? CLASS_6_RANGES : CLASS_9_RANGES;
}

/** The highest topic number defined for this class level — not hardcoded, so adding a new range entry automatically extends every function below. */
function maxTopicNumber(classLevel: QuestionBookletClassLevel): number {
  return Math.max(...rangesFor(classLevel).map((r) => r.to));
}

function resolveRange(classLevel: QuestionBookletClassLevel, topicNumber: number): TopicRangeRule {
  const ranges = rangesFor(classLevel);
  const match = ranges.find((r) => topicNumber >= r.from && topicNumber <= r.to);
  if (!match) throw new Error(`No section range covers class ${classLevel} topic ${topicNumber} (expected 1-${maxTopicNumber(classLevel)}).`);
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

/** Every topic number included in this exam's syllabus for this class level, in order. */
export function topicNumbersForExam(examType: QuestionBookletExamType, classLevel: QuestionBookletClassLevel): number[] {
  const numbers: number[] = [];
  for (let topicNumber = 1; topicNumber <= maxTopicNumber(classLevel); topicNumber++) {
    if (isTopicInExamSyllabus(examType, classLevel, topicNumber)) numbers.push(topicNumber);
  }
  return numbers;
}
