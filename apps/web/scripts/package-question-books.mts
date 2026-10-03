/**
 * Packages the externally-authored, quality-fix-verified question bank
 * (D:\Projects\notes handwritten\questions\{class6,class9}\{en,hi}\
 * topic-N.json — outside this repo, 72 topics per class level) into the
 * sellable Question Bank Booklet product: one per-topic PDF per topic, plus
 * one compiled master book per (exam × class × language), each exam's book
 * including only the topics on that exam's real syllabus (see
 * isTopicInExamSyllabus in @vedicneev/engine — JNVST drops GK/Science/
 * Social-Science topics; RMS/AISSEE/UPSS include everything).
 *
 * Mirrors upload-study-notes.mts's upload convention: same Supabase
 * Storage bucket ("study-notes"), same signed-URL TTL, same Product
 * upsert pattern — just under a "question-books/" prefix and driven by
 * freshly-rendered PDFs instead of pre-existing files.
 *
 * ZERO ERROR TOLERANCE GATE: every topic file is structurally validated
 * (validateQuestionBookletTopic) and scanned for the known AI
 * self-correction artifact (scanForSelfCorrectionArtifacts — see that
 * quality audit's topic-1.json Q59/Q72 example) before anything is
 * rendered. A class/language combo with ANY unresolved structural error or
 * artifact flag in ANY of its topics is refused entirely — no partial or
 * "mostly clean" book is ever packaged. Fix the flagged file(s) and re-run.
 *
 * Structural validity alone is not sufficient to sell a topic, though —
 * real answer/content errors have passed that check before. Each topic is
 * additionally required to be listed in SECOND_PASS_CLEARED.json (the same
 * manifest generate-mock-papers.mts gates on, populated as the independent
 * blind second-pass review clears topics); anything not yet cleared is
 * silently excluded from that topic's packaging rather than treated as a
 * hard error, so a partially-cleared class/language corpus still packages
 * what IS cleared.
 *
 * PRODUCT-ID COLLISION WARNING: seed-store.ts already seeds its OWN
 * QUESTION_BOOKLET rows (a 500-question sample drawn live from the
 * Question/PreviousYearQuestion DB tables, via generate-booklet-pdfs.mts)
 * and re-upserts them by matching on (productType, targetExam, targetClass,
 * language) — NOT by id. Running seed-store.ts again after this script has
 * created full-corpus QUESTION_BOOKLET rows for the SAME (exam, class,
 * language) tuple will silently overwrite this script's product with the
 * 500-question DB sample. Before this goes live, either retire
 * seed-store.ts's QUESTION_BOOKLETS block (the full corpus supersedes the
 * DB sample) or change its lookup to also filter out rows this script
 * owns. This script deliberately uses the explicit `id`s below (distinct
 * from seed-store.ts's auto-cuid rows) so the two don't collide by `id` —
 * only the unresolved (productType, targetExam, targetClass, language)
 * re-seed conflict above remains.
 *
 * Run with: npx tsx apps/web/scripts/package-question-books.mts [--dry-run] [--out-dir=<path>]
 * --dry-run renders and reports without touching Supabase or the DB —
 * useful to validate the question content before anything goes live.
 * --out-dir=<path> additionally writes every rendered PDF (per-topic and
 * compiled volumes) to <path>, mirroring the Storage object layout, so the
 * actual files can be reviewed/delivered before Supabase credentials are
 * available. Safe to combine with --dry-run (no upload, no DB write, just
 * local files); combining it with a real run also keeps a local copy of
 * everything that gets uploaded.
 */
import fs from "node:fs";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
// Named ESM exports from @vedicneev/engine don't statically resolve under
// this file's strict ESM (.mts) mode — same cjs-module-lexer limitation
// documented in generate-sample-papers.mts's import of @vedicneev/engine.
// Runtime-only workaround; the `import type` keeps full type safety.
import type {
  extractTopicTitle,
  isTopicInExamSyllabus,
  scanForSelfCorrectionArtifacts,
  validateQuestionBookletTopic,
  QuestionBookletClassLevel,
  QuestionBookletExamType,
} from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const {
  extractTopicTitle,
  isTopicInExamSyllabus,
  scanForSelfCorrectionArtifacts,
  validateQuestionBookletTopic,
  QUESTION_BOOKLET_EXAM_TYPES,
} = engineRuntime as unknown as typeof import("@vedicneev/engine");

