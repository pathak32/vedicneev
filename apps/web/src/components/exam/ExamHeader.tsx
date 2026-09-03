"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Tabs,
  TabsList,
  TabsTrigger,
  cn,
} from "@vedicneev/ui";
import { formatDuration } from "@vedicneev/engine";
import { Clock, Languages } from "lucide-react";

import { localize } from "@/lib/exam/localize";
import type { LanguageCode } from "@/lib/exam/types";
import { SUPPORTED_LANGUAGES, useLanguageStore } from "@/lib/hooks/useLanguageStore";
import { selectStatusCounts, useTestStore } from "@/lib/stores/useTestStore";

export function ExamHeader() {
  const session = useTestStore((s) => s.session);
  const language = useTestStore((s) => s.language);
  const setSessionLanguage = useTestStore((s) => s.setLanguage);
  const setGlobalLanguage = useLanguageStore((s) => s.setLanguage);
  const currentSectionIndex = useTestStore((s) => s.currentSectionIndex);
  const switchSection = useTestStore((s) => s.switchSection);
  const overallRemainingSeconds = useTestStore((s) => s.overallRemainingSeconds);
  const remainingSecondsBySection = useTestStore((s) => s.remainingSecondsBySection);
  const submitExam = useTestStore((s) => s.submitExam);
  const submitted = useTestStore((s) => s.submitted);
  const statusCounts = useTestStore((s) => selectStatusCounts(s));
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!session) return null;

  const currentSection = session.sections[currentSectionIndex];
  const sectionalRemaining = currentSection
    ? remainingSecondsBySection[currentSection.key]
    : undefined;
  const displaySeconds = sectionalRemaining ?? overallRemainingSeconds;
  const isLowTime = displaySeconds <= 60;

  // Visited but left without a selected option (excludes marked-for-review, tallied separately).
  const notAnswered = statusCounts.VISITED;

  function changeLanguage(next: LanguageCode) {
    // Only the display language changes — countdown, section/question
    // position, saved answers, and statuses all live untouched elsewhere
    // in the store.
    setSessionLanguage(next);
    // Persists the choice app-wide so the next exam session opens in it too.
    setGlobalLanguage(next);
  }

  const activeLanguageLabel = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.label ?? language;

  return (
    <header className="flex flex-col gap-3 border-b border-border bg-background p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-base font-bold text-foreground md:text-lg">
          {localize(session.templateName, language)}
        </h1>
        <Tabs
          value={currentSection?.key}
          onValueChange={(key) => {
            const index = session.sections.findIndex((s) => s.key === key);
            if (index >= 0) switchSection(index);
          }}
        >
          <TabsList>
            {session.sections.map((section) => (
              <TabsTrigger key={section.key} value={section.key}>
                {localize(section.name, language)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-lg font-semibold tabular-nums",
            isLowTime
              ? "border-destructive/60 bg-destructive/10 text-destructive"
              : "border-border bg-muted text-foreground"
          )}
          role="timer"
          aria-live="polite"
        >
          <Clock className="h-4 w-4" />
          {formatDuration(displaySeconds)}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" aria-label="Change language" className="gap-1.5">
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">{activeLanguageLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={language} onValueChange={(value) => changeLanguage(value as LanguageCode)}>
              {SUPPORTED_LANGUAGES.map((option) => (
                <DropdownMenuRadioItem key={option.code} value={option.code}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="destructive" disabled={submitted}>
              Submit Exam
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit the exam?</DialogTitle>
              <DialogDescription>
                Once submitted, you cannot change any answers. Here&apos;s your progress:
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Badge variant="secondary" className="justify-center py-2">
                Answered: {statusCounts.ANSWERED + statusCounts.ANSWERED_AND_MARKED}
              </Badge>
              <Badge variant="outline" className="justify-center py-2">
                Not Answered: {notAnswered}
              </Badge>
              <Badge variant="outline" className="justify-center py-2">
                Marked for Review: {statusCounts.MARKED_FOR_REVIEW + statusCounts.ANSWERED_AND_MARKED}
              </Badge>
              <Badge variant="outline" className="justify-center py-2">
                Not Visited: {statusCounts.UNVISITED}
              </Badge>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
                Continue Test
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  submitExam();
                  setConfirmOpen(false);
                }}
              >
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
