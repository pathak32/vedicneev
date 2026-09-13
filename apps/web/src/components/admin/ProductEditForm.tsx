"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Switch } from "@vedicneev/ui";
import { Plus, Trash2 } from "lucide-react";

import type { StoreProductType } from "@/lib/store/types";

const PRODUCT_TYPE_OPTIONS: { value: StoreProductType; label: string }[] = [
  { value: "MOCK_SERIES", label: "Mock Series" },
  { value: "QUESTION_BOOKLET", label: "Question Booklet" },
  { value: "OMR_KIT", label: "OMR Kit" },
  { value: "LIVE_BOOTCAMP", label: "Live Bootcamp" },
  { value: "MEGA_BUNDLE", label: "Mega Bundle" },
];

const EXAM_OPTIONS = ["JNVST", "AISSEE", "RMS", "DPS", "OTHER"] as const;
const OPTION_IDS = ["a", "b", "c", "d"] as const;

export interface ProductSampleQuestionFormValue {
  stemEn: string;
  stemHi: string;
  options: { id: string; textEn: string; textHi: string }[];
  correctOptionId: string;
  explanationEn: string;
  explanationHi: string;
}

function emptySampleQuestion(): ProductSampleQuestionFormValue {
  return {
    stemEn: "",
    stemHi: "",
    options: OPTION_IDS.map((id) => ({ id, textEn: "", textHi: "" })),
    correctOptionId: "a",
    explanationEn: "",
    explanationHi: "",
  };
}

export interface ProductEditFormValues {
  productType: StoreProductType;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  targetExam: "" | (typeof EXAM_OPTIONS)[number];
  targetClass: "" | "CLASS_6" | "CLASS_9";
  displayPrice: number;
  sellingPrice: number;
  fileUrl: string;
  isActive: boolean;
  previewOutline: string[];
  sampleQuestions: ProductSampleQuestionFormValue[];
  previewOmrImageUrl: string;
  previewOmrInstructions: string[];
}

export interface ProductEditFormProps {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: ProductEditFormValues;
}

const EMPTY_VALUES: ProductEditFormValues = {
  productType: "MOCK_SERIES",
  titleEn: "",
  titleHi: "",
  descriptionEn: "",
  descriptionHi: "",
  targetExam: "",
  targetClass: "",
  displayPrice: 0,
  sellingPrice: 0,
  fileUrl: "",
  isActive: true,
  previewOutline: [],
  sampleQuestions: [],
  previewOmrImageUrl: "",
  previewOmrInstructions: [],
};

const inputClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
const textareaClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const labelClass = "text-sm font-medium text-foreground";
const sectionClass = "flex flex-col gap-3 rounded-xl border border-border p-4";

/** Add/edit/remove rows of a plain string[] field — used for both previewOutline (table of contents) and previewOmrInstructions. */
function StringListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (next: string[]) => void; placeholder: string }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => onChange(items.map((it, i) => (i === index ? e.target.value : it)))}
            placeholder={placeholder}
            className={inputClass}
          />
          <Button type="button" variant="outline" size="icon" onClick={() => onChange(items.filter((_, i) => i !== index))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => onChange([...items, ""])}>
        <Plus className="h-4 w-4" />
        Add line
      </Button>
    </div>
  );
}

