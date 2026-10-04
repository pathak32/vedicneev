import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vedicneev/db";
import { generateOmrSheetSpec, type QuestionBookletExamType } from "@vedicneev/engine";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { hasPurchasedProduct } from "@/lib/store/sampleBookEntitlement";
import { decodeImageToGrayscale } from "@/lib/omr/decodeImage";
import { scanSampleBook, type SampleBookAnswerKeyEntry } from "@/lib/omr/scanSampleBook";
import { uploadScanImage } from "@/lib/omr/uploadScanImage";
import { SAMPLE_BOOK_OMR_EXAM_TYPE, SAMPLE_BOOK_ROLL_NUMBER_DIGITS } from "@/lib/omr/sampleBookOmrSpec";

// Decodes/stores an uploaded image and writes a DB row on every request —
// never cache or statically collect this route.
export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB — a phone photo comfortably fits well under this.
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const KNOWN_EXAM_TYPES = new Set<string>(["JNVST", "RMS", "AISSEE", "UPSS"]);

function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "jpg";
  }
}

/**
 * Scores one buyer's photo of a filled sample-book OMR sheet. Login-gated
 * (Phase 3's whole design premise, per this feature's own planning: scanning
 * is free, but only for a signed-in buyer of this exact book) and scoped to
 * one specific (productId, setNumber) the buyer picks from a dropdown —
 * see scanSampleBook.ts's own comment on why this ships without a printed
 * per-set code for now.
 */
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Log in with the WhatsApp number you purchased with to scan a sheet." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data with "productId", "setNumber", and "file" fields.' }, { status: 400 });
  }

  const productId = formData.get("productId");
  const setNumberRaw = formData.get("setNumber");
  const file = formData.get("file");

  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ error: '"productId" is required.' }, { status: 400 });
  }
  const setNumber = typeof setNumberRaw === "string" ? Number(setNumberRaw) : NaN;
  if (!Number.isInteger(setNumber) || setNumber < 1) {
    return NextResponse.json({ error: '"setNumber" must be a positive integer.' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '"file" is required and must be an image.' }, { status: 400 });
  }
  if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
    return NextResponse.json({ error: `Unsupported image type "${file.type}". Use JPEG, PNG, WEBP, or HEIC.` }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: `Image is too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB).` }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
  }

  const entitled = await hasPurchasedProduct(user.id, productId);
  if (!entitled) {
    return NextResponse.json({ error: "No paid purchase of this book was found on your account." }, { status: 403 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.targetExam || !KNOWN_EXAM_TYPES.has(product.targetExam)) {
    return NextResponse.json({ error: "This product is not a scannable sample-paper book." }, { status: 404 });
  }
  const examType = product.targetExam as QuestionBookletExamType;

  const answerKeyRow = await prisma.sampleBookAnswerKey.findUnique({
    where: { productId_setNumber: { productId, setNumber } },
  });
  if (!answerKeyRow) {
    return NextResponse.json({ error: `No answer key found for Set ${setNumber} of this book — check the set number and try again.` }, { status: 404 });
  }
  const answerKey = answerKeyRow.answerKey as unknown as SampleBookAnswerKeyEntry[];

  const buffer = Buffer.from(await file.arrayBuffer());

  let grayscaleImage;
  try {
    grayscaleImage = await decodeImageToGrayscale(buffer);
  } catch (error) {
    return NextResponse.json(
      { error: `Could not decode this image: ${error instanceof Error ? error.message : "unknown error"}` },
      { status: 400 }
    );
  }

  const spec = generateOmrSheetSpec({
    examType: SAMPLE_BOOK_OMR_EXAM_TYPE[examType],
    totalQuestions: answerKeyRow.totalQuestions,
    rollNumberDigits: SAMPLE_BOOK_ROLL_NUMBER_DIGITS,
  });

  const result = scanSampleBook(grayscaleImage, spec, answerKey);

  const stored = await uploadScanImage({
    userId: user.id,
    productId,
    buffer,
    contentType: file.type,
    fileExtension: extensionForContentType(file.type),
  });
  if (!stored.ok) {
    return NextResponse.json({ error: stored.error }, { status: 502 });
  }

  if (result.outcome === "UNREADABLE") {
    const attempt = await prisma.omrScanAttempt.create({
      data: {
        userId: user.id,
        productId,
        setNumber,
        imageUrl: stored.imageUrl,
        status: "UNREADABLE",
        failureReason: result.reason,
      },
    });
    return NextResponse.json({ scanId: attempt.id, status: attempt.status, reason: result.reason }, { status: 422 });
  }

  const attempt = await prisma.omrScanAttempt.create({
    data: {
      userId: user.id,
      productId,
      setNumber,
      imageUrl: stored.imageUrl,
      status: "SCORED",
      totalMarks: result.totalMarks,
      maxMarks: result.maxMarks,
      correctCount: result.correctCount,
      incorrectCount: result.incorrectCount,
      unattemptedCount: result.unattemptedCount,
      invalidCount: result.invalidCount,
      breakdown: result.responses as unknown as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({
    scanId: attempt.id,
    status: attempt.status,
    totalMarks: result.totalMarks,
    maxMarks: result.maxMarks,
    correctCount: result.correctCount,
    incorrectCount: result.incorrectCount,
    unattemptedCount: result.unattemptedCount,
    invalidCount: result.invalidCount,
    breakdown: result.responses,
  });
}
