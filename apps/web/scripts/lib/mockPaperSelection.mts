/**
 * Shared question-selection logic for every "mock paper" product
 * (generate-mock-papers.mts's standalone giveaway papers, and
 * generate-sample-paper-books.mts's sellable 20-paper + OMR book) — one
 * source of truth for the second-pass-cleared gating and the
 * rotation-with-light-reuse picker, so the two products can never drift
 * apart on which questions are eligible or how sets are built.
 */
import fs from "node:fs";
import path from "node:path";

import type { isTopicInExamSyllabus, sectionKeyForTopic, validateQuestionBookletTopic, QuestionBookletClassLevel, QuestionBookletExamType, QuestionBookletQuestion } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { isTopicInExamSyllabus: inSyllabus, sectionKeyForTopic: sectionOf, validateQuestionBookletTopic: validateTopic } =
  engineRuntime as unknown as typeof import("@vedicneev/engine");

// Overridable for environments where the question bank isn't under the
// user's local Windows path (e.g. a cloud session with the content checked
// out as its own repo, whose root IS the questions directory).
export const QUESTIONS_ROOT = process.env.QUESTION_BANK_ROOT || path.join("D:\\Projects\\notes handwritten", "questions");
const CLEARED_MANIFEST = path.join(QUESTIONS_ROOT, "_review", "SECOND_PASS_CLEARED.json");

export const EXAM_LABEL: Record<QuestionBookletExamType, string> = {
  JNVST: "JNVST",
  RMS: "RMS",
  AISSEE: "AISSEE (Sainik School)",
  UPSS: "UPSS",
};

export interface MockPaperQuestion extends QuestionBookletQuestion {
  /** Which syllabus topic this question was drawn from, for the answer key's reference only. */
  topicNumber: number;
}

interface ClearedEntry {
  classLevel: number;
  language: string;
  topics: number[];
}

function loadClearedTopics(classLevel: QuestionBookletClassLevel, lang: "en" | "hi"): number[] {
  if (!fs.existsSync(CLEARED_MANIFEST)) {
    console.error(`No second-pass-cleared manifest found at ${CLEARED_MANIFEST} — nothing is eligible yet.`);
    return [];
  }
  const data = JSON.parse(fs.readFileSync(CLEARED_MANIFEST, "utf-8")) as { cleared: ClearedEntry[] };
  const entry = data.cleared.find((e) => e.classLevel === classLevel && e.language === lang);
  return entry?.topics ?? [];
}

function loadTopicQuestions(classLevel: QuestionBookletClassLevel, lang: "en" | "hi", topicNumber: number): MockPaperQuestion[] {
  const filePath = path.join(QUESTIONS_ROOT, `class${classLevel}`, lang, `topic-${topicNumber}.json`);
  if (!fs.existsSync(filePath)) return [];
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const { ok, questions } = validateTopic(raw);
  if (!ok) {
    console.warn(`  topic-${topicNumber}.json has structural errors despite being marked second-pass-cleared — skipping it. Check the manifest.`);
    return [];
  }
  return questions.map((q: QuestionBookletQuestion) => ({ ...q, topicNumber }));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Stable identity for a question across the whole run — used both to dedupe exact/near-duplicate questions within the pool and to key usage counts for the rotation. */
function questionKey(q: MockPaperQuestion): string {
  return q.question.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Collapses exact-text (whitespace/case-insensitive) duplicate questions, keeping the first occurrence — the real corpus is known to carry some repeated/near-identical questions within a topic, and a sample paper showing the same question twice looks broken. */
function dedupeByQuestionText(pool: MockPaperQuestion[]): MockPaperQuestion[] {
  const seen = new Set<string>();
  const out: MockPaperQuestion[] = [];
  for (const q of pool) {
    const key = questionKey(q);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

/**
 * Picks `n` questions from `pool` for ONE set, preferring the
 * least-used-so-far questions (rotation with light reuse) and balancing the
 * correct-answer letter as evenly as possible within the set. `usage` is
 * mutated in place (incremented for every question picked) so the next
 * set's call sees updated counts.
 */
function pickForSet(pool: MockPaperQuestion[], n: number, usage: Map<string, number>): MockPaperQuestion[] {
  const byLetter = new Map<string, MockPaperQuestion[]>();
  for (const q of shuffle(pool)) {
    const bucket = byLetter.get(q.correctOption) ?? [];
    bucket.push(q);
    byLetter.set(q.correctOption, bucket);
  }
  // Within each letter, least-used-so-far first (ties already randomized by the shuffle above, stable sort preserves that order among equal usage counts).
  for (const bucket of byLetter.values()) {
    bucket.sort((a, b) => (usage.get(questionKey(a)) ?? 0) - (usage.get(questionKey(b)) ?? 0));
  }

  const letters = [...byLetter.keys()];
  const picked: MockPaperQuestion[] = [];
  let letterIndex = 0;
  while (picked.length < n && letters.some((l) => (byLetter.get(l)?.length ?? 0) > 0)) {
    const letter = letters[letterIndex % letters.length]!;
    letterIndex++;
    const bucket = byLetter.get(letter)!;
    const next = bucket.shift();
    if (next) {
      picked.push(next);
      usage.set(questionKey(next), (usage.get(questionKey(next)) ?? 0) + 1);
    }
  }
  return picked;
}

/** Builds one set: samples proportionally across sections (so one section doesn't dominate), applying the rotation-with-light-reuse pick within each section, then shuffles final order. */
function buildOneSet(pool: MockPaperQuestion[], count: number, classLevel: QuestionBookletClassLevel, usage: Map<string, number>): MockPaperQuestion[] {
  const bySection = new Map<string, MockPaperQuestion[]>();
  for (const q of pool) {
    const section = sectionOf(classLevel, q.topicNumber);
    const bucket = bySection.get(section) ?? [];
    bucket.push(q);
    bySection.set(section, bucket);
  }
  const sections = [...bySection.keys()];
  const perSection = Math.ceil(count / Math.max(sections.length, 1));
  const picked: MockPaperQuestion[] = [];
  for (const section of sections) {
    picked.push(...pickForSet(bySection.get(section)!, perSection, usage));
  }
  return shuffle(picked).slice(0, count);
}

export interface SelectSetsResult {
  clearedTopicCount: number;
  poolSize: number;
  /** One entry per set, in order; a set can come back shorter than `count` (or the array shorter than `sets`) if the pool runs out. */
  sets: MockPaperQuestion[][];
}

/** Loads the eligible pool for (exam, classLevel, lang) and builds `sets` numbered sets of `count` questions each, sharing one rotation-with-light-reuse usage tracker across all of them. */
export function selectSets(
  exam: QuestionBookletExamType,
  classLevel: QuestionBookletClassLevel,
  lang: "en" | "hi",
  count: number,
  sets: number
): SelectSetsResult {
  const clearedTopics = loadClearedTopics(classLevel, lang).filter((t) => inSyllabus(exam, classLevel, t));
  const rawPool: MockPaperQuestion[] = [];
  for (const t of clearedTopics) rawPool.push(...loadTopicQuestions(classLevel, lang, t));
  const pool = dedupeByQuestionText(rawPool);

  const usage = new Map<string, number>();
  const result: MockPaperQuestion[][] = [];
  for (let setNumber = 1; setNumber <= sets; setNumber++) {
    const selected = buildOneSet(pool, count, classLevel, usage);
    if (selected.length === 0) break;
    result.push(selected);
  }

  return { clearedTopicCount: clearedTopics.length, poolSize: pool.length, sets: result };
}
