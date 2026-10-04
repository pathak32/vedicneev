/**
 * Builds the sellable "20 Sample Papers" book: one combined PDF per
 * (exam, class, language) containing N complete REAL-exam-pattern papers
 * (see lib/mockPaperSelection.mts's EXAM_PATTERNS — sectioned, marked, and
 * timed like the actual exam, not a flat undifferentiated question list),
 * each immediately followed by its own OMR answer sheet with a randomly
 * generated roll number already bubbled in for exam-day realism — and NO
 * printed answer key anywhere in the book. By product decision: withholding
 * the key is deliberate, so a buyer has to log in and scan their filled OMR
 * sheet to see their score, which is the funnel into the paid subscription.
 * A student who wants an unscored take-home paper with an answer key
 * should use generate-mock-papers.mts instead — that's a different,
 * free-giveaway product with a different design intent.
 *
 * The real answer keys are written out as structured JSON to a path OUTSIDE
 * apps/web/public/ (never served as a static file) — printing one secret
 * right next to the public PDF defeats the whole point. That JSON is a
 * hand-off artifact for whatever stores it for the scan-and-grade API
 * (database row, admin upload, etc.) — not itself a served endpoint.
 *
 * Run with:
 *   npx tsx apps/web/scripts/generate-sample-paper-books.mts --exam=UPSS --class=6 --lang=en [--sets=20]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { OmrExamType, QuestionBookletClassLevel, QuestionBookletExamType } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { QUESTION_BOOKLET_EXAM_TYPES, generateOmrSheetSpec } = engineRuntime as unknown as typeof import("@vedicneev/engine");

import { Document, renderToBuffer } from "@react-pdf/renderer";
import { registerFontIfNeeded, buildPdfStyles, PDF_LANGUAGE_LABEL } from "./lib/pdfFonts.mjs";
import { buildMockPaperPage, type MockPaperMeta } from "./lib/mockPaperDocument.mjs";
import { buildOmrSheetPage, randomRollNumber } from "./lib/omrSheetDocument.mjs";
import { buildClosingPage, buildCoverPage } from "./lib/sampleBookCover.mjs";
import { EXAM_LABEL, selectSets, type BuiltSection } from "./lib/mockPaperSelection.mjs";

const React = (await import("react")).default;
const h = React.createElement;

const ROLL_NUMBER_DIGITS = 6;

/** The engine's OmrSheetSpec geometry doesn't vary by exam (examType is descriptive only), and the type doesn't include UPSS — "OTHER" is the honest value for it. */
const OMR_EXAM_TYPE: Record<QuestionBookletExamType, OmrExamType> = {
  JNVST: "JNVST",
  RMS: "RMS",
  AISSEE: "AISSEE",
  UPSS: "OTHER",
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
  const lang = get("lang", "en") as "en" | "hi";
  const sets = Number(get("sets", "20"));
  return { exam, classLevel, lang, sets };
}

interface AnswerKeyEntry {
  questionNumber: number;
  correctOption: string;
}

function flattenAnswerKey(sections: BuiltSection[]): AnswerKeyEntry[] {
  const out: AnswerKeyEntry[] = [];
  let n = 0;
  for (const section of sections) {
    for (const q of section.questions) {
      n++;
      out.push({ questionNumber: n, correctOption: q.correctOption });
    }
  }
  return out;
}

