import { prisma } from "@vedicneev/db";

import { ConceptNoteReviewManager } from "@/components/admin/ConceptNoteReviewManager";

export const dynamic = "force-dynamic";

/**
 * Review queue for AI-drafted ConceptNotes — grouped by Topic, DRAFT rows
 * first since they're what needs action. Nothing here reaches a student
 * (or an institute's Mistake Vault) until a teammate reviews and publishes
 * it — see ConceptNote's own schema comment.
 */
export default async function AdminConceptNotesPage() {
  const notes = await prisma.conceptNote.findMany({
    include: { topic: { include: { section: true } }, reviewedByUser: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { topicId: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Concept Note Review</h1>
        <p className="text-sm text-muted-foreground">
          {notes.filter((n) => n.status === "DRAFT").length} draft, {notes.filter((n) => n.status === "PUBLISHED").length}{" "}
          published, {notes.length} total.
        </p>
      </div>

      <ConceptNoteReviewManager
        initialNotes={notes.map((n) => ({
          id: n.id,
          topicName: (n.topic.name as unknown as Record<string, string>).en ?? n.topic.key,
          sectionName: (n.topic.section.name as unknown as Record<string, string>).en ?? n.topic.section.key,
          title: (n.title as unknown as Record<string, string>).en ?? "",
          explanation: (n.body as any)?.en?.explanation ?? "",
          workedExample: (n.body as any)?.en?.workedExample ?? "",
          commonMistake: (n.body as any)?.en?.commonMistake ?? "",
          status: n.status,
          reviewedByName: n.reviewedByUser?.name ?? null,
        }))}
      />
    </div>
  );
}
