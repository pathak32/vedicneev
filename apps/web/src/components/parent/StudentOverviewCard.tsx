"use client";

import { Badge, Card, CardContent, CardHeader, CardTitle, cn } from "@vedicneev/ui";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import type { StudentProfile, TestHistoryEntry } from "@/lib/auth/types";

export interface StudentOverviewCardProps {
  student: StudentProfile;
  history: TestHistoryEntry[];
  isActive: boolean;
  onSelect: () => void;
}

type Readiness = "HIGH" | "MODERATE" | "LOW";

const READINESS_META: Record<Readiness, { label: string; className: string }> = {
  HIGH: { label: "High Readiness", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-400" },
  MODERATE: { label: "Moderate Readiness", className: "bg-amber-500/15 text-amber-700 border-amber-500/40 dark:text-amber-400" },
  LOW: { label: "Low Readiness", className: "bg-red-500/15 text-red-700 border-red-500/40 dark:text-red-400" },
};

function readinessFromAccuracy(accuracyPercent: number): Readiness {
  if (accuracyPercent >= 70) return "HIGH";
  if (accuracyPercent >= 45) return "MODERATE";
  return "LOW";
}

export function StudentOverviewCard({ student, history, isActive, onSelect }: StudentOverviewCardProps) {
  const sorted = [...history].sort((a, b) => a.submittedAt - b.submittedAt);
  const latest = sorted.at(-1);
  const previous = sorted.at(-2);
  const trend = latest && previous ? latest.accuracyPercent - previous.accuracyPercent : 0;
  const readiness = readinessFromAccuracy(latest?.accuracyPercent ?? 0);
  const meta = READINESS_META[readiness];

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      className={cn("cursor-pointer transition-colors", isActive ? "border-primary" : "hover:border-primary/50")}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="truncate">{student.fullName}</span>
          {isActive ? <Badge variant="secondary">Active</Badge> : null}
        </CardTitle>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[10px]">
            {student.targetExam}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            Class {student.targetClass}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{history.length} test{history.length === 1 ? "" : "s"} taken</span>
          {latest ? (
            <span className="flex items-center gap-1 font-medium text-foreground">
              {trend > 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              ) : trend < 0 ? (
                <TrendingDown className="h-3.5 w-3.5 text-red-600" />
              ) : (
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {latest.accuracyPercent.toFixed(0)}%
            </span>
          ) : null}
        </div>
        <Badge variant="outline" className={cn("w-fit font-medium", meta.className)}>
          {meta.label}
        </Badge>
      </CardContent>
    </Card>
  );
}
