import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDemoSession } from "@/lib/exam/mock-data";

/**
 * examId format for a dynamically-assembled live mock — see
 * generateJnvstMockSession/generateLiveMockSession in
 * apps/web/src/lib/exam/jnvstMockService.ts, both of which produce
 * `${templateSlug}-live-mock-${Date.now()}`. These are never a static
 * fixture getDemoSession can look up (a fresh one is minted per attempt),
 * but the pattern itself is only ever server-generated, not user-suppliable
 * in any way that matters here — a mismatched/garbage id in this shape
 * still gets the correct "no submitted attempt found" handling one layer
 * down in results/page.tsx, which checks the real session in the store.
 */
const LIVE_MOCK_EXAM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*-live-mock-\d+$/;

/**
 * Same reasoning as LIVE_MOCK_EXAM_ID_PATTERN, for topic-practice sessions
 * instead of full mock papers — see generateTopicPracticeSession in
 * apps/web/src/lib/exam/topicPracticeService.ts, which mints
 * `topic-practice-${topicKey}-${Date.now()}`. Without this exemption, the
 * ExamPlayer's post-submit redirect to /exam/${examId}/results would 404
 * here even for a real, just-completed attempt.
 */
const TOPIC_PRACTICE_EXAM_ID_PATTERN = /^topic-practice-[a-z0-9_]+-\d+$/;

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
 *    the gap for all four routes in one place. Live-mock examIds are
 *    exempted (see LIVE_MOCK_EXAM_ID_PATTERN above) since they're
 *    legitimately dynamic and can't be resolved via this static lookup.
 * 2. `robots: { index: false }` — every route under here is either
 *    session-specific (the exam player, results) or requires
 *    authentication to mean anything (OMR tools), so none of it should be
 *    indexed. Not a robots.txt disallow — see app/robots.ts for why.
 */
export function generateMetadata({ params }: { params: { examId: string } }): Metadata {
  const session = getDemoSession(params.examId);
  const isDynamicExamId =
    LIVE_MOCK_EXAM_ID_PATTERN.test(params.examId) || TOPIC_PRACTICE_EXAM_ID_PATTERN.test(params.examId);
  if (!session && !isDynamicExamId) notFound();

  return {
    title: session?.templateName.en ?? "Mock Test",
    robots: { index: false, follow: true },
  };
}

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
