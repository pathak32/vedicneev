import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";
import { generateOmrSheetSpec } from "@vedicneev/engine";

import { getInstituteSession } from "@/lib/institute/session";
import { SHEET_TOKEN_DIGITS } from "@/lib/tests/createTestBatch";
import { renderInstituteOmrPrintHtml } from "@/lib/omr/renderInstituteOmrPrintHtml";

// Reads roster entries fresh and stamps downloadedAt — never cache or
// statically collect this route.
export const dynamic = "force-dynamic";

/**
 * Serves the full batch's watermarked OMR sheets as one printable HTML
 * document (window.print() -> "Save as PDF", same pattern
 * apps/web/app/api/omr/generate/route.ts already uses for its own
 * consumer sheets) — there is deliberately no "download a blank master"
 * path anywhere in this app; every sheet only ever exists already bound to
 * one TestBatchRosterEntry (see that model's own comment).
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const testBatch = await prisma.testBatch.findUnique({
    where: { id: params.id },
    include: { institute: true, rosterEntries: { orderBy: { sequenceNumber: "asc" } } },
  });

  // Not found and wrong-institute are reported identically — never confirm
  // to an authenticated admin of one institute that a given test batch id
  // belongs to a DIFFERENT institute.
  if (!testBatch || testBatch.instituteId !== session.institute.id) {
    return NextResponse.json({ error: "Test batch not found." }, { status: 404 });
  }

  const rollNumberDigits = Math.max(4, String(testBatch.totalStudents).length);
  const spec = generateOmrSheetSpec({
    examType: "OTHER",
    totalQuestions: testBatch.totalQuestions,
    rollNumberDigits,
    sheetTokenDigits: SHEET_TOKEN_DIGITS,
  });

  const html = renderInstituteOmrPrintHtml(
    spec,
    {
      instituteName: testBatch.institute.name,
      instituteSlug: testBatch.institute.slug,
      batchName: testBatch.batchName,
      testCode: testBatch.testCode,
      subject: testBatch.subject ?? "",
    },
    testBatch.rosterEntries.map((entry) => ({
      sequenceNumber: entry.sequenceNumber,
      rollNumber: entry.rollNumber,
      sheetToken: entry.sheetToken,
      studentName: entry.studentName,
    }))
  );

  const now = new Date();
  await prisma.$transaction([
    prisma.testBatch.update({ where: { id: testBatch.id }, data: { sheetsGeneratedAt: testBatch.sheetsGeneratedAt ?? now } }),
    prisma.testBatchRosterEntry.updateMany({
      where: { testBatchId: testBatch.id, downloadedAt: null },
      data: { downloadedAt: now },
    }),
  ]);

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
