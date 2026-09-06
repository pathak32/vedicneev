export type StoreProductType = "MOCK_SERIES" | "QUESTION_BOOKLET" | "OMR_KIT" | "LIVE_BOOTCAMP" | "MEGA_BUNDLE";

/** Client-facing shape of a Product row — title/description already localized to a single string, unlike the bilingual Json columns in Prisma. */
export interface StoreProduct {
  id: string;
  title: string;
  description: string;
  productType: StoreProductType;
  targetExam: "JNVST" | "AISSEE" | "RMS" | "DPS" | "OTHER" | null;
  targetClass: "CLASS_6" | "CLASS_9" | null;
  displayPrice: number;
  sellingPrice: number;
  fileUrl: string | null;
}
