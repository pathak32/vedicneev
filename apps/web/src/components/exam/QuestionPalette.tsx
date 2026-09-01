"use client";

import { useState } from "react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  cn,
} from "@vedicneev/ui";
import { Grid3x3, PanelRightClose, PanelRightOpen } from "lucide-react";

import { selectCurrentSection, useTestStore } from "@/lib/stores/useTestStore";
import type { QuestionStatus } from "@/lib/exam/types";

const STATUS_STYLES: Record<QuestionStatus, string> = {
  UNVISITED: "bg-muted text-muted-foreground border-border",
  VISITED: "bg-red-500 text-white border-red-500",
  ANSWERED: "bg-emerald-500 text-white border-emerald-500",
  MARKED_FOR_REVIEW: "bg-purple-500 text-white border-purple-500",
  ANSWERED_AND_MARKED: "bg-purple-500 text-white border-purple-500",
};

const LEGEND: { status: QuestionStatus; label: string }[] = [
  { status: "ANSWERED", label: "Answered" },
  { status: "VISITED", label: "Unanswered" },
  { status: "MARKED_FOR_REVIEW", label: "Marked for Review" },
  { status: "UNVISITED", label: "Not Visited" },
];

function PaletteGrid({ onJump }: { onJump?: () => void }) {
  const section = useTestStore(selectCurrentSection);
  const statuses = useTestStore((s) => s.statuses);
  const currentQuestionIndex = useTestStore((s) => s.currentQuestionIndex);
  const goToQuestionIndex = useTestStore((s) => s.goToQuestionIndex);
  const currentSectionIndex = useTestStore((s) => s.currentSectionIndex);

  if (!section) return null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">{section.name.en}</h3>
        <div className="grid grid-cols-5 gap-2">
          {section.questionIds.map((questionId, index) => {
            const status = statuses[questionId] ?? "UNVISITED";
            const isActive = index === currentQuestionIndex;
            return (
              <button
                key={questionId}
                type="button"
                onClick={() => {
                  goToQuestionIndex(currentSectionIndex, index);
                  onJump?.();
                }}
                aria-current={isActive}
                aria-label={`Go to question ${index + 1}, status ${status.toLowerCase().replace(/_/g, " ")}`}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-md border-2 text-sm font-semibold transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  STATUS_STYLES[status],
                  isActive && "ring-2 ring-foreground ring-offset-2"
                )}
              >
                {index + 1}
                {status === "ANSWERED_AND_MARKED" ? (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
        {LEGEND.map(({ status, label }) => (
          <div key={status} className="flex items-center gap-2">
            <span className={cn("h-3 w-3 rounded-sm border-2", STATUS_STYLES[status])} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuestionPalette() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile: floating trigger opening a Sheet drawer */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg" aria-label="Open question palette">
              <Grid3x3 className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Question Palette</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <PaletteGrid />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: persistent collapsible sidebar */}
      <aside
        className={cn(
          "relative hidden shrink-0 border-l border-border bg-background transition-all md:block",
          collapsed ? "w-12" : "w-72"
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute -left-4 top-4 z-10 h-8 w-8 rounded-full border border-border bg-background shadow"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand question palette" : "Collapse question palette"}
        >
          {collapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
        </Button>
        {collapsed ? null : (
          <div className="h-full overflow-y-auto p-4 pt-12">
            <PaletteGrid />
          </div>
        )}
      </aside>
    </>
  );
}
