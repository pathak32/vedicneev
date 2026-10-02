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
 * Run with: npx tsx apps/web/scripts/package-question-books.mts [--dry-run]
 * --dry-run renders and reports without touching Supabase or the DB —
 * useful to validate the question content before anything goes live.
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

const NOTES_ROOT = "D:\\Projects\\notes handwritten";
const BUCKET = process.env.SUPABASE_STUDY_NOTES_BUCKET || "study-notes";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365;
// Supabase Storage's own per-file cap on the plan this project uses (see
// upload-split-study-notes.mts's identical reason for splitting).
const MAX_VOLUME_BYTES = 48 * 1024 * 1024;

type BookletLanguage = "en" | "hi";
const CLASS_LEVELS: QuestionBookletClassLevel[] = [6, 9];
const LANGUAGES: BookletLanguage[] = ["en", "hi"];
const LANGUAGE_TO_PRISMA: Record<BookletLanguage, "EN" | "HI"> = { en: "EN", hi: "HI" };

const EXAM_LABEL: Record<QuestionBookletExamType, string> = {
  JNVST: "JNVST",
  RMS: "RMS",
  AISSEE: "AISSEE (Sainik School)",
  UPSS: "UPSS",
};

function topicFilePath(classLevel: QuestionBookletClassLevel, language: BookletLanguage, topicNumber: number): string {
  return path.join(NOTES_ROOT, "questions", `class${classLevel}`, language, `topic-${topicNumber}.json`);
}

interface LoadedCorpus {
  topics: BookletTopicSection[];
  missing: number[];
  structuralErrors: { topicNumber: number; message: string }[];
  artifactFlags: { topicNumber: number; questionNumber: number; matchedPhrase: string; excerpt: string }[];
}

/** Loads and validates every topic file for one (class, language) — collects every problem rather than stopping at the first, so one run reports the full quality picture. */
function loadCorpus(classLevel: QuestionBookletClassLevel, language: BookletLanguage): LoadedCorpus {
  const result: LoadedCorpus = { topics: [], missing: [], structuralErrors: [], artifactFlags: [] };

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
  console.log(`  [${label}] ${corpus.topics.length}/72 topics clean and ready to package.`);
}

/** Renders a compiled book, splitting into more volumes (never cutting a topic across two) until every volume fits under MAX_VOLUME_BYTES. */
async function renderCompiledBookVolumes(
  examLabel: string,
  classLevel: QuestionBookletClassLevel,
  languageLabel: string,
  topics: BookletTopicSection[],
  styles: ReturnType<typeof buildPdfStyles>
): Promise<{ volumeLabel: string | undefined; buffer: Buffer }[]> {
  for (let volumeCount = 1; volumeCount <= 10; volumeCount++) {
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
  throw new Error(`Could not split ${examLabel} Class ${classLevel} (${languageLabel}) under ${MAX_VOLUME_BYTES} bytes even at 10 volumes.`);
}

async function uploadBuffer(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  buffer: Buffer,
  storagePath: string
): Promise<string> {
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, buffer, { contentType: "application/pdf", upsert: true });
  if (uploadError) throw new Error(`Upload failed for ${storagePath}: ${uploadError.message}`);
  const { data, error: signError } = await admin.storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
  if (signError || !data) throw new Error(`Signing failed for ${storagePath}: ${signError?.message ?? "unknown error"}`);
  return data.signedUrl;
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
      const corpus = corpusByKey.get(`${classLevel}-${language}`)!;
      const isClean = corpus.structuralErrors.length === 0 && corpus.artifactFlags.length === 0;
      const hasAnyContent = corpus.topics.length > 0;
      if (!isClean) {
        console.error(`\nSkipping class${classLevel}/${language} entirely — unresolved errors/flags above must be fixed first (zero error tolerance).`);
        continue;
      }
      if (!hasAnyContent) {
        console.log(`\nSkipping class${classLevel}/${language} — no topic files found yet.`);
        continue;
      }

      const fontFamily = registerFontIfNeeded(language);
      const styles = buildPdfStyles(fontFamily);
      const languageLabel = PDF_LANGUAGE_LABEL[language];

      console.log(`\nclass${classLevel}/${language}: rendering ${corpus.topics.length} per-topic PDFs...`);
      for (const topic of corpus.topics) {
        const buffer = await renderToBuffer(buildTopicDocument(classLevel, topic, fontFamily, styles));
        if (!dryRun) {
          const storagePath = `question-books/topics/class-${classLevel}/${language}/topic-${topic.topicNumber}.pdf`;
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

          if (dryRun) continue;

          const storagePath = `question-books/compiled/${id}.pdf`;
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
