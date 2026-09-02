"use client";

import Link from "next/link";
import { Badge, Button } from "@vedicneev/ui";
import { AlertTriangle, ArrowRight, CheckCheck } from "lucide-react";

import type { MistakeLogEntry, MistakeTagCategory } from "@/lib/auth/types";
import { MISTAKE_TAG_META } from "@/lib/exam/mistake-vault";

export interface MistakeVaultProgressProps {
  mistakes: MistakeLogEntry[];
  onMarkAllReviewed: () => void;
}

/** Reviewed-vs-total progress plus an unreviewed tag breakdown — the parent-facing summary of the student-facing /dashboard/mistakes view. */
export function MistakeVaultProgress({ mistakes, onMarkAllReviewed }: MistakeVaultProgressProps) {
  const total = mistakes.length;
  const reviewedCount = mistakes.filter((m) => m.reviewed).length;
  const reviewedPercent = total === 0 ? 0 : (reviewedCount / total) * 100;

  const unreviewedCounts: Record<MistakeTagCategory, number> = {
    CARELESS_RUSHED: 0,
    CONCEPT_GAP: 0,
    CALCULATION_GAP: 0,
  };
  for (const m of mistakes) if (!m.reviewed) unreviewedCounts[m.mistakeTag] += 1;
  const unreviewedTotal = total - reviewedCount;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <CheckCheck className="h-6 w-6 text-emerald-600" />
        <p className="text-sm text-muted-foreground">No mistakes logged yet — nice work.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {reviewedCount} of {total} reviewed
          </span>
          <span className="font-semibold text-foreground">{reviewedPercent.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${reviewedPercent}%` }} />
        </div>
      </div>

      {unreviewedTotal > 0 ? (
        <div className="flex flex-wrap gap-2">
          {(Object.keys(MISTAKE_TAG_META) as MistakeTagCategory[])
            .filter((tag) => unreviewedCounts[tag] > 0)
            .map((tag) => (
              <Badge key={tag} variant="outline" className="gap-1 font-medium">
                <AlertTriangle className="h-3 w-3" />
                {MISTAKE_TAG_META[tag].label}: {unreviewedCounts[tag]}
              </Badge>
            ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No unreviewed mistakes — nice work.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button asChild type="button" variant="outline" size="sm">
          <Link href="/dashboard/mistakes">
            View Full Mistake Vault
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
        {unreviewedTotal > 0 ? (
          <Button type="button" variant="outline" size="sm" onClick={onMarkAllReviewed}>
            <CheckCheck className="h-4 w-4" />
            Mark All Reviewed
          </Button>
        ) : null}
      </div>
    </div>
  );
}
