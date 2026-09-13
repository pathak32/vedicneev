"use client";

import { useMemo, useState } from "react";
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

const PRODUCT_TYPE_LABEL: Record<StoreProductType, string> = {
  MOCK_SERIES: "Mock Series",
  QUESTION_BOOKLET: "Question Bank Booklet",
  OMR_KIT: "OMR Kit",
  LIVE_BOOTCAMP: "Live Bootcamp",
  MEGA_BUNDLE: "Mega Bundle",
};

const CLASS_LABEL: Record<"CLASS_6" | "CLASS_9", string> = {
  CLASS_6: "Class 6",
  CLASS_9: "Class 9",
};

type ExamFilter = Exclude<StoreProduct["targetExam"], null>;
type ClassFilter = "CLASS_6" | "CLASS_9";

/** Pill-style toggle button — active when `active`, otherwise an outline pill. */
function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button type="button" size="sm" variant={active ? "default" : "outline"} onClick={onClick}>
      {children}
    </Button>
  );
}

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
  const [examFilter, setExamFilter] = useState<ExamFilter | "ALL">("ALL");
  const [classFilter, setClassFilter] = useState<ClassFilter | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<StoreProductType | "ALL">("ALL");

  const bumpProduct = products.find((p) => p.productType === "OMR_KIT");

  // Only offer a pill for a value that actually appears among the live
  // products — an exam/class/type combination with nothing seeded for it
  // yet shouldn't show up as a selectable (and always-empty) filter.
  const examOptions = useMemo(
    () => Array.from(new Set(products.map((p) => p.targetExam).filter((v): v is ExamFilter => v !== null))),
    [products]
  );
  const classOptions = useMemo(
    () => Array.from(new Set(products.map((p) => p.targetClass).filter((v): v is ClassFilter => v !== null))),
    [products]
  );
  const typeOptions = useMemo(() => Array.from(new Set(products.map((p) => p.productType))), [products]);

  // A null targetExam/targetClass on the product means "every exam" /
  // "both classes" (see schema.prisma's Product model) — that product
  // stays visible no matter which specific exam/class pill is active,
  // it's only excluded by an exact, conflicting productType filter.
  const filteredProducts = products.filter(
    (product) =>
      (examFilter === "ALL" || product.targetExam === null || product.targetExam === examFilter) &&
      (classFilter === "ALL" || product.targetClass === null || product.targetClass === classFilter) &&
      (typeFilter === "ALL" || product.productType === typeFilter)
  );

  return (
    <>
      {examOptions.length > 1 || classOptions.length > 1 || typeOptions.length > 1 ? (
        <div className="mb-6 flex flex-col gap-3">
          {examOptions.length > 1 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exam</span>
              <FilterPill active={examFilter === "ALL"} onClick={() => setExamFilter("ALL")}>
                All
              </FilterPill>
              {examOptions.map((exam) => (
                <FilterPill key={exam} active={examFilter === exam} onClick={() => setExamFilter(exam)}>
                  {exam}
                </FilterPill>
              ))}
            </div>
          ) : null}

          {classOptions.length > 1 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Class</span>
              <FilterPill active={classFilter === "ALL"} onClick={() => setClassFilter("ALL")}>
                All
              </FilterPill>
              {classOptions.map((level) => (
                <FilterPill key={level} active={classFilter === level} onClick={() => setClassFilter(level)}>
                  {CLASS_LABEL[level]}
                </FilterPill>
              ))}
            </div>
          ) : null}

          {typeOptions.length > 1 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Package Type</span>
              <FilterPill active={typeFilter === "ALL"} onClick={() => setTypeFilter("ALL")}>
                All
              </FilterPill>
              {typeOptions.map((type) => (
                <FilterPill key={type} active={typeFilter === type} onClick={() => setTypeFilter(type)}>
                  {PRODUCT_TYPE_LABEL[type]}
                </FilterPill>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {filteredProducts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No package matches that combination yet.
        </p>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredProducts.map((product) => {
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
      )}

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
