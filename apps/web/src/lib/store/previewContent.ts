import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";
import type { StorePreviewSampleQuestion } from "./types";

/** Raw shape stored in Product.previewSampleQuestions — bilingual, admin-authored. */
export interface PreviewSampleQuestionRaw {
  stem: Multilingual;
  options: { id: string; text: Multilingual }[];
  correctOptionId: string;
  explanation?: Multilingual | null;
}

/** Localizes Product.previewSampleQuestions' raw Json into the single-language shape the storefront renders. Returns null for anything that isn't a non-empty array (unset, malformed, or legacy rows). */
export function localizePreviewSampleQuestions(raw: unknown, language: "en" | "hi" = "en"): StorePreviewSampleQuestion[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return (raw as PreviewSampleQuestionRaw[]).map((q) => ({
    stem: localize(q.stem, language),
    options: q.options.map((o) => ({ id: o.id, text: localize(o.text, language) })),
    correctOptionId: q.correctOptionId,
    explanation: q.explanation ? localize(q.explanation, language) : null,
  }));
}
