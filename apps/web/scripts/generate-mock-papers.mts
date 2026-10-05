/**
 * Generates a numbered batch of "mock paper" sets per exam board — real
 * exam-pattern sections (see lib/mockPaperSelection.mts's EXAM_PATTERNS),
 * proportionally-sampled real verified questions, with a separate answer
 * key PDF. This is the platform's giveaway sample-paper product: students
 * get a numbered set (e.g. "Set 7 of 20") rather than a single one-off
 * sample, so the same exam/class/language can offer many distinct sittings
 * without the generator re-running from scratch each time.
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
 *   npx tsx apps/web/scripts/generate-mock-papers.mts --exam=JNVST --class=6 --lang=en [--sets=20]
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
import { buildMockPaperAnswerKeyDocument, buildMockPaperDocument, type MockPaperMeta } from "./lib/mockPaperDocument.mjs";
import { EXAM_LABEL, selectSets } from "./lib/mockPaperSelection.mjs";
import { randomRollNumber } from "./lib/omrSheetDocument.mjs";

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
  const sets = Number(get("sets", "20"));
  return { exam, classLevel, lang, sets };
}

async function main() {
  const { exam, classLevel, lang, sets } = parseArgs();
  const { clearedTopicCount, poolSizeBySection, pattern, sets: builtSets } = selectSets(exam, classLevel, lang, sets);

  console.log(`${EXAM_LABEL[exam]} Class ${classLevel} (${lang}): ${clearedTopicCount} second-pass-cleared topic(s) available.`);
  console.log(`Pool by section: ${JSON.stringify(poolSizeBySection)}`);
  if (builtSets.length === 0) {
    console.log("Nothing eligible yet — no mock papers generated. Clear more topics in SECOND_PASS_CLEARED.json and re-run.");
    return;
  }
  if (builtSets.length < sets) {
    console.warn(`Only ${builtSets.length} of the requested ${sets} sets could be built — at least one section's pool ran out entirely.`);
  }

  const fontFamily = registerFontIfNeeded(lang);
  const styles = buildPdfStyles(fontFamily);
  const examSlug = exam.toLowerCase();
  const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "mock-papers", `${examSlug}-class-${classLevel}-${lang}`);
  fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < builtSets.length; i++) {
    const setNumber = i + 1;
    const sections = builtSets[i]!;
    const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
    const totalMarks = sections.reduce((sum, s) => sum + s.questions.length * s.marksEach, 0);
    console.log(`  Set ${setNumber}: ${totalQuestions} questions across ${sections.length} sections, ${totalMarks} marks.`);

    const meta: MockPaperMeta = {
      examLabel: EXAM_LABEL[exam],
      classLevel,
      languageLabel: PDF_LANGUAGE_LABEL[lang],
      durationMinutes: pattern.durationMinutes,
      negativeMarking: pattern.negativeMarking,
      totalMarks,
      totalQuestions,
      setLabel: sets > 1 ? `Set ${setNumber} of ${sets}` : undefined,
      rollNumber: randomRollNumber(6),
    };

    const paperBuffer = await renderToBuffer(buildMockPaperDocument(meta, sections, styles));
    const keyBuffer = await renderToBuffer(buildMockPaperAnswerKeyDocument(meta, sections, styles));

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
