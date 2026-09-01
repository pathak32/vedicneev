"use client";

import { useEffect, useMemo } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";
import { calculateRawScore, formatDuration, type MarkingScheme, type ScoredResponse } from "@vedicneev/engine";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { ActionDock } from "./ActionDock";
import { ExamHeader } from "./ExamHeader";
import { QuestionCanvas } from "./QuestionCanvas";
import { QuestionPalette } from "./QuestionPalette";
import { VedicSpeedTipModal } from "./VedicSpeedTipModal";
import type { ExamSessionData } from "@/lib/exam/types";
import { selectCurrentQuestion, useTestStore } from "@/lib/stores/useTestStore";

const NAVIGATION_KEYS = new Set(["ArrowLeft", "ArrowRight", "1", "2", "3", "4"]);

export interface ExamPlayerProps {
  session: ExamSessionData;
  /** In Practice Mode, arithmetic questions linked to a Vedic speed hack show an optional tip. */
  practiceMode?: boolean;
}

export function ExamPlayer({ session, practiceMode = true }: ExamPlayerProps) {
  const storeSession = useTestStore((s) => s.session);
  const initSession = useTestStore((s) => s.initSession);
  const submitted = useTestStore((s) => s.submitted);
  const language = useTestStore((s) => s.language);
  const currentQuestion = useTestStore(selectCurrentQuestion);
  const currentQuestionIndex = useTestStore((s) => s.currentQuestionIndex);
  const currentSectionIndex = useTestStore((s) => s.currentSectionIndex);
  const selectedOptions = useTestStore((s) => s.selectedOptions);
  const selectOption = useTestStore((s) => s.selectOption);
  const overallRemainingSeconds = useTestStore((s) => s.overallRemainingSeconds);

  // Initialize the session once (or whenever a different exam is loaded).
  useEffect(() => {
    initSession(session);
  }, [session, initSession]);

  // Live countdown — ticks once per second; tick() itself is a no-op once submitted.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      useTestStore.getState().tick();
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  // Keyboard shortcuts: 1-4 select an option, Left/Right navigate.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const state = useTestStore.getState();
      if (state.submitted || !NAVIGATION_KEYS.has(event.key)) return;

      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        state.goToNext();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        state.goToPrevious();
        return;
      }

      const optionIndex = Number(event.key) - 1;
      const question = selectCurrentQuestion(state);
      const option = question?.options[optionIndex];
      if (option) {
        event.preventDefault();
        state.selectOption(option.id);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const globalQuestionNumber = useMemo(() => {
    if (!storeSession) return 0;
    let count = 0;
    for (let i = 0; i < currentSectionIndex; i++) {
      count += storeSession.sections[i]?.questionIds.length ?? 0;
    }
    return count + currentQuestionIndex + 1;
  }, [storeSession, currentSectionIndex, currentQuestionIndex]);

  if (!storeSession) {
    return <div className="p-8 text-center text-muted-foreground">Loading exam…</div>;
  }

  if (submitted) {
    return (
      <ResultsSummary
        session={storeSession}
        selectedOptions={selectedOptions}
        totalTakenSeconds={storeSession.totalDurationSeconds - overallRemainingSeconds}
      />
    );
  }

  const speedHack =
    practiceMode && currentQuestion?.vedicSpeedHackId
      ? storeSession.speedHacksById[currentQuestion.vedicSpeedHackId]
      : undefined;

  return (
    <div className="flex h-dvh flex-col">
      <ExamHeader />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 pb-28 md:p-8">
            {currentQuestion ? (
              <QuestionCanvas
                question={currentQuestion}
                language={language}
                questionNumber={globalQuestionNumber}
                selectedOption={selectedOptions[currentQuestion.id]}
                onSelect={selectOption}
              />
            ) : null}
            {speedHack ? <VedicSpeedTipModal hack={speedHack} language={language} /> : null}
          </div>
          <div className="sticky bottom-0">
            <ActionDock />
          </div>
        </main>
        <QuestionPalette />
      </div>
    </div>
  );
}

interface ResultsSummaryProps {
  session: ExamSessionData;
  selectedOptions: Record<string, string | undefined>;
  totalTakenSeconds: number;
}

function ResultsSummary({ session, selectedOptions, totalTakenSeconds }: ResultsSummaryProps) {
  const allQuestionIds = Object.keys(session.questionsById);

  const responses: ScoredResponse[] = allQuestionIds.map((id) => {
    const selected = selectedOptions[id];
    if (selected === undefined) return { outcome: "unattempted" };
    const question = session.questionsById[id]!;
    return { outcome: selected === question.correctOption ? "correct" : "incorrect" };
  });

  const scheme: MarkingScheme = {
    correctMarks: 1,
    negativeMarks: session.negativeMarkingRatio,
    unattemptedMarks: 0,
  };
  const result = calculateRawScore(responses, scheme);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Exam Submitted</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">
              {result.rawScore} / {result.totalQuestions}
            </p>
            <p className="text-sm text-muted-foreground">Score</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="flex flex-col items-center gap-1 rounded-lg bg-emerald-500/10 p-3 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              {result.correctCount} Correct
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg bg-red-500/10 p-3 text-red-600">
              <XCircle className="h-5 w-5" />
              {result.incorrectCount} Incorrect
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg bg-muted p-3 text-muted-foreground">
              {result.unattemptedCount} Skipped
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Time taken: {formatDuration(Math.max(0, totalTakenSeconds))}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mx-auto"
            onClick={() => useTestStore.getState().initSession(session)}
          >
            <RotateCcw className="h-4 w-4" />
            Retake Demo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
