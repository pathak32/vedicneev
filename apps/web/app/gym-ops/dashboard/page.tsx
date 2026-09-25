import type { Metadata } from "next";
import { prisma } from "@vedicneev/db";

import { GymOpsDashboard } from "@/components/gym-ops/GymOpsDashboard";

export const metadata: Metadata = { title: "GymOps Dashboard" };
export const dynamic = "force-dynamic";

export default async function GymOpsDashboardPage() {
  const now = new Date();
  const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [totalActive, atRiskCount, allMembers, recentPlans] = await Promise.all([
    prisma.gymMember.count({ where: { status: "ACTIVE" } }),
    prisma.gymMember.count({
      where: {
        status: { in: ["AT_RISK", "ACTIVE"] },
        membershipEnd: { gte: now, lte: sevenDaysOut },
      },
    }),
    prisma.gymMember.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { gym: { select: { name: true } } },
    }),
    prisma.gymDietPlan.count(),
  ]);

  // MRR: active members × ₹1,500 avg monthly fee (placeholder rate)
  const mrr = totalActive * 1500;

  return (
    <GymOpsDashboard
      metrics={{ totalActive, atRiskCount, mrr, totalPlans: recentPlans as number }}
      members={allMembers}
    />
  );
}
