import Link from "next/link";
import { prisma } from "@vedicneev/db";
import { Button } from "@vedicneev/ui";

import { LIVE_MOCK_TEMPLATE_SLUGS } from "@/lib/exam/jnvstMockService";
import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";

export const dynamic = "force-dynamic";

/**
 * Catalog / selection dashboard for the dynamically-assembled live mocks —
 * lists every seeded ExamTemplate this app knows how to launch (Class 6
 * JNVST plus the new JNVST/AISSEE/RMS Class 9 lateral-entry templates)
 * straight from the database, so a newly-seeded template shows up here
 * automatically instead of needing a matching hardcoded card. Each card
 * links to /exam/live/[templateSlug], which fetches its own fresh paper on
 * mount via /api/exams/generate-mock.
 */
export default async function ExamLiveCatalogPage() {
  const templates = await prisma.examTemplate.findMany({
    where: { slug: { in: [...LIVE_MOCK_TEMPLATE_SLUGS] }, isActive: true },
    orderBy: [{ classLevel: "asc" }, { examType: "asc" }],
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground">Live Mock Tests</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every mock below draws a fresh, randomly assembled paper from the practice-question bank each time you start
        it — pick the exam and class level that matches what you&apos;re preparing for.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {templates.map((template) => (
          <div key={template.id} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                {template.examType} &middot; Class {template.classLevel}
              </p>
              <h2 className="mt-1 text-lg font-bold text-foreground">
                {localize(template.name as Multilingual, "en")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {template.totalQuestions} questions &middot; {template.totalMarks} marks &middot; {template.durationMinutes} min
              </p>
            </div>
            <Button asChild className="mt-4">
              <Link href={`/exam/live/${template.slug}`}>Start Mock</Link>
            </Button>
          </div>
        ))}
      </div>

      {templates.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No live mock templates are seeded yet — run the database seed scripts first.
        </p>
      ) : null}
    </div>
  );
}
