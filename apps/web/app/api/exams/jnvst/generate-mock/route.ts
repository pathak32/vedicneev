import { NextResponse } from "next/server";

import { resolveCheckoutUser } from "@/lib/auth/resolveCheckoutUser";
import { generateJnvstMockSession } from "@/lib/exam/jnvstMockService";

export const dynamic = "force-dynamic";

interface RequestBody {
  /** Optional — when a signed-in student's phone resolves to a real user, activates rotation (see generateJnvstMockSession) so repeats are minimized across that student's own attempts. Omitted (or unresolvable) draws fully at random, same as before rotation existed. */
  phone?: string;
}

/**
 * Assembles a fresh JNVST Class 6 mock paper on demand — see
 * apps/web/src/lib/exam/jnvstMockService.ts for the real logic. Still no
 * destructive action to gate (nothing here can be undone or cost money),
 * but no longer fully side-effect-free once `phone` resolves to a real
 * user — a rotation record is written so the next mock for that student
 * prefers fresh questions. Unlike /api/admin/*, this is a student-facing
 * route and this app has no real server-side student session to check
 * yet (see apps/web/src/lib/auth/mockAuthProvider.ts) — that's a genuine,
 * existing gap in this codebase, not something introduced here, and
 * closing it is a separate, larger auth project of its own; `phone` here
 * is only ever a client-supplied hint for rotation, not an auth check.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => ({}));
  const phone = typeof body === "object" && body !== null ? (body as RequestBody).phone : undefined;

  // Read-only lookup (createIfMissing: false) — generating a mock must
  // never silently create a User row just because rotation wants an id;
  // an unresolvable phone just means "draw at random," not an error.
  const userResult = phone ? await resolveCheckoutUser(phone, false) : null;
  const userId = userResult?.ok ? userResult.user.id : undefined;

  const result = await generateJnvstMockSession(userId);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({ success: true, session: result.session, warnings: result.warnings });
}
