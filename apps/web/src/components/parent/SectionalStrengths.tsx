"use client";

import { cn } from "@vedicneev/ui";

import type { TestHistoryEntry } from "@/lib/auth/types";

export interface SectionalStrengthsProps {
  history: TestHistoryEntry[];
}

function heatColor(accuracyPercent: number): string {
  if (accuracyPercent >= 75) return "bg-emerald-500 text-white";
  if (accuracyPercent >= 50) return "bg-amber-500 text-white";
  return "bg-red-500 text-white";
}

/** Averages each section's accuracy across every completed attempt — a cross-test strengths/weaknesses view, not just the latest test. */
export function SectionalStrengths({ history }: SectionalStrengthsProps) {
  const bySection = new Map<string, { name: string; sum: number; count: number }>();
  for (const entry of history) {
    for (const section of entry.sectionBreakdown) {
      const bucket = bySection.get(section.sectionKey) ?? { name: section.sectionName, sum: 0, count: 0 };
      bucket.sum += section.accuracyPercent;
      bucket.count += 1;
      bySection.set(section.sectionKey, bucket);
    }
  }

  const rows = Array.from(bySection.entries()).map(([key, v]) => ({
    key,
    name: v.name,
    accuracyPercent: v.sum / v.count,
  }));

  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No sectional data yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-muted-foreground">{row.name}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", heatColor(row.accuracyPercent))}
              style={{ width: `${row.accuracyPercent}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs font-semibold text-foreground">
            {row.accuracyPercent.toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}
