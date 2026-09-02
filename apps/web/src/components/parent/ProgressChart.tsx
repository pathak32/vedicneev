"use client";

import { useState } from "react";

import type { TestHistoryEntry } from "@/lib/auth/types";

export interface ProgressChartProps {
  history: TestHistoryEntry[];
}

const WIDTH = 320;
const CHART_HEIGHT = 120;
const LABEL_HEIGHT = 20;
const BAR_GAP = 10;

/** Bar chart of accuracy % over the student's last 5 mock tests — single series, so no legend; value shown only on hover. */
export function ProgressChart({ history }: ProgressChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const recent = [...history].sort((a, b) => a.submittedAt - b.submittedAt).slice(-5);

  if (recent.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No mock tests taken yet.</p>;
  }

  const barWidth = (WIDTH - BAR_GAP * (recent.length - 1)) / recent.length;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${CHART_HEIGHT + LABEL_HEIGHT}`}
      role="img"
      aria-label="Accuracy percentage over the last 5 mock tests"
      className="mx-auto block w-full max-w-sm"
    >
      {recent.map((entry, i) => {
        const barHeight = Math.max(2, (entry.accuracyPercent / 100) * CHART_HEIGHT);
        const x = i * (barWidth + BAR_GAP);
        const y = CHART_HEIGHT - barHeight;
        const isHovered = hoverIndex === i;

        return (
          <g
            key={entry.id}
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
              y={CHART_HEIGHT + 14}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {new Date(entry.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </text>
            {isHovered ? (
              <text
                x={x + barWidth / 2}
                y={Math.max(10, y - 4)}
                textAnchor="middle"
                className="fill-foreground text-[10px] font-semibold"
              >
                {entry.accuracyPercent.toFixed(0)}%
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
