export type StoreProductType = "MOCK_SERIES" | "QUESTION_BOOKLET" | "OMR_KIT" | "LIVE_BOOTCAMP" | "MEGA_BUNDLE";

/** A single sample question shown in the pre-purchase preview — already localized to one language, unlike Product.previewSampleQuestions' bilingual Json shape. */
export interface StorePreviewSampleQuestion {
  stem: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string | null;
}

/** Client-facing shape of a Product row — title/description already localized to a single string, unlike the bilingual Json columns in Prisma. */
export interface StoreProduct {
  id: string;
  title: string;
  description: string;
  productType: StoreProductType;
  targetExam: "JNVST" | "AISSEE" | "RMS" | "DPS" | "OTHER" | null;
  targetClass: "CLASS_6" | "CLASS_9" | null;
  /** Language the file itself is written in (e.g. a QUESTION_BOOKLET's PDF) — null for product types that aren't language editions. */
  language: "EN" | "HI" | "MR" | "BN" | "TA" | "GU" | null;
  displayPrice: number;
  sellingPrice: number;
  fileUrl: string | null;
  /** Table of contents shown in the preview modal before purchase — see Product.previewOutline. Null for products seeded before this field existed. */
  previewOutline: string[] | null;
  /** 2-3 worked examples shown in the preview modal for MOCK_SERIES/QUESTION_BOOKLET products — see Product.previewSampleQuestions. */
  previewSampleQuestions: StorePreviewSampleQuestion[] | null;
  /** Sample A4 sheet image shown in the preview modal for OMR_KIT products — see Product.previewOmrImageUrl. */
  previewOmrImageUrl: string | null;
  /** Usage instructions shown alongside the sample sheet for OMR_KIT products — see Product.previewOmrInstructions. */
  previewOmrInstructions: string[] | null;
}
