/**
 * Uploads the 30 subject-split volume PDFs (produced by .scratch/split_all.py
 * for the 10 master books that exceeded the Supabase Storage 50MB bucket
 * limit — see upload-study-notes.mts's original FAIL list) and registers
 * each as its own STUDY_NOTES Product row. Three volumes per book:
 *   Vol 1 + Vol 2: the "Arithmetic & Reasoning" half, itself split in two
 *     purely because it was still too big as one file (topic-boundary-safe,
 *     never cuts a topic's content in half — see split_all.py).
 *   Vol 3: the "Language" half (JNVST has no GK in its syllabus, so its
 *     Vol 3 is Language-only; RMS/AISSEE/UPSS's Vol 3 also includes GK).
 *
 * Run with: npx tsx apps/web/scripts/upload-split-study-notes.mts
 */
import fs from "node:fs";
import path from "node:path";

for (const line of fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)="?(.*?)"?$/);
  if (m) process.env[m[1]!] = m[2];
}

import type { createSupabaseAdminClient } from "@vedicneev/auth";
import authRuntime from "@vedicneev/auth";
const { createSupabaseAdminClient: createSupabaseAdminClientImpl } = authRuntime as unknown as typeof import("@vedicneev/auth");
import { prisma } from "@vedicneev/db";

const SPLIT_DIR = "D:\\Projects\\notes handwritten\\_Final Books\\_split";
const BUCKET = process.env.SUPABASE_STUDY_NOTES_BUCKET || "study-notes";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365;

interface Volume {
  file: string;
  idSuffix: string;
  titleEn: string;
  descriptionEn: string;
}

interface SplitBook {
  examType: "JNVST" | "RMS" | "AISSEE" | "UPSS";
  classLevel: 6 | 9;
  language: "EN" | "HI";
  volumes: Volume[];
}

function c6Volumes(prefix: string, hasGK: boolean): Volume[] {
  return [
    {
      file: `${prefix}_Part1_vol1.pdf`,
      idSuffix: "vol1",
      titleEn: "Volume 1 — Mental Ability & Reasoning (Topics 1-39)",
      descriptionEn: "Handwritten-style notes covering Mental Ability, non-verbal reasoning, and Vedic speed-math shortcuts.",
    },
    {
      file: `${prefix}_Part1_vol2.pdf`,
      idSuffix: "vol2",
      titleEn: "Volume 2 — Arithmetic (Topics 40-72)",
      descriptionEn: "Handwritten-style notes covering Fractions & Decimals, Profit/Loss/Interest, Mensuration, Averages, Ratios & Percentages.",
    },
    {
      file: `${prefix}_Part2.pdf`,
      idSuffix: "vol3",
      titleEn: hasGK ? "Volume 3 — Language & General Knowledge (Topics 13-24, 61-69)" : "Volume 3 — Language (Topics 13-20)",
      descriptionEn: hasGK
        ? "Handwritten-style notes covering English/Language grammar and General Knowledge."
        : "Handwritten-style notes covering English/Language grammar (this exam's syllabus has no General Knowledge section).",
    },
  ];
}

function c9Volumes(prefix: string): Volume[] {
  return [
    {
      file: `${prefix}_Part1_vol1.pdf`,
      idSuffix: "vol1",
      titleEn: "Volume 1 — Reasoning & Mathematics, Part 1 (Topics 1-28)",
      descriptionEn: "Handwritten-style notes covering advanced reasoning, arithmetic, and the start of algebra.",
    },
    {
      file: `${prefix}_Part1_vol2.pdf`,
      idSuffix: "vol2",
      titleEn: "Volume 2 — Mathematics, Part 2 (Topics 29-48)",
      descriptionEn: "Handwritten-style notes covering algebra, geometry, mensuration, and statistics.",
    },
    {
      file: `${prefix}_Part2.pdf`,
      idSuffix: "vol3",
      titleEn: "Volume 3 — Language, Science & Social Science (Topics 49-72)",
      descriptionEn: "Handwritten-style notes covering English, Physics/Chemistry/Biology, History, and Civics.",
    },
  ];
}

