/**
 * Shared question-selection logic for every "mock paper" product
 * (generate-mock-papers.mts's standalone giveaway papers, and
 * generate-sample-paper-books.mts's sellable 20-paper + OMR book) — one
 * source of truth for the second-pass-cleared gating, the real exam section
 * blueprints, and the rotation-with-light-reuse picker, so the two products
 * can never drift apart on which questions are eligible or how sets are
 * built.
 *
 * EXAM_SECTION_SPECS below is researched from each board's actual published
 * 2025 pattern (JNVST, AISSEE) or the best available public information at
 * the time this was written (RMS, UPSS) — see the per-exam comments.
 * Confirm against an official pattern document before this goes live if
 * more authoritative sourcing becomes available.
 */
import fs from "node:fs";
import path from "node:path";

import type {
  sectionKeyForTopic,
  scanForSelfCorrectionArtifacts,
  scanForUnsupportedGlyphs,
  validateQuestionBookletTopic,
  QuestionBookletClassLevel,
  QuestionBookletExamType,
  QuestionBookletQuestion,
} from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const {
  sectionKeyForTopic: sectionOf,
  scanForSelfCorrectionArtifacts: scanArtifacts,
  scanForUnsupportedGlyphs: scanGlyphs,
  validateQuestionBookletTopic: validateTopic,
} = engineRuntime as unknown as typeof import("@vedicneev/engine");

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

/** One of the 4 syllabus sections sectionKeyForTopic ever returns. */
export type SectionKey = "mental_ability" | "arithmetic" | "language" | "general_knowledge";

export interface ExamSectionSpec {
  section: SectionKey;
  /** The exam's own name for this section, printed on the paper — not always the same word as our internal syllabus bucket (e.g. AISSEE's "Mathematics" is our "arithmetic" bucket, its "Intelligence" is our "mental_ability" bucket). */
  label: string;
  count: number;
  marksEach: number;
}

export interface ExamPattern {
  sections: ExamSectionSpec[];
  durationMinutes: number;
  negativeMarking: boolean;
  /** True where the exact section-wise question count isn't officially confirmed and was estimated from the exam's published total marks — see this module's header comment. */
  patternIsEstimated: boolean;
}

/**
 * JNVST Class 6, 2025: 80 questions / 100 marks / 120 min, no negative
 * marking — Mental Ability 40q/50m, Arithmetic 20q/25m, Language 20q/25m
 * (1.25 marks/question throughout). Source: official pattern as reported by
 * Careers360 / Physics Wallah for the Jan/Apr 2025 sittings.
 *
 * AISSEE Class 6, 2025: 125 questions / 300 marks / 150 min, no negative
 * marking — Language 25q/50m (2/q), Mathematics 50q/150m (3/q),
 * Intelligence 25q/50m (2/q), General Knowledge 25q/50m (2/q). Source:
 * official NTA pattern as reported by Careers360 for the April 2025 sitting.
 *
 * UPSS (UP Sainik School) Class 9, 2025-26: confirmed against an actual
 * official CET-2025-2026 Class IX question booklet (Set A) — 200 questions /
 * 200 marks (1 mark flat, every question) / 2.5 hours, no negative marking.
 * Printed structure: Part-1 English (50 Ques.), Part-2 General Knowledge
 * (50 Ques.), Part-3 Mathematics/Intelligence Test (75+25 Ques.) — i.e.
 * Mathematics 75 + Intelligence Test 25 inside one combined part. This
 * replaces the earlier AISSEE-shaped estimate below, which had the English
 * and General Knowledge counts at half their real size and used 2-3 marks
 * per question instead of a flat 1.
 *
 * RMS Class 6: web research for this module found a DIFFERENT published
 * figure (4 sections — English/Mathematics/Intelligence/GK — at 50 marks
 * each = 200 total). But packages/db/prisma/seed.ts — this codebase's own
 * already-established source for the live online mock product — instead
 * mirrors AISSEE's exact structure for RMS (`const rmsSections =
 * aisseeSections`), with its own comment flagging that as an approximation
 * pending official verification too. Matching that existing choice here
 * rather than introducing a third, conflicting number keeps the live mock
 * and this print product consistent with each other (patternIsEstimated:
 * true either way — this is a real open question, not a settled one).
 */