for (const line of fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)="?(.*?)"?$/);
  if (m) process.env[m[1]!] = m[2];
}

import type { createSupabaseAdminClient } from "@vedicneev/auth";
import authRuntime from "@vedicneev/auth";
const { createSupabaseAdminClient: createSupabaseAdminClientImpl } = authRuntime as unknown as typeof import("@vedicneev/auth");
import { prisma } from "@vedicneev/db";

import { registerFontIfNeeded, buildPdfStyles, PDF_LANGUAGE_LABEL } from "./lib/pdfFonts.mjs";
import { buildCompiledBookDocument, buildTopicDocument, splitTopicsIntoVolumes, type BookletTopicSection } from "./lib/questionBookletDocument.mjs";

// Overridable for environments where the question bank isn't under this fixed
// local Windows path (e.g. a cloud session with the content checked out as
// its own repo, whose root IS the questions directory) — the default stays
// the user's local layout ("D:\...\notes handwritten\questions\...") so
// nothing changes for normal local runs.
const QUESTIONS_ROOT = process.env.QUESTION_BANK_ROOT || path.join("D:\\Projects\\notes handwritten", "questions");
const BUCKET = process.env.SUPABASE_STUDY_NOTES_BUCKET || "study-notes";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365;
// Supabase Storage's own per-file cap on the plan this project uses (see
// upload-split-study-notes.mts's identical reason for splitting).
const MAX_VOLUME_BYTES = 48 * 1024 * 1024;
// react-pdf's layout pass scales roughly QUADRATICALLY with document size,
// not linearly — measured empirically: 409 questions ~13s, 815 ~52s, 5911
// (a full-syllabus exam like RMS/AISSEE/UPSS) extrapolates to ~45 MINUTES
// for a single document. Always starting the volume-count search at 1 (as
// if testing a ~500-question book first) is exactly how that catastrophic
// single-document render gets attempted. 500 questions/volume keeps a
// single render under ~20s based on the same data.
const TARGET_QUESTIONS_PER_VOLUME = 500;

const OUT_DIR_ARG = process.argv.find((a) => a.startsWith("--out-dir="));
const OUT_DIR = OUT_DIR_ARG ? OUT_DIR_ARG.slice("--out-dir=".length) : null;

function writeLocal(relativeStoragePath: string, buffer: Buffer) {
  if (!OUT_DIR) return;
  const outPath = path.join(OUT_DIR, relativeStoragePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buffer);
}

type BookletLanguage = "en" | "hi";
const CLASS_LEVELS: QuestionBookletClassLevel[] = [6, 9];
const LANGUAGES: BookletLanguage[] = ["en", "hi"];
const LANGUAGE_TO_PRISMA: Record<BookletLanguage, "EN" | "HI"> = { en: "EN", hi: "HI" };

// Per explicit user decision (see _review/OPEN_ISSUES.md, "URGENT: class9/hi
// translation script is broken"): most class9/hi topic files on disk are
// untranslated raw English, not real Hindi, even though they pass structural
// validation and the artifact scan (both only check shape/known phrases, not
// language). Packaging would otherwise ship that content as a "Hindi" book.
// Paused until the translation is fixed and re-verified — remove this once
// class9/hi is back in scope.
const PAUSED_COMBOS = new Set<string>(["9-hi"]);

// Structural validity + the artifact scan alone are not enough to call a
// topic sellable — this project's whole second-pass process exists because
// real answer/content errors have passed both those checks before (the
// water-image topics, several GK facts, several arithmetic slips). Only
// topics listed in SECOND_PASS_CLEARED.json (the same manifest
// generate-mock-papers.mts gates on) are eligible here; anything else is
// held back automatically as more of the corpus clears second pass, with no
// code change needed.
const SECOND_PASS_CLEARED_PATH = path.join(QUESTIONS_ROOT, "_review", "SECOND_PASS_CLEARED.json");
interface ClearedEntry {
  classLevel: number;
  language: string;
  topics: number[];
}
function loadClearedTopics(classLevel: QuestionBookletClassLevel, language: BookletLanguage): Set<number> {
  if (!fs.existsSync(SECOND_PASS_CLEARED_PATH)) return new Set();
  const data = JSON.parse(fs.readFileSync(SECOND_PASS_CLEARED_PATH, "utf-8")) as { cleared: ClearedEntry[] };
  const entry = data.cleared.find((e) => e.classLevel === classLevel && e.language === language);
  return new Set(entry?.topics ?? []);
}

