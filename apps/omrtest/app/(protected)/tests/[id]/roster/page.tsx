import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { canAccessTestBatch } from "@/lib/institute/facultyScope";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RosterEditor } from "@/components/RosterEditor";

// Session/ownership check does a live DB lookup keyed off the route param
// — never a candidate for static generation.
export const dynamic = "force-dynamic";

export default async function RosterPage({ params }: { params: { id: string } }) {
  const session = (await getInstituteSession())!;

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || !canAccessTestBatch(session, testBatch)) notFound();

  const entries = await prisma.testBatchRosterEntry.findMany({
    where: { testBatchId: testBatch.id },
    orderBy: { sequenceNumber: "asc" },
    select: {
      id: true,
      rollNumber: true,
      studentName: true,
      parentName: true,
      parentPhone: true,
      parentEmail: true,
    },
  });

  return (
    <>
      <PageHeader
        title={`${testBatch.batchName} — Roster`}
        description={`Test Code: ${testBatch.testCode} · ${entries.length} student${entries.length === 1 ? "" : "s"}`}
        backHref={`/tests/${testBatch.id}/sheets`}
        backLabel="Back to batch"
      />
      <RosterEditor testBatchId={testBatch.id} entries={entries} />
    </>
  );
}
