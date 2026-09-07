"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ActionDock } from "@/components/exam/ActionDock";
import { ExamHeader } from "@/components/exam/ExamHeader";
import { QuestionCanvas } from "@/components/exam/QuestionCanvas";
import { QuestionPalette } from "@/components/exam/QuestionPalette";
import { buildDiagnosticReport } from "@/lib/exam/diagnostics";
import { useSprintIdentityStore } from "@/lib/sprints/useSprintIdentityStore";
import { selectCurrentQuestion, useTestStore } from "@/lib/stores/useTestStore";

export interface SprintExamRunnerProps {
  sprintId: string;
  templateSlug: string;
  registrationId: string;
  /** ISO 8601 — the sprint's official close time. */
  endTimeIso: string;
}

/**
 * A National Sprint's own top-level exam orchestration — deliberately not
 * ExamPlayer, which is wired to signed-in-parent entitlement/paywall
 * checks that don't apply here (sprints are free and open to guests). The
 * underlying UI (ExamHeader/QuestionCanvas/ActionDock/QuestionPalette) and
 * useTestStore are auth-agnostic already, so they're reused unmodified;
 * only the gating and submission target differ.
 *
 * Known limitation: resuming an in-progress attempt after a reload is
 * matched by templateSlug prefix on the stored session's examId, not a
 * true sprint id (ExamSessionData has no such field) — in the rare case
 * of an unrelated unsubmitted mock on the exact same template already
 * open in this browser, entering a sprint would resume that instead of
 * starting fresh.
 */
export function SprintExamRunner({ sprintId, templateSlug, registrationId, endTimeIso }: SprintExamRunnerProps) {
  const router = useRouter();
  const [loadError, setLoadError] = useState<string | null>(null);
  const runStartedAtRef = useRef<number | null>(null);
  const hasSubmittedToServerRef = useRef(false);

  const storeSession = useTestStore((s) => s.session);
  const initSession = useTestStore((s) => s.initSession);
  const testStoreHasHydrated = useTestStore((s) => s.hasHydrated);
  const submitted = useTestStore((s) => s.submitted);
  const submittedAt = useTestStore((s) => s.submittedAt);
  const language = useTestStore((s) => s.language);
  const currentQuestion = useTestStore(selectCurrentQuestion);
  const currentQuestionIndex = useTestStore((s) => s.currentQuestionIndex);
  const currentSectionIndex = useTestStore((s) => s.currentSectionIndex);
  const selectedOptions = useTestStore((s) => s.selectedOptions);
  const selectOption = useTestStore((s) => s.selectOption);
  const timeSpentSeconds = useTestStore((s) => s.timeSpentSeconds);

  // Assemble a fresh paper exactly like /exam/live/[templateSlug] does,
  // reusing the same content-assembly endpoint rather than a sprint-only
  // fork of it.
  useEffect(() => {
    if (!testStoreHasHydrated) return;
    const restored = useTestStore.getState();
    const alreadyResuming = Boolean(restored.session?.examId.startsWith(`${templateSlug}-live-mock-`) && !restored.submitted);
    if (alreadyResuming) {
      runStartedAtRef.current = runStartedAtRef.current ?? Date.now();
      return;
    }

    let cancelled = false;
    fetch(`/api/exams/generate-mock?slug=${templateSlug}`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.success) {
          setLoadError(data.error ?? "Could not start this sprint's paper.");
          return;
        }
        initSession(data.session);
        runStartedAtRef.current = Date.now();
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not start this sprint's paper.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testStoreHasHydrated, templateSlug]);

  // Live countdown tick — identical to every other timed exam flow.
  useEffect(() => {
    const id = window.setInterval(() => useTestStore.getState().tick(), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Hard safety net: nobody keeps testing past the sprint's own close
  // time, regardless of what the underlying ExamTemplate's own duration
  // timer would otherwise still allow — this is what actually makes the
  // window "synchronized" for everyone, not just the display countdown.
  useEffect(() => {
    const endTimeMs = new Date(endTimeIso).getTime();
    const id = window.setInterval(() => {
      if (Date.now() >= endTimeMs) {
        const state = useTestStore.getState();
        if (!state.submitted) state.submitExam();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [endTimeIso]);

  // On submit, score locally (the same diagnostic engine every other exam
  // flow uses) and post the result to this sprint's own submission
  // endpoint exactly once, then hand off to the leaderboard.
  useEffect(() => {
    if (!submitted || !storeSession || hasSubmittedToServerRef.current) return;
    hasSubmittedToServerRef.current = true;

    const report = buildDiagnosticReport(storeSession, selectedOptions, timeSpentSeconds);
    const timeTakenSeconds =
      runStartedAtRef.current && submittedAt
        ? Math.max(0, Math.round((submittedAt - runStartedAtRef.current) / 1000))
        : 0;

    fetch(`/api/sprints/${sprintId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registrationId,
        totalScore: report.totalMarks,
        maxScore: report.maxMarks,
        timeTakenSeconds,
      }),
    })
      .catch((err) => console.error("Failed to submit sprint attempt:", err))
      .finally(() => {
        useSprintIdentityStore.getState().markSubmitted(sprintId);
        router.push(`/sprints/${sprintId}/leaderboard`);
      });
  }, [submitted, storeSession, selectedOptions, timeSpentSeconds, submittedAt, sprintId, registrationId, router]);

  const globalQuestionNumber = useMemo(() => {
    if (!storeSession) return 0;
    let count = 0;
    for (let i = 0; i < currentSectionIndex; i++) {
      count += storeSession.sections[i]?.questionIds.length ?? 0;
    }
    return count + currentQuestionIndex + 1;
  }, [storeSession, currentSectionIndex, currentQuestionIndex]);

  if (loadError) {
    return <div className="p-8 text-center text-sm text-destructive">{loadError}</div>;
  }

  if (!testStoreHasHydrated || !storeSession || submitted) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading your sprint paper…</div>;
  }

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
