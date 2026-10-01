/**
 * One-time upload + registration script for the externally-authored
 * handwritten-style study notes (produced by a separate tool — see
 * D:\Projects\notes handwritten\, outside this repo). Two independent
 * passes:
 *
 * 1. MASTER BOOKS (16 files, ~32-101MB each) — the digital-sale SKUs.
 *    Uploaded to Supabase Storage, then upserted as Product rows
 *    (productType STUDY_NOTES) so they show up in /store through the
 *    existing catalog/checkout/Purchase flow with zero new payment code.
 *
 * 2. PER-TOPIC PDFs (288 files, ~50-300KB each) — used for precise
 *    Mistake Vault remediation links. Uploaded to the same bucket, then
 *    each TopicNotePdf row (seeded by seed-study-note-pdfs.ts) gets its
 *    pdfUrlEn/pdfUrlHi filled in.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY in the environment (createSupabaseAdminClient
 * returns null without them) — this script refuses to run without them
 * rather than silently writing fake/local-path URLs into the database.
 *
 * Run with: npx tsx apps/web/scripts/upload-study-notes.mts
 */
import fs from "node:fs";
import path from "node:path";

// tsx doesn't auto-load .env (that only happens implicitly when Prisma's
// own client is instantiated, which doesn't help callers that only need
// @vedicneev/auth's env vars) — load it manually so this script works the
// same way whether run alone or alongside the Prisma-backed seed scripts.
for (const line of fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)="?(.*?)"?$/);
  if (m) process.env[m[1]!] = m[2];
}

// Named ESM exports from @vedicneev/auth don't statically resolve under this
// file's strict ESM (.mts) mode — same cjs-module-lexer limitation documented
// in generate-sample-papers.mts's import of @vedicneev/engine. Runtime-only
// workaround; the `import type` keeps full type safety.
import type { createSupabaseAdminClient } from "@vedicneev/auth";
import authRuntime from "@vedicneev/auth";
const { createSupabaseAdminClient: createSupabaseAdminClientImpl } = authRuntime as unknown as typeof import("@vedicneev/auth");
import { prisma } from "@vedicneev/db";

const NOTES_ROOT = "D:\\Projects\\notes handwritten";
const BUCKET = process.env.SUPABASE_STUDY_NOTES_BUCKET || "study-notes";
// Product.fileUrl / TopicNotePdf.pdfUrl* are static stored strings with no
// re-signing route (same convention as every other Product.fileUrl in this
// codebase — see apps/web/app/api/library/route.ts) — 1 year matches
// Subscription's own SUBSCRIPTION_VALIDITY_MS, the longest-lived thing this
// codebase already signs for.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365;

interface MasterBook {
  localPath: string;
  storagePath: string;
  examType: "JNVST" | "RMS" | "AISSEE" | "UPSS";
  classLevel: 6 | 9;
  language: "EN" | "HI";
  titleEn: string;
}

