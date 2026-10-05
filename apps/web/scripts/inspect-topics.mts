/**
 * Quick diagnostic dump for a range of topic files — prints the declared
 * title, question count, and first/last question text so a mismatch against
 * the canonical title list (packages/db/prisma/seed-study-note-pdfs.ts's
 * CLASS_6_TITLES/CLASS_9_TITLES) is obvious at a glance.
 *
 * Built specifically to check topic-39.json (titled "Finding a Hidden Shape
 * Among Clutter" but found by audit-reasoning-content.mts to contain HCF/LCM
 * content — topics 40/41's real subjects) against its neighbors: is 39 a
 * duplicate of 40/41, and are 40/41 themselves fine, empty, or also wrong?
 *
 * Run with:
 *   npx tsx apps/web/scripts/inspect-topics.mts --class=6 --lang=en --from=38 --to=41
 */
import fs from "node:fs";
import path from "node:path";

import type { extractTopicTitle, validateQuestionBookletTopic, QuestionBookletClassLevel } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { extractTopicTitle: getTitle, validateQuestionBookletTopic: validateTopic } =
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
  for (let topicNumber = from; topicNumber <= to; topicNumber++) {
    const filePath = path.join(QUESTIONS_ROOT, `class${classLevel}`, lang, `topic-${topicNumber}.json`);
    console.log(`\n=== topic-${topicNumber}.json ===`);
    if (!fs.existsSync(filePath)) {
      console.log("  MISSING — file does not exist.");
      continue;
    }
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
      console.log(`  INVALID JSON: ${err instanceof Error ? err.message : err}`);
      continue;
    }
    const title = getTitle(raw, topicNumber);
    const { ok, questions, errors } = validateTopic(raw);
    console.log(`  declared title: "${title}"`);
    console.log(`  structurally valid: ${ok}${ok ? "" : ` (${errors.length} error(s): ${errors.slice(0, 3).map((e) => e.message).join("; ")}${errors.length > 3 ? "..." : ""})`}`);
    console.log(`  question count: ${questions.length}`);
    if (questions.length > 0) {
      console.log(`  Q${questions[0]!.questionNumber}: "${questions[0]!.question}"`);
      const last = questions[questions.length - 1]!;
      console.log(`  Q${last.questionNumber}: "${last.question}"`);
    }
  }
}

main();
