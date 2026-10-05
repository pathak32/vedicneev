import { prisma } from "@vedicneev/db";

/**
 * True if this user has a PAID purchase of this EXACT Product row — not
 * the broader "any OMR-entitling product" check hasOmrEntitlement.ts does
 * for the institute-style offline-OMR flow. The sealed answer key behind
 * the sample-paper-book scan feature belongs to one specific book (one
 * exam/class/language edition), so entitlement has to be scoped to that
 * same specific Product, not any product that happens to also grant OMR
 * practice.
 */
export async function hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  const count = await prisma.purchase.count({
    where: { userId, productId, status: "PAID" },
  });
  return count > 0;
}