const MASTER_BOOKS: MasterBook[] = (
  [
    ["RMS", 6, "EN", "VedicNeev_RMS_English_Master.pdf", "RMS Class 6 — Complete Handwritten Notes (English)"],
    ["RMS", 6, "HI", "VedicNeev_RMS_Hindi_Master.pdf", "RMS Class 6 — Complete Handwritten Notes (Hindi)"],
    ["JNVST", 6, "EN", "VedicNeev_JNVST_English_Master.pdf", "JNVST Class 6 — Complete Handwritten Notes (English)"],
    ["JNVST", 6, "HI", "VedicNeev_JNVST_Hindi_Master.pdf", "JNVST Class 6 — Complete Handwritten Notes (Hindi)"],
    ["AISSEE", 6, "EN", "VedicNeev_AISS_English_Master.pdf", "AISSEE Class 6 — Complete Handwritten Notes (English)"],
    ["AISSEE", 6, "HI", "VedicNeev_AISS_Hindi_Master.pdf", "AISSEE Class 6 — Complete Handwritten Notes (Hindi)"],
    ["UPSS", 6, "EN", "VedicNeev_UPSS_English_Master.pdf", "UPSS Class 6 — Complete Handwritten Notes (English)"],
    ["UPSS", 6, "HI", "VedicNeev_UPSS_Hindi_Master.pdf", "UPSS Class 6 — Complete Handwritten Notes (Hindi)"],
  ] as [MasterBook["examType"], 6, MasterBook["language"], string, string][]
)
  .map(([examType, classLevel, language, file, titleEn]) => ({
    localPath: path.join(NOTES_ROOT, "_Final Books", "Class 6", file),
    storagePath: `master-books/class-6/${file}`,
    examType,
    classLevel,
    language,
    titleEn,
  }))
  .concat(
    (
      [
        ["RMS", "VedicNeev_Class9_RMS_English_Master.pdf", "EN", "RMS Class 9 — Complete Handwritten Notes (English)"],
        ["RMS", "VedicNeev_Class9_RMS_Hindi_Master.pdf", "HI", "RMS Class 9 — Complete Handwritten Notes (Hindi)"],
        ["JNVST", "VedicNeev_Class9_JNVST_English_Master.pdf", "EN", "JNVST Class 9 — Complete Handwritten Notes (English)"],
        ["JNVST", "VedicNeev_Class9_JNVST_Hindi_Master.pdf", "HI", "JNVST Class 9 — Complete Handwritten Notes (Hindi)"],
        ["AISSEE", "VedicNeev_Class9_AISS_English_Master.pdf", "EN", "AISSEE Class 9 — Complete Handwritten Notes (English)"],
        ["AISSEE", "VedicNeev_Class9_AISS_Hindi_Master.pdf", "HI", "AISSEE Class 9 — Complete Handwritten Notes (Hindi)"],
        ["UPSS", "VedicNeev_Class9_UPSS_English_Master.pdf", "EN", "UPSS Class 9 — Complete Handwritten Notes (English)"],
        ["UPSS", "VedicNeev_Class9_UPSS_Hindi_Master.pdf", "HI", "UPSS Class 9 — Complete Handwritten Notes (Hindi)"],
      ] as [MasterBook["examType"], string, MasterBook["language"], string][]
    ).map(([examType, file, language, titleEn]) => ({
      localPath: path.join(NOTES_ROOT, "_Final Books", "Class 9", file),
      storagePath: `master-books/class-9/${file}`,
      examType,
      classLevel: 9 as const,
      language,
      titleEn,
    }))
  );

function topicPdfPaths(classLevel: 6 | 9, topicNumber: number): { en: string; hi: string } {
  const classDir = classLevel === 6 ? "Class 6" : "class9";
  return {
    en: path.join(NOTES_ROOT, "content", "pdfs", classDir, "english", `topic-${topicNumber}.pdf`),
    hi: path.join(NOTES_ROOT, "content", "pdfs", classDir, "hindi", `topic-${topicNumber}.pdf`),
  };
}

async function uploadFile(admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, localPath: string, storagePath: string): Promise<string> {
  const buffer = fs.readFileSync(localPath);
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (uploadError) throw new Error(`Upload failed for ${storagePath}: ${uploadError.message}`);

  const { data, error: signError } = await admin.storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
  if (signError || !data) throw new Error(`Signing failed for ${storagePath}: ${signError?.message ?? "unknown error"}`);
  return data.signedUrl;
}

