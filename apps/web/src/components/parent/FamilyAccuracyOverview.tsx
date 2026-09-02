"use client";

import { useState } from "react";

import type { StudentProfile, TestHistoryEntry } from "@/lib/auth/types";

export interface FamilyAccuracyOverviewProps {
  students: StudentProfile[];
  history: TestHistoryEntry[];
}

const WIDTH = 320;
const CHART_HEIGHT = 120;
const LABEL_HEIGHT = 28;
const BAR_GAP = 14;

/** One bar per child — average accuracy across every attempt on file, so a parent can compare readiness across siblings at a glance. */
export function FamilyAccuracyOverview({ students, history }: FamilyAccuracyOverviewProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const rows = students
    .map((student) => {
      const attempts = history.filter((entry) => entry.studentId === student.id);
      const avgAccuracy = attempts.length
        ? attempts.reduce((sum, entry) => sum + entry.accuracyPercent, 0) / attempts.length
        : null;
      return { student, avgAccuracy, attemptCount: attempts.length };
    })
    .filter((row): row is typeof row & { avgAccuracy: number } => row.avgAccuracy !== null);

  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No mock tests taken yet across your children.</p>;
  }

  const barWidth = (WIDTH - BAR_GAP * (rows.length - 1)) / rows.length;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${CHART_HEIGHT + LABEL_HEIGHT}`}
      role="img"
      aria-label="Average accuracy percentage by child"
      className="mx-auto block w-full max-w-sm"
    >
      {rows.map((row, i) => {
        const barHeight = Math.max(2, (row.avgAccuracy / 100) * CHART_HEIGHT);
        const x = i * (barWidth + BAR_GAP);
        const y = CHART_HEIGHT - barHeight;
        const isHovered = hoverIndex === i;
        const firstName = row.student.fullName.split(" ")[0];

        return (
          <g
            key={row.student.id}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
            className="cursor-pointer"
          >
            <rect x={x} y={0} width={barWidth} height={CHART_HEIGHT} fill="transparent" />
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={4}
              className={isHovered ? "fill-primary" : "fill-primary/70"}
            />
            <text
              x={x + barWidth / 2}
              y={Math.max(10, y - 6)}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-semibold"
            >
              {row.avgAccuracy.toFixed(0)}%
            </text>
            <text
              x={x + barWidth / 2}
              y={CHART_HEIGHT + 12}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px] font-medium"
            >
              {firstName}
            </text>
            <text
              x={x + barWidth / 2}
              y={CHART_HEIGHT + 24}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
            >
              {row.attemptCount} test{row.attemptCount === 1 ? "" : "s"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
