import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { BatchUploadForm } from "@/components/BatchUploadForm";

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
    <main>
      <h1>{testBatch.batchName} — Upload Scanned Sheets</h1>
      <p>
        Test Code: {testBatch.testCode} &middot; {testBatch.totalStudents} students &middot; {testBatch.totalQuestions} questions
      </p>
      {!testBatch.answerKey ? (
        <p role="status">
          No answer key is set yet — uploaded sheets will still be matched against the roster and held as Queued until you{" "}
          <a href={`/tests/${testBatch.id}/answer-key`}>set the answer key</a>.
        </p>
      ) : null}
      <BatchUploadForm testBatchId={testBatch.id} />
    </main>
  );
}
