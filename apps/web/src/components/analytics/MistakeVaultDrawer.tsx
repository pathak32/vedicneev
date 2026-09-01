"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  cn,
} from "@vedicneev/ui";
import { formatDuration, type PaidPlanId } from "@vedicneev/engine";
import { AlertTriangle, BookOpen, Clock, Lightbulb, Sparkles } from "lucide-react";

import { VedicSpeedTipModal } from "@/components/exam/VedicSpeedTipModal";
import { PaywallModal } from "@/components/pricing/PaywallModal";
import type { MistakeReport } from "@/lib/exam/diagnostics";
import type { ExamSessionData, LanguageCode } from "@/lib/exam/types";

export interface MistakeVaultDrawerProps {
  examId: string;
  mistakes: MistakeReport[];
  session: ExamSessionData;
  language: LanguageCode;
  /** Vedic All-Access unlocks detailed solutions and speed-hack clinics; other plans see the paywall instead. */
  hasFullAccess: boolean;
  suggestedPlans: PaidPlanId[];
}

type TagFilter = "ALL" | "CARELESS_RUSHED" | "CONCEPT_GAP" | "CALCULATION_GAP";

const TAG_META: Record<
  Exclude<TagFilter, "ALL">,
  { label: string; className: string }
> = {
  CARELESS_RUSHED: { label: "Careless / Rushed", className: "bg-amber-500/15 text-amber-700 border-amber-500/40 dark:text-amber-400" },
  CONCEPT_GAP: { label: "Concept Gap", className: "bg-red-500/15 text-red-700 border-red-500/40 dark:text-red-400" },
  CALCULATION_GAP: { label: "Calculation Gap", className: "bg-blue-500/15 text-blue-700 border-blue-500/40 dark:text-blue-400" },
};

const FILTER_OPTIONS: { value: TagFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "CARELESS_RUSHED", label: "Careless" },
  { value: "CONCEPT_GAP", label: "Concept Gap" },
  { value: "CALCULATION_GAP", label: "Calculation" },
];

function MistakeItem({
  mistake,
  session,
  language,
  examId,
}: {
  mistake: MistakeReport;
  session: ExamSessionData;
  language: LanguageCode;
  examId: string;
}) {
  const meta = TAG_META[mistake.mistakeTag];
  const speedHack = mistake.question.vedicSpeedHackId
    ? session.speedHacksById[mistake.question.vedicSpeedHackId]
    : undefined;
  const selectedOptionText = mistake.question.options.find((o) => o.id === mistake.selectedOption)?.text?.[
    language
  ];
  const correctOptionText = mistake.question.options.find((o) => o.id === mistake.question.correctOption)
    ?.text?.[language];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">Q{mistake.questionNumber}</span>
        <Badge variant="outline" className={cn("font-medium", meta.className)}>
          <AlertTriangle className="mr-1 h-3 w-3" />
          {meta.label}
        </Badge>
      </div>

      <p className="text-sm text-foreground">{mistake.question.content[language]}</p>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="text-red-600 dark:text-red-400">Your answer: {selectedOptionText ?? "—"}</span>
        <span className="text-emerald-600 dark:text-emerald-400">Correct answer: {correctOptionText ?? "—"}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        Time spent: {formatDuration(mistake.timeSpentSeconds)} · Recommended:{" "}
        {formatDuration(mistake.recommendedSeconds)}
      </div>

      {mistake.question.explanation ? (
        <div className="flex items-start gap-2 rounded-md bg-muted/60 p-3 text-sm">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>{mistake.question.explanation[language]}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        {speedHack ? <VedicSpeedTipModal hack={speedHack} language={language} /> : null}
        <Button asChild type="button" variant="outline" size="sm">
          <Link href={`/exam/${examId}?mode=practice`}>
            <Sparkles className="h-3.5 w-3.5" />
            Try Similar Question
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function MistakeVaultDrawer({
  examId,
  mistakes,
  session,
  language,
  hasFullAccess,
  suggestedPlans,
}: MistakeVaultDrawerProps) {
  const [filter, setFilter] = useState<TagFilter>("ALL");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const filtered = filter === "ALL" ? mistakes : mistakes.filter((m) => m.mistakeTag === filter);

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="lg"
        disabled={mistakes.length === 0}
        onClick={() => (hasFullAccess ? setSheetOpen(true) : setPaywallOpen(true))}
      >
        <Lightbulb className="h-4 w-4" />
        Open Mistake Vault
        <Badge variant="secondary" className="ml-1">
          {mistakes.length}
        </Badge>
      </Button>

      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        feature="MISTAKE_VAULT_SOLUTIONS"
        suggestedPlans={suggestedPlans}
        onUnlocked={() => {
          setPaywallOpen(false);
          setSheetOpen(true);
        }}
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Mistake Vault</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filter === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No mistakes in this category.</p>
          ) : (
            filtered.map((mistake) => (
              <MistakeItem
                key={mistake.question.id}
                mistake={mistake}
                session={session}
                language={language}
                examId={examId}
              />
            ))
          )}
        </div>
      </SheetContent>
      </Sheet>
    </>
  );
}
