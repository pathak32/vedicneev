/**
 * Renders one or more topics to real, readable PDFs on your own machine —
 * for the human second-pass review itself, which has to happen BEFORE a
 * topic is marked cleared in _review/SECOND_PASS_CLEARED.json. The real
 * packaging script (package-question-books.mts) deliberately only
 * renders topics that are ALREADY cleared, which is backwards for this:
 * you can't read a topic as a finished PDF to decide whether to clear it
 * if the renderer refuses to touch it until it's cleared. This script
 * has no such gate — it renders exactly the topics you ask for, however
 * they currently look, cleared or not.
 *
 * Writes no DB, no Supabase upload — just PDF files on disk you can open
 * in any normal PDF reader and read question-by-question, same layout
 * as what a buyer would eventually see.
 *
 * Run with:
 *   npx tsx apps/web/scripts/review-topic-pdf.mts --class=9 --lang=hi --topic=13
 *   npx tsx apps/web/scripts/review-topic-pdf.mts --class=9 --lang=hi --topics=1-72   (all of them, or any list/range: 1,2,5-10)
 * Writes to ./review-pdfs/class<N>-<lang>-topic-<N>.pdf (relative to
 * wherever you run the command from) unless --out-dir=<path> is given.
 * A missing or structurally broken topic is reported and skipped —
 * it does not stop the rest of the batch.
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
  const outDir = get("out-dir") ?? "review-pdfs";

  const single = get("topic");
  const multi = get("topics");
  if (!single && !multi) throw new Error("--topic=<number> or --topics=<list/range, e.g. 1-72 or 1,2,5-10> is required");

  const topics = new Set<number>();
  if (single) topics.add(Number(single));
  if (multi) {
    for (const part of multi.split(",")) {
      if (part.includes("-")) {
        const [from, to] = part.split("-").map(Number);
        for (let t = from!; t <= to!; t++) topics.add(t);
      } else {
        topics.add(Number(part));
      }
    }
  }
  return { classLevel, lang, outDir, topics: [...topics].sort((a, b) => a - b) };
}

async function renderOne(classLevel: QuestionBookletClassLevel, lang: "en" | "hi", topicNumber: number, outDir: string) {
  const filePath = path.join(QUESTIONS_ROOT, `class${classLevel}`, lang, `topic-${topicNumber}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`topic-${topicNumber}: SKIPPED — file not found`);
    return;
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const { ok, questions, errors } = validateTopic(raw);
  if (!ok) {
    console.log(`topic-${topicNumber}: SKIPPED — structural errors: ${errors.map((e) => e.message).join("; ")}`);
    return;
  }

  const topicTitle = getTitle(raw, topicNumber);
  const pdfLang = lang === "hi" ? "hi" : "en";
  const fontFamily = registerFontIfNeeded(pdfLang);
  const styles = buildPdfStyles(fontFamily);
  const doc = buildTopicDocument(classLevel, { topicNumber, topicTitle, questions }, fontFamily, styles);
  const buffer = await renderToBuffer(doc);

  const out = path.join(outDir, `class${classLevel}-${lang}-topic-${topicNumber}.pdf`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buffer);
  console.log(`topic-${topicNumber}: wrote ${questions.length} questions — "${topicTitle}" -> ${out}`);
}

async function main() {
  const { classLevel, lang, outDir, topics } = parseArgs();
  for (const topicNumber of topics) {
    await renderOne(classLevel, lang, topicNumber, outDir);
  }
  console.log(`\nDone. ${topics.length} topic(s) requested — check above for any skipped. Folder: ${path.resolve(outDir)}`);
}

main();
