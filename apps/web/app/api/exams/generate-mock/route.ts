import { NextRequest, NextResponse } from "next/server";

import { generateLiveMockSession, isLiveMockTemplateSlug } from "@/lib/exam/jnvstMockService";

export const dynamic = "force-dynamic";

/**
 * Board/class-agnostic version of /api/exams/jnvst/generate-mock — assembles
 * a fresh mock paper for ANY seeded ExamTemplate slug (JNVST Class 9,
 * AISSEE Class 9, RMS Class 9, and future additions) instead of assuming
 * "jnvst-class-6". See apps/web/src/lib/exam/jnvstMockService.ts's
 * generateLiveMockSession for the real logic. Read-only and side-effect-free
 * (nothing is written or persisted; every call just draws a new random
 * subset of the PYQ pool), so there's no destructive action to gate here —
 * same reasoning as the JNVST-specific route this generalizes.
 */
export async function POST(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug || !isLiveMockTemplateSlug(slug)) {
    return NextResponse.json({ error: "Unknown or unsupported exam template slug." }, { status: 400 });
  }

  const result = await generateLiveMockSession(slug);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({ success: true, session: result.session, warnings: result.warnings });
}
