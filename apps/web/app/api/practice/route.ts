import { NextRequest, NextResponse } from "next/server";

import { listPracticeTopics } from "@/lib/exam/topicPracticeService";

export const dynamic = "force-dynamic";

/**
 * Lists every practice-able topic, filtered by exam relevance — see
 * apps/web/src/lib/exam/topicPracticeService.ts's listPracticeTopics for
 * the real logic. `targetExam` is read from the query string (the caller
 * supplies the signed-in student's own target exam, since — like
 * /api/practice/[topicKey] — this app has no real server-side student
 * session to read it from yet). Read-only and side-effect-free.
 */
export async function GET(request: NextRequest) {
  const targetExam = request.nextUrl.searchParams.get("targetExam") ?? undefined;
  const topics = await listPracticeTopics(targetExam);
  return NextResponse.json({ success: true, topics });
}
