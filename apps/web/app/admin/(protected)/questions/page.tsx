import { Button } from "@vedicneev/ui";
import { Download } from "lucide-react";

import { QuestionExportTable } from "@/components/admin/QuestionExportTable";
import { getAllQuestionsForExport } from "@/lib/admin/questionExport";

export const dynamic = "force-dynamic";

/**
 * Question bank audit — every seeded question (topic-bank + PYQ) across
 * every board/class/section, normalized to one flat row so an admin can
 * spot-check formatting/keying/wording issues. This page filters over the
 * full fetched set for a quick look; the CSV/JSON export buttons are the
 * real audit surface for reviewing all ~1200+ rows at once.
 */
export default async function AdminQuestionsPage() {
  const questions = await getAllQuestionsForExport();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Question Bank Export</h1>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions across every exam board, class, and section.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href="/api/admin/questions/export?format=json" target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download JSON
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/api/admin/questions/export?format=csv" target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              Download CSV
            </a>
          </Button>
        </div>
      </div>

      <QuestionExportTable questions={questions} />
    </div>
  );
}
