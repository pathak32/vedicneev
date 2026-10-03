/**
 * Generates a numbered batch of "mock paper" sets per exam board — shuffled,
 * proportionally-sampled sets of real, verified questions with separate
 * answer keys. This is the platform's sellable/giveaway sample-paper
 * product: students get a numbered set (e.g. "Set 7 of 20") rather than a
 * single one-off sample, so the same exam/class/language can offer many
 * distinct sittings without the generator re-running from scratch each time.
 *
 * ZERO ERROR TOLERANCE FOR CUSTOMER-FACING OUTPUT: this script only draws
 * from topics listed in QUESTION_BANK_ROOT/_review/SECOND_PASS_CLEARED.json
 * — the manifest of topics that have been through the independent blind
 * second-pass review (VERIFY_INSTRUCTIONS.md), not just the first automated
 * pass. As more topics clear the second pass, this script's available
 * question pool grows automatically — no code change needed.
 *
 * ROTATION WITH LIGHT REUSE: across the N sets generated in one run, every
 * question is drawn from the least-used-so-far pool first (ties broken
 * randomly), so the whole eligible pool cycles through roughly evenly
 * before anything repeats. If the pool is large enough relative to
 * sets × questions-per-set, this behaves like strict no-repeat; if the pool
 * is smaller, repeats are spread evenly across sets rather than concentrated
 * in a few questions appearing in every set. Usage counts are tracked only
 * within a single run — re-running the script starts the rotation over.
 *
 * Run with:
 *   npx tsx apps/web/scripts/generate-mock-papers.mts --exam=JNVST --class=6 --lang=en [--sets=20] [--count=30]
 *
 * QUESTION_BANK_ROOT overrides where the question bank is checked out
 * (defaults to the user's local "D:\...\notes handwritten\questions" path).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { isTopicInExamSyllabus, sectionKeyForTopic, validateQuestionBookletTopic, QuestionBookletClassLevel, QuestionBookletExamType, QuestionBookletQuestion } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { isTopicInExamSyllabus: inSyllabus, sectionKeyForTopic: sectionOf, validateQuestionBookletTopic: validateTopic, QUESTION_BOOKLET_EXAM_TYPES } =
  engineRuntime as unknown as typeof import("@vedicneev/engine");

import { renderToBuffer } from "@react-pdf/renderer";
import { registerFontIfNeeded, buildPdfStyles, PDF_LANGUAGE_LABEL } from "./lib/pdfFonts.mjs";
import { buildMockPaperAnswerKeyDocument, buildMockPaperDocument, type MockPaperQuestion } from "./lib/mockPaperDocument.mjs";

// Overridable for environments where the question bank isn't under the
// user's local Windows path (e.g. a cloud session with the content checked
// out as its own repo, whose root IS the questions directory).
const QUESTIONS_ROOT = process.env.QUESTION_BANK_ROOT || path.join("D:\\Projects\\notes handwritten", "questions");
const CLEARED_MANIFEST = path.join(QUESTIONS_ROOT, "_review", "SECOND_PASS_CLEARED.json");

const EXAM_LABEL: Record<QuestionBookletExamType, string> = {
  JNVST: "JNVST",
  RMS: "RMS",
  AISSEE: "AISSEE (Sainik School)",
  UPSS: "UPSS",
};

function parseArgs() {
  const get = (name: string, fallback?: string) => {
    const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
    return arg ? arg.split("=")[1]! : fallback;
  };
  const exam = (get("exam") ?? "").toUpperCase() as QuestionBookletExamType;
  if (!QUESTION_BOOKLET_EXAM_TYPES.includes(exam)) {
    console.error(`--exam must be one of: ${QUESTION_BOOKLET_EXAM_TYPES.join(", ")}`);
    process.exit(1);
  }
  const classLevel = Number(get("class", "6")) as QuestionBookletClassLevel;
  if (classLevel !== 6 && classLevel !== 9) {
    console.error("--class must be 6 or 9");
    process.exit(1);
  }
  const lang = (get("lang", "en") as "en" | "hi");
  const count = Number(get("count", "30"));
  const sets = Number(get("sets", "20"));
  return { exam, classLevel, lang, count, sets };
}

interface ClearedEntry {
  classLevel: number;
  language: string;
  topics: number[];
}

function loadClearedTopics(classLevel: QuestionBookletClassLevel, lang: "en" | "hi"): number[] {
  if (!fs.existsSync(CLEARED_MANIFEST)) {
    console.error(`No second-pass-cleared manifest found at ${CLEARED_MANIFEST} — nothing is eligible for a mock paper yet.`);
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

/** Builds one set: samples proportionally across sections (so one section doesn't dominate), applying the rotation-with-light-reuse pick within each section, then shuffles final order and reports the answer-key letter distribution. */
function buildOneSet(pool: MockPaperQuestion[], count: number, classLevel: QuestionBookletClassLevel, usage: Map<string, number>, setNumber: number): MockPaperQuestion[] {
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
  const final = shuffle(picked).slice(0, count);

  const letterCounts: Record<string, number> = {};
  for (const q of final) letterCounts[q.correctOption] = (letterCounts[q.correctOption] ?? 0) + 1;
  console.log(`  Set ${setNumber}: ${final.length} questions, answer-key letters ${JSON.stringify(letterCounts)}`);

  return final;
}

