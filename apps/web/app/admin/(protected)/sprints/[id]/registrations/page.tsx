import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@vedicneev/db";
import { Badge, Card, CardContent } from "@vedicneev/ui";
import { ArrowLeft, Users } from "lucide-react";

import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";

export const dynamic = "force-dynamic";

export default async function AdminSprintRegistrationsPage({ params }: { params: { id: string } }) {
  const sprint = await prisma.nationalSprint.findUnique({ where: { id: params.id } });
  if (!sprint) notFound();

  const registrations = await prisma.sprintRegistration.findMany({
    where: { sprintId: params.id },
    include: { submission: { select: { totalScore: true, maxScore: true, submittedAt: true } } },
    orderBy: { registeredAt: "desc" },
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-16">
      <div>
        <Link
          href={`/admin/sprints/${sprint.id}`}
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to question pool
        </Link>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{localize(sprint.title as Multilingual, "en")} — Registrations</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {registrations.length} registered · {registrations.filter((r) => r.submission).length} submitted
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {registrations.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No one has registered for this sprint yet.
          </p>
        ) : (
          registrations.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.participantName}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.phone}
                    {r.email ? ` · ${r.email}` : ""} · {r.state}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Registered {r.registeredAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    {r.userId ? " · linked account" : " · guest"}
                  </p>
                </div>
                {r.submission ? (
                  <Badge variant="secondary">
                    {r.submission.totalScore}/{r.submission.maxScore} submitted
                  </Badge>
                ) : (
                  <Badge variant="outline">Not submitted</Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
