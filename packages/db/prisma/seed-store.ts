/**
 * Seeds the storefront's 5 flagship digital products plus one illustrative
 * influencer promo code. Separate from prisma/seed.ts, matching
 * seed-jnvst-pyqs.ts's precedent — independent of the rest of the seed
 * data, safe to re-run on its own.
 *
 * fileUrl points at a real static placeholder asset for the two products
 * that sell a downloadable file — apps/web/public/sample-question-bank-
 * booklet.pdf and the existing public/omr-sample-sheet.svg — matching
 * MediaItem.videoUrl/OfflineMockSession.scannedImageUrl's "populated out
 * of band" convention. Swap these for the real production assets before
 * launch. The other three products are access-based, not file-based, so
 * fileUrl stays null for them by omission.
 *
 * Product has no natural unique business key in the schema, so this keys
 * off productType instead — safe only because this script seeds exactly
 * one row per type; re-running it after a copy/price edit updates the
 * existing row for that type instead of duplicating it.
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
    title: { en: "Digital Question Bank Booklet (PDF)", hi: "डिजिटल प्रश्न बैंक पुस्तिका (PDF)" },
    description: {
      en: "A downloadable PDF of practice questions with full solutions.",
      hi: "पूर्ण समाधान सहित अभ्यास प्रश्नों की डाउनलोड करने योग्य PDF।",
    },
    productType: "QUESTION_BOOKLET" as const,
    displayPrice: 399,
    sellingPrice: 149,
    fileUrl: "/sample-question-bank-booklet.pdf",
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
      en: "Everything: the mock series, the 30-day sprint, the question booklet, and the OMR kit.",
      hi: "सब कुछ: मॉक सीरीज़, 30-दिवसीय स्प्रिंट, प्रश्न पुस्तिका, और OMR किट।",
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
    const existing = await prisma.product.findFirst({ where: { productType: product.productType } });
    const data = {
      title: product.title as Prisma.InputJsonValue,
      description: product.description as Prisma.InputJsonValue,
      productType: product.productType,
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