const EXAM_LABEL: Record<QuestionBookletExamType, string> = {
  JNVST: "JNVST",
  RMS: "RMS",
  AISSEE: "AISSEE (Sainik School)",
  UPSS: "UPSS",
};

function topicFilePath(classLevel: QuestionBookletClassLevel, language: BookletLanguage, topicNumber: number): string {
  return path.join(QUESTIONS_ROOT, `class${classLevel}`, language, `topic-${topicNumber}.json`);
}

interface LoadedCorpus {
  topics: BookletTopicSection[];
  missing: number[];
  structuralErrors: { topicNumber: number; message: string }[];
  artifactFlags: { topicNumber: number; questionNumber: number; matchedPhrase: string; excerpt: string }[];
  notSecondPassCleared: number[];
}

/** Loads and validates every topic file for one (class, language) — collects every problem rather than stopping at the first, so one run reports the full quality picture. */
function loadCorpus(classLevel: QuestionBookletClassLevel, language: BookletLanguage): LoadedCorpus {
  const result: LoadedCorpus = { topics: [], missing: [], structuralErrors: [], artifactFlags: [], notSecondPassCleared: [] };
  const cleared = loadClearedTopics(classLevel, language);

  for (let topicNumber = 1; topicNumber <= 72; topicNumber++) {
    const filePath = topicFilePath(classLevel, language, topicNumber);
    if (!fs.existsSync(filePath)) {
      result.missing.push(topicNumber);
      continue;
    }

    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
      result.structuralErrors.push({ topicNumber, message: `Invalid JSON: ${err instanceof Error ? err.message : err}` });
      continue;
    }

    const { ok, questions, errors } = validateQuestionBookletTopic(raw);
    if (!ok) {
      for (const e of errors) result.structuralErrors.push({ topicNumber, message: `Q${e.questionNumber ?? "?"}: ${e.message}` });
      continue;
    }

    const artifacts = scanForSelfCorrectionArtifacts(questions);
    for (const a of artifacts) result.artifactFlags.push({ topicNumber, ...a });
    if (artifacts.length > 0) continue; // don't ship this topic's content until it's re-verified

    if (!cleared.has(topicNumber)) {
      result.notSecondPassCleared.push(topicNumber);
      continue; // structurally fine, but not yet through the independent blind second pass
    }

    result.topics.push({ topicNumber, topicTitle: extractTopicTitle(raw, topicNumber), questions });
  }

  return result;
}

function reportCorpus(classLevel: QuestionBookletClassLevel, language: BookletLanguage, corpus: LoadedCorpus) {
  const label = `class${classLevel}/${language}`;
  if (corpus.missing.length > 0) {
    console.warn(`  [${label}] ${corpus.missing.length}/72 topic files not found (expected if that corpus isn't generated/synced yet).`);
  }
  if (corpus.structuralErrors.length > 0) {
    console.error(`  [${label}] ${corpus.structuralErrors.length} structural error(s):`);
    for (const e of corpus.structuralErrors.slice(0, 20)) console.error(`    topic-${e.topicNumber}.json — ${e.message}`);
    if (corpus.structuralErrors.length > 20) console.error(`    ...and ${corpus.structuralErrors.length - 20} more.`);
  }
  if (corpus.artifactFlags.length > 0) {
    console.error(`  [${label}] ${corpus.artifactFlags.length} self-correction artifact flag(s) — these topics need re-verification before packaging:`);
    for (const f of corpus.artifactFlags.slice(0, 20)) {
      console.error(`    topic-${f.topicNumber}.json Q${f.questionNumber} — matched "${f.matchedPhrase}": "...${f.excerpt}..."`);
    }
    if (corpus.artifactFlags.length > 20) console.error(`    ...and ${corpus.artifactFlags.length - 20} more.`);
  }
  if (corpus.notSecondPassCleared.length > 0) {
    console.warn(`  [${label}] ${corpus.notSecondPassCleared.length} topic(s) structurally fine but not yet second-pass cleared, excluded from packaging: ${corpus.notSecondPassCleared.join(", ")}`);
  }
  console.log(`  [${label}] ${corpus.topics.length}/72 topics second-pass cleared and ready to package.`);
}

