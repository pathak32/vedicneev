import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { BatchUploadForm } from "@/components/BatchUploadForm";
import { PageHeader } from "@/components/dashboard/PageHeader";

// Session/ownership check does a live DB lookup keyed off the route param
// — never a candidate for static generation.
export const dynamic = "force-dynamic";

export default async function BatchUploadPage({ params }: { params: { id: string } }) {
  // getInstituteSession() is guaranteed non-null here — this route lives
  // under app/(protected), whose layout already redirected away otherwise.
  const session = (await getInstituteSession())!;

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || testBatch.instituteId !== session.institute.id) notFound();

  return (
    <>
      <PageHeader
        title={`${testBatch.batchName} — Upload Scanned Sheets`}
        description={`Test Code: ${testBatch.testCode} · ${testBatch.totalStudents} students · ${testBatch.totalQuestions} questions`}
        backHref={`/tests/${testBatch.id}/sheets`}
        backLabel="Back to batch"
      />
      {!testBatch.answerKey ? (
        <p
          role="status"
          className="mb-6 max-w-2xl rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-slate-700"
        >
          No answer key is set yet — uploaded sheets will still be matched against the roster and held as Queued
          until you{" "}
          <a href={`/tests/${testBatch.id}/answer-key`} className="font-medium text-brand-indigo hover:underline">
            set the answer key
          </a>
          .
        </p>
      ) : null}
      <BatchUploadForm testBatchId={testBatch.id} />
    </>
  );
}