export const EXAM_PATTERNS: Record<QuestionBookletExamType, ExamPattern> = {
  JNVST: {
    sections: [
      { section: "mental_ability", label: "Mental Ability Test", count: 40, marksEach: 1.25 },
      { section: "arithmetic", label: "Arithmetic Test", count: 20, marksEach: 1.25 },
      { section: "language", label: "Language Test", count: 20, marksEach: 1.25 },
    ],
    durationMinutes: 120,
    negativeMarking: false,
    patternIsEstimated: false,
  },
  AISSEE: {
    sections: [
      { section: "language", label: "Language", count: 25, marksEach: 2 },
      { section: "arithmetic", label: "Mathematics", count: 50, marksEach: 3 },
      { section: "mental_ability", label: "Intelligence", count: 25, marksEach: 2 },
      { section: "general_knowledge", label: "General Knowledge", count: 25, marksEach: 2 },
    ],
    durationMinutes: 150,
    negativeMarking: false,
    patternIsEstimated: false,
  },
  UPSS: {
    sections: [
      { section: "language", label: "English", count: 50, marksEach: 1 },
      { section: "general_knowledge", label: "General Knowledge", count: 50, marksEach: 1 },
      { section: "arithmetic", label: "Mathematics", count: 75, marksEach: 1 },
      { section: "mental_ability", label: "Intelligence Test", count: 25, marksEach: 1 },
    ],
    durationMinutes: 150,
    negativeMarking: false,
    patternIsEstimated: false,
  },
  RMS: {
    sections: [
      { section: "language", label: "English", count: 25, marksEach: 2 },
      { section: "arithmetic", label: "Mathematics", count: 50, marksEach: 3 },
      { section: "mental_ability", label: "Intelligence", count: 25, marksEach: 2 },
      { section: "general_knowledge", label: "General Knowledge & Current Affairs", count: 25, marksEach: 2 },
    ],
    durationMinutes: 150,
    negativeMarking: false,
    patternIsEstimated: true,
  },
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

  // Same zero-error-tolerance checks package-question-books.mts applies,
  // but excluding only the flagged QUESTIONS rather than the whole topic —
  // this product samples individual questions from a pool rather than
  // shipping a fixed per-topic document, so a topic with one bad question
  // doesn't need to lose the rest of its otherwise-good pool.
  const flagged = new Set<number>();
  for (const a of scanArtifacts(questions)) flagged.add(a.questionNumber);
  if (lang === "en") {
    for (const g of scanGlyphs(questions)) flagged.add(g.questionNumber);
  }
  if (flagged.size > 0) {
    console.warn(`  topic-${topicNumber}.json: excluding ${flagged.size} flagged question(s) (self-correction artifact or suspicious character) from the sample-paper pool — fix the source file and re-run to bring them back.`);
  }

  return questions.filter((q: QuestionBookletQuestion) => !flagged.has(q.questionNumber)).map((q: QuestionBookletQuestion) => ({ ...q, topicNumber }));
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

/**
 * Sections where the live UPSS Class 6 feedback ("English level thoda high
 * hai, GK bhi thoda high hai") applies — Language and General Knowledge.
 * Per explicit user decision, fixed by leaning on the difficulty tags
 * already shipped in #15 rather than rewriting content: these sections draw
 * Easy/Medium questions first and only reach into Hard (or untagged, which
 * ranks ahead of Hard since most of the corpus predates tagging and isn't
 * known to be hard) once a set's Easy/Medium supply for a given
 * correct-answer letter is exhausted.
 */
const DIFFICULTY_BIASED_SECTIONS: ReadonlySet<SectionKey> = new Set(["language", "general_knowledge"]);
const DIFFICULTY_RANK: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 3 };
function difficultyRank(q: MockPaperQuestion): number {
  return q.difficulty ? DIFFICULTY_RANK[q.difficulty]! : 2;
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
 * set's call sees updated counts. A section whose pool is smaller than
 * `n × sets-in-the-run` naturally starts repeating once every question in
 * it has been used once — this function doesn't special-case that, the
 * least-used-first order already produces exactly that behavior, and a
 * section with ample pool (several times n × sets) simply never repeats.
 */
function pickForSet(pool: MockPaperQuestion[], n: number, usage: Map<string, number>, section: SectionKey): MockPaperQuestion[] {
  const biasDifficulty = DIFFICULTY_BIASED_SECTIONS.has(section);
  const byLetter = new Map<string, MockPaperQuestion[]>();
  for (const q of shuffle(pool)) {
    const bucket = byLetter.get(q.correctOption) ?? [];
    bucket.push(q);
    byLetter.set(q.correctOption, bucket);
  }
  // Within each letter, least-used-so-far first (ties already randomized by the shuffle above, stable sort preserves that order among equal usage counts).
  // For Language/GK, difficulty rank sorts first so Easy/Medium exhaust before Hard is ever reached, same shuffle+usage tiebreak within each rank.
  for (const bucket of byLetter.values()) {
    bucket.sort((a, b) => {
      if (biasDifficulty) {
        const rankDiff = difficultyRank(a) - difficultyRank(b);
        if (rankDiff !== 0) return rankDiff;
      }
      return (usage.get(questionKey(a)) ?? 0) - (usage.get(questionKey(b)) ?? 0);
    });
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

export interface BuiltSection {
  section: SectionKey;
  label: string;
  marksEach: number;
  questions: MockPaperQuestion[];
}

/** Builds one set according to the exam's real section blueprint — e.g. AISSEE's 25 Language + 50 Mathematics + 25 Intelligence + 25 GK — rather than an even split across however many sections happen to be in the pool. */
function buildOneSet(
  poolBySection: Map<SectionKey, MockPaperQuestion[]>,
  pattern: ExamPattern,
  usage: Map<string, number>
): BuiltSection[] {
  return pattern.sections.map((spec) => ({
    section: spec.section,
    label: spec.label,
    marksEach: spec.marksEach,
    questions: pickForSet(poolBySection.get(spec.section) ?? [], spec.count, usage, spec.section),
  }));
}

export interface SelectSetsResult {
  clearedTopicCount: number;
  poolSize: number;
  poolSizeBySection: Record<SectionKey, number>;
  pattern: ExamPattern;
  /** One entry per set, in order; each set is its sections in the exam's printed order. A set's section can come back shorter than its blueprint count if that section's pool is exhausted. */
  sets: BuiltSection[][];
}

/** Loads the eligible pool for (exam, classLevel, lang) and builds `sets` numbered sets following the exam's real section blueprint, sharing one rotation-with-light-reuse usage tracker across all of them. */
export function selectSets(exam: QuestionBookletExamType, classLevel: QuestionBookletClassLevel, lang: "en" | "hi", sets: number): SelectSetsResult {
  const pattern = EXAM_PATTERNS[exam];
  const clearedTopics = loadClearedTopics(classLevel, lang);

  const rawPool: MockPaperQuestion[] = [];
  for (const t of clearedTopics) rawPool.push(...loadTopicQuestions(classLevel, lang, t));
  const pool = dedupeByQuestionText(rawPool);

  const poolBySection = new Map<SectionKey, MockPaperQuestion[]>();
  for (const q of pool) {
    const section = sectionOf(classLevel, q.topicNumber) as SectionKey;
    const bucket = poolBySection.get(section) ?? [];
    bucket.push(q);
    poolBySection.set(section, bucket);
  }
  const poolSizeBySection = Object.fromEntries(
    (["mental_ability", "arithmetic", "language", "general_knowledge"] as SectionKey[]).map((s) => [s, poolBySection.get(s)?.length ?? 0])
  ) as Record<SectionKey, number>;

  const usage = new Map<string, number>();
  const result: BuiltSection[][] = [];
  for (let setNumber = 1; setNumber <= sets; setNumber++) {
    const built = buildOneSet(poolBySection, pattern, usage);
    if (built.every((s) => s.questions.length === 0)) break;
    result.push(built);
  }

  return { clearedTopicCount: clearedTopics.length, poolSize: pool.length, poolSizeBySection, pattern, sets: result };
}
