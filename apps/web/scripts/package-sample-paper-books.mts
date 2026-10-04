/**
 * Packages the sellable "20 Sample Papers + OMR Sheets" book (see
 * generate-sample-paper-books.mts's own header for the product's design)
 * into real Product rows, one per (exam, class, language) combo that has
 * second-pass-cleared content — mirrors package-question-books.mts's
 * render-then-upload-then-upsert structure exactly, just for this product
 * instead of the full-corpus Question Bank.
 *
 * productType is "MOCK_SERIES": this book is genuinely a series of
 * complete, sectioned mock exam papers (not a topic-by-topic reference,
 * which is what QUESTION_BOOKLET already means in this schema), and
 * MOCK_SERIES is already one of the productTypes hasOmrEntitlement()
 * recognizes (apps/web/src/lib/store/omrEntitlement.ts) — so a buyer of
 * this specific book automatically qualifies for OMR scanning on this
 * exam/class the moment Phase 3 (the scan-and-score feature) exists,
 * with no entitlement-logic change needed.
 *
 * Deliberately does NOT upload the answer keys anywhere — same
 * "never let the secret the book is selling leak out of the local
 * filesystem" rule generate-sample-paper-books.mts's own header documents.
 * They're written to the same local output path for Phase 3 to pick up
 * later (today: a local, gitignored JSON file; Phase 3 should move this to
 * a real DB table keyed by this Product's id, not keep reading the file).
 *
 * Run with:
 *   npx tsx apps/web/scripts/package-sample-paper-books.mts [--dry-run] [--out-dir=<path>] [--sets=20]
 * --dry-run renders and reports without touching Supabase or the DB.
 * --out-dir=<path> additionally writes every rendered PDF locally.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { OmrExamType, QuestionBookletClassLevel, QuestionBookletExamType } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { QUESTION_BOOKLET_EXAM_TYPES, generateOmrSheetSpec } = engineRuntime as unknown as typeof import("@vedicneev/engine");

for (const line of fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)="?(.*?)"?$/);
  if (m) process.env[m[1]!] = m[2];
}

import type { createSupabaseAdminClient } from "@vedicneev/auth";
import authRuntime from "@vedicneev/auth";
const { createSupabaseAdminClient: createSupabaseAdminClientImpl } = authRuntime as unknown as typeof import("@vedicneev/auth");
import { prisma } from "@vedicneev/db";

import { Document, renderToBuffer } from "@react-pdf/renderer";
import { registerFontIfNeeded, buildPdfStyles, PDF_LANGUAGE_LABEL } from "./lib/pdfFonts.mjs";
import { buildMockPaperPage, type MockPaperMeta } from "./lib/mockPaperDocument.mjs";
import { buildOmrSheetPage, randomRollNumber } from "./lib/omrSheetDocument.mjs";
import { buildClosingPage, buildCoverPage } from "./lib/sampleBookCover.mjs";
import { EXAM_LABEL, selectSets, type BuiltSection } from "./lib/mockPaperSelection.mjs";

const React = (await import("react")).default;
const h = React.createElement;

const BUCKET = process.env.SUPABASE_STUDY_NOTES_BUCKET || "study-notes";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365;
const ROLL_NUMBER_DIGITS = 6;

type BookletLanguage = "en" | "hi";
const CLASS_LEVELS: QuestionBookletClassLevel[] = [6, 9];
const LANGUAGES: BookletLanguage[] = ["en", "hi"];
const LANGUAGE_TO_PRISMA: Record<BookletLanguage, "EN" | "HI"> = { en: "EN", hi: "HI" };

/** The engine's OmrSheetSpec geometry doesn't vary by exam (examType is descriptive only), and the type doesn't include UPSS — "OTHER" is the honest value for it. Same mapping as generate-sample-paper-books.mts. */
const OMR_EXAM_TYPE: Record<QuestionBookletExamType, OmrExamType> = {
  JNVST: "JNVST",
  RMS: "RMS",
  AISSEE: "AISSEE",
  UPSS: "OTHER",
};

