import { NextResponse } from "next/server";

import { generateTopicPracticeSession } from "@/lib/exam/topicPracticeService";

export const dynamic = "force-dynamic";

/**
 * Assembles a single-topic practice session on demand — see
 * apps/web/src/lib/exam/topicPracticeService.ts for the real logic.
 * Read-only and side-effect-free (nothing is written or persisted), so
 * there's no destructive action to gate here. Like /api/exams/jnvst/
 * generate-mock, this is a student-facing route and this app has no real
 * server-side student session to check yet (see
 * apps/web/src/lib/auth/mockAuthProvider.ts) — a genuine, existing gap,
 * not something introduced here.
 */
export async function POST(request: Request, { params }: { params: { topicKey: string } }) {
  const untimedParam = new URL(request.url).searchParams.get("untimed");
  const untimed = untimedParam === null ? undefined : untimedParam !== "false";
  const result = await generateTopicPracticeSession(params.topicKey, { untimed });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true, session: result.session });
}
