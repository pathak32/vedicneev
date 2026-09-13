"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vedicneev/ui";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

import type { StorePreviewSampleQuestion, StoreProduct } from "@/lib/store/types";

/** One sample question card with a "Show answer" toggle so the correct option and explanation stay hidden until the visitor asks for them — mirrors how the real exam interface treats a question before it's answered. */
function SampleQuestionCard({ question, index }: { question: StorePreviewSampleQuestion; index: number }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <p className="text-sm font-medium text-foreground">
        <span className="text-muted-foreground">Q{index + 1}.</span> {question.stem}
      </p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {question.options.map((option) => {
          const isCorrect = revealed && option.id === question.correctOptionId;
          return (
            <li
              key={option.id}
              className={`flex items-start gap-2 rounded-md border px-3 py-1.5 text-sm ${
                isCorrect
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                  : "border-border text-foreground"
              }`}
            >
              {isCorrect ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : null}
              {option.text}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        {revealed ? (
          <>
            Hide answer <ChevronUp className="h-3.5 w-3.5" />
          </>
        ) : (
          <>
            Show answer & explanation <ChevronDown className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      {revealed && question.explanation ? (
        <p className="mt-2 rounded-md bg-background p-3 text-xs text-muted-foreground">{question.explanation}</p>
      ) : null}
    </div>
  );
}

export function ProductPreviewModal({
  product,
  onClose,
  onBuyNow,
}: {
  product: StoreProduct;
  onClose: () => void;
  onBuyNow: () => void;
}) {
  const hasOutline = !!product.previewOutline?.length;
  const hasSampleQuestions = !!product.previewSampleQuestions?.length;
  const hasOmrPreview = product.productType === "OMR_KIT" && (!!product.previewOmrImageUrl || !!product.previewOmrInstructions?.length);
  const hasAnyContent = hasOutline || hasSampleQuestions || hasOmrPreview;

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{product.title}</DialogTitle>
            <Badge variant="secondary">Free preview</Badge>
          </div>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="-mx-1 flex flex-1 flex-col gap-6 overflow-y-auto px-1 py-2">
          {hasOutline ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What&apos;s inside</p>
              <ul className="flex flex-col gap-1.5">
                {product.previewOutline!.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasSampleQuestions ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sample questions</p>
              {product.previewSampleQuestions!.map((question, index) => (
                <SampleQuestionCard key={index} question={question} index={index} />
              ))}
            </div>
          ) : null}

          {hasOmrPreview ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sample OMR sheet</p>
              {product.previewOmrImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin-pasted external asset URL, not a local image next/image can optimize
                <img
                  src={product.previewOmrImageUrl}
                  alt="Sample OMR answer sheet layout"
                  className="w-full max-w-sm rounded-lg border border-border object-contain"
                />
              ) : null}
              {product.previewOmrInstructions?.length ? (
                <ol className="flex flex-col gap-1.5 text-sm text-foreground">
                  {product.previewOmrInstructions.map((step, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="font-semibold text-muted-foreground">{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          ) : null}

          {!hasAnyContent ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              A detailed preview for this package is coming soon.
            </p>
          ) : null}
        </div>

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