const OUT_DIR_ARG = process.argv.find((a) => a.startsWith("--out-dir="));
const OUT_DIR = OUT_DIR_ARG ? OUT_DIR_ARG.slice("--out-dir=".length) : null;
const SETS_ARG = process.argv.find((a) => a.startsWith("--sets="));
const SETS = SETS_ARG ? Number(SETS_ARG.slice("--sets=".length)) : 20;

function writeLocal(relativeStoragePath: string, buffer: Buffer) {
  if (!OUT_DIR) return;
  const outPath = path.join(OUT_DIR, relativeStoragePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buffer);
}

const UPLOAD_MAX_ATTEMPTS = 4;
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Same retry-with-backoff as package-question-books.mts's uploadBuffer — duplicated rather than imported to avoid touching that already-verified, already-run-in-production script for a one-call-site shared helper. */
async function uploadBuffer(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  buffer: Buffer,
  storagePath: string
): Promise<string> {
  let lastError: string = "unknown error";
  for (let attempt = 1; attempt <= UPLOAD_MAX_ATTEMPTS; attempt++) {
    const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, buffer, { contentType: "application/pdf", upsert: true });
    if (!uploadError) {
      const { data, error: signError } = await admin.storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
      if (!signError && data) return data.signedUrl;
      lastError = `Signing failed: ${signError?.message ?? "unknown error"}`;
    } else {
      lastError = `Upload failed: ${uploadError.message}`;
    }
    if (attempt < UPLOAD_MAX_ATTEMPTS) {
      const backoffMs = 1000 * 2 ** (attempt - 1);
      console.warn(`  [retry ${attempt}/${UPLOAD_MAX_ATTEMPTS - 1}] ${storagePath} — ${lastError}. Retrying in ${backoffMs}ms...`);
      await sleep(backoffMs);
    }
  }
  throw new Error(`${lastError} for ${storagePath} after ${UPLOAD_MAX_ATTEMPTS} attempts.`);
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
  const dryRun = process.argv.includes("--dry-run");
  const admin = dryRun ? null : createSupabaseAdminClientImpl();
  if (!dryRun && !admin) {
    console.error("SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL are not set — refusing to run. Pass --dry-run to render/validate only.");
    process.exitCode = 1;
    return;
  }

  console.log(dryRun ? "Running in --dry-run mode (no upload, no DB writes).\n" : "Packaging sample-paper books for real — uploading + writing Product rows.\n");

  const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
  const keysDir = path.join(scriptsDir, "output", "sample-paper-answer-keys");
  fs.mkdirSync(keysDir, { recursive: true });

  let bookCount = 0;

  for (const classLevel of CLASS_LEVELS) {
    for (const language of LANGUAGES) {
      for (const examType of QUESTION_BOOKLET_EXAM_TYPES) {
        const { clearedTopicCount, pattern, sets: builtSets } = selectSets(examType, classLevel, language, SETS);
        const label = `${EXAM_LABEL[examType]} Class ${classLevel} (${language})`;

        if (builtSets.length === 0) {
          console.log(`  [skip] ${label}: ${clearedTopicCount} topic(s) cleared, not enough to build any set yet.`);
          continue;
        }
        if (builtSets.length < SETS) {
          console.warn(`  [${label}] only ${builtSets.length} of the requested ${SETS} sets could be built.`);
        }
        bookCount++;

        const fontFamily = registerFontIfNeeded(language);
        const styles = buildPdfStyles(fontFamily);
        const languageLabel = PDF_LANGUAGE_LABEL[language];
        const examLabel = EXAM_LABEL[examType];
        const examSlug = examType.toLowerCase();
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
            examLabel, classLevel, languageLabel,
            durationMinutes: pattern.durationMinutes,
            negativeMarking: pattern.negativeMarking,
            totalMarks, totalQuestions, setLabel, rollNumber,
          };
          pages.push(buildMockPaperPage(paperMeta, sections, styles));

          const omrSpec = generateOmrSheetSpec({ examType: OMR_EXAM_TYPE[examType], totalQuestions, rollNumberDigits: ROLL_NUMBER_DIGITS });
          pages.push(buildOmrSheetPage({ examLabel, classLevel, languageLabel, setLabel, rollNumber }, omrSpec));

          answerKeysBySet.push({ setNumber, totalQuestions, answerKey: flattenAnswerKey(sections) });
        }
        pages.push(buildClosingPage(examLabel, classLevel, styles));

        const buffer = await renderToBuffer(h(Document, { title: bookTitle }, ...pages));
        const sizeMb = (buffer.length / 1024 / 1024).toFixed(1);
        console.log(`  ${label}: ${builtSets.length} sets, ${sizeMb}MB`);

        const id = `sample-paper-book-${examSlug}-class${classLevel}-${language}`;
        const storagePath = `sample-paper-books/${id}.pdf`;
        writeLocal(storagePath, buffer);

        const keysPath = path.join(keysDir, `${examSlug}-class-${classLevel}-${language}.json`);
        fs.writeFileSync(keysPath, JSON.stringify({ productId: id, exam: examType, classLevel, language, pattern, sets: answerKeysBySet }, null, 2));

        if (dryRun) continue;

        const signedUrl = await uploadBuffer(admin!, buffer, storagePath);
        const totalQuestions = pattern.sections.reduce((sum, s) => sum + s.count, 0);
        const totalMarks = pattern.sections.reduce((sum, s) => sum + s.count * s.marksEach, 0);
        const titleEn = `${examLabel} Class ${classLevel} — ${builtSets.length} Sample Papers with OMR Sheets${language === "hi" ? " (Hindi)" : ""}`;
        const descriptionEn =
          `${builtSets.length} full-length, exam-pattern sample papers (${totalQuestions} questions, ${totalMarks} marks each) — sectioned and marked exactly like the real ${examLabel} exam. ` +
          `Every paper comes with its own OMR answer sheet. No printed answer key: log in with the WhatsApp number you purchased with, scan your filled sheet, and get your score in seconds — free for buyers of this book.`;
        const previewOutline = [
          ...pattern.sections.map((s) => `${s.label}: ${s.count} questions, ${s.marksEach} mark${s.marksEach === 1 ? "" : "s"} each`),
          `Duration: ${pattern.durationMinutes} minutes${pattern.negativeMarking ? ", negative marking applies" : ", no negative marking"}`,
          "A matching OMR answer sheet after every paper, with a roll number pre-bubbled for exam-day practice",
          "No printed answer key — scan your sheet at vedicneev.com for an instant score",
        ];

        await prisma.product.upsert({
          where: { id },
          update: {
            fileUrl: signedUrl,
            title: { en: titleEn },
            description: { en: descriptionEn },
            previewOutline,
            targetExam: examType,
            targetClass: classLevel === 6 ? "CLASS_6" : "CLASS_9",
            language: LANGUAGE_TO_PRISMA[language],
            productType: "MOCK_SERIES",
            isActive: true,
          },
          create: {
            id,
            title: { en: titleEn },
            description: { en: descriptionEn },
            previewOutline,
            targetExam: examType,
            targetClass: classLevel === 6 ? "CLASS_6" : "CLASS_9",
            language: LANGUAGE_TO_PRISMA[language],
            productType: "MOCK_SERIES",
            // Placeholder pricing — review/adjust in /admin/store before going live.
            displayPrice: 799,
            sellingPrice: 299,
            fileUrl: signedUrl,
            isActive: true,
          },
        });
      }
    }
  }

  console.log(`\nDone. ${dryRun ? "Would render" : "Rendered/uploaded"} ${bookCount} sample-paper book(s)/Product row(s).`);
  if (!dryRun && bookCount > 0) {
    console.log(`Answer keys written locally to ${keysDir} — NOT uploaded anywhere; Phase 3 needs to move these into a real DB table before the scan-and-score feature can read them.`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
