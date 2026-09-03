import { NextResponse } from "next/server";

import { generateJnvstMockSession } from "@/lib/exam/jnvstMockService";

export const dynamic = "force-dynamic";

/**
 * Assembles a fresh JNVST Class 6 mock paper on demand — see
 * apps/web/src/lib/exam/jnvstMockService.ts for the real logic. Read-only
 * and side-effect-free (nothing is written or persisted; every call just
 * draws a new random subset of the PYQ pool), so there's no destructive
 * action to gate here. Unlike /api/admin/*, this is a student-facing route
 * and this app has no real server-side student session to check yet (see
 * apps/web/src/lib/auth/mockAuthProvider.ts) — that's a genuine, existing
 * gap in this codebase, not something introduced here, and closing it is
 * a separate, larger auth project of its own.
 */
export async function POST() {
  const result = await generateJnvstMockSession();

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({ success: true, session: result.session, warnings: result.warnings });
}