/** Renders a compiled book, splitting into more volumes (never cutting a topic across two) until every volume fits under MAX_VOLUME_BYTES. */
async function renderCompiledBookVolumes(
  examLabel: string,
  classLevel: QuestionBookletClassLevel,
  languageLabel: string,
  topics: BookletTopicSection[],
  styles: ReturnType<typeof buildPdfStyles>
): Promise<{ volumeLabel: string | undefined; buffer: Buffer }[]> {
  const totalQuestions = topics.reduce((sum, t) => sum + t.questions.length, 0);
  // Start from a question-count-based estimate rather than always trying a
  // single un-split document first — see TARGET_QUESTIONS_PER_VOLUME's
  // comment for why that first attempt alone can take the better part of an
  // hour for a large corpus. The byte-size check below is still the actual
  // pass/fail gate; this only picks a sane starting point for it.
  const startingVolumeCount = Math.max(1, Math.ceil(totalQuestions / TARGET_QUESTIONS_PER_VOLUME));
  const maxVolumeCount = startingVolumeCount + 10;
  for (let volumeCount = startingVolumeCount; volumeCount <= maxVolumeCount; volumeCount++) {
    const groups = splitTopicsIntoVolumes(topics, volumeCount);
    const rendered = await Promise.all(
      groups.map(async (group, i) => {
        const volumeLabel = groups.length > 1 ? `Volume ${i + 1} of ${groups.length}` : undefined;
        const buffer = await renderToBuffer(
          buildCompiledBookDocument({ examLabel, classLevel, languageLabel, volumeLabel }, group, styles)
        );
        return { volumeLabel, buffer };
      })
    );
    if (rendered.every((r) => r.buffer.length <= MAX_VOLUME_BYTES)) return rendered;
  }
  throw new Error(`Could not split ${examLabel} Class ${classLevel} (${languageLabel}) under ${MAX_VOLUME_BYTES} bytes even at ${maxVolumeCount} volumes.`);
}

