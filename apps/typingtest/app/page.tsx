import { prisma } from "@vedicneev/db";

import { ExamCatalogFilters } from "@/components/ExamCatalogFilters";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const exams = await prisma.typingExam.findMany({
    where: { isActive: true },
    orderBy: { organization: "asc" },
  });

  return (
    <div className="container flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Government Exam Typing Practice</h1>
        <p className="max-w-2xl text-muted-foreground">
          Official-format typing tests — Gross/Net Speed, Accuracy, and Full/Half Mistakes graded exactly like the
          real exam. English &amp; Hindi (Inscript/Remington) layouts supported.
        </p>
      </div>

      {exams.length === 0 ? (
        <p className="text-muted-foreground">No exams are published yet — check back soon.</p>
      ) : (
        <ExamCatalogFilters exams={exams} />
      )}
    </div>
  );
}
