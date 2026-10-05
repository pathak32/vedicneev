import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";
import type { StoreProduct } from "@/lib/store/types";
import { BuyPageClient } from "@/components/store/BuyPageClient";

export const dynamic = "force-dynamic";

/**
 * A single-product deep link meant for promotion outside the site — a
 * YouTube description, a WhatsApp broadcast — that lands a viewer directly
 * on checkout for ONE specific product, skipping /store's browse-and-filter
 * grid entirely. Product.id already reads as a clean slug for everything
 * this site packages (e.g. "sample-paper-book-upss-class6-en" — see
 * package-sample-paper-books.mts/package-question-books.mts's own id
 * scheme), so no separate slug field was added for this.
 *
 * `?promo=CODE` passes straight through to StoreCheckoutDialog's
 * initialPromoCode, auto-applying it — pair one PromoCode per video (see
 * apps/web/scripts/create-promo-code.mts) to both give viewers a discount
 * and get a free per-video conversion count via that code's usageCount,
 * with no separate analytics wiring needed.
 */
export default async function BuyPage({
  params,
  searchParams,
}: {
  params: { productId: string };
  searchParams: { promo?: string };
}) {
  const product = await prisma.product.findUnique({ where: { id: params.productId } });
  if (!product || !product.isActive) notFound();

  const storeProduct: StoreProduct = {
    id: product.id,
    title: localize(product.title as Multilingual, "en"),
    description: localize(product.description as Multilingual, "en"),
    productType: product.productType,
    targetExam: product.targetExam,
    targetClass: product.targetClass,
    language: product.language,
    displayPrice: product.displayPrice,
    sellingPrice: product.sellingPrice,
    fileUrl: product.fileUrl,
    previewOutline: (product.previewOutline as string[] | null) ?? null,
    previewSampleQuestions: null,
    previewOmrImageUrl: product.previewOmrImageUrl,
    previewOmrInstructions: (product.previewOmrInstructions as string[] | null) ?? null,
  };

  return <BuyPageClient product={storeProduct} initialPromoCode={searchParams.promo} />;
}
