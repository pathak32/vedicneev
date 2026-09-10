import { NextResponse } from "next/server";

import { getJnvstSampleQuestions } from "@/lib/exam/jnvstMockService";

export const revalidate = 3600;

/**
 * Up to 3 sample questions (one per section) for the Mock Exam Series
 * intro screen — see getJnvstSampleQuestions. No auth check by design:
 * this is exactly the content meant to be visible before a visitor picks
 * "Sign in first" or "Sign in later".
 */
export async function GET() {
  const result = await getJnvstSampleQuestions();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }
  return NextResponse.json({ success: true, questions: result.questions });
}
