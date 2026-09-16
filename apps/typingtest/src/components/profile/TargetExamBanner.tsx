"use client";

import { useState } from "react";
import { Button } from "@vedicneev/ui";
import { Target } from "lucide-react";

import { localize } from "@/lib/localize";
import { TargetExamSelector, type TargetExamOption } from "./TargetExamSelector";

export interface TargetExamBannerProps {
  exams: TargetExamOption[];
  currentExam: TargetExamOption | null;
}

/** Dashboard banner showing the candidate's active target exam, with a switcher. Auto-opens the selector once when no target exam has been chosen yet — this is the "capture intent" moment in place of any grade-level field. */
export function TargetExamBanner({ exams, currentExam }: TargetExamBannerProps) {
  const [open, setOpen] = useState(currentExam === null && exams.length > 0);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Target className="h-4 w-4 text-primary" />
          {currentExam ? (
            <span className="text-foreground">
              Preparing for: <span className="font-semibold">{localize(currentExam.name)}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">No target exam selected yet.</span>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {currentExam ? "Change" : "Choose exam"}
        </Button>
      </div>

      <TargetExamSelector open={open} onOpenChange={setOpen} exams={exams} currentExamId={currentExam?.id ?? null} />
    </>
  );
}
