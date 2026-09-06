import Link from "next/link";
import { prisma } from "@vedicneev/db";
import { Badge } from "@vedicneev/ui";

import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";
import { PYQ_CLASS9_EXAMS, PYQ_CLASS9_YEARS } from "@/lib/exam/pyqClass9";

export const dynamic = "force-dynamic";

/**
 * Discovery page for the Class 9 PYQ practice bank — organizes the three
 * lateral-entry boards (JNVST/AISSEE/RMS) by exam board, then by year
 * (2022-2026). Each board's full paper is drawn from a pooled 5-year bank
 * (see PreviousYearQuestion's doc comment in schema.prisma), so the year
 * badges here are a browsing aid over that pool rather than five
 * independent archived papers — clicking any year opens the same
 * board-wide mock, which every /pyq/class-9/[exam]/[year] page explains.
 */
export default async function PyqClass9CatalogPage() {
  const templateSlugs = PYQ_CLASS9_EXAMS.map((exam) => exam.templateSlug);

  const [templates, yearCounts] = await Promise.all([
    prisma.examTemplate.findMany({ where: { slug: { in: templateSlugs }, isActive: true } }),
    prisma.previousYearQuestion.groupBy({
      by: ["examType", "year"],
      where: { classLevel: 9, examType: { in: PYQ_CLASS9_EXAMS.map((exam) => exam.examType) } },
      _count: { _all: true },
    }),
  ]);

  const templateBySlug = new Map(templates.map((template) => [template.slug, template]));
  const countByExamYear = new Map(yearCounts.map((row) => [`${row.examType}-${row.year}`, row._count._all]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground">Class 9 Previous Year Questions</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Practice papers for JNVST, AISSEE, and RMS Class 9 lateral entry, built from a 5-year (2022-2026) practice
        bank in both English and Hindi.
      </p>

      <div className="mt-8 space-y-6">
        {PYQ_CLASS9_EXAMS.map((exam) => {
          const template = templateBySlug.get(exam.templateSlug);
          const Icon = exam.icon;

          return (
            <div key={exam.key} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">{exam.board}</p>
                  <h2 className="text-lg font-bold text-foreground">
                    {template ? localize(template.name as Multilingual, "en") : `${exam.title} Class 9`}
                  </h2>
                  {template ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {template.totalQuestions} questions &middot; {template.totalMarks} marks &middot;{" "}
                      {template.durationMinutes} min
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Not seeded yet.</p>
                  )}
                </div>
                <Badge variant="secondary">EN + HI</Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {PYQ_CLASS9_YEARS.map((year) => {
                  const count = countByExamYear.get(`${exam.examType}-${year}`) ?? 0;
                  return (
                    <Link
                      key={year}
                      href={`/pyq/class-9/${exam.key}/${year}`}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-amber-500 hover:text-amber-600"
                    >
                      {year}
                      <span className="ml-1.5 text-xs text-muted-foreground">({count})</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
