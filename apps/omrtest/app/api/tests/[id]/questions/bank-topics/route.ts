import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { canAccessTestBatch } from "@/lib/institute/facultyScope";
import { getAvailableBankTopics } from "@/lib/tests/bankTopics";

// Reads the request's cookie jar via getInstituteSession — never prerenderable.
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || !canAccessTestBatch(session, testBatch)) {
    return NextResponse.json({ error: "Test batch not found." }, { status: 404 });
  }

  const sections = await getAvailableBankTopics(testBatch.examCategory, testBatch.classLevel);
  return NextResponse.json({ sections });
}
