/**
 * Seeds the storefront's flagship digital products plus one illustrative
 * influencer promo code. Separate from prisma/seed.ts, matching
 * seed-jnvst-pyqs.ts's precedent — independent of the rest of the seed
 * data, safe to re-run on its own.
 *
 * QUESTION_BOOKLET products are intentionally NOT seeded here. The old
 * 500-question DB-sample booklets (generate-booklet-pdfs.mts) were
 * superseded by the full-corpus Question Banks, which
 * apps/web/scripts/package-question-books.mts uploads and upserts under
 * explicit `question-book-full-*` ids. Seeding QUESTION_BOOKLET rows here
 * too would re-match and overwrite those rows (this seed matches by
 * productType/targetExam/targetClass/language, not id). Rows an earlier
 * run of this seed already created are left untouched — deactivate them in
 * /admin/store once the full-corpus products are live.
 *
 * The OMR kit still uses the existing public/omr-sample-sheet.svg
 * placeholder, matching MediaItem.videoUrl/OfflineMockSession.scannedImageUrl's
 * "populated out of band" convention — swap it for a real production asset
 * before launch. The remaining access-based products (mock series,
 * bootcamp, mega bundle) have no file and aren't language editions, so
 * fileUrl/language stay null for them by omission.
 *
 * Product has no natural unique business key in the schema, so this keys
 * off (productType, targetExam, targetClass, language) instead — safe only
 * because this script seeds at most one row per that combination;
 * re-running it after a copy/price edit updates the existing row instead
 * of duplicating it.
 */
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    // None of the remaining products are exam/class/language-specific.
    const targetExam = null;
    const targetClass = null;
    const language = null;
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
