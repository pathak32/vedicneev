"use client";

import { Card, CardContent, CardHeader, CardTitle, cn } from "@vedicneev/ui";

import type { GroupAccuracy, TopicAccuracy } from "@/lib/exam/diagnostics";
import type { LanguageCode } from "@/lib/exam/types";

export interface SectionBreakdownProps {
  sections: GroupAccuracy[];
  topics: TopicAccuracy[];
  language: LanguageCode;
}

function heatColor(accuracyPercent: number, attempted: number): string {
  if (attempted === 0) return "bg-muted text-muted-foreground";
  if (accuracyPercent >= 75) return "bg-emerald-500 text-white";
  if (accuracyPercent >= 50) return "bg-amber-500 text-white";
  return "bg-red-500 text-white";
}

function HeatCell({ accuracyPercent, attempted, total }: { accuracyPercent: number; attempted: number; total: number }) {
  return (
    <div
      className={cn(
        "flex h-14 flex-col items-center justify-center rounded-md text-xs font-semibold",
        heatColor(accuracyPercent, attempted)
      )}
    >
      <span>{attempted > 0 ? `${accuracyPercent.toFixed(0)}%` : "—"}</span>
      <span className="text-[10px] font-normal opacity-90">
        {attempted}/{total}
      </span>
    </div>
  );
}

export function SectionBreakdown({ sections, topics, language }: SectionBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Section & Topic Accuracy</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sections.map((section) => (
            <div key={section.key} className="flex flex-col gap-1.5">
              <p className="truncate text-xs font-medium text-muted-foreground" title={section.name[language]}>
                {section.name[language]}
              </p>
              <HeatCell
                accuracyPercent={section.accuracyPercent}
                attempted={section.attempted}
                total={section.total}
              />
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">By topic</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {topics.map((topic) => (
              <div key={topic.key} className="flex flex-col gap-1.5">
                <p className="truncate text-xs font-medium text-muted-foreground" title={topic.name[language]}>
                  {topic.name[language]}
                </p>
                <HeatCell
                  accuracyPercent={topic.accuracyPercent}
                  attempted={topic.attempted}
                  total={topic.total}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
