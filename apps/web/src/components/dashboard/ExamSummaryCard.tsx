import Link from "next/link";
import { Award, Minus, Target, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import type { TestHistoryEntry } from "@/lib/auth/types";

export interface ExamSummaryCardProps {
  entry: TestHistoryEntry;
  /** Accuracy delta (percentage points) vs. the student's previous attempt; null if this is the first. */
  accuracyTrend: number | null;
}

function formatDate(timestampMs: number): string {
  return new Date(timestampMs).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/60 p-3 text-center">
      <div className="text-primary">{icon}</div>
      <p className="text-base font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function ExamSummaryCard({ entry, accuracyTrend }: ExamSummaryCardProps) {
  return (
    <Link href={`/exam/${entry.examId}/results`} className="block">
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            <span className="truncate" title={entry.examName}>
              {entry.examName}
            </span>
            {accuracyTrend !== null ? (
              accuracyTrend > 0 ? (
                <TrendingUp className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : accuracyTrend < 0 ? (
                <TrendingDown className="h-4 w-4 shrink-0 text-red-600" />
              ) : (
                <Minus className="h-4 w-4 shrink-0 text-muted-foreground" />
              )
            ) : null}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{formatDate(entry.submittedAt)}</p>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          <StatTile
            icon={<Award className="h-4 w-4" />}
            label="Marks"
            value={`${entry.totalMarks}/${entry.maxMarks}`}
          />
          <StatTile
            icon={<Target className="h-4 w-4" />}
            label="Accuracy"
            value={`${entry.accuracyPercent.toFixed(0)}%`}
          />
          <StatTile
            icon={<TrendingUp className="h-4 w-4" />}
            label="Percentile"
            value={`${entry.percentile.toFixed(0)}th`}
          />
        </CardContent>
      </Card>
    </Link>
  );
}
