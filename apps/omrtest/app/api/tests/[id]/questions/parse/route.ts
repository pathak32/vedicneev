import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { extractTextFromDocument } from "@/lib/parsers/documentParser";
import { findDuplicates } from "@/lib/parsers/duplicateCheck";

// Reads an uploaded file and the institute's other batches — never cache
// or statically collect this route. Nothing is written here: this is the
// preview step, POST .../questions/save is what persists.
export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const SUPPORTED_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
]);

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || testBatch.instituteId !== session.institute.id) {
    return NextResponse.json({ error: "Test batch not found." }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data with a "file" field.' }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '"file" is required — a .docx or .pdf question paper.' }, { status: 400 });
  }
  if (!SUPPORTED_TYPES.has(file.type)) {
    return NextResponse.json({ error: `Unsupported file type "${file.type}" — upload a .docx or .pdf.` }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: `File is too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB).` }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await extractTextFromDocument(buffer, file.type);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Duplicate check scoped to this institute's OTHER batches — a
  // text-similarity heuristic, not true semantic/embedding search (see
  // duplicateCheck.ts's own comment on why). Capped at a generous but
  // bounded row count so this stays fast even for an institute with a
  // long test history.
  const existingItems = await prisma.testBatchQuestionItem.findMany({
    where: { testBatch: { instituteId: session.institute.id }, testBatchId: { not: testBatch.id }, text: { not: null } },
    select: { testBatchId: true, questionNumber: true, text: true, testBatch: { select: { batchName: true } } },
    take: 2000,
  });
  const duplicates = findDuplicates(
    parsed.questions.map((q) => ({ questionNumber: q.questionNumber, text: q.text })),
    existingItems
      .filter((item) => item.text)
      .map((item) => ({
        testBatchId: item.testBatchId,
        batchName: item.testBatch.batchName,
        questionNumber: item.questionNumber,
        text: item.text!,
      }))
  );

  return NextResponse.json({ questions: parsed.questions, duplicates });
}
