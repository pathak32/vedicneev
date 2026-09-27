import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { canAccessTestBatch } from "@/lib/institute/facultyScope";
import { generateQuestionsFromBank, type BankAllocation } from "@/lib/tests/generateFromBank";

// Reads the request's cookie jar via getInstituteSession — never
// prerenderable. Nothing is written here: this only builds a preview, the
// same way /questions/parse does — POST .../questions/save is still the
// only route that persists TestBatchQuestionItem rows.
export const dynamic = "force-dynamic";

interface RequestBody {
  allocations?: { topicId?: string; count?: number }[];
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || !canAccessTestBatch(session, testBatch)) {
    return NextResponse.json({ error: "Test batch not found." }, { status: 404 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const allocations: BankAllocation[] = [];
  for (const raw of body.allocations ?? []) {
    if (typeof raw.topicId !== "string" || !raw.topicId) {
      return NextResponse.json({ error: "Every allocation needs a topicId." }, { status: 400 });
    }
    const count = Number(raw.count);
    if (!Number.isInteger(count) || count <= 0) {
      return NextResponse.json({ error: `Invalid question count for topic ${raw.topicId}.` }, { status: 400 });
    }
    allocations.push({ topicId: raw.topicId, count });
  }
  if (allocations.length === 0) {
    return NextResponse.json({ error: "Pick at least one topic and question count." }, { status: 400 });
  }

  const result = await generateQuestionsFromBank(testBatch, allocations);
  return NextResponse.json(result);
}
