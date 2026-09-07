import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";

import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";
import { SprintRunClient } from "@/components/sprints/SprintRunClient";
import type { SprintListItem } from "@/lib/sprints/types";

export const dynamic = "force-dynamic";

export default async function SprintRunPage({ params }: { params: { sprintId: string } }) {
  const sprint = await prisma.nationalSprint.findUnique({
    where: { id: params.sprintId },
    include: { examTemplate: { select: { slug: true } } },
  });
  if (!sprint || !sprint.isActive) notFound();

  const item: SprintListItem = {
    id: sprint.id,
    title: localize(sprint.title as Multilingual, "en"),
    examType: sprint.examType,
    classLevel: sprint.classLevel,
    templateSlug: sprint.examTemplate.slug,
    startTime: sprint.startTime.toISOString(),
    endTime: sprint.endTime.toISOString(),
  };

  return <SprintRunClient sprint={item} />;
}
