/**
 * Scopes the "class9/hi topics are untranslated raw English" problem
 * (_review/OPEN_ISSUES.md, "URGENT: class9/hi translation script is
 * broken") before any retranslation work starts.
 *
 * Structural validation and the artifact/glyph scanners only check shape
 * and known phrases — they don't know what language a field is actually
 * written in, which is exactly how untranslated English got past both
 * checks and into files sitting under .../class9/hi/. This script uses a
 * much more direct signal: a genuinely Hindi explanation or question
 * contains Devanagari script (U+0900-U+097F); a file that's really just
 * English text saved under the hi/ path won't have a single Devanagari
 * character anywhere in those fields (numerals/A-D option letters/English
 * loanwords are expected and ignored — this only checks for the presence
 * of ANY Devanagari character per question, not full-sentence correctness).
 *
 * Run with:
 *   npx tsx apps/web/scripts/audit-hindi-translation.mts [--class=9|6] [--from=1] [--to=72]
 * Defaults to --class=9 --from=1 --to=72 (the paused combo). Reads directly
 * from QUESTIONS_ROOT (same env override as the packaging scripts) — no DB,
 * no Supabase, nothing is written or uploaded.
 */
import fs from "node:fs";
import path from "node:path";

import type { validateQuestionBookletTopic, extractTopicTitle, QuestionBookletClassLevel } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { validateQuestionBookletTopic: validateTopic, extractTopicTitle: getTitle } =
  engineRuntime as unknown as typeof import("@vedicneev/engine");

const QUESTIONS_ROOT = process.env.QUESTION_BANK_ROOT || path.join("D:\\Projects\\notes handwritten", "questions");
const DEVANAGARI_RE = /[\u0900-\u097F]/;

function parseArgs() {
  const get = (name: string, fallback: string) => {
    const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
    return arg ? arg.split("=")[1]! : fallback;
  };
  const classLevel = Number(get("class", "9")) as QuestionBookletClassLevel;
  const from = Number(get("from", "1"));
  const to = Number(get("to", "72"));
  return { classLevel, from, to };
}

function main() {
  const { classLevel, from, to } = parseArgs();
  let totalTopics = 0;
  let totalQuestions = 0;
  let totalUntranslated = 0;
  let fullyFakeTopics = 0;
  let partiallyFakeTopics = 0;
  let cleanTopics = 0;

  for (let topicNumber = from; topicNumber <= to; topicNumber++) {
    const filePath = path.join(QUESTIONS_ROOT, `class${classLevel}`, "hi", `topic-${topicNumber}.json`);
    if (!fs.existsSync(filePath)) continue;
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const { ok, questions, errors } = validateTopic(raw);
    if (!ok) {
      console.log(`\n=== topic-${topicNumber}.json — STRUCTURAL ERRORS, skipped: ${errors.map((e) => e.message).join("; ")} ===`);
      continue;
    }
    totalTopics++;
    totalQuestions += questions.length;

    const untranslated = questions.filter((q) => !DEVANAGARI_RE.test(q.question) && !DEVANAGARI_RE.test(q.explanation));
    totalUntranslated += untranslated.length;

    const title = getTitle(raw, topicNumber);
    if (untranslated.length === 0) {
      cleanTopics++;
      console.log(`topic-${topicNumber} "${title}": OK — ${questions.length}/${questions.length} have Devanagari text`);
    } else if (untranslated.length === questions.length) {
      fullyFakeTopics++;
      console.log(`topic-${topicNumber} "${title}": FULLY UNTRANSLATED — 0/${questions.length} have Devanagari text`);
    } else {
      partiallyFakeTopics++;
      console.log(`topic-${topicNumber} "${title}": PARTIAL — ${untranslated.length}/${questions.length} untranslated (Q${untranslated.slice(0, 10).map((q) => q.questionNumber).join(",")}${untranslated.length > 10 ? ",..." : ""})`);
    }
  }

  console.log(`\n\n===== SUMMARY (class${classLevel}/hi, topics ${from}-${to}) =====`);
  console.log(`Topics scanned: ${totalTopics} (clean: ${cleanTopics}, fully untranslated: ${fullyFakeTopics}, partially untranslated: ${partiallyFakeTopics})`);
  console.log(`Total questions: ${totalQuestions}, total untranslated: ${totalUntranslated}`);
}

main();
