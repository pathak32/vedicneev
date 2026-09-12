import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

// Reads the request's own admin session cookie — never cache or
// statically collect this route.
export const dynamic = "force-dynamic";

/**
 * The single source of truth for "is this browser's session allowed to
 * bypass paywalls" — every client call site asks this instead of
 * re-implementing the check. Bypass = holding a valid admin session
 * (getAuthenticatedAdmin, the same signed httpOnly cookie that already
 * gates /admin) — a customer can't forge that from devtools no matter
 * what they set client-side, so there's no separate secret to leak.
 */
export async function GET() {
  const admin = await getAuthenticatedAdmin();
  return NextResponse.json({ bypass: Boolean(admin) });
}
