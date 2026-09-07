"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@vedicneev/ui";
import { MessageCircle, Send, Trophy } from "lucide-react";

import { useSprintIdentityStore } from "@/lib/sprints/useSprintIdentityStore";
import { INDIAN_STATES } from "@/lib/sprints/indianStates";
import type { SprintListItem } from "@/lib/sprints/types";

type Badge_ = "GOLD" | "SILVER" | "BRONZE" | null;

interface LeaderboardRow {
  registrationId: string;
  participantName: string;
  state: string;
  totalScore: number;
  maxScore: number;
  timeTakenSeconds: number;
  rank: number;
  badge: Badge_;
}

const BADGE_LABEL: Record<Exclude<Badge_, null>, string> = {
  GOLD: "🥇 Gold Scholar",
  SILVER: "🥈 Silver Scholar",
  BRONZE: "🥉 Bronze Scholar",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function SprintLeaderboardClient({ sprint }: { sprint: SprintListItem }) {
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const hasHydrated = useSprintIdentityStore((s) => s.hasHydrated);
  const myRegistrationId = useSprintIdentityStore((s) => s.bySprintId[sprint.id]?.registrationId ?? null);

  useEffect(() => {
    let cancelled = false;
    const query = stateFilter !== "ALL" ? `?state=${encodeURIComponent(stateFilter)}` : "";
    fetch(`/api/sprints/${sprint.id}/leaderboard${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setRows(data.rows ?? []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [sprint.id, stateFilter]);

  const myRow = hasHydrated && myRegistrationId ? (rows?.find((r) => r.registrationId === myRegistrationId) ?? null) : null;

  const shareText = myRow
    ? `I ranked #${myRow.rank}${myRow.badge ? ` and earned the ${BADGE_LABEL[myRow.badge]} badge` : ""} in the ${sprint.title} on VedicNeev! Scored ${myRow.totalScore}/${myRow.maxScore}.`
    : null;
  const leaderboardUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Leaderboard</p>
      <h1 className="mt-1 text-2xl font-bold text-foreground">{sprint.title}</h1>

      {myRow ? (
        <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Your result</p>
              <p className="text-2xl font-bold text-foreground">
                Rank #{myRow.rank}
                {myRow.badge ? <span className="ml-2 text-base font-semibold">{BADGE_LABEL[myRow.badge]}</span> : null}
              </p>
              <p className="text-sm text-muted-foreground">
                {myRow.totalScore}/{myRow.maxScore} marks · {formatTime(myRow.timeTakenSeconds)}
              </p>
            </div>
            <Trophy className="h-10 w-10 shrink-0 text-amber-500" />
          </div>
          <div className="mt-4 flex gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${leaderboardUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <MessageCircle className="h-4 w-4" />
              Share to WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(leaderboardUrl)}&text=${encodeURIComponent(shareText ?? "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Send className="h-4 w-4" />
              Share to Telegram
            </a>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex items-center gap-2">
        <label htmlFor="state-filter" className="text-sm font-medium text-foreground">
          Filter:
        </label>
        <select
          id="state-filter"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="ALL">All India</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Rank</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">State</th>
              <th className="px-4 py-2 font-medium">Score</th>
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Badge</th>
            </tr>
          </thead>
          <tbody>
            {rows === null ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  Loading leaderboard…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  No submissions yet — be the first to finish!
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.registrationId}
                  className={`border-t border-border ${row.registrationId === myRegistrationId ? "bg-primary/5" : ""}`}
                >
                  <td className="px-4 py-2 font-mono tabular-nums text-foreground">#{row.rank}</td>
                  <td className="px-4 py-2 text-foreground">{row.participantName}</td>
                  <td className="px-4 py-2 text-muted-foreground">{row.state}</td>
                  <td className="px-4 py-2 tabular-nums text-foreground">
                    {row.totalScore}/{row.maxScore}
                  </td>
                  <td className="px-4 py-2 tabular-nums text-muted-foreground">{formatTime(row.timeTakenSeconds)}</td>
                  <td className="px-4 py-2">{row.badge ? <Badge variant="secondary">{BADGE_LABEL[row.badge]}</Badge> : null}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-sm">
        <Link href="/sprints" className="text-primary underline">
          Back to all sprints
        </Link>
      </p>
    </div>
  );
}
