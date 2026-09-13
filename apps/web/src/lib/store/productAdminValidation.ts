import { Prisma } from "@vedicneev/db";

export const PRODUCT_TYPES = ["MOCK_SERIES", "QUESTION_BOOKLET", "OMR_KIT", "LIVE_BOOTCAMP", "MEGA_BUNDLE"] as const;
export const EXAM_TYPES = ["JNVST", "AISSEE", "RMS", "DPS", "OTHER"] as const;
export const CLASS_LEVELS = ["CLASS_6", "CLASS_9"] as const;

export interface SampleQuestionBody {
  stem?: { en?: string; hi?: string };
  options?: { id?: string; text?: { en?: string; hi?: string } }[];
  correctOptionId?: string;
  explanation?: { en?: string; hi?: string } | null;
}

export interface ProductBody {
  productType?: string;
  titleEn?: string;
  titleHi?: string;
  descriptionEn?: string;
  descriptionHi?: string;
  targetExam?: string | null;
  targetClass?: string | null;
  displayPrice?: number;
  sellingPrice?: number;
  fileUrl?: string | null;
  isActive?: boolean;
  previewOutline?: string[];
  sampleQuestions?: SampleQuestionBody[];
  previewOmrImageUrl?: string | null;
  previewOmrInstructions?: string[];
}

/** Validates the shared shape of a create/update body — used by both POST /api/admin/products and PATCH /api/admin/products/[id]. `requireCore: true` (create) demands title/description/prices even when absent; PATCH passes false so an omitted field just means "leave unchanged", while a present-but-empty one still fails. */
export function validateProductBody(body: ProductBody, { requireCore }: { requireCore: boolean }): string | null {
  if (requireCore || body.productType !== undefined) {
    if (!body.productType || !PRODUCT_TYPES.includes(body.productType as (typeof PRODUCT_TYPES)[number])) {
      return "productType must be one of MOCK_SERIES, QUESTION_BOOKLET, OMR_KIT, LIVE_BOOTCAMP, MEGA_BUNDLE.";
    }
  }
  if (requireCore && (!body.titleEn?.trim() || !body.descriptionEn?.trim())) {
    return "An English title and description are required.";
  }
  if (body.titleEn !== undefined && !body.titleEn.trim()) return "Title cannot be empty.";
  if (body.descriptionEn !== undefined && !body.descriptionEn.trim()) return "Description cannot be empty.";
  if (requireCore && (typeof body.displayPrice !== "number" || typeof body.sellingPrice !== "number")) {
    return "displayPrice and sellingPrice are required numbers.";
  }
  if (body.displayPrice !== undefined && (typeof body.displayPrice !== "number" || body.displayPrice < 0)) {
    return "displayPrice must be a non-negative number.";
  }
  if (body.sellingPrice !== undefined && (typeof body.sellingPrice !== "number" || body.sellingPrice < 0)) {
    return "sellingPrice must be a non-negative number.";
  }
  if (body.targetExam && !EXAM_TYPES.includes(body.targetExam as (typeof EXAM_TYPES)[number])) {
    return "targetExam must be a valid exam type.";
  }
  if (body.targetClass && !CLASS_LEVELS.includes(body.targetClass as (typeof CLASS_LEVELS)[number])) {
    return "targetClass must be CLASS_6 or CLASS_9.";
  }
  if (body.sampleQuestions?.some((q) => !q.stem?.en?.trim() || !q.options?.length || !q.correctOptionId)) {
    return "Each sample question needs a stem, options, and a correct option id.";
  }
  return null;
}

/** Converts admin-form sample questions into Product.previewSampleQuestions' Json shape. undefined (field omitted) means "leave unchanged" for PATCH; Prisma.JsonNull clears it when the admin removed every question. */
export function toSampleQuestionsJson(questions: SampleQuestionBody[] | undefined) {
  if (!questions) return undefined;
  if (questions.length === 0) return Prisma.JsonNull;
  return questions.map((q) => ({
    stem: { en: q.stem!.en!.trim(), hi: q.stem!.hi?.trim() || q.stem!.en!.trim() },
    options: q.options!.map((o) => ({ id: o.id, text: { en: o.text!.en!.trim(), hi: o.text!.hi?.trim() || o.text!.en!.trim() } })),
    correctOptionId: q.correctOptionId,
    explanation: q.explanation?.en?.trim() ? { en: q.explanation.en.trim(), hi: q.explanation.hi?.trim() || q.explanation.en.trim() } : null,
  }));
}
