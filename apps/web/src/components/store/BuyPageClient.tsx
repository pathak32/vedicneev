"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@vedicneev/ui";
import { ShieldCheck } from "lucide-react";

import type { StoreProduct } from "@/lib/store/types";
import { StoreCheckoutDialog } from "./StoreCheckoutDialog";

/**
 * The page behind /buy/[productId]'s checkout dialog — opens straight into
 * checkout (checkoutOpen starts true) rather than requiring a click, since
 * a visitor who followed a promotional link here already decided to buy.
 * Stays as a plain product summary with its own "Buy Now" if they close
 * the dialog, instead of being a blank page with nothing to do next.
 */
export function BuyPageClient({ product, initialPromoCode }: { product: StoreProduct; initialPromoCode?: string }) {
  const [checkoutOpen, setCheckoutOpen] = useState(true);
  const discountPercent = Math.round((1 - product.sellingPrice / product.displayPrice) * 100);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <ShieldCheck className="h-8 w-8 text-primary" />
      <h1 className="text-xl font-bold text-foreground">{product.title}</h1>
      <p className="text-sm text-muted-foreground">{product.description}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">₹{product.sellingPrice.toLocaleString("en-IN")}</span>
        <span className="text-sm text-muted-foreground line-through">₹{product.displayPrice.toLocaleString("en-IN")}</span>
        {discountPercent > 0 ? <span className="text-sm font-medium text-emerald-600">{discountPercent}% off</span> : null}
      </div>

      {product.previewOutline ? (
        <ul className="mt-2 flex flex-col gap-1.5 text-left text-sm text-muted-foreground">
          {product.previewOutline.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      ) : null}

      {!checkoutOpen ? (
        <Button size="lg" onClick={() => setCheckoutOpen(true)}>
          Buy Now
        </Button>
      ) : null}

      <Link href="/store" className="text-xs text-muted-foreground underline">
        Browse everything else in the Store
      </Link>

      {checkoutOpen ? (
        <StoreCheckoutDialog
          primaryProduct={product}
          initialPromoCode={initialPromoCode}
          onCancel={() => setCheckoutOpen(false)}
          onSuccess={() => {}}
        />
      ) : null}
    </div>
  );
}
