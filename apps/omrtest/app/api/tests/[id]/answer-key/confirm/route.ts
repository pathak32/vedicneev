import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { canAccessTestBatch } from "@/lib/institute/facultyScope";
import { parseStoredAnswerKey } from "@/lib/tests/answerKey";

// Writes TestBatch.answerKeyConfirmedAt — never cache or statically
// collect this route.
export const dynamic = "force-dynamic";

/**
 * The explicit sign-off Generate Multi-Set Papers gates on (see
 * TestBatch.answerKeyConfirmedAt's own comment) — deliberately its own
 * action, never implied by a save, so an institute can't reach "sets
 * generated" without a distinct moment where they said the key is right.
 */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || !canAccessTestBatch(session, testBatch)) {
    return NextResponse.json({ error: "Test batch not found." }, { status: 404 });
  }

  const entries = parseStoredAnswerKey(testBatch.answerKey);
  if (!entries || entries.length !== testBatch.totalQuestions) {
    return NextResponse.json({ error: "Save a complete answer key before confirming it." }, { status: 400 });
  }

  await prisma.testBatch.update({ where: { id: testBatch.id }, data: { answerKeyConfirmedAt: new Date() } });

  return NextResponse.json({ ok: true });
}
