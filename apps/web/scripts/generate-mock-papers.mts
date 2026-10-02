/**
 * Generates a free sample "mock paper" per exam board — a shuffled,
 * proportionally-sampled set of real, verified questions with a separate
 * answer key — meant to be given away directly (e.g. in a DM to a social
 * media follower who asks for a sample), not sold through the Store.
 *
 * ZERO ERROR TOLERANCE FOR CUSTOMER-FACING OUTPUT: this script only draws
 * from topics listed in NOTES_ROOT/_review/SECOND_PASS_CLEARED.json — the
 * manifest of topics that have been through the independent blind
 * second-pass review (VERIFY_INSTRUCTIONS.md), not just the first
 * automated pass. A topic that has only had the first pass is NOT eligible
 * here even if it has zero structural errors, because this session found
 * concrete, real errors (a systemic 106-question premise defect, several
 * wrong answers) that only the second pass caught. As more topics clear
 * the second pass, add them to that manifest and this script's available
 * question pool grows automatically — no code change needed.
 *
 * Run with: npx tsx apps/web/scripts/generate-mock-papers.mts --exam=JNVST --class=6 --lang=en [--count=30]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { extractTopicTitle, isTopicInExamSyllabus, sectionKeyForTopic, validateQuestionBookletTopic, QuestionBookletClassLevel, QuestionBookletExamType, QuestionBookletQuestion } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { extractTopicTitle: extractTitleImpl, isTopicInExamSyllabus: inSyllabus, sectionKeyForTopic: sectionOf, validateQuestionBookletTopic: validateTopic, QUESTION_BOOKLET_EXAM_TYPES } =
  engineRuntime as unknown as typeof import("@vedicneev/engine");

import { renderToBuffer } from "@react-pdf/renderer";
import { registerFontIfNeeded, buildPdfStyles, PDF_LANGUAGE_LABEL } from "./lib/pdfFonts.mjs";
import { buildMockPaperAnswerKeyDocument, buildMockPaperDocument, type MockPaperQuestion } from "./lib/mockPaperDocument.mjs";

const NOTES_ROOT = "D:\\Projects\\notes handwritten\\questions";
const CLEARED_MANIFEST = path.join(NOTES_ROOT, "_review", "SECOND_PASS_CLEARED.json");

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
  return { exam, classLevel, lang, count };
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
  const filePath = path.join(NOTES_ROOT, `class${classLevel}`, lang, `topic-${topicNumber}.json`);
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

/** Samples up to `count` questions from the pool, split as evenly as possible across the sections actually present, so one section doesn't dominate just because it has more cleared topics. */
function sampleProportionally(pool: MockPaperQuestion[], count: number, classLevel: QuestionBookletClassLevel): MockPaperQuestion[] {
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
    picked.push(...shuffle(bySection.get(section)!).slice(0, perSection));
  }
  return shuffle(picked).slice(0, count);
}

async function main() {
  const { exam, classLevel, lang, count } = parseArgs();
  const clearedTopics = loadClearedTopics(classLevel, lang).filter((t) => inSyllabus(exam, classLevel, t));

  console.log(`${EXAM_LABEL[exam]} Class ${classLevel} (${lang}): ${clearedTopics.length} second-pass-cleared topic(s) on this exam's syllabus.`);
  if (clearedTopics.length === 0) {
    console.log("Nothing eligible yet — no mock paper generated. Clear more topics in SECOND_PASS_CLEARED.json and re-run.");
    return;
  }

  const pool: MockPaperQuestion[] = [];
  for (const t of clearedTopics) pool.push(...loadTopicQuestions(classLevel, lang, t));
  console.log(`Pooled ${pool.length} eligible questions across ${new Set(pool.map((q) => sectionOf(classLevel, q.topicNumber))).size} section(s).`);

  if (pool.length < count) {
    console.warn(`Only ${pool.length} questions available, fewer than the requested ${count} — the paper will be shorter than usual.`);
  }

  const selected = sampleProportionally(pool, count, classLevel);
  if (selected.length === 0) {
    console.log("No questions selected — nothing to render.");
    return;
  }

  const fontFamily = registerFontIfNeeded(lang);
  const styles = buildPdfStyles(fontFamily);
  const meta = {
    examLabel: EXAM_LABEL[exam],
    classLevel,
    languageLabel: PDF_LANGUAGE_LABEL[lang],
    totalMarks: selected.length,
    durationMinutes: Math.max(30, selected.length * 1.5),
  };

  const paperBuffer = await renderToBuffer(buildMockPaperDocument(meta, selected, styles));
  const keyBuffer = await renderToBuffer(buildMockPaperAnswerKeyDocument(meta, selected, styles));

  const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "mock-papers");
  fs.mkdirSync(outDir, { recursive: true });
  const slug = `${exam.toLowerCase()}-class-${classLevel}-${lang}-mock-sample`;
  fs.writeFileSync(path.join(outDir, `${slug}.pdf`), paperBuffer);
  fs.writeFileSync(path.join(outDir, `${slug}-answer-key.pdf`), keyBuffer);

  console.log(`Wrote ${selected.length}-question paper + answer key to apps/web/public/mock-papers/${slug}*.pdf`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
