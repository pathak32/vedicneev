import Link from "next/link";
import { Badge, Card, CardContent } from "@vedicneev/ui";
import { prisma } from "@vedicneev/db";
import { ChevronRight } from "lucide-react";

import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";
import { loadSprintQuestionPool } from "@/lib/admin/sprintQuestionPool";

export const dynamic = "force-dynamic";

/**
 * Lists every active/upcoming National Sprint with a live verification
 * count against its full question pool (see sprintQuestionPool.ts — a
 * sprint has no single fixed paper, so "reviewed" means the whole pool a
 * student's randomly-assembled attempt could draw from, not one sample
 * paper).
 */
export default async function AdminSprintsPage() {
  const sprints = await prisma.nationalSprint.findMany({
    where: { isActive: true, endTime: { gte: new Date() } },
    include: { examTemplate: { select: { id: true, slug: true } } },
    orderBy: { startTime: "asc" },
  });

  const rows = await Promise.all(
    sprints.map(async (sprint) => {
      const pool = await loadSprintQuestionPool(sprint.examTemplateId);
      const total = pool?.questions.length ?? 0;
      const verified = pool?.questions.filter((q) => q.verifiedAt !== null).length ?? 0;
      return { sprint, total, verified };
    })
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-foreground">National Sprint Review</h1>
        <p className="text-sm text-muted-foreground">
          Every active or upcoming sprint&apos;s full source question pool, with per-question verification tracking.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No active or upcoming sprints.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map(({ sprint, total, verified }) => {
            const allVerified = total > 0 && verified === total;
            return (
              <Link key={sprint.id} href={`/admin/sprints/${sprint.id}`}>
                <Card className="transition-colors hover:border-primary/50">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                        {sprint.examType} · Class {sprint.classLevel} · {sprint.examTemplate.slug}
                      </p>
                      <h2 className="mt-0.5 text-base font-bold text-foreground">
                        {localize(sprint.title as Multilingual, "en")}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {sprint.startTime.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} –{" "}
                        {sprint.endTime.toLocaleString("en-IN", { timeStyle: "short" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={allVerified ? "default" : "secondary"}>
                        {verified}/{total} verified
                      </Badge>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
