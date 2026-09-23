import { BUBBLE_OPTIONS, type BubbleOption } from "./omr";

export const MIN_SET_COUNT = 2;
export const MAX_SET_COUNT = 5;

/** A 1-based, inclusive question range a section covers, e.g. Maths 1-50. Sections must partition 1..totalQuestions without gaps or overlaps. */
export interface TestSection {
  name: string;
  startQuestion: number;
  endQuestion: number;
}

/**
 * One master question, in the order it's numbered on the original paper.
 * `text`/`options` are optional — an institute that hasn't digitized its
 * question bank supplies only `correctOption` (see TestBatch.masterQuestions'
 * own comment), and every renderer downstream degrades to a reordering
 * table instead of full question content when they're absent.
 */
export interface MasterQuestionItem {
  questionNumber: number;
  correctOption: BubbleOption;
  text?: string;
  options?: Partial<Record<BubbleOption, string>>;
}

/**
 * One generated set: `permutation[i]` is the 0-based master-question index
 * that now occupies position `i+1` on this set's paper, and
 * `answerKey[i]` is that position's correct option — i.e.
 * `answerKey[i] === masterAnswerKey[permutation[i]]` always, by
 * construction. Both arrays have length `totalQuestions`.
 */
export interface SetMapping {
  permutation: number[];
  answerKey: BubbleOption[];
}

/** Keyed "SET_1".."SET_5" — see TestBatch.setMappings' own comment. */
export type SetMappings = Record<string, SetMapping>;

export interface GenerateQuestionSetsInput {
  masterAnswerKey: BubbleOption[];
  /** 2-5 — validated against MIN_SET_COUNT/MAX_SET_COUNT. */
  setCount: number;
  /**
   * When given, shuffling never moves a question across a section
   * boundary (Maths stays Maths, GK stays GK) — only reorders questions
   * within each section's own range. Omit entirely to shuffle the whole
   * paper as one section.
   */
  sections?: TestSection[];
}

export type GenerateQuestionSetsResult = { ok: true; setMappings: SetMappings } | { ok: false; error: string };

function setLabel(setNumber: number): string {
  return `SET_${setNumber}`;
}

/** Fisher-Yates over `array[start, end)` in place. */
function shuffleRangeInPlace(array: number[], start: number, end: number): void {
  for (let i = end - 1; i > start; i--) {
    const j = start + Math.floor(Math.random() * (i - start + 1));
    [array[i], array[j]] = [array[j] as number, array[i] as number];
  }
}

function validateSections(sections: TestSection[], totalQuestions: number): string | null {
  const sorted = [...sections].sort((a, b) => a.startQuestion - b.startQuestion);
  let expectedNext = 1;
  for (const section of sorted) {
    if (section.startQuestion !== expectedNext) {
      return `Sections must cover every question with no gaps or overlaps — expected "${section.name}" to start at question ${expectedNext}, got ${section.startQuestion}.`;
    }
    if (section.endQuestion < section.startQuestion) {
      return `Section "${section.name}" has an end question before its start question.`;
    }
    expectedNext = section.endQuestion + 1;
  }
  if (expectedNext - 1 !== totalQuestions) {
    return `Sections must cover all ${totalQuestions} questions — they currently cover only ${expectedNext - 1}.`;
  }
  return null;
}

/**
 * Generates `setCount` distinct question-order permutations from one
 * master answer key, shuffling strictly within each section's boundary
 * when sections are given. SET_1 is always the identity permutation (the
 * master order, unshuffled) — institutes commonly already have a printed
 * "Set A" matching the master, and grading/printing both treat every set
 * uniformly regardless of which one is the identity, so this costs
 * nothing and saves a re-print for whichever set an institute already
 * has in hand.
 */
export function generateQuestionSets(input: GenerateQuestionSetsInput): GenerateQuestionSetsResult {
  const { masterAnswerKey, setCount } = input;
  const totalQuestions = masterAnswerKey.length;

  if (totalQuestions === 0) return { ok: false, error: "Master answer key is empty." };
  if (!Number.isInteger(setCount) || setCount < MIN_SET_COUNT || setCount > MAX_SET_COUNT) {
    return { ok: false, error: `Set count must be an integer between ${MIN_SET_COUNT} and ${MAX_SET_COUNT}.` };
  }
  for (const option of masterAnswerKey) {
    if (!BUBBLE_OPTIONS.includes(option)) {
      return { ok: false, error: `Master answer key contains an invalid option: "${option}".` };
    }
  }

  const sections = input.sections?.length
    ? input.sections
    : [{ name: "All Questions", startQuestion: 1, endQuestion: totalQuestions }];
  const sectionError = validateSections(sections, totalQuestions);
  if (sectionError) return { ok: false, error: sectionError };

  const identity = Array.from({ length: totalQuestions }, (_, i) => i);
  const setMappings: SetMappings = { [setLabel(1)]: toMapping(identity, masterAnswerKey) };

  for (let setNumber = 2; setNumber <= setCount; setNumber++) {
    const permutation = identity.slice();
    for (const section of sections) {
      shuffleRangeInPlace(permutation, section.startQuestion - 1, section.endQuestion);
    }
    setMappings[setLabel(setNumber)] = toMapping(permutation, masterAnswerKey);
  }

  return { ok: true, setMappings };
}

function toMapping(permutation: number[], masterAnswerKey: BubbleOption[]): SetMapping {
  return { permutation, answerKey: permutation.map((masterIndex) => masterAnswerKey[masterIndex] as BubbleOption) };
}

export interface AnswerKeyEntry {
  questionNumber: number;
  correctOption: BubbleOption;
}

/**
 * The one place both grading call sites (analyzeOmrUpload.ts, at upload
 * time, and the answer-key route's QUEUED re-grade pass) resolve which
 * answer key to grade a sheet against — kept here, not duplicated in each
 * caller, so a multi-set sheet is graded identically regardless of WHEN
 * that grading happens to run. `detectedSetCode` is trusted only when
 * `setMappings` actually has an entry for it; anything else (a single-set
 * batch, or a set bubble that couldn't be read) falls back to
 * `fallbackAnswerKeyEntries`.
 */
export function resolveAnswerKeyForSet(
  setMappings: SetMappings | null | undefined,
  detectedSetCode: string | null | undefined,
  fallbackAnswerKeyEntries: AnswerKeyEntry[] | null
): AnswerKeyEntry[] | null {
  const mapping = detectedSetCode ? setMappings?.[detectedSetCode] : undefined;
  if (!mapping) return fallbackAnswerKeyEntries;
  return mapping.answerKey.map((correctOption, i) => ({ questionNumber: i + 1, correctOption }));
}
