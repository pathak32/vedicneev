import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, KeyRound, ScanLine } from "lucide-react";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { Button, Card, CardContent } from "@vedicneev/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";

// Session/ownership check does a live DB lookup keyed off the route param
// — never a candidate for static generation.
export const dynamic = "force-dynamic";

export default async function TestSheetsPage({ params }: { params: { id: string } }) {
  // getInstituteSession() is guaranteed non-null here — this route lives
  // under app/(protected), whose layout already redirected away otherwise.
  const session = (await getInstituteSession())!;

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || testBatch.instituteId !== session.institute.id) notFound();

  return (
    <>
      <PageHeader
        title={testBatch.batchName}
        description={`Test Code: ${testBatch.testCode} · Subject: ${testBatch.subject} · ${testBatch.totalStudents} students · ${testBatch.totalQuestions} questions`}
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />

      <Card className="max-w-2xl border-slate-200">
        <CardContent className="space-y-6 p-6">
          <p className="text-sm text-slate-600">
            Every OMR sheet below is pre-assigned to one student&apos;s roll number and a unique sheet ID — there is
            no generic, reusable master sheet for this batch.
          </p>

          <Button asChild size="lg">
            <a href={`/api/tests/${testBatch.id}/sheets`} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" aria-hidden="true" />
              Download OMR Sheets ({testBatch.totalStudents})
            </a>
          </Button>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <Button asChild variant="outline">
              <Link href={`/tests/${testBatch.id}/answer-key`}>
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                {testBatch.answerKey ? "Edit answer key" : "Set answer key"}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/tests/${testBatch.id}/upload`}>
                <ScanLine className="h-4 w-4" aria-hidden="true" />
                Upload scanned sheets
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
