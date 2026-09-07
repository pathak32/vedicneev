import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";
import { Button } from "@vedicneev/ui";
import { Download } from "lucide-react";

import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";
import { loadSprintQuestionPool } from "@/lib/admin/sprintQuestionPool";
import { AdminSprintQuestionViewer } from "@/components/admin/AdminSprintQuestionViewer";

export const dynamic = "force-dynamic";

export default async function AdminSprintDetailPage({ params }: { params: { id: string } }) {
  const sprint = await prisma.nationalSprint.findUnique({ where: { id: params.id } });
  if (!sprint) notFound();

  const pool = await loadSprintQuestionPool(sprint.examTemplateId);
  if (!pool) notFound();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            {sprint.examType} · Class {sprint.classLevel}
          </p>
          <h1 className="text-2xl font-bold text-foreground">{localize(sprint.title as Multilingual, "en")}</h1>
          <p className="text-sm text-muted-foreground">
            {sprint.startTime.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
            {pool.questions.length} questions in pool · {pool.totalMarks} marks · {pool.durationMinutes} min
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={`/api/admin/sprints/${sprint.id}/export-pdf`} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            Export Master PDF
          </a>
        </Button>
      </div>

      <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-3 text-xs text-muted-foreground">
        This is the full source pool this sprint draws from — each registrant&apos;s actual paper is a randomly-
        assembled subset of it (see <code>/exam/live/{pool.templateSlug}</code>), not one fixed document. Verifying
        every item here covers everything a student could see, not just one sample draw.
      </div>

      <AdminSprintQuestionViewer questions={pool.questions} />
    </div>
  );
}
