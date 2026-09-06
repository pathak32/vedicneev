import { NextRequest, NextResponse } from "next/server";

import { listPracticeTopics } from "@/lib/exam/topicPracticeService";

export const dynamic = "force-dynamic";

/**
 * Lists every practice-able topic, filtered by exam AND grade relevance —
 * see apps/web/src/lib/exam/topicPracticeService.ts's listPracticeTopics
 * for the real logic. `targetExam`/`targetClass` are read from the query
 * string (the caller supplies the signed-in student's own values, since —
 * like /api/practice/[topicKey] — this app has no real server-side student
 * session to read them from yet). Read-only and side-effect-free.
 */
export async function GET(request: NextRequest) {
  const targetExam = request.nextUrl.searchParams.get("targetExam") ?? undefined;
  const targetClass = request.nextUrl.searchParams.get("targetClass") ?? undefined;
  const topics = await listPracticeTopics(targetExam, targetClass);
  return NextResponse.json({ success: true, topics });
}
