import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { QuestionUploadPanel } from "@/components/QuestionUploadPanel";
import { PageHeader } from "@/components/dashboard/PageHeader";

// Session/ownership check does a live DB lookup keyed off the route param
// — never a candidate for static generation.
export const dynamic = "force-dynamic";

export default async function UploadQuestionsPage({ params }: { params: { id: string } }) {
  const session = (await getInstituteSession())!;

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || testBatch.instituteId !== session.institute.id) notFound();

  return (
    <>
      <PageHeader
        title={`${testBatch.batchName} — Upload Question Paper`}
        description={`Test Code: ${testBatch.testCode} · ${testBatch.totalQuestions} questions`}
        backHref={`/tests/${testBatch.id}/sheets`}
        backLabel="Back to batch"
      />
      <QuestionUploadPanel testBatchId={testBatch.id} totalQuestions={testBatch.totalQuestions} />
    </>
  );
}
