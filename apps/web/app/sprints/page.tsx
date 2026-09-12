import { prisma } from "@vedicneev/db";

import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";
import { SprintCatalogClient } from "@/components/sprints/SprintCatalogClient";
import type { SprintListItem } from "@/lib/sprints/types";

export const dynamic = "force-dynamic";

/**
 * Public discovery page for National Sprints — free, time-synchronized
 * weekly scholarship tests. No sign-in required to browse or register
 * (see SprintRegisterDialog); a signed-in parent's active student just
 * pre-fills the form.
 */
export default async function SprintsPage() {
  const sprints = await prisma.nationalSprint.findMany({
    where: { isActive: true, endTime: { gte: new Date() } },
    include: { examTemplate: { select: { slug: true } } },
    orderBy: { startTime: "asc" },
    take: 20,
  });

  const items: SprintListItem[] = sprints.map((sprint) => ({
    id: sprint.id,
    title: localize(sprint.title as Multilingual, "en"),
    examType: sprint.examType,
    classLevel: sprint.classLevel,
    templateSlug: sprint.examTemplate.slug,
    startTime: sprint.startTime.toISOString(),
    endTime: sprint.endTime.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground">National Scholarship Tests</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Free, weekly, synchronized mock tests for JNVST, AISSEE, and RMS — everyone answers the same paper in the
        same live window, then climbs an All-India and state-wise leaderboard.
      </p>

      <div className="mt-8">
        <SprintCatalogClient sprints={items} />
      </div>
    </div>
  );
}
