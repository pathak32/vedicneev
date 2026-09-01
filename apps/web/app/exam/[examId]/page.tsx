import { notFound } from "next/navigation";

import { ExamPlayer } from "@/components/exam/ExamPlayer";
import { getDemoSession } from "@/lib/exam/mock-data";

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
