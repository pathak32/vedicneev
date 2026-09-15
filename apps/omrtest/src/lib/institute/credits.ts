import { prisma } from "@vedicneev/db";

/**
 * An institute's live scan-credit balance for its current billing period —
 * always SUM(delta), computed on read rather than cached, so a disputed or
 * duplicate scan can be refunded with a new offsetting ledger row (see
 * packages/db's InstituteCreditLedger comment) without an update that
 * would erase the audit trail a billing dispute needs.
 */
export async function getInstituteCreditBalance(instituteId: string, periodStart: Date): Promise<number> {
  const result = await prisma.instituteCreditLedger.aggregate({
    where: { instituteId, createdAt: { gte: periodStart } },
    _sum: { delta: true },
  });
  return result._sum.delta ?? 0;
}