export function ProductEditForm({ mode, productId, initialValues }: ProductEditFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductEditFormValues>(initialValues ?? EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ProductEditFormValues>(key: K, value: ProductEditFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function updateQuestion(index: number, patch: Partial<ProductSampleQuestionFormValue>) {
    setValues((v) => ({
      ...v,
      sampleQuestions: v.sampleQuestions.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    }));
  }

  function updateQuestionOption(qIndex: number, optionIndex: number, patch: Partial<{ textEn: string; textHi: string }>) {
    setValues((v) => ({
      ...v,
      sampleQuestions: v.sampleQuestions.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, oi) => (oi === optionIndex ? { ...o, ...patch } : o)) } : q
      ),
    }));
  }

  const showsOmr = values.productType === "OMR_KIT";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: values.productType,
          titleEn: values.titleEn,
          titleHi: values.titleHi,
          descriptionEn: values.descriptionEn,
          descriptionHi: values.descriptionHi,
          targetExam: values.targetExam || null,
          targetClass: values.targetClass || null,
          displayPrice: values.displayPrice,
          sellingPrice: values.sellingPrice,
          fileUrl: values.fileUrl || null,
          isActive: values.isActive,
          previewOutline: values.previewOutline.filter((s) => s.trim()),
          sampleQuestions: values.sampleQuestions
            .filter((q) => q.stemEn.trim())
            .map((q) => ({
              stem: { en: q.stemEn.trim(), hi: q.stemHi.trim() || q.stemEn.trim() },
              options: q.options.map((o) => ({ id: o.id, text: { en: o.textEn.trim(), hi: o.textHi.trim() || o.textEn.trim() } })),
              correctOptionId: q.correctOptionId,
              explanation: q.explanationEn.trim() ? { en: q.explanationEn.trim(), hi: q.explanationHi.trim() || q.explanationEn.trim() } : null,
            })),
          previewOmrImageUrl: values.previewOmrImageUrl || null,
          previewOmrInstructions: values.previewOmrInstructions.filter((s) => s.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save the package.");
        return;
      }
      router.push("/admin/store");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="product-type" className={labelClass}>
          Package Type
        </label>
        <select
          id="product-type"
          value={values.productType}
          onChange={(e) => update("productType", e.target.value as StoreProductType)}
          className={inputClass}
        >
          {PRODUCT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-title-en" className={labelClass}>
            Title (English)
          </label>
          <input id="product-title-en" value={values.titleEn} onChange={(e) => update("titleEn", e.target.value)} required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-title-hi" className={labelClass}>
            Title (Hindi) <span className="font-normal text-muted-foreground">— optional, falls back to English</span>
          </label>
          <input id="product-title-hi" value={values.titleHi} onChange={(e) => update("titleHi", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-desc-en" className={labelClass}>
            Description (English)
          </label>
          <textarea id="product-desc-en" value={values.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} required rows={2} className={textareaClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-desc-hi" className={labelClass}>
            Description (Hindi) <span className="font-normal text-muted-foreground">— optional</span>
          </label>
          <textarea id="product-desc-hi" value={values.descriptionHi} onChange={(e) => update("descriptionHi", e.target.value)} rows={2} className={textareaClass} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-display-price" className={labelClass}>
            MRP (₹, struck through)
          </label>
          <input
            id="product-display-price"
            type="number"
            min={0}
            value={values.displayPrice}
            onChange={(e) => update("displayPrice", Number(e.target.value))}
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-selling-price" className={labelClass}>
            Selling Price (₹)
          </label>
          <input
            id="product-selling-price"
            type="number"
            min={0}
            value={values.sellingPrice}
            onChange={(e) => update("sellingPrice", Number(e.target.value))}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="product-file-url" className={labelClass}>
          File URL <span className="font-normal text-muted-foreground">— delivered to buyers after purchase, optional</span>
        </label>
        <input id="product-file-url" value={values.fileUrl} onChange={(e) => update("fileUrl", e.target.value)} placeholder="https://..." className={inputClass} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-exam" className={labelClass}>
            Exam Board
          </label>
          <select id="product-exam" value={values.targetExam} onChange={(e) => update("targetExam", e.target.value as ProductEditFormValues["targetExam"])} className={inputClass}>
            <option value="">Every exam</option>
            {EXAM_OPTIONS.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-class" className={labelClass}>
            Class Level
          </label>
          <select id="product-class" value={values.targetClass} onChange={(e) => update("targetClass", e.target.value as ProductEditFormValues["targetClass"])} className={inputClass}>
            <option value="">Both classes</option>
            <option value="CLASS_6">Class 6 only</option>
            <option value="CLASS_9">Class 9 only</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={values.isActive} onCheckedChange={(checked) => update("isActive", checked)} />
        <span className={labelClass}>{values.isActive ? "Active — visible on /store" : "Inactive — hidden from /store"}</span>
      </div>

      <div className={sectionClass}>
        <p className={labelClass}>Table of contents (preview)</p>
        <p className="text-xs text-muted-foreground">Shown as a checklist in the preview modal, e.g. &quot;Chapter 1: Mental Ability&quot;.</p>
        <StringListEditor items={values.previewOutline} onChange={(next) => update("previewOutline", next)} placeholder="Chapter title" />
      </div>

      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <div>
            <p className={labelClass}>Sample questions (preview)</p>
            <p className="text-xs text-muted-foreground">2-3 curated worked examples shown before purchase. Leave the stem blank to skip a slot.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => update("sampleQuestions", [...values.sampleQuestions, emptySampleQuestion()])}>
            <Plus className="h-4 w-4" />
            Add question
          </Button>
        </div>

        {values.sampleQuestions.map((question, qIndex) => (
          <div key={qIndex} className="flex flex-col gap-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Question {qIndex + 1}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => update("sampleQuestions", values.sampleQuestions.filter((_, i) => i !== qIndex))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <textarea
                value={question.stemEn}
                onChange={(e) => updateQuestion(qIndex, { stemEn: e.target.value })}
                placeholder="Question stem (English)"
                rows={2}
                className={textareaClass}
              />
              <textarea
                value={question.stemHi}
                onChange={(e) => updateQuestion(qIndex, { stemHi: e.target.value })}
                placeholder="Question stem (Hindi) — optional"
                rows={2}
                className={textareaClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              {question.options.map((option, oIndex) => (
                <div key={option.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={question.correctOptionId === option.id}
                    onChange={() => updateQuestion(qIndex, { correctOptionId: option.id })}
                    aria-label={`Option ${option.id.toUpperCase()} is correct`}
                  />
                  <input
                    value={option.textEn}
                    onChange={(e) => updateQuestionOption(qIndex, oIndex, { textEn: e.target.value })}
                    placeholder={`Option ${option.id.toUpperCase()} (English)`}
                    className={inputClass}
                  />
                  <input
                    value={option.textHi}
                    onChange={(e) => updateQuestionOption(qIndex, oIndex, { textHi: e.target.value })}
                    placeholder={`Option ${option.id.toUpperCase()} (Hindi) — optional`}
                    className={inputClass}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">The selected radio button marks the correct option.</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <textarea
                value={question.explanationEn}
                onChange={(e) => updateQuestion(qIndex, { explanationEn: e.target.value })}
                placeholder="Explanation (English) — optional"
                rows={2}
                className={textareaClass}
              />
              <textarea
                value={question.explanationHi}
                onChange={(e) => updateQuestion(qIndex, { explanationHi: e.target.value })}
                placeholder="Explanation (Hindi) — optional"
                rows={2}
                className={textareaClass}
              />
            </div>
          </div>
        ))}
      </div>

      {showsOmr ? (
        <div className={sectionClass}>
          <p className={labelClass}>Sample OMR sheet (preview)</p>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="product-omr-image" className="text-xs text-muted-foreground">
              Sample sheet image URL
            </label>
            <input
              id="product-omr-image"
              value={values.previewOmrImageUrl}
              onChange={(e) => update("previewOmrImageUrl", e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
            {values.previewOmrImageUrl.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin-pasted external URL, not a local asset next/image can optimize
              <img src={values.previewOmrImageUrl.trim()} alt="" className="h-32 w-24 rounded-md border border-border object-contain" />
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">Usage instructions, shown as a numbered list.</p>
          <StringListEditor items={values.previewOmrInstructions} onChange={(next) => update("previewOmrInstructions", next)} placeholder="Instruction step" />
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : mode === "create" ? "Create Package" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/store")}>
          Cancel
        </Button>
        {mode === "edit" ? (
          <Button
            type="button"
            variant="outline"
            className="ml-auto text-destructive hover:text-destructive"
            disabled={submitting}
            onClick={async () => {
              if (!window.confirm("Delete this package? This can't be undone.")) return;
              setSubmitting(true);
              const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
              const data = await res.json().catch(() => ({}));
              if (res.ok) {
                router.push("/admin/store");
                router.refresh();
              } else {
                setError(data.error ?? "Could not delete the package. Try deactivating it instead.");
                setSubmitting(false);
              }
            }}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
