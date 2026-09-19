import { redirect } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { getInstituteCreditBalance } from "@/lib/institute/credits";

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

  // No InstituteSubscription exists yet for a pilot institute (Phase 4's
  // Razorpay wiring isn't built) — the ledger has no billing-period start to
  // anchor on in that case, so fall back to the institute's own creation
  // date, which still correctly sums every ledger row it has ever had.
  const subscription = await prisma.instituteSubscription.findUnique({ where: { instituteId: institute.id } });
  const periodStart = subscription?.currentPeriodStart ?? institute.createdAt;
  const creditBalance = await getInstituteCreditBalance(institute.id, periodStart);

  const testBatches = await prisma.testBatch.findMany({
    where: { instituteId: institute.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const mostRecentBatch = testBatches[0];

  return (
    <main>
      <h1>{institute.name}</h1>
      <p>Scan credit balance: {creditBalance}</p>

      <p>
        <a href="/tests/new">
          <button type="button">Generate OMR Sheets</button>
        </a>{" "}
        {mostRecentBatch ? (
          <a href={`/tests/${mostRecentBatch.id}/upload`}>
            <button type="button">Upload Scanned Sheets</button>
          </a>
        ) : (
          <button type="button" disabled title="Create a test batch first">
            Upload Scanned Sheets
          </button>
        )}
      </p>

      <h2>Test Batches</h2>
      {testBatches.length === 0 ? (
        <p>No test batches yet — generate your first one above.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Batch</th>
              <th>Test Code</th>
              <th>Students</th>
              <th>Answer Key</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {testBatches.map((batch) => (
              <tr key={batch.id}>
                <td>{batch.batchName}</td>
                <td>{batch.testCode}</td>
                <td>{batch.totalStudents}</td>
                <td>{batch.answerKey ? "Set" : "Not set"}</td>
                <td>
                  <a href={`/tests/${batch.id}/sheets`}>Sheets</a> &middot;{" "}
                  <a href={`/tests/${batch.id}/upload`}>Upload</a> &middot;{" "}
                  <a href={`/tests/${batch.id}/answer-key`}>Answer Key</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
