import { prisma, type InstituteStatus } from "@vedicneev/db";

export interface InstituteAuditRow {
  id: string;
  name: string;
  status: InstituteStatus;
  branchCity: string | null;
  adminPhone: string | null;
  examCategory: string | null;
  creditBalance: number;
  createdAt: Date;
}

/**
 * Every onboarded omrtest.vedicneev.com institute, for the Super Admin
 * audit tab — apps/web and apps/omrtest share the same Prisma schema
 * (packages/db), so this reads those tables directly rather than calling
 * across to apps/omrtest's own API.
 */
export async function getAllInstitutesForAdmin(): Promise<InstituteAuditRow[]> {
  const [institutes, ledgerSums] = await Promise.all([
    prisma.institute.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        // OWNER first: the admin who actually completed onboarding, not a
        // STAFF account added later — take(1) below relies on this order.
        admins: { include: { user: true, branch: true }, orderBy: { createdAt: "asc" }, take: 1 },
      },
    }),
    prisma.instituteCreditLedger.groupBy({ by: ["instituteId"], _sum: { delta: true } }),
  ]);

  const balanceByInstitute = new Map(ledgerSums.map((row) => [row.instituteId, row._sum.delta ?? 0]));

  return institutes.map((institute) => {
    const owner = institute.admins[0];
    return {
      id: institute.id,
      name: institute.name,
      status: institute.status,
      branchCity: owner?.branch?.city ?? null,
      adminPhone: owner?.user.phone ?? null,
      examCategory: institute.primaryExamCategory,
      creditBalance: balanceByInstitute.get(institute.id) ?? 0,
      createdAt: institute.createdAt,
    };
  });
}