const UPLOAD_MAX_ATTEMPTS = 4;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * A long, sequential run (72 topics + several compiled volumes per
 * class/language, real network calls throughout) is one dropped connection
 * away from losing an hour of rendering work — a bare "fetch failed" from a
 * Wi-Fi hiccup previously killed the whole script with nothing yet uploaded
 * after the failure point. Retries with exponential backoff (1s/2s/4s)
 * before giving up for real; `upsert: true` already makes re-uploading the
 * same path safe, so a retry here never risks a duplicate/corrupt object.
 */
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

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const admin = dryRun ? null : createSupabaseAdminClientImpl();
  if (!dryRun && !admin) {
    console.error("SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL are not set — refusing to run. Pass --dry-run to render/validate only.");
    process.exitCode = 1;
    return;
  }

  console.log(dryRun ? "Running in --dry-run mode (no upload, no DB writes).\n" : "Packaging question books for real — uploading + writing Product rows.\n");

  const corpusByKey = new Map<string, LoadedCorpus>();
  for (const classLevel of CLASS_LEVELS) {
    for (const language of LANGUAGES) {
      const corpus = loadCorpus(classLevel, language);
      reportCorpus(classLevel, language, corpus);
      corpusByKey.set(`${classLevel}-${language}`, corpus);
    }
  }

  let topicPdfCount = 0;
  let bookCount = 0;

  for (const classLevel of CLASS_LEVELS) {
    for (const language of LANGUAGES) {
      if (PAUSED_COMBOS.has(`${classLevel}-${language}`)) {
        console.log(`\nSkipping class${classLevel}/${language} — paused pending Hindi translation fix (see _review/OPEN_ISSUES.md).`);
        continue;
      }

      const corpus = corpusByKey.get(`${classLevel}-${language}`)!;
      const isClean = corpus.structuralErrors.length === 0 && corpus.artifactFlags.length === 0;
      const hasAnyContent = corpus.topics.length > 0;
      if (!isClean) {
        console.error(`\nSkipping class${classLevel}/${language} entirely — unresolved errors/flags above must be fixed first (zero error tolerance).`);
        continue;
      }
      if (!hasAnyContent) {
        const reason = corpus.notSecondPassCleared.length > 0 ? "no topics are second-pass cleared yet" : "no topic files found yet";
        console.log(`\nSkipping class${classLevel}/${language} — ${reason}.`);
        continue;
      }

      const fontFamily = registerFontIfNeeded(language);
      const styles = buildPdfStyles(fontFamily);
      const languageLabel = PDF_LANGUAGE_LABEL[language];

      console.log(`\nclass${classLevel}/${language}: rendering ${corpus.topics.length} per-topic PDFs...`);
      for (const topic of corpus.topics) {
        const buffer = await renderToBuffer(buildTopicDocument(classLevel, topic, fontFamily, styles));
        const storagePath = `question-books/topics/class-${classLevel}/${language}/topic-${topic.topicNumber}.pdf`;
        writeLocal(storagePath, buffer);
        if (!dryRun) {
          await uploadBuffer(admin!, buffer, storagePath);
        }
        topicPdfCount++;
      }

      for (const examType of QUESTION_BOOKLET_EXAM_TYPES) {
        const examTopics = corpus.topics.filter((t) => isTopicInExamSyllabus(examType, classLevel, t.topicNumber));
        if (examTopics.length === 0) continue;

        const volumes = await renderCompiledBookVolumes(EXAM_LABEL[examType], classLevel, languageLabel, examTopics, styles);
        for (let i = 0; i < volumes.length; i++) {
          const { volumeLabel, buffer } = volumes[i]!;
          const volSuffix = volumes.length > 1 ? `-vol${i + 1}` : "";
          const id = `question-book-full-${examType.toLowerCase()}-class${classLevel}-${language}${volSuffix}`;
          const sizeMb = (buffer.length / 1024 / 1024).toFixed(1);
          console.log(`  ${examType} Class ${classLevel} (${language})${volumeLabel ? ` [${volumeLabel}]` : ""}: ${sizeMb}MB`);

          const storagePath = `question-books/compiled/${id}.pdf`;
          writeLocal(storagePath, buffer);

          if (dryRun) continue;

          const signedUrl = await uploadBuffer(admin!, buffer, storagePath);
          const totalQuestions = examTopics.reduce((sum, t) => sum + t.questions.length, 0);
          const titleEn = `${EXAM_LABEL[examType]} Class ${classLevel} — Complete Question Bank${language === "hi" ? " (Hindi)" : ""}${volumeLabel ? ` — ${volumeLabel}` : ""}`;
          await prisma.product.upsert({
            where: { id },
            update: {
              fileUrl: signedUrl,
              title: { en: titleEn },
              description: { en: `${totalQuestions} verified practice questions across ${examTopics.length} topics, covering the full ${EXAM_LABEL[examType]} Class ${classLevel} syllabus, with complete worked solutions.` },
              targetExam: examType,
              targetClass: classLevel === 6 ? "CLASS_6" : "CLASS_9",
              language: LANGUAGE_TO_PRISMA[language],
              productType: "QUESTION_BOOKLET",
              isActive: true,
            },
            create: {
              id,
              title: { en: titleEn },
              description: { en: `${totalQuestions} verified practice questions across ${examTopics.length} topics, covering the full ${EXAM_LABEL[examType]} Class ${classLevel} syllabus, with complete worked solutions.` },
              targetExam: examType,
              targetClass: classLevel === 6 ? "CLASS_6" : "CLASS_9",
              language: LANGUAGE_TO_PRISMA[language],
              productType: "QUESTION_BOOKLET",
              // Placeholder pricing — review/adjust in /admin/store before going live.
              displayPrice: 499,
              sellingPrice: 199,
              fileUrl: signedUrl,
              isActive: true,
            },
          });
          bookCount++;
        }
      }
    }
  }

  console.log(`\nDone. ${dryRun ? "Would render" : "Rendered/uploaded"} ${topicPdfCount} per-topic PDFs and ${bookCount} compiled book volume(s)/Product row(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
