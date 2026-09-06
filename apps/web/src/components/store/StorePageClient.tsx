"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button } from "@vedicneev/ui";
import { BookOpen, CalendarClock, FileText, Package, ScanLine } from "lucide-react";

import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectActiveParent, useAuthStore } from "@/lib/auth/useAuthStore";
import type { StoreProduct, StoreProductType } from "@/lib/store/types";
import { StoreCheckoutDialog } from "./StoreCheckoutDialog";

const PRODUCT_ICON: Record<StoreProductType, typeof Package> = {
  MOCK_SERIES: FileText,
  QUESTION_BOOKLET: BookOpen,
  OMR_KIT: ScanLine,
  LIVE_BOOTCAMP: CalendarClock,
  MEGA_BUNDLE: Package,
};

export function StorePageClient({ products }: { products: StoreProduct[] }) {
  const { isAuthenticated } = useActiveStudent();
  const parent = useAuthStore(selectActiveParent);
  const [checkoutProduct, setCheckoutProduct] = useState<StoreProduct | null>(null);

  const bumpProduct = products.find((p) => p.productType === "OMR_KIT");

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((product) => {
          const Icon = PRODUCT_ICON[product.productType];
          const discountPercent = Math.round((1 - product.sellingPrice / product.displayPrice) * 100);

          return (
            <div key={product.id} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
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

              {isAuthenticated && parent ? (
                <Button className="mt-4" onClick={() => setCheckoutProduct(product)}>
                  Buy Now
                </Button>
              ) : (
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/onboarding">Sign in to buy</Link>
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {checkoutProduct && parent ? (
        <StoreCheckoutDialog
          primaryProduct={checkoutProduct}
          bumpProduct={checkoutProduct.productType === "OMR_KIT" ? undefined : bumpProduct}
          parentPhone={parent.phone}
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