async function main() {
  const { exam, classLevel, lang, count, sets } = parseArgs();
  const clearedTopics = loadClearedTopics(classLevel, lang).filter((t) => inSyllabus(exam, classLevel, t));

  console.log(`${EXAM_LABEL[exam]} Class ${classLevel} (${lang}): ${clearedTopics.length} second-pass-cleared topic(s) on this exam's syllabus.`);
  if (clearedTopics.length === 0) {
    console.log("Nothing eligible yet — no mock papers generated. Clear more topics in SECOND_PASS_CLEARED.json and re-run.");
    return;
  }

  const rawPool: MockPaperQuestion[] = [];
  for (const t of clearedTopics) rawPool.push(...loadTopicQuestions(classLevel, lang, t));
  const pool = dedupeByQuestionText(rawPool);
  console.log(`Pooled ${pool.length} unique eligible questions across ${new Set(pool.map((q) => sectionOf(classLevel, q.topicNumber))).size} section(s).`);

  const totalNeeded = count * sets;
  if (pool.length < totalNeeded) {
    console.warn(`Pool has ${pool.length} unique questions but ${sets} sets × ${count} questions need ${totalNeeded} — some questions will repeat across sets (rotation with light reuse), spread as evenly as possible.`);
  } else {
    console.log(`Pool is large enough for all ${sets} sets to be fully distinct from each other.`);
  }

  const fontFamily = registerFontIfNeeded(lang);
  const styles = buildPdfStyles(fontFamily);
  const examSlug = exam.toLowerCase();
  const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "mock-papers", `${examSlug}-class-${classLevel}-${lang}`);
  fs.mkdirSync(outDir, { recursive: true });

  const usage = new Map<string, number>();
  let written = 0;
  for (let setNumber = 1; setNumber <= sets; setNumber++) {
    const selected = buildOneSet(pool, count, classLevel, usage, setNumber);
    if (selected.length === 0) {
      console.log(`  Set ${setNumber}: no questions available — stopping early.`);
      break;
    }

    const meta = {
      examLabel: EXAM_LABEL[exam],
      classLevel,
      languageLabel: PDF_LANGUAGE_LABEL[lang],
      totalMarks: selected.length,
      durationMinutes: Math.max(30, selected.length * 1.5),
      setLabel: sets > 1 ? `Set ${setNumber} of ${sets}` : undefined,
    };

    const paperBuffer = await renderToBuffer(buildMockPaperDocument(meta, selected, styles));
    const keyBuffer = await renderToBuffer(buildMockPaperAnswerKeyDocument(meta, selected, styles));

    const setSlug = String(setNumber).padStart(2, "0");
    fs.writeFileSync(path.join(outDir, `set-${setSlug}.pdf`), paperBuffer);
    fs.writeFileSync(path.join(outDir, `set-${setSlug}-answer-key.pdf`), keyBuffer);
    written++;
  }

  console.log(`\nWrote ${written} set(s) (paper + answer key) to apps/web/public/mock-papers/${examSlug}-class-${classLevel}-${lang}/`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
