"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@vedicneev/ui";
import { Trophy } from "lucide-react";

import { useSprintIdentityStore } from "@/lib/sprints/useSprintIdentityStore";
import type { SprintListItem } from "@/lib/sprints/types";
import { SprintRegisterDialog } from "./SprintRegisterDialog";

type SprintPhase = "LOADING" | "UPCOMING" | "LIVE" | "CLOSED";

/** null means "the live clock hasn't mounted yet" — see the useState comment below on why this must render identically to the server first. */
function phaseOf(sprint: SprintListItem, now: number | null): SprintPhase {
  if (now === null) return "LOADING";
  const start = new Date(sprint.startTime).getTime();
  const end = new Date(sprint.endTime).getTime();
  if (now < start) return "UPCOMING";
  if (now <= end) return "LIVE";
  return "CLOSED";
}

function countdownLabel(targetMs: number, now: number): string {
  const diff = Math.max(0, targetMs - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

const EXAM_BOARD_LABEL: Record<string, string> = {
  JNVST: "Navodaya Vidyalaya",
  AISSEE: "Sainik School",
  RMS: "Military School",
};

export function SprintCatalogClient({ sprints }: { sprints: SprintListItem[] }) {
  const router = useRouter();
  // Starts null so the server render and the client's first render match
  // exactly (both render the loading placeholder below) — computing
  // Date.now() in useState's initializer would capture a different
  // instant on each side and fail hydration. A useEffect (client-only,
  // after hydration) is what actually starts the live clock.
  const [now, setNow] = useState<number | null>(null);
  const [registerFor, setRegisterFor] = useState<SprintListItem | null>(null);
  const hasHydrated = useSprintIdentityStore((s) => s.hasHydrated);
  const entries = useSprintIdentityStore((s) => s.bySprintId);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (sprints.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No sprints are scheduled right now — check back soon.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {sprints.map((sprint) => {
          const phase = phaseOf(sprint, now);
          const entry = hasHydrated ? (entries[sprint.id] ?? null) : null;

          return (
            <div key={sprint.id} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                    {EXAM_BOARD_LABEL[sprint.examType] ?? sprint.examType} · Class {sprint.classLevel}
                  </p>
                  <Badge variant={phase === "LIVE" ? "default" : phase === "UPCOMING" ? "secondary" : "outline"}>
                    {phase === "LIVE" ? "LIVE NOW" : phase === "UPCOMING" ? "Upcoming" : phase === "CLOSED" ? "Closed" : "…"}
                  </Badge>
                </div>
                <h2 className="mt-1 text-lg font-bold text-foreground">{sprint.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {phase === "LOADING"
                    ? " "
                    : phase === "UPCOMING"
                      ? `Starts in ${countdownLabel(new Date(sprint.startTime).getTime(), now!)}`
                      : phase === "LIVE"
                        ? `Closes in ${countdownLabel(new Date(sprint.endTime).getTime(), now!)}`
                        : `Ended ${new Date(sprint.endTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {entry?.hasSubmitted ? (
                  <Button asChild>
                    <Link href={`/sprints/${sprint.id}/leaderboard`}>
                      <Trophy className="h-4 w-4" />
                      View Leaderboard
                    </Link>
                  </Button>
                ) : entry && phase !== "CLOSED" ? (
                  <Button onClick={() => router.push(`/sprints/${sprint.id}/run`)}>
                    {phase === "LIVE" ? "Enter Sprint" : "Registered — View Countdown"}
                  </Button>
                ) : phase === "CLOSED" ? (
                  <Button asChild variant="outline">
                    <Link href={`/sprints/${sprint.id}/leaderboard`}>
                      <Trophy className="h-4 w-4" />
                      View Leaderboard
                    </Link>
                  </Button>
                ) : (
                  <Button onClick={() => setRegisterFor(sprint)}>Register Free</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {registerFor ? (
        <SprintRegisterDialog
          sprint={registerFor}
          open
          onOpenChange={(open) => !open && setRegisterFor(null)}
          onRegistered={(sprintEntry) => {
            useSprintIdentityStore.getState().registerEntry(registerFor.id, sprintEntry);
            router.push(`/sprints/${registerFor.id}/run`);
          }}
        />
      ) : null}
    </>
  );
}
