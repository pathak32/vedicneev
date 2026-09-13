import { Badge, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";
import { prisma } from "@vedicneev/db";

import { MockPaperPublishButton } from "@/components/admin/MockPaperPublishButton";
import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";

export const dynamic = "force-dynamic";

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

function previewText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "en" in value) {
    const en = (value as Record<string, unknown>).en;
    if (typeof en === "string") return en;
  }
  return "(missing)";
}

interface PaperGroupKey {
  examType: string;
  classLevel: number;
  paperNumber: number;
}

function paperGroupKey({ examType, classLevel, paperNumber }: PaperGroupKey): string {
  return `${examType}::${classLevel}::${paperNumber}`;
}

/**
 * Admin review queue for AISSEE/RMS (and any other board's) discrete mock
 * papers — every (examType, classLevel, paperNumber) group of
 * PreviousYearQuestion rows, shown as one card with its DRAFT/PUBLISHED
 * status, section counts checked against that board/class's real
 * ExamTemplateSection blueprint, a read-only question preview, and a
 * Publish/Unpublish action (api/admin/mock-papers/publish). DRAFT papers
 * sort first since they're what needs action. Nothing here ever reaches
 * a student until published — see jnvstMockService.ts's PUBLISHED filter.
 */
export default async function AdminMockPapersPage() {
  const [groups, sectionBreakdown, sections, templates] = await Promise.all([
    prisma.previousYearQuestion.groupBy({
      by: ["examType", "classLevel", "paperNumber", "reviewStatus"],
      _count: { _all: true },
    }),
    prisma.previousYearQuestion.groupBy({
      by: ["examType", "classLevel", "paperNumber", "sectionId"],
      _count: { _all: true },
    }),
    prisma.section.findMany(),
    prisma.examTemplate.findMany({ include: { sections: { include: { section: true }, orderBy: { order: "asc" } } } }),
  ]);

  const sectionById = new Map(sections.map((s) => [s.id, s]));
  const blueprintByBoardClass = new Map(
    templates.map((t) => [
      `${t.examType}::${t.classLevel}`,
      t.sections.map((s) => ({ sectionId: s.sectionId, key: s.section.key, name: s.section.name, target: s.questionCount })),
    ])
  );
  const countsByGroup = new Map<string, { sectionId: string; count: number }[]>();
  for (const row of sectionBreakdown) {
    const key = paperGroupKey(row);
    const list = countsByGroup.get(key) ?? [];
    list.push({ sectionId: row.sectionId, count: row._count._all });
    countsByGroup.set(key, list);
  }

  const papers = groups
    .map((g) => ({
      examType: g.examType,
      classLevel: g.classLevel,
      paperNumber: g.paperNumber,
      reviewStatus: g.reviewStatus,
      totalCount: g._count._all,
    }))
    .sort((a, b) => {
      if (a.reviewStatus !== b.reviewStatus) return a.reviewStatus === "DRAFT" ? -1 : 1;
      if (a.examType !== b.examType) return a.examType.localeCompare(b.examType);
      if (a.classLevel !== b.classLevel) return a.classLevel - b.classLevel;
      return a.paperNumber - b.paperNumber;
    });

  const questionsByGroup = new Map(
    await Promise.all(
      papers.map(async (p) => {
        const rows = await prisma.previousYearQuestion.findMany({
          where: { examType: p.examType, classLevel: p.classLevel, paperNumber: p.paperNumber },
          orderBy: { sectionId: "asc" },
        });
        return [paperGroupKey(p), rows] as const;
      })
    )
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mock Paper Review</h1>
        <p className="text-sm text-muted-foreground">
          Every discrete AISSEE/RMS (and any other board&apos;s) mock paper, grouped by board, class, and paper number.
          Draft papers never appear on the student-facing Mock Exam Series tab until published here.
        </p>
      </div>

      {papers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No Previous-Year-Question content is seeded yet.</p>
      ) : null}

      {papers.map((p) => {
        const key = paperGroupKey(p);
        const blueprint = blueprintByBoardClass.get(`${p.examType}::${p.classLevel}`) ?? [];
        const counts = countsByGroup.get(key) ?? [];
        const countBySection = new Map(counts.map((c) => [c.sectionId, c.count]));
        const questions = questionsByGroup.get(key) ?? [];

        return (
          <Card key={key}>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">
                  {p.examType} &middot; Class {p.classLevel} &middot; Paper {p.paperNumber}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">{p.totalCount} questions total</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={p.reviewStatus === "PUBLISHED" ? "default" : "secondary"}>{p.reviewStatus}</Badge>
                <MockPaperPublishButton
                  examType={p.examType}
                  classLevel={p.classLevel}
                  paperNumber={p.paperNumber}
                  action={p.reviewStatus === "PUBLISHED" ? "unpublish" : "publish"}
                />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-0">
              <div className="flex flex-wrap gap-2">
                {(blueprint.length > 0 ? blueprint : Array.from(sectionById.values()).map((s) => ({ sectionId: s.id, key: s.key, name: s.name, target: null as number | null }))).map(
                  (b) => {
                    const actual = countBySection.get(b.sectionId) ?? 0;
                    const short = b.target !== null && actual < b.target;
                    return (
                      <Badge key={b.sectionId} variant={short ? "destructive" : "outline"} className="text-xs">
                        {localize(b.name as Multilingual, "en")}: {actual}
                        {b.target !== null ? ` / ${b.target}` : ""}
                      </Badge>
                    );
                  }
                )}
              </div>

              <details className="rounded-md border border-border">
                <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-foreground">
                  View {questions.length} question{questions.length === 1 ? "" : "s"}
                </summary>
                <div className="max-h-[32rem] overflow-y-auto overflow-x-auto border-t border-border">
                  <table className="w-full min-w-[800px] text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        {["Key", "Question", "A", "B", "C", "D", "Answer", "Explanation"].map((h) => (
                          <th key={h} className="whitespace-nowrap px-2 py-2 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {questions.map((q) => {
                        const options = q.optionsJson as unknown[];
                        return (
                          <tr key={q.id}>
                            <td className="whitespace-nowrap px-2 py-2 font-mono">{q.key}</td>
                            <td className="min-w-[220px] max-w-[320px] px-2 py-2">{previewText(q.questionJson)}</td>
                            {[0, 1, 2, 3].map((i) => (
                              <td key={i} className="max-w-[140px] px-2 py-2">
                                {previewText(options[i])}
                              </td>
                            ))}
                            <td className="px-2 py-2 font-semibold">{OPTION_LETTERS[q.correctAnswer] ?? "?"}</td>
                            <td className="min-w-[200px] max-w-[320px] px-2 py-2">{previewText(q.explanation)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
