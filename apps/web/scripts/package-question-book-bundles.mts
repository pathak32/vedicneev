/**
 * Packages a "Complete Question Bank" BUNDLE product per (exam × class ×
 * language) — a single ZIP containing every already-rendered compiled-book
 * volume PDF (see package-question-books.mts, which produced and uploaded
 * those volumes to Supabase Storage under question-books/compiled/). This
 * script zips EXISTING uploaded volumes rather than re-rendering anything,
 * so it's fast (seconds per combo) even though rendering a full exam's
 * worth of questions as ONE document from scratch is itself prohibitively
 * slow (see package-question-books.mts's TARGET_QUESTIONS_PER_VOLUME
 * comment — the reason compiled books are split into volumes at all).
 *
 * By product decision, individual per-volume products stay on sale
 * alongside the bundle (not retired) — the bundle is a value upsell, not a
 * replacement. previewOutline is set to the full list of topics covered
 * (every topic on that exam's syllabus) so the storefront's pre-purchase
 * preview modal shows exactly what's inside before a buyer commits.
 *
 * Run with: npx tsx apps/web/scripts/package-question-book-bundles.mts [--dry-run]
 * --dry-run lists what would be bundled without uploading or writing to the DB.
 */
import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";

// Named ESM exports from @vedicneev/engine don't statically resolve under
// this file's strict ESM (.mts) mode — same cjs-module-lexer limitation
// documented in package-question-books.mts's import of @vedicneev/engine.
import type {
  extractTopicTitle,
  isTopicInExamSyllabus,
  maxTopicNumber,
  validateQuestionBookletTopic,
  QuestionBookletClassLevel,
  QuestionBookletExamType,
} from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const {
  extractTopicTitle,
  isTopicInExamSyllabus,
  maxTopicNumber,
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

const QUESTIONS_ROOT = process.env.QUESTION_BANK_ROOT || path.join("D:\\Projects\\notes handwritten", "questions");
const BUCKET = process.env.SUPABASE_STUDY_NOTES_BUCKET || "study-notes";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365;
const COMPILED_PREFIX = "question-books/compiled";

// Per explicit user decision: individual volumes are repriced to ₹99 each
// (separately, via a one-off DB update — this script doesn't touch that
// price), and the bundle is priced at a flat ₹499 regardless of how many
// volumes it contains. displayPrice (the struck-through MRP) is instead
// set dynamically per bundle to volumeCount × ₹99 — an honest "buy these
// separately for ₹X, or get them all for ₹499" anchor, not an arbitrary
// marketing number.
const BUNDLE_SELLING_PRICE = 499;
const PER_VOLUME_PRICE_FOR_ANCHOR = 99;

type BookletLanguage = "en" | "hi";
const CLASS_LEVELS: QuestionBookletClassLevel[] = [6, 9];
const LANGUAGES: BookletLanguage[] = ["en", "hi"];
const LANGUAGE_TO_PRISMA: Record<BookletLanguage, "EN" | "HI"> = { en: "EN", hi: "HI" };
const LANGUAGE_SUFFIX: Record<BookletLanguage, string> = { en: "", hi: " (Hindi)" };

const EXAM_LABEL: Record<QuestionBookletExamType, string> = {
  JNVST: "JNVST",
  RMS: "RMS",
  AISSEE: "AISSEE (Sainik School)",
  UPSS: "UPSS",
};

function topicFilePath(classLevel: QuestionBookletClassLevel, language: BookletLanguage, topicNumber: number): string {
  return path.join(QUESTIONS_ROOT, `class${classLevel}`, language, `topic-${topicNumber}.json`);
}

/**
 * The syllabus topic list for one (exam, class, language), for the
 * storefront preview only — not used to decide what gets bundled (the
 * already-rendered, already-uploaded volumes are the source of truth for
 * that). Silently skips a topic file that's missing or fails to parse
 * rather than erroring, since this only affects how complete the preview
 * list looks, not what's actually sold.
 */
function topicOutline(examType: QuestionBookletExamType, classLevel: QuestionBookletClassLevel, language: BookletLanguage): string[] {
  const outline: string[] = [];
  for (let topicNumber = 1; topicNumber <= maxTopicNumber(classLevel); topicNumber++) {
    if (!isTopicInExamSyllabus(examType, classLevel, topicNumber)) continue;
    const filePath = topicFilePath(classLevel, language, topicNumber);
    if (!fs.existsSync(filePath)) continue;
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const { ok, questions } = validateQuestionBookletTopic(raw);
      if (!ok) continue;
      outline.push(`${topicNumber}. ${extractTopicTitle(raw, topicNumber)} (${questions.length} questions)`);
    } catch {
      continue;
    }
  }
  return outline;
}

interface DownloadedVolume {
  volumeNumber: number;
  zipEntryName: string;
  buffer: Buffer;
}

