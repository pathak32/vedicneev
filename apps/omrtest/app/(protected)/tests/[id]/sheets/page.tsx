import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";

// Reads the request's cookie jar and does a live DB lookup keyed off the
// route param — never a candidate for static generation.
export const dynamic = "force-dynamic";

export default async function TestSheetsPage({ params }: { params: { id: string } }) {
  // getInstituteSession() is guaranteed non-null here — this route lives
  // under app/(protected), whose layout already redirected away otherwise.
  const session = (await getInstituteSession())!;

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || testBatch.instituteId !== session.institute.id) notFound();

  return (
    <main>
      <h1>{testBatch.batchName}</h1>
      <p>
        Test Code: {testBatch.testCode} &middot; Subject: {testBatch.subject} &middot; {testBatch.totalStudents} students &middot;{" "}
        {testBatch.totalQuestions} questions
      </p>
      <p>
        Every OMR sheet below is pre-assigned to one student's roll number and a unique sheet ID — there is no generic,
        reusable master sheet for this batch.
      </p>
      <a href={`/api/tests/${testBatch.id}/sheets`} target="_blank" rel="noopener noreferrer">
        <button type="button">Download OMR Sheets ({testBatch.totalStudents})</button>
      </a>
      <p>
        <a href={`/tests/${testBatch.id}/answer-key`}>
          {testBatch.answerKey ? "Edit answer key" : "Set answer key"}
        </a>
      </p>
      <p>
        <a href={`/tests/${testBatch.id}/upload`}>Upload scanned sheets</a>
      </p>
    </main>
  );
}
