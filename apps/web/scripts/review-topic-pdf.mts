/**
 * Renders a single topic to a real, readable PDF on your own machine —
 * for the human second-pass review itself, which has to happen BEFORE a
 * topic is marked cleared in _review/SECOND_PASS_CLEARED.json. The real
 * packaging script (package-question-books.mts) deliberately only
 * renders topics that are ALREADY cleared, which is backwards for this:
 * you can't read a topic as a finished PDF to decide whether to clear it
 * if the renderer refuses to touch it until it's cleared. This script
 * has no such gate — it renders exactly the topic you ask for, however
 * it currently looks, cleared or not.
 *
 * Writes no DB, no Supabase upload — just a PDF file on disk you can
 * open in any normal PDF reader and read question-by-question, same
 * layout as what a buyer would eventually see.
 *
 * Run with:
 *   npx tsx apps/web/scripts/review-topic-pdf.mts --class=9 --lang=hi --topic=13
 * Writes to ./review-pdfs/class9-hi-topic-13.pdf (relative to wherever
 * you run the command from) unless --out=<path> is given.
 */
import fs from "node:fs";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";

import type { validateQuestionBookletTopic, extractTopicTitle, QuestionBookletClassLevel } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { validateQuestionBookletTopic: validateTopic, extractTopicTitle: getTitle } =
  engineRuntime as unknown as typeof import("@vedicneev/engine");

import { registerFontIfNeeded, buildPdfStyles } from "./lib/pdfFonts.mjs";
import { buildTopicDocument } from "./lib/questionBookletDocument.mjs";

const QUESTIONS_ROOT = process.env.QUESTION_BANK_ROOT || path.join("D:\\Projects\\notes handwritten", "questions");

function parseArgs() {
  const get = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
  const classLevel = Number(get("class") ?? "6") as QuestionBookletClassLevel;
  const lang = (get("lang") ?? "en") as "en" | "hi";
  const topicNumber = Number(get("topic"));
  if (!topicNumber) throw new Error("--topic=<number> is required");
  const out = get("out") ?? path.join("review-pdfs", `class${classLevel}-${lang}-topic-${topicNumber}.pdf`);
  return { classLevel, lang, topicNumber, out };
}

async function main() {
  const { classLevel, lang, topicNumber, out } = parseArgs();
  const filePath = path.join(QUESTIONS_ROOT, `class${classLevel}`, lang, `topic-${topicNumber}.json`);
  if (!fs.existsSync(filePath)) throw new Error(`Not found: ${filePath}`);

  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const { ok, questions, errors } = validateTopic(raw);
  if (!ok) {
    console.error(`topic-${topicNumber}.json has structural errors — fix these before review:`);
    for (const e of errors) console.error(`  Q${e.questionNumber ?? "?"}: ${e.message}`);
    process.exit(1);
  }

  const topicTitle = getTitle(raw, topicNumber);
  const pdfLang = lang === "hi" ? "hi" : "en";
  const fontFamily = registerFontIfNeeded(pdfLang);
  const styles = buildPdfStyles(fontFamily);
  const doc = buildTopicDocument(classLevel, { topicNumber, topicTitle, questions }, fontFamily, styles);
  const buffer = await renderToBuffer(doc);

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buffer);
  console.log(`Wrote ${questions.length} questions to: ${path.resolve(out)}`);
  console.log(`Topic: "${topicTitle}"`);
}

main();
