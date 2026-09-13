import { notFound } from "next/navigation";

import { ProductEditForm, type ProductSampleQuestionFormValue } from "@/components/admin/ProductEditForm";
import type { Multilingual } from "@/lib/exam/types";
import type { PreviewSampleQuestionRaw } from "@/lib/store/previewContent";
import { getProductById } from "@/lib/store/adminQueries";

export const dynamic = "force-dynamic";

function toFormSampleQuestions(raw: unknown): ProductSampleQuestionFormValue[] {
  if (!Array.isArray(raw)) return [];
  return (raw as PreviewSampleQuestionRaw[]).map((q) => ({
    stemEn: q.stem.en ?? "",
    stemHi: q.stem.hi ?? "",
    options: q.options.map((o) => ({ id: o.id, textEn: o.text.en ?? "", textHi: o.text.hi ?? "" })),
    correctOptionId: q.correctOptionId,
    explanationEn: q.explanation?.en ?? "",
    explanationHi: q.explanation?.hi ?? "",
  }));
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  const title = product.title as Multilingual;
  const description = product.description as Multilingual;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-16">
      <h1 className="text-2xl font-bold text-foreground">Edit Digital Package</h1>
      <ProductEditForm
        mode="edit"
        productId={product.id}
        initialValues={{
          productType: product.productType,
          titleEn: title.en ?? "",
          titleHi: title.hi ?? "",
          descriptionEn: description.en ?? "",
          descriptionHi: description.hi ?? "",
          targetExam: product.targetExam ?? "",
          targetClass: product.targetClass ?? "",
          displayPrice: product.displayPrice,
          sellingPrice: product.sellingPrice,
          fileUrl: product.fileUrl ?? "",
          isActive: product.isActive,
          previewOutline: (product.previewOutline as string[] | null) ?? [],
          sampleQuestions: toFormSampleQuestions(product.previewSampleQuestions),
          previewOmrImageUrl: product.previewOmrImageUrl ?? "",
          previewOmrInstructions: (product.previewOmrInstructions as string[] | null) ?? [],
        }}
      />
    </div>
  );
}
