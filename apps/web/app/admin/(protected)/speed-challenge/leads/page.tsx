import Link from "next/link";
import { prisma } from "@vedicneev/db";
import { Badge, Card, CardContent } from "@vedicneev/ui";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSpeedChallengeLeadsPage() {
  const attempts = await prisma.speedChallengeAttempt.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, phone: true } } },
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
      <div>
        <Link
          href="/admin/speed-challenge"
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to questions
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Speed Challenge Leads</h1>
        <p className="text-sm text-muted-foreground">
          Every real lead captured by the homepage widget after a 3-strike or completed run — {attempts.length} total.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {attempts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No leads captured yet.
          </p>
        ) : (
          attempts.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{a.user.name ?? "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.user.phone} · Class {a.targetClass} · {a.createdAt.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{a.score}/{a.questionCount} correct</Badge>
                  <Badge variant={a.strikes >= 3 ? "destructive" : "outline"}>{a.strikes} strikes</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
