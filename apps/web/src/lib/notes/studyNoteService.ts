import { prisma } from "@vedicneev/db";
import type { StudyNoteTopicPdf } from "@vedicneev/engine";

/**
 * Read-only catalog of TopicNotePdf rows for the /api/study-notes route —
 * mirrors mediaService.ts's listMedia. Only rows with at least one PDF URL
 * set are returned (a row still pending upload — see upload-study-notes.mts
 * — isn't useful to a client yet).
 */
export async function listStudyNoteTopicPdfs(): Promise<StudyNoteTopicPdf[]> {
  const rows = await prisma.topicNotePdf.findMany({
    where: { OR: [{ pdfUrlEn: { not: null } }, { pdfUrlHi: { not: null } }] },
    include: { matchedTopic: { select: { key: true } } },
    orderBy: [{ classLevel: "asc" }, { topicNumber: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    classLevel: row.classLevel,
    topicNumber: row.topicNumber,
    sectionKey: row.sectionKey,
    titleEn: row.titleEn,
    titleHi: row.titleHi,
    matchedTopicKey: row.matchedTopic?.key ?? null,
    pdfUrlEn: row.pdfUrlEn,
    pdfUrlHi: row.pdfUrlHi,
  }));
}
