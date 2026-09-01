"use client";

import { Card, CardContent, CardHeader, CardTitle, cn } from "@vedicneev/ui";
import type { SpeedAccuracyQuadrant } from "@vedicneev/engine";
import { Gauge, Rabbit, Snail, Zap } from "lucide-react";

import type { AttemptedQuestionReport } from "@/lib/exam/diagnostics";
import type { LanguageCode } from "@/lib/exam/types";

export interface SpeedAccuracyMatrixProps {
  reports: AttemptedQuestionReport[];
  language: LanguageCode;
}

const QUADRANT_META: Record<
  SpeedAccuracyQuadrant,
  { title: string; hint: string; icon: React.ReactNode; className: string }
> = {
  FAST_AND_ACCURATE: {
    title: "Fast & Accurate",
    hint: "Concept and speed both mastered.",
    icon: <Zap className="h-4 w-4" />,
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  SLOW_AND_ACCURATE: {
    title: "Slow & Accurate",
    hint: "Gets it right — needs speed training via Vedic shortcuts.",
    icon: <Snail className="h-4 w-4" />,
    className: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  RUSHED_CARELESS: {
    title: "Rushed / Careless",
    hint: "Answered too fast and got it wrong — a slip, not a gap.",
    icon: <Rabbit className="h-4 w-4" />,
    className: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  STRUGGLED_CONCEPT_GAP: {
    title: "Struggled / Concept Gap",
    hint: "Took long and still got it wrong — revisit the concept.",
    icon: <Gauge className="h-4 w-4" />,
    className: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

const QUADRANT_ORDER: SpeedAccuracyQuadrant[] = [
  "FAST_AND_ACCURATE",
  "SLOW_AND_ACCURATE",
  "RUSHED_CARELESS",
  "STRUGGLED_CONCEPT_GAP",
];

export function SpeedAccuracyMatrix({ reports, language }: SpeedAccuracyMatrixProps) {
  const byQuadrant = new Map<SpeedAccuracyQuadrant, AttemptedQuestionReport[]>();
  for (const quadrant of QUADRANT_ORDER) byQuadrant.set(quadrant, []);
  for (const report of reports) byQuadrant.get(report.quadrant)?.push(report);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Speed vs. Accuracy Matrix</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {QUADRANT_ORDER.map((quadrant) => {
          const meta = QUADRANT_META[quadrant];
          const items = byQuadrant.get(quadrant) ?? [];
          return (
            <div key={quadrant} className={cn("flex flex-col gap-2 rounded-lg border p-3", meta.className)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {meta.icon}
                  {meta.title}
                </div>
                <span className="text-lg font-bold">{items.length}</span>
              </div>
              <p className="text-xs opacity-80">{meta.hint}</p>
              {items.length > 0 ? (
                <div className="flex flex-wrap gap-1 pt-1">
                  {items.map((item) => (
                    <span
                      key={item.question.id}
                      title={item.question.content[language]}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-background/70 text-[11px] font-semibold"
                    >
                      {item.questionNumber}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
