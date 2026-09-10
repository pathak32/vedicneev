"use client";

import { useState } from "react";
import { Badge, Button } from "@vedicneev/ui";
import { BookOpen, CalendarClock, Eye, FileText, Package, ScanLine } from "lucide-react";

import { selectActiveParent, useAuthStore } from "@/lib/auth/useAuthStore";
import type { StoreProduct, StoreProductType } from "@/lib/store/types";
import { ProductPreviewModal } from "./ProductPreviewModal";
import { StoreCheckoutDialog } from "./StoreCheckoutDialog";

const PRODUCT_ICON: Record<StoreProductType, typeof Package> = {
  MOCK_SERIES: FileText,
  QUESTION_BOOKLET: BookOpen,
  OMR_KIT: ScanLine,
  LIVE_BOOTCAMP: CalendarClock,
  MEGA_BUNDLE: Package,
};

/**
 * Browsing (the product grid, the preview modal) needs no sign-in at all —
 * only the checkout dialog itself cares who's buying, and even there an
 * absent parentPhone just means StoreCheckoutDialog runs its guest-checkout
 * path (see that component and POST /api/checkout) instead of blocking.
 */
export function StorePageClient({ products }: { products: StoreProduct[] }) {
  const parent = useAuthStore(selectActiveParent);
  const [previewProduct, setPreviewProduct] = useState<StoreProduct | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<StoreProduct | null>(null);

  const bumpProduct = products.find((p) => p.productType === "OMR_KIT");

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((product) => {
          const Icon = PRODUCT_ICON[product.productType];
          const discountPercent = Math.round((1 - product.sellingPrice / product.displayPrice) * 100);

          return (
            <div
              key={product.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  {discountPercent > 0 ? <Badge variant="secondary">{discountPercent}% off</Badge> : null}
                </div>
                <h2 className="mt-3 text-lg font-bold text-foreground">{product.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">₹{product.sellingPrice.toLocaleString("en-IN")}</span>
                  <span className="text-sm text-muted-foreground line-through">₹{product.displayPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setPreviewProduct(product)}>
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button className="flex-1" onClick={() => setCheckoutProduct(product)}>
                  Buy Now
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {previewProduct ? (
        <ProductPreviewModal
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
          onBuyNow={() => {
            setCheckoutProduct(previewProduct);
            setPreviewProduct(null);
          }}
        />
      ) : null}

      {checkoutProduct ? (
        <StoreCheckoutDialog
          primaryProduct={checkoutProduct}
          bumpProduct={checkoutProduct.productType === "OMR_KIT" ? undefined : bumpProduct}
          parentPhone={parent?.phone}
          onCancel={() => setCheckoutProduct(null)}
          // Deliberately doesn't close the dialog — it stays open on its
          // own "Purchase complete!" screen (with a link into the
          // library) until the user navigates away or closes it
          // themselves via onCancel.
          onSuccess={() => {}}
        />
      ) : null}
    </>
  );
}
