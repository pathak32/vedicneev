import { NextResponse } from "next/server";

import { getJnvstClassSixBlueprint } from "@/lib/exam/jnvstMockService";

// Read-only and cheap — fine to revalidate periodically rather than force
// a fresh DB round-trip on every request (the blueprint only changes if
// the seeded ExamTemplate itself is edited, which isn't a frequent event).
export const revalidate = 3600;

/** The real JNVST Class 6 blueprint (80Q/100M/120min, 40-20-20), read live from the seeded ExamTemplate — see jnvstMockService.ts for why this isn't a second hardcoded copy of those numbers. */
export async function GET() {
  const result = await getJnvstClassSixBlueprint();

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json(result);
}
