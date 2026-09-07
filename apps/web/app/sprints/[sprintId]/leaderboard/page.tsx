import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";
import { SprintLeaderboardClient } from "@/components/sprints/SprintLeaderboardClient";
import type { SprintListItem } from "@/lib/sprints/types";

export const dynamic = "force-dynamic";

export default async function SprintLeaderboardPage({ params }: { params: { sprintId: string } }) {
  const sprint = await prisma.nationalSprint.findUnique({
    where: { id: params.sprintId },
    include: { examTemplate: { select: { slug: true } } },
  });
  if (!sprint) notFound();

  const item: SprintListItem = {
    id: sprint.id,
    title: localize(sprint.title as Multilingual, "en"),
    examType: sprint.examType,
    classLevel: sprint.classLevel,
    templateSlug: sprint.examTemplate.slug,
    startTime: sprint.startTime.toISOString(),
    endTime: sprint.endTime.toISOString(),
  };

  return <SprintLeaderboardClient sprint={item} />;
}
