import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";
import type { MasterQuestionItem, SetMappings } from "@vedicneev/engine";

import { getInstituteSession } from "@/lib/institute/session";
import { renderSetQuestionPaperHtml } from "@/lib/omr/renderSetQuestionPaperHtml";

// Reads live TestBatch state — never cache or statically collect this route.
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string; setCode: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || testBatch.instituteId !== session.institute.id) {
    return NextResponse.json({ error: "Test batch not found." }, { status: 404 });
  }

  const setMappings = testBatch.setMappings as unknown as SetMappings | null;
  const mapping = setMappings?.[params.setCode];
  if (!mapping) {
    return NextResponse.json(
      { error: `"${params.setCode}" doesn't exist for this batch — generate sets first.` },
      { status: 404 }
    );
  }

  const masterQuestions = (testBatch.masterQuestions as unknown as MasterQuestionItem[] | null) ?? null;

  const html = renderSetQuestionPaperHtml(
    {
      batchName: testBatch.batchName,
      testCode: testBatch.testCode,
      subject: testBatch.subject ?? "",
      setCode: params.setCode,
    },
    mapping.permutation,
    masterQuestions
  );

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
