"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { Trophy } from "lucide-react";

import { useSprintIdentityStore } from "@/lib/sprints/useSprintIdentityStore";
import type { SprintListItem } from "@/lib/sprints/types";
import { SprintExamRunner } from "./SprintExamRunner";

function countdownLabel(targetMs: number, now: number): string {
  const diff = Math.max(0, targetMs - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function SprintRunClient({ sprint }: { sprint: SprintListItem }) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const hasHydrated = useSprintIdentityStore((s) => s.hasHydrated);
  const entry = useSprintIdentityStore((s) => s.bySprintId[sprint.id] ?? null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (hasHydrated && entry?.hasSubmitted) router.replace(`/sprints/${sprint.id}/leaderboard`);
  }, [hasHydrated, entry?.hasSubmitted, router, sprint.id]);

  if (!hasHydrated) return null;

  if (!entry) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-16 text-center">
        <p className="text-lg font-semibold text-foreground">You haven&apos;t registered for this sprint yet</p>
        <Button asChild>
          <Link href="/sprints">Go register</Link>
        </Button>
      </div>
    );
  }

  const startMs = new Date(sprint.startTime).getTime();
  const endMs = new Date(sprint.endTime).getTime();

  if (now < startMs) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-16 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-600">{sprint.title}</p>
        <p className="text-sm text-muted-foreground">You&apos;re registered. The sprint opens in:</p>
        <p className="font-mono text-5xl font-bold tabular-nums text-foreground">{countdownLabel(startMs, now)}</p>
        <p className="text-xs text-muted-foreground">Keep this page open — it launches automatically at the start time.</p>
      </div>
    );
  }

  if (now > endMs) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-16 text-center">
        <p className="text-lg font-semibold text-foreground">This sprint has closed</p>
        <p className="text-sm text-muted-foreground">You didn&apos;t submit an attempt before the window ended.</p>
        <Button asChild variant="outline">
          <Link href={`/sprints/${sprint.id}/leaderboard`}>
            <Trophy className="h-4 w-4" />
            View Leaderboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <SprintExamRunner
      sprintId={sprint.id}
      templateSlug={sprint.templateSlug}
      registrationId={entry.registrationId}
      endTimeIso={sprint.endTime}
    />
  );
}
