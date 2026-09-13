import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vedicneev/db";

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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: ProductBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validationError = validateProductBody(body, { requireCore: false });
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        productType: body.productType as (typeof PRODUCT_TYPES)[number] | undefined,
        title: body.titleEn !== undefined ? { en: body.titleEn.trim(), hi: body.titleHi?.trim() || body.titleEn.trim() } : undefined,
        description:
          body.descriptionEn !== undefined
            ? { en: body.descriptionEn.trim(), hi: body.descriptionHi?.trim() || body.descriptionEn.trim() }
            : undefined,
        targetExam: body.targetExam !== undefined ? (body.targetExam as (typeof EXAM_TYPES)[number]) || null : undefined,
        targetClass: body.targetClass !== undefined ? (body.targetClass as (typeof CLASS_LEVELS)[number]) || null : undefined,
        displayPrice: body.displayPrice,
        sellingPrice: body.sellingPrice,
        fileUrl: body.fileUrl !== undefined ? body.fileUrl?.trim() || null : undefined,
        isActive: body.isActive,
        previewOutline: body.previewOutline !== undefined ? (body.previewOutline.length ? body.previewOutline : Prisma.JsonNull) : undefined,
        previewSampleQuestions: toSampleQuestionsJson(body.sampleQuestions),
        previewOmrImageUrl: body.previewOmrImageUrl !== undefined ? body.previewOmrImageUrl?.trim() || null : undefined,
        previewOmrInstructions:
          body.previewOmrInstructions !== undefined ? (body.previewOmrInstructions.length ? body.previewOmrInstructions : Prisma.JsonNull) : undefined,
      },
    });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Package not found." }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return NextResponse.json({ error: "Package not found." }, { status: 404 });
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "This package has existing purchases and can't be deleted — deactivate it instead." },
          { status: 409 }
        );
      }
    }
    throw error;
  }
}
