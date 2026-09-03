import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExamPlayer } from "@/components/exam/ExamPlayer";
import { getDemoSession } from "@/lib/exam/mock-data";

// This route reads searchParams and mirrors purely client-side session state
// (Zustand + localStorage) with no data to prerender — force it dynamic so
// the build never attempts to statically collect page data for it.
export const dynamic = "force-dynamic";

// examId validity and the noindex baseline are already handled by the
// parent layout's generateMetadata — this only needs to differentiate the
// player's title from its sibling routes (results, OMR print/scan), which
// otherwise all inherit the same bare exam name.
export function generateMetadata({ params }: { params: { examId: string } }): Metadata {
  const session = getDemoSession(params.examId);
  return { title: session ? `Practice Test: ${session.templateName.en}` : undefined };
}

export default function ExamPage({
  params,
  searchParams,
}: {
  params: { examId: string };
  searchParams: { mode?: string };
}) {
  // TODO: once Supabase is connected, resolve the session via @vedicneev/db
  // (ExamTemplate + ExamTemplateSection + Question) instead of the mock data.
  const session = getDemoSession(params.examId);
  if (!session) notFound();

  const practiceMode = searchParams.mode !== "timed";

  return <ExamPlayer session={session} practiceMode={practiceMode} />;
}
