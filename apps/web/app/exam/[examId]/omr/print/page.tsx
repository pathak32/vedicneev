"use client";

import { notFound } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { Printer } from "lucide-react";

import { OmrPrintSheet } from "@/components/omr/OmrPrintSheet";
import { getDemoSession } from "@/lib/exam/mock-data";
import { buildOmrSpecForSession, orderedQuestionIdsForSession } from "@/lib/exam/omr-bridge";

export default function OmrPrintPage({ params }: { params: { examId: string } }) {
  const session = getDemoSession(params.examId);
  if (!session) notFound();

  const totalQuestions = orderedQuestionIdsForSession(session).length;
  const spec = buildOmrSpecForSession(session);

  return (
    <div className="flex flex-col items-center gap-4 bg-muted/40 py-8">
      <div className="flex w-full max-w-3xl items-center justify-between px-4 print:hidden">
        <div>
          <h1 className="text-lg font-bold text-foreground">{session.templateName.en} — OMR Sheet</h1>
          <p className="text-sm text-muted-foreground">
            {totalQuestions} questions · print on A4, then use the scanner to grade it.
          </p>
        </div>
        <Button type="button" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>

      <div className="overflow-auto shadow-lg print:shadow-none">
        <OmrPrintSheet spec={spec} examName={session.templateName.en} />
      </div>
    </div>
  );
}
