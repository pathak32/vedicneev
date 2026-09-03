import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDemoSession } from "@/lib/exam/mock-data";

/**
 * Covers the whole exam subtree — the player, results, and both OMR routes
 * — with one check and one metadata baseline:
 *
 * 1. `notFound()` for an unrecognized examId. The player and OMR pages
 *    already did this individually client-side, but results/page.tsx never
 *    validated examId against real data at all — it just rendered a generic
 *    "no submitted attempt found" message with a 200 status for *any*
 *    examId, including garbage ones. That's a textbook soft 404: infinite
 *    URL variations, all 200, none with unique content. Checking here, in
 *    generateMetadata (which runs before any of those pages render), closes
 *    the gap for all four routes in one place.
 * 2. `robots: { index: false }` — every route under here is either
 *    session-specific (the exam player, results) or requires
 *    authentication to mean anything (OMR tools), so none of it should be
 *    indexed. Not a robots.txt disallow — see app/robots.ts for why.
 */
export function generateMetadata({ params }: { params: { examId: string } }): Metadata {
  const session = getDemoSession(params.examId);
  if (!session) notFound();

  return {
    title: session.templateName.en,
    robots: { index: false, follow: true },
  };
}

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
