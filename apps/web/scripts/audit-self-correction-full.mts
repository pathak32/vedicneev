/**
 * Full, non-truncated self-correction-artifact report across a topic range.
 *
 * scanForSelfCorrectionArtifacts (questionBookletSchema.ts) already gates
 * packaging — package-question-books.mts/mockPaperSelection.mts print it,
 * but only the first ~20 findings (and package-question-books.mts --dry-run
 * also pays the full PDF-render cost even to get that). This script reads
 * the raw topic files directly, with no rendering, and prints EVERY finding
 * plus per-topic and grand totals — needed to actually scope the ~207-
 * question cleanup (topics 10, 11, 47, 52, and others) before splitting the
 * rewrite work across topics.
 *
 * Run with:
 *   npx tsx apps/web/scripts/audit-self-correction-full.mts [--class=6|9] [--lang=en|hi] [--from=1] [--to=72]
 * Defaults to --class=6 --lang=en --from=1 --to=72. Reads directly from
 * QUESTIONS_ROOT (same env override as the packaging scripts) — no DB, no
 * Supabase, nothing is written or uploaded.
 */
import fs from "node:fs";
import path from "node:path";

import type { validateQuestionBookletTopic, scanForSelfCorrectionArtifacts, QuestionBookletClassLevel } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { validateQuestionBookletTopic: validateTopic, scanForSelfCorrectionArtifacts: scanArtifacts } =
  engineRuntime as unknown as typeof import("@vedicneev/engine");

const QUESTIONS_ROOT = process.env.QUESTION_BANK_ROOT || path.join("D:\\Projects\\notes handwritten", "questions");

function parseArgs() {
  const get = (name: string, fallback: string) => {
    const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
    return arg ? arg.split("=")[1]! : fallback;
  };
  const classLevel = Number(get("class", "6")) as QuestionBookletClassLevel;
  const lang = get("lang", "en") as "en" | "hi";
  const from = Number(get("from", "1"));
  const to = Number(get("to", "72"));
  return { classLevel, lang, from, to };
}

function main() {
  const { classLevel, lang, from, to } = parseArgs();
  let grandTotal = 0;
  let topicsWithFindings = 0;
  const perTopicCounts: { topic: number; count: number }[] = [];

  for (let topicNumber = from; topicNumber <= to; topicNumber++) {
    const filePath = path.join(QUESTIONS_ROOT, `class${classLevel}`, lang, `topic-${topicNumber}.json`);
    if (!fs.existsSync(filePath)) continue;
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const { ok, questions, errors } = validateTopic(raw);
    if (!ok) {
      console.log(`\n=== topic-${topicNumber}.json — STRUCTURAL ERRORS, skipped: ${errors.map((e) => e.message).join("; ")} ===`);
      continue;
    }
    const flags = scanArtifacts(questions);
    if (flags.length === 0) continue;

    topicsWithFindings++;
    grandTotal += flags.length;
    perTopicCounts.push({ topic: topicNumber, count: flags.length });

    console.log(`\n=== topic-${topicNumber}.json — ${flags.length} flagged of ${questions.length} total ===`);
    for (const f of flags) {
      console.log(`  Q${f.questionNumber} — "${f.matchedPhrase}": "...${f.excerpt}..."`);
    }
  }

  console.log(`\n\n===== SUMMARY (class${classLevel}/${lang}, topics ${from}-${to}) =====`);
  console.log(`Topics with findings: ${topicsWithFindings}`);
  console.log(`Grand total flagged questions: ${grandTotal}`);
  console.log(`Per-topic breakdown: ${perTopicCounts.map((t) => `topic-${t.topic}:${t.count}`).join(", ")}`);
}

main();
