import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle, ScanLine } from "lucide-react";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { facultyTestBatchWhereClause } from "@/lib/institute/facultyScope";
import { getInstituteCreditBalance } from "@/lib/institute/credits";
import { Button, Card } from "@vedicneev/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default async function DashboardPage() {
  const session = await getInstituteSession();
  // Defensive, not redundant: app/(protected)/layout.tsx already redirects
  // away when there's no session on a real request, but a build-time
  // static-generation pass renders this page with no request in scope at
  // all — there, getInstituteSession legitimately returns null even though
  // the layout's own redirect() has no live request to act on. Redirecting
  // again here (rather than a `session!` assertion) keeps that case a
  // normal redirect instead of a build-breaking crash.
  if (!session) redirect("/login");

  const { institute } = session;

  // A pilot institute that hasn't subscribed via /billing yet has no
  // InstituteSubscription row — the ledger has no billing-period start to
  // anchor on in that case, so fall back to the institute's own creation
  // date, which still correctly sums every ledger row it has ever had
  // (its one-time welcome grant from createInstitute.ts included).
  const subscription = await prisma.instituteSubscription.findUnique({ where: { instituteId: institute.id } });
  const periodStart = subscription?.currentPeriodStart ?? institute.createdAt;
  const creditBalance = await getInstituteCreditBalance(institute.id, periodStart);

  const testBatches = await prisma.testBatch.findMany({
    where: facultyTestBatchWhereClause(session),
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const mostRecentBatch = testBatches[0];

  return (
    <>
      <PageHeader
        title={institute.name}
        description="Everything you've scanned and graded, in one place."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/tests/new">
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                Generate OMR Sheets
              </Link>
            </Button>
            {mostRecentBatch ? (
              <Button asChild>
                <Link href={`/tests/${mostRecentBatch.id}/upload`}>
                  <ScanLine className="h-4 w-4" aria-hidden="true" />
                  Upload Scanned Sheets
                </Link>
              </Button>
            ) : (
              <Button disabled title="Create a test batch first">
                <ScanLine className="h-4 w-4" aria-hidden="true" />
                Upload Scanned Sheets
              </Button>
            )}
          </>
        }
      />

      <QuickActions
        uploadHref={mostRecentBatch ? `/tests/${mostRecentBatch.id}/upload` : null}
        isOwner={session.admin.role === "OWNER"}
      />

      <DashboardMetrics
        creditBalance={creditBalance}
        batchCount={testBatches.length}
        mostRecentBatchName={mostRecentBatch ? mostRecentBatch.batchName : null}
      />

      <Card className="border-slate-200">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Test Batches</h2>
        </div>
        {testBatches.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-slate-500">No test batches yet — generate your first one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3 font-medium">Batch</th>
                  <th className="px-6 py-3 font-medium">Test Code</th>
                  <th className="px-6 py-3 font-medium">Students</th>
                  <th className="px-6 py-3 font-medium">Answer Key</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testBatches.map((batch) => (
                  <tr key={batch.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{batch.batchName}</td>
                    <td className="px-6 py-4 text-slate-600">{batch.testCode}</td>
                    <td className="px-6 py-4 text-slate-600">{batch.totalStudents}</td>
                    <td className="px-6 py-4">
                      <StatusBadge tone={batch.answerKey ? "success" : "secondary"}>
                        {batch.answerKey ? "Set" : "Not set"}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4 text-sm font-medium">
                        <Link href={`/tests/${batch.id}/sheets`} className="text-brand-indigo hover:underline">
                          Sheets
                        </Link>
                        <Link href={`/tests/${batch.id}/upload`} className="text-brand-indigo hover:underline">
                          Upload
                        </Link>
                        <Link href={`/tests/${batch.id}/answer-key`} className="text-brand-indigo hover:underline">
                          Answer Key
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
