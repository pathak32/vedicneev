import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { canAccessTestBatch } from "@/lib/institute/facultyScope";
import { Card, CardContent } from "@vedicneev/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";

// Session/ownership check does a live DB lookup keyed off the route param
// — never a candidate for static generation.
export const dynamic = "force-dynamic";

function truncate(text: string | null, max = 90): string {
  if (!text) return "—";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default async function MistakeVaultPage({ params }: { params: { id: string } }) {
  // getInstituteSession() is guaranteed non-null here — this route lives
  // under app/(protected), whose layout already redirected away otherwise.
  const session = (await getInstituteSession())!;

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || !canAccessTestBatch(session, testBatch)) notFound();

  const mistakes = await prisma.testBatchMistake.findMany({
    where: { rosterEntry: { testBatchId: testBatch.id } },
    include: { rosterEntry: true, questionItem: true },
  });

  // Group by the specific question ITEM (not just questionNumber) — a
  // multi-set batch can have several TestBatchQuestionItem rows sharing
  // the same questionNumber (one per set variant), and those are distinct
  // questions with their own text/options/correctOption.
  type Mistake = (typeof mistakes)[number];
  const groups = new Map<string, { questionItem: Mistake["questionItem"]; entries: Mistake[] }>();
  for (const mistake of mistakes) {
    const existing = groups.get(mistake.questionItemId);
    if (existing) {
      existing.entries.push(mistake);
    } else {
      groups.set(mistake.questionItemId, { questionItem: mistake.questionItem, entries: [mistake] });
    }
  }

  const sortedGroups = [...groups.values()].sort((a, b) => {
    if (a.questionItem.questionNumber !== b.questionItem.questionNumber) {
      return a.questionItem.questionNumber - b.questionItem.questionNumber;
    }
    return (a.questionItem.setCode ?? "").localeCompare(b.questionItem.setCode ?? "");
  });

  // Distinguish "nothing graded yet" from "graded, but nobody's gotten
  // anything wrong" only when we actually need to (zero mistakes) — no
  // point running the extra count query otherwise.
  const hasGradedUploads =
    mistakes.length > 0 ||
    (await prisma.omrUpload.count({ where: { testBatchId: testBatch.id, status: "GRADED" } })) > 0;

  return (
    <>
      <PageHeader
        title={`${testBatch.batchName} — Mistake Vault`}
        description={`Test Code: ${testBatch.testCode} · ${mistakes.length} mistake${mistakes.length === 1 ? "" : "s"} across ${sortedGroups.length} question${sortedGroups.length === 1 ? "" : "s"}`}
        backHref={`/tests/${testBatch.id}/sheets`}
        backLabel="Back to batch"
      />

      {sortedGroups.length === 0 ? (
        <Card className="max-w-2xl border-slate-200">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">
              {hasGradedUploads
                ? "No mistakes recorded for this batch yet — every graded response so far is correct."
                : "No graded sheets yet — mistakes will appear here once scanned sheets are graded."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {sortedGroups.map(({ questionItem, entries }) => (
            <Card key={questionItem.id} className="border-slate-200">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Q{questionItem.questionNumber}
                      {questionItem.setCode ? ` · Set ${questionItem.setCode}` : ""}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">{truncate(questionItem.text)}</p>
                  </div>
                  <span className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    {entries.length} student{entries.length === 1 ? "" : "s"} wrong
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400">
                        <th className="py-2 pr-2">Roll Number</th>
                        <th className="py-2 pr-2">Student Name</th>
                        <th className="py-2 pr-2">Selected</th>
                        <th className="py-2 pr-2">Correct</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...entries]
                        .sort((a, b) => a.rosterEntry.rollNumber.localeCompare(b.rosterEntry.rollNumber))
                        .map((mistake) => (
                          <tr key={mistake.id} className="border-b border-slate-100">
                            <td className="py-2 pr-2 font-medium text-slate-700">{mistake.rosterEntry.rollNumber}</td>
                            <td className="py-2 pr-2 text-slate-600">{mistake.rosterEntry.studentName ?? "—"}</td>
                            <td className="py-2 pr-2 text-destructive">{mistake.selectedOption ?? "— (unmarked)"}</td>
                            <td className="py-2 pr-2 text-success">{questionItem.correctOption}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
