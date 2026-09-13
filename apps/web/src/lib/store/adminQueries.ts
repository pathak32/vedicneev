import { prisma } from "@vedicneev/db";

/** Every Product regardless of active state, most recently updated first — the admin list view. Mirrors lib/media/adminQueries.ts's getAllMediaForAdmin shape. */
export function getAllProductsForAdmin() {
  return prisma.product.findMany({ orderBy: { updatedAt: "desc" } });
}

/** A single Product by id, or null — admin edit route 404s when this is null. */
export function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}
