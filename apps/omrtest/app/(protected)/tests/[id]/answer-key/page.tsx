import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { parseStoredAnswerKey } from "@/lib/tests/answerKey";
import { AnswerKeyForm } from "@/components/AnswerKeyForm";
import { MultiSetPanel } from "@/components/MultiSetPanel";
import { PageHeader } from "@/components/dashboard/PageHeader";

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
    <>
      <PageHeader
        title={`${testBatch.batchName} — Answer Key`}
        description={`Test Code: ${testBatch.testCode} · ${testBatch.totalQuestions} questions`}
        backHref={`/tests/${testBatch.id}/sheets`}
        backLabel="Back to batch"
      />
      <div className="flex flex-col gap-6">
        <AnswerKeyForm testBatchId={testBatch.id} totalQuestions={testBatch.totalQuestions} />
        <MultiSetPanel
          testBatchId={testBatch.id}
          hasCompleteAnswerKey={(parseStoredAnswerKey(testBatch.answerKey)?.length ?? 0) === testBatch.totalQuestions}
        />
      </div>
    </>
  );
}
