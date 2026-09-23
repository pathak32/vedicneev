import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { buildInstituteOmrSheetSpec } from "@/lib/omr/instituteSheetSpec";
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
 *
 * `?set=SET_2` restricts the document to that set's roster slice only —
 * the "download buttons for Set 1, Set 2, ..." the answer-key page renders
 * once multi-set generation has run. Omit it (or on a batch that never
 * generated sets) to get every roster entry in one document, unchanged
 * from before multi-set existed.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
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

  const requestedSet = new URL(request.url).searchParams.get("set");
  const rosterEntries = requestedSet
    ? testBatch.rosterEntries.filter((entry) => entry.setCode === requestedSet)
    : testBatch.rosterEntries;
  if (requestedSet && rosterEntries.length === 0) {
    return NextResponse.json({ error: `No roster entries are assigned to "${requestedSet}".` }, { status: 404 });
  }

  const spec = buildInstituteOmrSheetSpec(testBatch);

  const html = renderInstituteOmrPrintHtml(
    spec,
    {
      instituteName: testBatch.institute.name,
      instituteSlug: testBatch.institute.slug,
      batchName: testBatch.batchName,
      testCode: testBatch.testCode,
      subject: testBatch.subject ?? "",
      brandColor: testBatch.institute.brandColor,
    },
    rosterEntries.map((entry) => ({
      sequenceNumber: entry.sequenceNumber,
      rollNumber: entry.rollNumber,
      sheetToken: entry.sheetToken,
      studentName: entry.studentName,
      setCode: entry.setCode,
    }))
  );

  const now = new Date();
  await prisma.$transaction([
    prisma.testBatch.update({ where: { id: testBatch.id }, data: { sheetsGeneratedAt: testBatch.sheetsGeneratedAt ?? now } }),
    prisma.testBatchRosterEntry.updateMany({
      // Scoped to the entries actually IN this response — a Set 2-only
      // download must never mark Set 1/3/4's still-unfetched entries as
      // downloaded.
      where: { id: { in: rosterEntries.map((entry) => entry.id) }, downloadedAt: null },
      data: { downloadedAt: now },
    }),
  ]);

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
