import { prisma } from "@vedicneev/db";

import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";
import { StorePageClient } from "@/components/store/StorePageClient";
import type { StoreProduct } from "@/lib/store/types";

export const dynamic = "force-dynamic";

/**
 * Digital product storefront — one-time purchases (mock series, the 30-day
 * bootcamp, question booklets, the OMR kit, the mega bundle), distinct from
 * /pricing's recurring Subscription plans. See schema.prisma's Product/
 * PromoCode/Purchase models.
 */
export default async function StorePage() {
  const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } });

  const storeProducts: StoreProduct[] = products.map((product) => ({
    id: product.id,
    title: localize(product.title as Multilingual, "en"),
    description: localize(product.description as Multilingual, "en"),
    productType: product.productType,
    targetExam: product.targetExam,
    targetClass: product.targetClass,
    displayPrice: product.displayPrice,
    sellingPrice: product.sellingPrice,
    fileUrl: product.fileUrl,
    previewOutline: (product.previewOutline as string[] | null) ?? null,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground">Digital Knowledge Hub</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        One-time practice packs and bundles — buy once, keep access in your dashboard library forever.
      </p>

      <div className="mt-8">
        <StorePageClient products={storeProducts} />
      </div>

      {storeProducts.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No products are live yet — run the database seed scripts first.</p>
      ) : null}
    </div>
  );
}
