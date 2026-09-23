import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

// Writes an Institute row and an InstituteCreditLedger row — never cache
// or statically collect this route.
export const dynamic = "force-dynamic";

const APPROVAL_CREDIT_GRANT = 10;

/**
 * Flips a PENDING_APPROVAL (or SUSPENDED) institute to ACTIVE and grants
 * its welcome scan credits in one transaction — the two used to happen
 * separately (credits at onboarding, no approval step at all); moving the
 * grant here means an institute genuinely has zero usable credits until a
 * VedicNeev super admin has actually looked at it.
 *
 * The conditional updateMany (not update-by-id) is what makes this safe to
 * click twice, or to have two admins click it at the same moment: only the
 * request that actually flips status away from ACTIVE gets to write the
 * credit row, so a double-click can never double-grant.
 */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const institute = await prisma.institute.findUnique({ where: { id: params.id } });
  if (!institute) {
    return NextResponse.json({ error: "Institute not found." }, { status: 404 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.institute.updateMany({
      where: { id: params.id, status: { not: "ACTIVE" } },
      data: { status: "ACTIVE" },
    });
    if (updated.count === 0) return { alreadyActive: true as const };

    await tx.instituteCreditLedger.create({
      data: { instituteId: params.id, delta: APPROVAL_CREDIT_GRANT, reason: "MONTHLY_GRANT" },
    });
    return { alreadyActive: false as const };
  });

  return NextResponse.json({ success: true, alreadyActive: result.alreadyActive });
}