async function main() {
  const { exam, classLevel, lang, sets } = parseArgs();
  const { clearedTopicCount, poolSizeBySection, pattern, sets: builtSets } = selectSets(exam, classLevel, lang, sets);

  console.log(`${EXAM_LABEL[exam]} Class ${classLevel} (${lang}): ${clearedTopicCount} second-pass-cleared topic(s) available.`);
  console.log(`Pool by section: ${JSON.stringify(poolSizeBySection)}`);
  if (builtSets.length === 0) {
    console.log("Nothing eligible yet — no sample-paper book built. Clear more topics in SECOND_PASS_CLEARED.json and re-run.");
    return;
  }
  if (builtSets.length < sets) {
    console.warn(`Only ${builtSets.length} of the requested ${sets} sets could be built — at least one section's pool ran out entirely.`);
  }
  if (pattern.patternIsEstimated) {
    console.warn(`${EXAM_LABEL[exam]}'s section pattern is an estimate, not yet confirmed against an official notification — see EXAM_PATTERNS's comment in lib/mockPaperSelection.mts.`);
  }

  const fontFamily = registerFontIfNeeded(lang);
  const styles = buildPdfStyles(fontFamily);
  const languageLabel = PDF_LANGUAGE_LABEL[lang];
  const examLabel = EXAM_LABEL[exam];
  const examSlug = exam.toLowerCase();
  const bookTitle = `${examLabel} Class ${classLevel} — ${builtSets.length} Sample Papers with OMR Sheets${languageLabel ? ` (${languageLabel})` : ""}`;

  const pages = [buildCoverPage(bookTitle, examLabel, classLevel, languageLabel, builtSets.length, pattern, styles)];
  const answerKeysBySet: { setNumber: number; totalQuestions: number; answerKey: AnswerKeyEntry[] }[] = [];

  for (let i = 0; i < builtSets.length; i++) {
    const setNumber = i + 1;
    const sections = builtSets[i]!;
    const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
    const totalMarks = sections.reduce((sum, s) => sum + s.questions.length * s.marksEach, 0);
    const setLabel = `Set ${setNumber} of ${builtSets.length}`;
    const rollNumber = randomRollNumber(ROLL_NUMBER_DIGITS);

    const paperMeta: MockPaperMeta = {
      examLabel,
      classLevel,
      languageLabel,
      durationMinutes: pattern.durationMinutes,
      negativeMarking: pattern.negativeMarking,
      totalMarks,
      totalQuestions,
      setLabel,
      rollNumber,
    };
    pages.push(buildMockPaperPage(paperMeta, sections, styles));

    const omrSpec = generateOmrSheetSpec({
      examType: OMR_EXAM_TYPE[exam],
      totalQuestions,
      rollNumberDigits: ROLL_NUMBER_DIGITS,
    });
    pages.push(buildOmrSheetPage({ examLabel, classLevel, languageLabel, setLabel, rollNumber }, omrSpec));

    answerKeysBySet.push({ setNumber, totalQuestions, answerKey: flattenAnswerKey(sections) });
    console.log(`  Set ${setNumber}: ${totalQuestions} questions (${totalMarks} marks) across ${sections.length} sections + matching OMR sheet added to the book.`);
  }

  pages.push(buildClosingPage(examLabel, classLevel, styles));

  const bookBuffer = await renderToBuffer(h(Document, { title: bookTitle }, ...pages));

  const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
  const outDir = path.join(scriptsDir, "..", "public", "sample-paper-books");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${examSlug}-class-${classLevel}-${lang}.pdf`);
  fs.writeFileSync(outPath, bookBuffer);

  // Deliberately OUTSIDE apps/web/public/ — this is the secret the whole
  // product design depends on withholding from the PDF above.
  const keysDir = path.join(scriptsDir, "output", "sample-paper-answer-keys");
  fs.mkdirSync(keysDir, { recursive: true });
  const keysPath = path.join(keysDir, `${examSlug}-class-${classLevel}-${lang}.json`);
  fs.writeFileSync(keysPath, JSON.stringify({ exam, classLevel, language: lang, pattern, sets: answerKeysBySet }, null, 2));

  const sizeMb = (bookBuffer.length / 1024 / 1024).toFixed(1);
  console.log(`\nWrote book (${sizeMb}MB, ${builtSets.length} sets) to ${outPath}`);
  console.log(`Wrote answer keys (NOT public — do not serve this file) to ${keysPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
