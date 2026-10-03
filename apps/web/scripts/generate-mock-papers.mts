/**
 * Generates a numbered batch of "mock paper" sets per exam board — shuffled,
 * proportionally-sampled sets of real, verified questions with separate
 * answer keys. This is the platform's giveaway sample-paper product:
 * students get a numbered set (e.g. "Set 7 of 20") rather than a single
 * one-off sample, so the same exam/class/language can offer many distinct
 * sittings without the generator re-running from scratch each time.
 *
 * This is NOT the sellable "20 Sample Papers" book product (see
 * generate-sample-paper-books.mts) — that one binds each paper with a
 * matching OMR sheet and withholds the answer key entirely (scored only via
 * a logged-in OMR scan), by deliberate product decision. This script's
 * output (paper + a plain answer-key PDF, both freely downloadable) is
 * meant for lighter-weight giveaways, e.g. a social-media lead magnet.
 *
 * ZERO ERROR TOLERANCE FOR CUSTOMER-FACING OUTPUT: only draws from topics
 * listed in QUESTION_BANK_ROOT/_review/SECOND_PASS_CLEARED.json — see
 * lib/mockPaperSelection.mts for the shared gating/picking logic both this
 * script and generate-sample-paper-books.mts build on.
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

import type { QuestionBookletClassLevel, QuestionBookletExamType } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { QUESTION_BOOKLET_EXAM_TYPES } = engineRuntime as unknown as typeof import("@vedicneev/engine");

import { renderToBuffer } from "@react-pdf/renderer";
import { registerFontIfNeeded, buildPdfStyles, PDF_LANGUAGE_LABEL } from "./lib/pdfFonts.mjs";
import { buildMockPaperAnswerKeyDocument, buildMockPaperDocument } from "./lib/mockPaperDocument.mjs";
import { EXAM_LABEL, selectSets } from "./lib/mockPaperSelection.mjs";

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

async function main() {
  const { exam, classLevel, lang, count, sets } = parseArgs();
  const { clearedTopicCount, poolSize, sets: builtSets } = selectSets(exam, classLevel, lang, count, sets);

  console.log(`${EXAM_LABEL[exam]} Class ${classLevel} (${lang}): ${clearedTopicCount} second-pass-cleared topic(s) on this exam's syllabus.`);
  if (poolSize === 0) {
    console.log("Nothing eligible yet — no mock papers generated. Clear more topics in SECOND_PASS_CLEARED.json and re-run.");
    return;
  }
  console.log(`Pooled ${poolSize} unique eligible questions.`);
  const totalNeeded = count * sets;
  if (poolSize < totalNeeded) {
    console.warn(`Pool has ${poolSize} unique questions but ${sets} sets × ${count} questions need ${totalNeeded} — some questions will repeat across sets (rotation with light reuse), spread as evenly as possible.`);
  } else {
    console.log(`Pool is large enough for all ${sets} sets to be fully distinct from each other.`);
  }

  const fontFamily = registerFontIfNeeded(lang);
  const styles = buildPdfStyles(fontFamily);
  const examSlug = exam.toLowerCase();
  const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "mock-papers", `${examSlug}-class-${classLevel}-${lang}`);
  fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < builtSets.length; i++) {
    const setNumber = i + 1;
    const selected = builtSets[i]!;
    const letterCounts: Record<string, number> = {};
    for (const q of selected) letterCounts[q.correctOption] = (letterCounts[q.correctOption] ?? 0) + 1;
    console.log(`  Set ${setNumber}: ${selected.length} questions, answer-key letters ${JSON.stringify(letterCounts)}`);

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
  }

  console.log(`\nWrote ${builtSets.length} set(s) (paper + answer key) to apps/web/public/mock-papers/${examSlug}-class-${classLevel}-${lang}/`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
