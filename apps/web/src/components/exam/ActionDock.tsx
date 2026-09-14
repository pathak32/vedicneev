"use client";

import { Button } from "@vedicneev/ui";
import { CheckCircle2, ChevronLeft, ChevronRight, Flag, RotateCcw } from "lucide-react";

import { selectCurrentQuestionId, selectIsLastQuestion, useTestStore } from "@/lib/stores/useTestStore";

export function ActionDock() {
  const currentQuestionId = useTestStore(selectCurrentQuestionId);
  const hasAnswer = useTestStore((s) =>
    currentQuestionId ? s.selectedOptions[currentQuestionId] !== undefined : false
  );
  const isFirstQuestion = useTestStore(
    (s) => s.currentSectionIndex === 0 && s.currentQuestionIndex === 0
  );
  const isLastQuestion = useTestStore(selectIsLastQuestion);

  const clearResponse = useTestStore((s) => s.clearResponse);
  const markForReviewAndNext = useTestStore((s) => s.markForReviewAndNext);
  const saveAndNext = useTestStore((s) => s.saveAndNext);
  const goToPrevious = useTestStore((s) => s.goToPrevious);
  const setSubmitDialogOpen = useTestStore((s) => s.setSubmitDialogOpen);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 p-4 backdrop-blur">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={clearResponse}
          disabled={!hasAnswer}
        >
          <RotateCcw className="h-4 w-4" />
          Clear Response
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={markForReviewAndNext}>
          <Flag className="h-4 w-4" />
          Mark for Review &amp; Next
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={goToPrevious}
          disabled={isFirstQuestion}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        {isLastQuestion ? (
          <Button
            type="button"
            size="lg"
            variant="destructive"
            onClick={() => {
              // Still saves this last answer's status before opening the
              // confirm dialog — saveAndNext's own goToNext is a no-op here
              // (nothing left to advance to), it's only called for that save.
              saveAndNext();
              setSubmitDialogOpen(true);
            }}
          >
            Submit Exam
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={saveAndNext}>
            Save &amp; Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