const BOOKS: SplitBook[] = [
  { examType: "JNVST", classLevel: 6, language: "EN", volumes: c6Volumes("VedicNeev_JNVST_English_Master", false) },
  { examType: "RMS", classLevel: 6, language: "EN", volumes: c6Volumes("VedicNeev_RMS_English_Master", true) },
  { examType: "RMS", classLevel: 6, language: "HI", volumes: c6Volumes("VedicNeev_RMS_Hindi_Master", true) },
  { examType: "AISSEE", classLevel: 6, language: "EN", volumes: c6Volumes("VedicNeev_AISS_English_Master", true) },
  { examType: "AISSEE", classLevel: 6, language: "HI", volumes: c6Volumes("VedicNeev_AISS_Hindi_Master", true) },
  { examType: "UPSS", classLevel: 6, language: "EN", volumes: c6Volumes("VedicNeev_UPSS_English_Master", true) },
  { examType: "UPSS", classLevel: 6, language: "HI", volumes: c6Volumes("VedicNeev_UPSS_Hindi_Master", true) },
  { examType: "RMS", classLevel: 9, language: "EN", volumes: c9Volumes("VedicNeev_Class9_RMS_English_Master") },
  { examType: "AISSEE", classLevel: 9, language: "EN", volumes: c9Volumes("VedicNeev_Class9_AISS_English_Master") },
  { examType: "UPSS", classLevel: 9, language: "EN", volumes: c9Volumes("VedicNeev_Class9_UPSS_English_Master") },
];

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
    console.error("SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL are not set — refusing to run.");
    process.exitCode = 1;
    return;
  }

  let productCount = 0;
  const failed: string[] = [];

  for (const book of BOOKS) {
    for (const vol of book.volumes) {
      const localPath = path.join(SPLIT_DIR, vol.file);
      if (!fs.existsSync(localPath)) {
        console.warn(`  SKIP (not found): ${localPath}`);
        failed.push(vol.file);
        continue;
      }
      const storagePath = `master-books/split/${vol.file}`;
      let signedUrl: string;
      try {
        signedUrl = await uploadFile(admin, localPath, storagePath);
      } catch (err) {
        const sizeMb = (fs.statSync(localPath).size / 1024 / 1024).toFixed(1);
        console.error(`  FAIL (${sizeMb}MB): ${vol.file} — ${err instanceof Error ? err.message : err}`);
        failed.push(vol.file);
        continue;
      }

      const id = `study-notes-${book.examType.toLowerCase()}-class${book.classLevel}-${book.language.toLowerCase()}-${vol.idSuffix}`;
      await prisma.product.upsert({
        where: { id },
        update: {
          fileUrl: signedUrl,
          title: { en: `${book.examType} Class ${book.classLevel} — ${vol.titleEn}` },
          description: { en: vol.descriptionEn },
          targetExam: book.examType,
          targetClass: book.classLevel === 6 ? "CLASS_6" : "CLASS_9",
          language: book.language,
          productType: "STUDY_NOTES",
          isActive: true,
        },
        create: {
          id,
          title: { en: `${book.examType} Class ${book.classLevel} — ${vol.titleEn}` },
          description: { en: vol.descriptionEn },
          targetExam: book.examType,
          targetClass: book.classLevel === 6 ? "CLASS_6" : "CLASS_9",
          language: book.language,
          productType: "STUDY_NOTES",
          displayPrice: 149,
          sellingPrice: 79,
          fileUrl: signedUrl,
          isActive: true,
        },
      });
      productCount++;
      console.log(`  OK: ${vol.file} -> ${id}`);
    }
  }

  console.log(`\nDone. ${productCount} volume products created/updated.`);
  if (failed.length > 0) console.log(`Failed/missing: ${failed.join(", ")}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
