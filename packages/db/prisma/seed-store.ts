/**
 * Seeds the storefront's flagship digital products plus one illustrative
 * influencer promo code. Separate from prisma/seed.ts, matching
 * seed-jnvst-pyqs.ts's precedent — independent of the rest of the seed
 * data, safe to re-run on its own.
 *
 * The question-bank booklet is 6 discrete SKUs (JNVST/AISSEE/RMS × Class 6/
 * Class 9), each tagged with targetExam/targetClass so the /store filter
 * (see StorePageClient.tsx) can show a visitor only the exact package for
 * their exam and grade, instead of one generic booklet covering everyone.
 *
 * Each booklet's fileUrl points at a real, exam/class-specific PDF under
 * apps/web/public/booklets/ — generated from the actual seeded question
 * bank (not placeholder text) by apps/web/scripts/generate-booklet-pdfs.mts
 * (a deterministic 40-30-30 easy/medium/hard sample per section, targeting
 * 500 questions per booklet and capped by whatever reviewed content
 * actually exists, with full worked solutions — see that script's
 * "[shortfall]" warnings for which sections still need more content).
 * Re-run that script to refresh the PDFs after the underlying question
 * bank changes; this seed just points at whatever's already on disk. The
 * OMR kit still uses the
 * existing public/omr-sample-sheet.svg placeholder, matching MediaItem.
 * videoUrl/OfflineMockSession.scannedImageUrl's "populated out of band"
 * convention — swap it for a real production asset before launch. The
 * remaining access-based products (mock series, bootcamp, mega bundle)
 * have no file, so fileUrl stays null for them by omission.
 *
 * Product has no natural unique business key in the schema, so this keys
 * off (productType, targetExam, targetClass) instead — safe only because
 * this script seeds exactly one row per that combination; re-running it
 * after a copy/price edit updates the existing row instead of duplicating
 * it.
 */
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BOOKLET_EXAMS = [
  { exam: "JNVST" as const, label: { en: "JNVST", hi: "जेएनवीएसटी" } },
  { exam: "AISSEE" as const, label: { en: "AISSEE (Sainik School)", hi: "एआईएसएसई (सैनिक स्कूल)" } },
  { exam: "RMS" as const, label: { en: "RMS", hi: "आरएमएस" } },
];
const BOOKLET_CLASSES = [
  { classLevel: "CLASS_6" as const, numeral: 6, label: { en: "Class 6", hi: "कक्षा 6" } },
  { classLevel: "CLASS_9" as const, numeral: 9, label: { en: "Class 9", hi: "कक्षा 9" } },
];

const QUESTION_BOOKLETS = BOOKLET_EXAMS.flatMap(({ exam, label: examLabel }) =>
  BOOKLET_CLASSES.map(({ classLevel, numeral, label: classLabel }) => ({
    title: {
      en: `${examLabel.en} ${classLabel.en} Question Bank Booklet (PDF)`,
      hi: `${examLabel.hi} ${classLabel.hi} प्रश्न बैंक पुस्तिका (PDF)`,
    },
    description: {
      en: `A downloadable PDF of ${examLabel.en} ${classLabel.en} practice questions (40-30-30 difficulty split) with full solutions.`,
      hi: `पूर्ण समाधान सहित ${examLabel.hi} ${classLabel.hi} अभ्यास प्रश्नों (40-30-30 कठिनाई अनुपात) की डाउनलोड करने योग्य PDF।`,
    },
    productType: "QUESTION_BOOKLET" as const,
    targetExam: exam,
    targetClass: classLevel,
    displayPrice: 399,
    sellingPrice: 149,
    // Matches the filename generate-booklet-pdfs.mts writes for this exam/class combo.
    fileUrl: `/booklets/${exam.toLowerCase()}-class-${numeral}-question-bank-booklet.pdf`,
  }))
);

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
    const existing = await prisma.product.findFirst({
      where: { productType: product.productType, targetExam, targetClass },
    });
    const data = {
      title: product.title as Prisma.InputJsonValue,
      description: product.description as Prisma.InputJsonValue,
      productType: product.productType,
      targetExam,
      targetClass,
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
