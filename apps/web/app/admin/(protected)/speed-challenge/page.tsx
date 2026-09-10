import Link from "next/link";
import { prisma } from "@vedicneev/db";
import { Users } from "lucide-react";

import { AdminSpeedChallengeManager } from "@/components/admin/AdminSpeedChallengeManager";

export const dynamic = "force-dynamic";

export default async function AdminSpeedChallengePage() {
  const questions = await prisma.speedChallengeQuestion.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, question: true, options: true, correct: true, topic: true, isActive: true },
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Speed Challenge Questions</h1>
          <p className="text-sm text-muted-foreground">
            Powers the homepage hero&apos;s gamified widget — fully database-driven, no hardcoded questions.
          </p>
        </div>
        <Link
          href="/admin/speed-challenge/leads"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Users className="h-4 w-4" />
          View captured leads
        </Link>
      </div>

      <AdminSpeedChallengeManager initialQuestions={questions} />
    </div>
  );
}
