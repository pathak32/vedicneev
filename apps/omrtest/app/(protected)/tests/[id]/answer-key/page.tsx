import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { AnswerKeyForm } from "@/components/AnswerKeyForm";

// Session/ownership check does a live DB lookup keyed off the route param
// — never a candidate for static generation.
export const dynamic = "force-dynamic";

export default async function AnswerKeyPage({ params }: { params: { id: string } }) {
  // getInstituteSession() is guaranteed non-null here — this route lives
  // under app/(protected), whose layout already redirected away otherwise.
  const session = (await getInstituteSession())!;

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || testBatch.instituteId !== session.institute.id) notFound();

  return (
    <main>
      <h1>{testBatch.batchName} — Answer Key</h1>
      <p>
        Test Code: {testBatch.testCode} &middot; {testBatch.totalQuestions} questions
      </p>
      <AnswerKeyForm testBatchId={testBatch.id} totalQuestions={testBatch.totalQuestions} />
    </main>
  );
}
