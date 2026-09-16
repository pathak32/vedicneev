import { prisma } from "@vedicneev/db";

import { ExamCatalogFilters } from "@/components/ExamCatalogFilters";
import { HomeHero } from "@/components/HomeHero";
import { FaqSection } from "@/components/FaqSection";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const exams = await prisma.typingExam.findMany({
    where: { isActive: true },
    orderBy: { organization: "asc" },
  });

  return (
    <div className="container flex flex-col gap-12 py-10">
      <div className="flex flex-col gap-8">
        <HomeHero />

        {exams.length === 0 ? (
          <p className="text-muted-foreground">No exams are published yet — check back soon.</p>
        ) : (
          <ExamCatalogFilters exams={exams} />
        )}
      </div>

      <FaqSection />
    </div>
  );
}
