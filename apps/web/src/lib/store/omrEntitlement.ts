import { ExamType, prisma } from "@vedicneev/db";

/** Any purchased SKU that plausibly includes offline OMR practice for a given exam/class — a booklet without an OMR kit is still meant to be paired with one, same as the Store's own order-bump copy implies. */
const OMR_ENTITLING_PRODUCT_TYPES = ["OMR_KIT", "QUESTION_BOOKLET", "MOCK_SERIES", "MEGA_BUNDLE"] as const;

function toContentClassLevel(classLevel: number): "CLASS_6" | "CLASS_9" | null {
  if (classLevel === 6) return "CLASS_6";
  if (classLevel === 9) return "CLASS_9";
  return null;
}

/**
 * True if this user has a PAID purchase of a product that covers drawing a
 * fresh offline OMR set for this exam/class — a null targetExam/targetClass
 * on the Product means "every exam"/"every class" (see Product's own model
 * comment), so a MEGA_BUNDLE or the exam-agnostic MOCK_SERIES/OMR_KIT SKUs
 * satisfy any combination. Does not check guestEmail/guestPhone purchases
 * not yet linked to a User row — see Purchase's guest-linking comment;
 * those become eligible once /api/checkout/guest-contact (or a matching
 * sign-in) links them to this same userId.
 */
export async function hasOmrEntitlement(userId: string, examType: ExamType, classLevel: number): Promise<boolean> {
  const contentClassLevel = toContentClassLevel(classLevel);

  const count = await prisma.purchase.count({
    where: {
      userId,
      status: "PAID",
      product: {
        productType: { in: [...OMR_ENTITLING_PRODUCT_TYPES] },
        OR: [{ targetExam: null }, { targetExam: examType }],
        AND: [{ OR: [{ targetClass: null }, ...(contentClassLevel ? [{ targetClass: contentClassLevel }] : [])] }],
      },
    },
  });

  return count > 0;
}
