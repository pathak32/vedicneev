"use client";

import { cn } from "@vedicneev/ui";

import type { TestHistoryEntry } from "@/lib/auth/types";

export interface RecentAttemptsBreakdownProps {
  history: TestHistoryEntry[];
  /** How many of the most recent attempts to show as rows. */
  limit?: number;
}

function heatClassName(accuracyPercent: number): string {
  if (accuracyPercent >= 75) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  if (accuracyPercent >= 50) return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return "bg-red-500/15 text-red-700 dark:text-red-400";
}

function formatDate(timestampMs: number): string {
  return new Date(timestampMs).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Attempts × sections matrix — more granular than an averaged strengths bar, so a parent can see whether a weak section is improving attempt over attempt. */
export function RecentAttemptsBreakdown({ history, limit = 5 }: RecentAttemptsBreakdownProps) {
  const recent = [...history].sort((a, b) => b.submittedAt - a.submittedAt).slice(0, limit);

  if (recent.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No attempts yet.</p>;
  }

  const sections = new Map<string, string>();
  for (const entry of recent) {
    for (const section of entry.sectionBreakdown) {
      if (!sections.has(section.sectionKey)) sections.set(section.sectionKey, section.sectionName);
    }
  }
  const sectionKeys = Array.from(sections.keys());

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="py-2 pr-3 font-medium">Attempt</th>
            {sectionKeys.map((key) => (
              <th key={key} className="px-2 py-2 text-center font-medium">
                {sections.get(key)}
              </th>
            ))}
            <th className="pl-2 py-2 text-center font-medium">Overall</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((entry) => {
            const bySection = new Map(entry.sectionBreakdown.map((s) => [s.sectionKey, s.accuracyPercent]));
            return (
              <tr key={entry.id} className="border-b border-border/60 last:border-0">
                <td className="py-2 pr-3">
                  <p className="truncate text-xs font-medium text-foreground" title={entry.examName}>
                    {entry.examName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{formatDate(entry.submittedAt)}</p>
                </td>
                {sectionKeys.map((key) => {
                  const accuracy = bySection.get(key);
                  return (
                    <td key={key} className="px-2 py-2 text-center">
                      {accuracy === undefined ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <span
                          className={cn(
                            "inline-flex min-w-[2.5rem] justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                            heatClassName(accuracy)
                          )}
                        >
                          {accuracy.toFixed(0)}%
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="pl-2 py-2 text-center text-xs font-bold text-foreground">
                  {entry.accuracyPercent.toFixed(0)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
