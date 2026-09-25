import type { Metadata } from "next";
import { prisma } from "@vedicneev/db";

import { GymTrainerBuilder } from "@/components/gym-ops/GymTrainerBuilder";

export const metadata: Metadata = { title: "Diet & Workout Builder" };
export const dynamic = "force-dynamic";

export default async function GymTrainersPage() {
  const [members, plans] = await Promise.all([
    prisma.gymMember.findMany({
      where: { status: { in: ["ACTIVE", "AT_RISK"] } },
      select: { id: true, name: true, phone: true, assignedTrainer: true, status: true },
      orderBy: { name: "asc" },
    }),
    prisma.gymDietPlan.findMany({
      include: { member: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return <GymTrainerBuilder members={members} plans={plans} />;
}
