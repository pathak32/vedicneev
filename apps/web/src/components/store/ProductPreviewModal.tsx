"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vedicneev/ui";
import { CheckCircle2 } from "lucide-react";

import type { StoreProduct } from "@/lib/store/types";

/**
 * Description + table-of-contents preview, opened without any sign-in
 * requirement — the Store's whole point after this phase is that a
 * visitor can see what they'd be buying before committing to anything, not
 * just before paying. No real extracted PDF pages, per the confirmed
 * design decision — just the description and Product.previewOutline.
 */
export function ProductPreviewModal({
  product,
  onClose,
  onBuyNow,
}: {
  product: StoreProduct;
  onClose: () => void;
  onBuyNow: () => void;
}) {
  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        {product.previewOutline && product.previewOutline.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What&apos;s inside
            </p>
            <ul className="flex flex-col gap-1.5">
              {product.previewOutline.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">₹{product.sellingPrice.toLocaleString("en-IN")}</span>
            <span className="text-xs text-muted-foreground line-through">
              ₹{product.displayPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <Button type="button" onClick={onBuyNow}>
            Buy Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
