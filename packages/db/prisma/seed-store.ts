/**
 * Seeds the storefront's flagship digital products plus one illustrative
 * influencer promo code. Separate from prisma/seed.ts, matching
 * seed-jnvst-pyqs.ts's precedent — independent of the rest of the seed
 * data, safe to re-run on its own.
 *
 * The question-bank booklet is one SKU per (exam × class × language) —
 * JNVST/AISSEE/RMS × Class 6/Class 9 × every language
 * generate-booklet-pdfs.mts has actually produced a PDF for (see
 * BOOKLET_LANGUAGES below) — each tagged with targetExam/targetClass/
 * language so the /store filter (see StorePageClient.tsx) can show a
 * visitor only the exact package for their exam, grade, and language,
 * instead of one generic English-only booklet covering everyone.
 *
 * Each booklet's fileUrl points at a real, exam/class/language-specific PDF
 * under apps/web/public/booklets/ — generated from the actual seeded
 * question bank (not placeholder text) by
 * apps/web/scripts/generate-booklet-pdfs.mts (a deterministic 40-30-30
 * easy/medium/hard sample per section, targeting 500 questions per booklet
 * and capped by whatever reviewed content actually exists, with full
 * worked solutions — see that script's "[shortfall]" warnings for which
 * sections still need more content). A regional-language booklet is
 * mostly-English by volume until that content is authored (see that
 * script's per-language fallback coverage report) — the title still says
 * so plainly rather than mislabeling it a full translation. Re-run that
 * script (once per language in BOOKLET_LANGUAGES) to refresh the PDFs
 * after the underlying question bank changes; this seed just points at
 * whatever's already on disk. The OMR kit still uses the existing
 * public/omr-sample-sheet.svg placeholder, matching MediaItem.videoUrl/
 * OfflineMockSession.scannedImageUrl's "populated out of band" convention
 * — swap it for a real production asset before launch. The remaining
 * access-based products (mock series, bootcamp, mega bundle) have no file
 * and aren't language editions, so fileUrl/language stay null for them by
 * omission.
 *
 * Product has no natural unique business key in the schema, so this keys
 * off (productType, targetExam, targetClass, language) instead — safe only
 * because this script seeds exactly one row per that combination;
 * re-running it after a copy/price edit updates the existing row instead
 * of duplicating it.
 *
 * generate-booklet-pdfs.mts doesn't necessarily finish every combo for a
 * given language — e.g. a fontkit shaping crash partway through a run
 * leaves later exam/class combos for that language with no PDF at all.
 * QUESTION_BOOKLETS is filtered against the real files on disk below so a
 * combo like that is silently left unseeded (fixed by re-running the
 * generator and this seed again) rather than shipping a Buy Now button
 * whose download 404s.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BOOKLETS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "apps", "web", "public", "booklets");

const BOOKLET_EXAMS = [
  { exam: "JNVST" as const, label: { en: "JNVST", hi: "जेएनवीएसटी" } },
  { exam: "AISSEE" as const, label: { en: "AISSEE (Sainik School)", hi: "एआईएसएसई (सैनिक स्कूल)" } },
  { exam: "RMS" as const, label: { en: "RMS", hi: "आरएमएस" } },
];
const BOOKLET_CLASSES = [
  { classLevel: "CLASS_6" as const, numeral: 6, label: { en: "Class 6", hi: "कक्षा 6" } },
  { classLevel: "CLASS_9" as const, numeral: 9, label: { en: "Class 9", hi: "कक्षा 9" } },
];

// Mirrors generate-booklet-pdfs.mts's SUPPORTED_LANGUAGES/FONT_FAMILY_BY_LANGUAGE
// and the Language enum (schema.prisma). langSuffix must match that script's
// own filename logic (`language === "en" ? "" : "-" + language`) exactly, or
// fileUrl points at a PDF that was never generated.
const BOOKLET_LANGUAGES = [
  { language: "EN" as const, langSuffix: "", label: "" },
  { language: "HI" as const, langSuffix: "-hi", label: " — Hindi" },
  { language: "MR" as const, langSuffix: "-mr", label: " — Marathi" },
  { language: "BN" as const, langSuffix: "-bn", label: " — Bengali" },
  { language: "GU" as const, langSuffix: "-gu", label: " — Gujarati" },
  { language: "TA" as const, langSuffix: "-ta", label: " — Tamil" },
];

const QUESTION_BOOKLETS = BOOKLET_EXAMS.flatMap(({ exam, label: examLabel }) =>
  BOOKLET_CLASSES.flatMap(({ classLevel, numeral, label: classLabel }) =>
    BOOKLET_LANGUAGES.map(({ language, langSuffix, label: langLabel }) => ({
      title: {
        en: `${examLabel.en} ${classLabel.en} Question Bank Booklet${langLabel} (PDF)`,
        hi: `${examLabel.hi} ${classLabel.hi} प्रश्न बैंक पुस्तिका${langLabel} (PDF)`,
      },
      description: {
        en: `A downloadable PDF of ${examLabel.en} ${classLabel.en} practice questions (40-30-30 difficulty split) with full solutions.`,
        hi: `पूर्ण समाधान सहित ${examLabel.hi} ${classLabel.hi} अभ्यास प्रश्नों (40-30-30 कठिनाई अनुपात) की डाउनलोड करने योग्य PDF।`,
      },
      productType: "QUESTION_BOOKLET" as const,
      targetExam: exam,
      targetClass: classLevel,
      language,
      displayPrice: 399,
      sellingPrice: 149,
      // Matches the filename generate-booklet-pdfs.mts writes for this exam/class/language combo.
      fileUrl: `/booklets/${exam.toLowerCase()}-class-${numeral}-question-bank-booklet${langSuffix}.pdf`,
    }))
  )
).filter((booklet) => {
  const exists = fs.existsSync(path.join(BOOKLETS_DIR, path.basename(booklet.fileUrl)));
  if (!exists) {
    console.warn(`Store seed: skipping ${booklet.fileUrl} (${booklet.language}) — no PDF generated for this combo yet.`);
  }
  return exists;
});

const PRODUCTS = [
  {
    title: { en: "Complete Digital Mock Series", hi: "संपूर्ण डिजिटल मॉक सीरीज़" },
    description: {
      en: "Unlimited full-length mock tests across JNVST, AISSEE, and RMS, Class 6 and 9.",
      hi: "JNVST, AISSEE, और RMS, कक्षा 6 और 9 में असीमित पूर्ण-लंबाई मॉक टेस्ट।",
    },
    productType: "MOCK_SERIES" as const,
    displayPrice: 999,
    sellingPrice: 349,
  },
  {
    title: { en: "30-Day Daily Live Mock Sprint", hi: "30-दिवसीय दैनिक लाइव मॉक स्प्रिंट" },
    description: {
      en: "One fresh mock test unlocks every morning for 30 days, building toward exam day.",
      hi: "30 दिनों तक हर सुबह एक नया मॉक टेस्ट अनलॉक होता है, परीक्षा के दिन की तैयारी के लिए।",
    },
    productType: "LIVE_BOOTCAMP" as const,
    displayPrice: 1499,
    sellingPrice: 499,
  },
  ...QUESTION_BOOKLETS,
  {
    title: { en: "Printable Offline OMR Kit", hi: "प्रिंट करने योग्य ऑफ़लाइन OMR किट" },
    description: {
      en: "Print-at-home OMR answer sheets to practice offline, scannable in our OMR evaluator.",
      hi: "ऑफ़लाइन अभ्यास के लिए घर पर प्रिंट करने योग्य OMR उत्तर पत्रक, हमारे OMR मूल्यांकनकर्ता में स्कैन करने योग्य।",
    },
    productType: "OMR_KIT" as const,
    displayPrice: 299,
    sellingPrice: 99,
    fileUrl: "/omr-sample-sheet.svg",
  },
  {
    title: { en: "The Ultimate Mega Bundle", hi: "अल्टीमेट मेगा बंडल" },
    description: {
      en: "Everything: the mock series, the 30-day sprint, every question booklet, and the OMR kit.",
      hi: "सब कुछ: मॉक सीरीज़, 30-दिवसीय स्प्रिंट, हर प्रश्न पुस्तिका, और OMR किट।",
    },
    productType: "MEGA_BUNDLE" as const,
    displayPrice: 2499,
    sellingPrice: 699,
  },
];

const PROMO_CODES = [
  {
    code: "GAURAV199",
    discountType: "PERCENTAGE" as const,
    discountValue: 20,
    influencerName: "Gaurav",
    commissionRate: 40.0,
  },
];

async function main() {
  for (const product of PRODUCTS) {
    const targetExam = "targetExam" in product ? product.targetExam : null;
    const targetClass = "targetClass" in product ? product.targetClass : null;
    const language = "language" in product ? product.language : null;
    const existing = await prisma.product.findFirst({
      where: { productType: product.productType, targetExam, targetClass, language },
    });
    const data = {
      title: product.title as Prisma.InputJsonValue,
      description: product.description as Prisma.InputJsonValue,
      productType: product.productType,
      targetExam,
      targetClass,
      language,
      displayPrice: product.displayPrice,
      sellingPrice: product.sellingPrice,
      fileUrl: "fileUrl" in product ? product.fileUrl : null,
    };
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
    } else {
      await prisma.product.create({ data });
    }
  }

  for (const promo of PROMO_CODES) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: {
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        influencerName: promo.influencerName,
        commissionRate: promo.commissionRate,
      },
      create: promo,
    });
  }

  console.log(`Store seed: ${PRODUCTS.length} products, ${PROMO_CODES.length} promo code(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