async function main() {
  const admin = createSupabaseAdminClientImpl();
  if (!admin) {
    console.error(
      "SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL are not set in this environment — refusing to run.\n" +
        "Add them to .env (from your Supabase dashboard: Project Settings > API) and re-run this script."
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Uploading ${MASTER_BOOKS.length} master books to bucket "${BUCKET}"...`);
  let bookCount = 0;
  const failedBooks: string[] = [];
  for (const book of MASTER_BOOKS) {
    if (!fs.existsSync(book.localPath)) {
      console.warn(`  SKIP (file not found): ${book.localPath}`);
      continue;
    }
    let signedUrl: string;
    try {
      signedUrl = await uploadFile(admin, book.localPath, book.storagePath);
    } catch (err) {
      const sizeMb = (fs.statSync(book.localPath).size / 1024 / 1024).toFixed(1);
      console.error(`  FAIL (${sizeMb}MB): ${book.storagePath} — ${err instanceof Error ? err.message : err}`);
      failedBooks.push(`${book.storagePath} (${sizeMb}MB)`);
      continue;
    }
    await prisma.product.upsert({
      where: { id: `study-notes-${book.examType.toLowerCase()}-class${book.classLevel}-${book.language.toLowerCase()}` },
      update: {
        fileUrl: signedUrl,
        title: { en: book.titleEn },
        description: { en: `Full topic-wise handwritten-style study notes covering the entire ${book.examType} Class ${book.classLevel} syllabus.` },
        targetExam: book.examType,
        targetClass: book.classLevel === 6 ? "CLASS_6" : "CLASS_9",
        language: book.language,
        productType: "STUDY_NOTES",
        isActive: true,
      },
      create: {
        id: `study-notes-${book.examType.toLowerCase()}-class${book.classLevel}-${book.language.toLowerCase()}`,
        title: { en: book.titleEn },
        description: { en: `Full topic-wise handwritten-style study notes covering the entire ${book.examType} Class ${book.classLevel} syllabus.` },
        targetExam: book.examType,
        targetClass: book.classLevel === 6 ? "CLASS_6" : "CLASS_9",
        language: book.language,
        productType: "STUDY_NOTES",
        // Placeholder pricing — review/adjust in /admin/store before going live.
        displayPrice: 299,
        sellingPrice: 149,
        fileUrl: signedUrl,
        isActive: true,
      },
    });
    bookCount++;
    console.log(`  OK: ${book.storagePath}`);
  }

  console.log(`Uploading per-topic PDFs (288 files) and updating TopicNotePdf rows...`);
  let topicCount = 0;
  const failedTopics: string[] = [];
  for (const classLevel of [6, 9] as const) {
    for (let topicNumber = 1; topicNumber <= 72; topicNumber++) {
      const { en, hi } = topicPdfPaths(classLevel, topicNumber);
      const updates: { pdfUrlEn?: string; pdfUrlHi?: string } = {};

      try {
        if (fs.existsSync(en)) {
          updates.pdfUrlEn = await uploadFile(admin, en, `topics/class-${classLevel}/english/topic-${topicNumber}.pdf`);
        }
        if (fs.existsSync(hi)) {
          updates.pdfUrlHi = await uploadFile(admin, hi, `topics/class-${classLevel}/hindi/topic-${topicNumber}.pdf`);
        }
      } catch (err) {
        console.error(`  FAIL: class ${classLevel} topic ${topicNumber} — ${err instanceof Error ? err.message : err}`);
        failedTopics.push(`class ${classLevel} topic ${topicNumber}`);
        continue;
      }
      if (Object.keys(updates).length === 0) {
        console.warn(`  SKIP (no files found): class ${classLevel} topic ${topicNumber}`);
        continue;
      }

      await prisma.topicNotePdf.update({
        where: { classLevel_topicNumber: { classLevel, topicNumber } },
        data: updates,
      });
      topicCount++;
    }
  }

  console.log(`Done. Uploaded/updated ${bookCount} master books and ${topicCount} per-topic PDFs.`);
  if (failedBooks.length > 0) console.log(`Master books that FAILED (likely bucket file-size limit):\n  ${failedBooks.join("\n  ")}`);
  if (failedTopics.length > 0) console.log(`Per-topic PDFs that FAILED:\n  ${failedTopics.join("\n  ")}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
