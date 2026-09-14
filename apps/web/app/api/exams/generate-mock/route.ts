import { NextRequest, NextResponse } from "next/server";

import { resolveCheckoutUser } from "@/lib/auth/resolveCheckoutUser";
import { generateLiveMockSession, isLiveMockTemplateSlug } from "@/lib/exam/jnvstMockService";

export const dynamic = "force-dynamic";

interface RequestBody {
  /** Optional — see the same field on /api/exams/jnvst/generate-mock. Deliberately read from the JSON body, not a query param — phone is personal data and query strings get logged. Ignored (no rotation) when `paper` is set, since a fixed published paper must stay identical for every student. */
  phone?: string;
}

/**
 * Board/class-agnostic version of /api/exams/jnvst/generate-mock — assembles
 * a fresh mock paper for ANY seeded ExamTemplate slug (JNVST Class 9,
 * AISSEE Class 9, RMS Class 9, and future additions) instead of assuming
 * "jnvst-class-6". See apps/web/src/lib/exam/jnvstMockService.ts's
 * generateLiveMockSession for the real logic. Still no destructive action
 * to gate, but no longer fully side-effect-free once `phone` resolves to a
 * real user for a random (non-`paper`) draw — see the JNVST-specific
 * route's identical rotation note.
 */
export async function POST(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug || !isLiveMockTemplateSlug(slug)) {
    return NextResponse.json({ error: "Unknown or unsupported exam template slug." }, { status: 400 });
  }

  const paperParam = request.nextUrl.searchParams.get("paper");
  const paperNumber = paperParam !== null ? Number(paperParam) : undefined;
  if (paperNumber !== undefined && (!Number.isInteger(paperNumber) || paperNumber < 1)) {
    return NextResponse.json({ error: "Invalid paper number." }, { status: 400 });
  }

  const body: unknown = await request.json().catch(() => ({}));
  const phone = typeof body === "object" && body !== null ? (body as RequestBody).phone : undefined;
  const userResult = phone ? await resolveCheckoutUser(phone, false) : null;
  const userId = userResult?.ok ? userResult.user.id : undefined;

  const result = await generateLiveMockSession(slug, paperNumber, userId);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({ success: true, session: result.session, warnings: result.warnings });
}
