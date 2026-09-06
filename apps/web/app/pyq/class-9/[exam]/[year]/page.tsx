import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";
import { Button } from "@vedicneev/ui";

import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";
import { findPyqClass9Exam, isPyqClass9Year } from "@/lib/exam/pyqClass9";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { exam: string; year: string };
}

/**
 * Per-board, per-year landing page for a Class 9 PYQ paper. The actual
 * mock is assembled from a pooled 2022-2026 practice bank rather than a
 * single archived paper for this exact year (see PreviousYearQuestion's
 * doc comment in schema.prisma and pyq-seed/'s "pooled year-cohort"
 * convention) — this page says so plainly rather than implying otherwise,
 * and shows how many of this year's questions feed into the pool.
 */
export default async function PyqClass9YearPage({ params }: PageProps) {
  const exam = findPyqClass9Exam(params.exam);
  if (!exam || !isPyqClass9Year(params.year)) notFound();

  const year = Number(params.year);

  const [template, yearQuestionCount] = await Promise.all([
    prisma.examTemplate.findUnique({
      where: { slug: exam.templateSlug },
      include: { sections: { include: { section: true }, orderBy: { order: "asc" } } },
    }),
    prisma.previousYearQuestion.count({ where: { examType: exam.examType, classLevel: 9, year } }),
  ]);

  if (!template) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
        {exam.board} &middot; {year}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-foreground">{localize(template.name as Multilingual, "en")}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This mock draws from our full 2022-2026 practice bank for {exam.title} Class 9, including {yearQuestionCount}{" "}
        question{yearQuestionCount === 1 ? "" : "s"} written to the {year} pattern, so every attempt covers the
        complete syllabus rather than one single archived paper.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Section</th>
              <th className="px-4 py-2 font-medium">Questions</th>
              <th className="px-4 py-2 font-medium">Marks</th>
            </tr>
          </thead>
          <tbody>
            {template.sections.map((section) => (
              <tr key={section.id} className="border-t border-border">
                <td className="px-4 py-2 text-foreground">{localize(section.section.name as Multilingual, "en")}</td>
                <td className="px-4 py-2 text-foreground">{section.questionCount}</td>
                <td className="px-4 py-2 text-foreground">{section.questionCount * section.marksPerQuestion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {template.totalQuestions} questions &middot; {template.totalMarks} marks &middot; {template.durationMinutes}{" "}
        min
        {template.negativeMarkingRatio > 0 ? " · negative marking applies" : " · no negative marking"}
      </p>

      <Button asChild className="mt-6">
        <Link href={`/pyq/class-9/${exam.key}/${params.year}/run`}>Start Full Mock</Link>
      </Button>
    </div>
  );
}