/** Downloads every already-uploaded compiled-book volume for one (exam, class, language) key, in volume order. */
async function downloadVolumes(admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, key: string): Promise<DownloadedVolume[]> {
  const { data, error } = await admin.storage.from(BUCKET).list(COMPILED_PREFIX, { limit: 1000 });
  if (error || !data) throw new Error(`Could not list ${COMPILED_PREFIX}: ${error?.message ?? "unknown error"}`);

  const matches = data
    .filter((f) => f.name.startsWith(`question-book-full-${key}`) && f.name.endsWith(".pdf"))
    .map((f) => {
      const m = f.name.match(/-vol(\d+)\.pdf$/);
      return { fileName: f.name, volumeNumber: m ? Number(m[1]) : 1 };
    })
    .sort((a, b) => a.volumeNumber - b.volumeNumber);
  if (matches.length === 0) {
    throw new Error(`No uploaded volumes found for ${key} under ${COMPILED_PREFIX}/ — run package-question-books.mts first.`);
  }

  const out: DownloadedVolume[] = [];
  for (const { fileName, volumeNumber } of matches) {
    const { data: fileData, error: downloadError } = await admin.storage.from(BUCKET).download(`${COMPILED_PREFIX}/${fileName}`);
    if (downloadError || !fileData) throw new Error(`Could not download ${COMPILED_PREFIX}/${fileName}: ${downloadError?.message ?? "unknown error"}`);
    const buffer = Buffer.from(await fileData.arrayBuffer());
    out.push({ volumeNumber, zipEntryName: `Volume-${String(volumeNumber).padStart(2, "0")}.pdf`, buffer });
  }
  return out;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const admin = createSupabaseAdminClientImpl();
  if (!admin) {
    console.error("SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL are not set.");
    process.exitCode = 1;
    return;
  }

  console.log(dryRun ? "Running in --dry-run mode (no upload, no DB writes).\n" : "Building complete-question-bank bundles for real.\n");

  let bundleCount = 0;

  for (const classLevel of CLASS_LEVELS) {
    for (const language of LANGUAGES) {
      for (const examType of QUESTION_BOOKLET_EXAM_TYPES) {
        const key = `${examType.toLowerCase()}-class${classLevel}-${language}`;

        let volumes: DownloadedVolume[];
        try {
          volumes = await downloadVolumes(admin, key);
        } catch (err) {
          console.warn(`  Skipping ${key}: ${err instanceof Error ? err.message : err}`);
          continue;
        }

        const zip = new JSZip();
        for (const v of volumes) zip.file(v.zipEntryName, v.buffer);
        const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
        const sizeMb = (zipBuffer.length / 1024 / 1024).toFixed(1);
        console.log(`  ${EXAM_LABEL[examType]} Class ${classLevel} (${language}) bundle: ${volumes.length} volume(s), ${sizeMb}MB`);

        if (dryRun) {
          bundleCount++;
          continue;
        }

        const storagePath = `question-books/bundles/question-book-bundle-${key}.zip`;
        const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, zipBuffer, { contentType: "application/zip", upsert: true });
        if (uploadError) throw new Error(`Upload failed for ${storagePath}: ${uploadError.message}`);
        const { data: signedData, error: signError } = await admin.storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
        if (signError || !signedData) throw new Error(`Signing failed for ${storagePath}: ${signError?.message ?? "unknown error"}`);

        const outline = topicOutline(examType, classLevel, language);
        const id = `question-book-bundle-${key}`;
        const titleEn = `${EXAM_LABEL[examType]} Class ${classLevel} — Complete Question Bank${LANGUAGE_SUFFIX[language]} (All ${volumes.length} Volumes)`;
        const descriptionEn = `The complete ${EXAM_LABEL[examType]} Class ${classLevel} question bank — all ${volumes.length} volumes in one ZIP download, covering the full syllabus with worked solutions for every question.`;
        const displayPrice = volumes.length * PER_VOLUME_PRICE_FOR_ANCHOR;

        await prisma.product.upsert({
          where: { id },
          update: {
            fileUrl: signedData.signedUrl,
            title: { en: titleEn },
            description: { en: descriptionEn },
            previewOutline: outline,
            targetExam: examType,
            targetClass: classLevel === 6 ? "CLASS_6" : "CLASS_9",
            language: LANGUAGE_TO_PRISMA[language],
            productType: "QUESTION_BOOKLET",
            displayPrice,
            sellingPrice: BUNDLE_SELLING_PRICE,
            isActive: true,
          },
          create: {
            id,
            title: { en: titleEn },
            description: { en: descriptionEn },
            previewOutline: outline,
            targetExam: examType,
            targetClass: classLevel === 6 ? "CLASS_6" : "CLASS_9",
            language: LANGUAGE_TO_PRISMA[language],
            productType: "QUESTION_BOOKLET",
            displayPrice,
            sellingPrice: BUNDLE_SELLING_PRICE,
            fileUrl: signedData.signedUrl,
            isActive: true,
          },
        });
        bundleCount++;
      }
    }
  }

  console.log(`\nDone. ${dryRun ? "Would build" : "Built"} ${bundleCount} bundle(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
