/**
 * Fast, PDF-free diagnostic: scans specific topic files for the exact
 * character/question causing scanForUnsupportedGlyphs to flag them, without
 * the heavy per-topic + compiled-book PDF rendering that package-question-
 * books.mts --dry-run does (that script renders everything even in dry-run
 * mode, which is overkill for just reading off flagged characters).
 *
 * Run with:
 *   npx tsx apps/web/scripts/inspect-glyphs.mts --class=6 --lang=en --topics=10,11,47,52
 */
import fs from "node:fs";
import path from "node:path";

import type { validateQuestionBookletTopic, scanForUnsupportedGlyphs, QuestionBookletClassLevel } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { validateQuestionBookletTopic: validateTopic, scanForUnsupportedGlyphs: scanGlyphs } =
  engineRuntime as unknown as typeof import("@vedicneev/engine");

const QUESTIONS_ROOT = process.env.QUESTION_BANK_ROOT || path.join("D:\\Projects\\notes handwritten", "questions");

function parseArgs() {
  const get = (name: string, fallback: string) => {
    const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
    return arg ? arg.split("=")[1]! : fallback;
  };
  const classLevel = Number(get("class", "6")) as QuestionBookletClassLevel;
  const lang = get("lang", "en") as "en" | "hi";
  const topics = get("topics", "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
  return { classLevel, lang, topics };
}

function main() {
  const { classLevel, lang, topics } = parseArgs();
  for (const topicNumber of topics) {
    const filePath = path.join(QUESTIONS_ROOT, `class${classLevel}`, lang, `topic-${topicNumber}.json`);
    console.log(`\n=== topic-${topicNumber}.json ===`);
    if (!fs.existsSync(filePath)) {
      console.log("  MISSING");
      continue;
    }
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const { ok, questions, errors } = validateTopic(raw);
    if (!ok) {
      console.log(`  STRUCTURAL ERRORS: ${errors.map((e) => e.message).join("; ")}`);
      continue;
    }
    const flags = scanGlyphs(questions);
    console.log(`  ${questions.length} total questions, ${flags.length} flagged`);
    for (const f of flags.slice(0, 15)) {
      console.log(`  Q${f.questionNumber} (${f.field}) — char "${f.char}" (U+${f.codePoint.toString(16).toUpperCase().padStart(4, "0")}): "...${f.excerpt}..."`);
    }
    if (flags.length > 15) console.log(`  ...and ${flags.length - 15} more.`);
  }
}

main();
