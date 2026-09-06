import { notFound, redirect } from "next/navigation";

import { findPyqClass9Exam, isPyqClass9Year } from "@/lib/exam/pyqClass9";

interface PageProps {
  params: { exam: string; year: string };
}

/**
 * Thin dispatch into the existing live-mock runner (/exam/live/[templateSlug]
 * → ExamPlayer → /exam/[examId]/results) instead of forking a new timer/OMR
 * implementation — that pipeline already assembles from PreviousYearQuestion
 * for jnvst-class-9/aissee-class-9/rms-class-9 (see jnvstMockService.ts).
 */
export default function PyqClass9RunPage({ params }: PageProps) {
  const exam = findPyqClass9Exam(params.exam);
  if (!exam || !isPyqClass9Year(params.year)) notFound();

  redirect(`/exam/live/${exam.templateSlug}`);
}
