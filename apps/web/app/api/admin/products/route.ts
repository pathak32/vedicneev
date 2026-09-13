import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";
import {
  CLASS_LEVELS,
  EXAM_TYPES,
  PRODUCT_TYPES,
  toSampleQuestionsJson,
  validateProductBody,
  type ProductBody,
} from "@/lib/store/productAdminValidation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: ProductBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validationError = validateProductBody(body, { requireCore: true });
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const product = await prisma.product.create({
    data: {
      productType: body.productType as (typeof PRODUCT_TYPES)[number],
      title: { en: body.titleEn!.trim(), hi: body.titleHi?.trim() || body.titleEn!.trim() },
      description: { en: body.descriptionEn!.trim(), hi: body.descriptionHi?.trim() || body.descriptionEn!.trim() },
      targetExam: (body.targetExam as (typeof EXAM_TYPES)[number]) || null,
      targetClass: (body.targetClass as (typeof CLASS_LEVELS)[number]) || null,
      displayPrice: body.displayPrice!,
      sellingPrice: body.sellingPrice!,
      fileUrl: body.fileUrl?.trim() || null,
      isActive: body.isActive ?? true,
      previewOutline: body.previewOutline?.length ? body.previewOutline : undefined,
      previewSampleQuestions: toSampleQuestionsJson(body.sampleQuestions),
      previewOmrImageUrl: body.previewOmrImageUrl?.trim() || null,
      previewOmrInstructions: body.previewOmrInstructions?.length ? body.previewOmrInstructions : undefined,
    },
  });
  return NextResponse.json({ success: true, product }, { status: 201 });
}
