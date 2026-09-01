"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { checkExamAccess } from "@vedicneev/engine";

import { PhoneAuthModal } from "@/components/auth/PhoneAuthModal";
import { PaywallModal } from "@/components/pricing/PaywallModal";
import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectActiveAccount, selectActiveParent, useAuthStore } from "@/lib/auth/useAuthStore";
import { selectFreeMockTestsUsed, selectParentSubscription, useSubscriptionStore } from "@/lib/payments/useSubscriptionStore";
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
  const router = useRouter();
  const { hasHydrated, isAuthenticated, activeStudent, needsOnboarding } = useActiveStudent();
  const [authOpen, setAuthOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const parent = useAuthStore(selectActiveParent);
  const subscription = useSubscriptionStore((s) => selectParentSubscription(s, parent?.id ?? null));
  const freeMockTestsUsed = useSubscriptionStore((s) => selectFreeMockTestsUsed(s, activeStudent?.id ?? null));
  const access = useMemo(
    () => checkExamAccess(subscription, session.examType, freeMockTestsUsed),
    [subscription, session.examType, freeMockTestsUsed]
  );

  const storeSession = useTestStore((s) => s.session);
  const initSession = useTestStore((s) => s.initSession);
  const submitted = useTestStore((s) => s.submitted);
  const language = useTestStore((s) => s.language);
  const currentQuestion = useTestStore(selectCurrentQuestion);
  const currentQuestionIndex = useTestStore((s) => s.currentQuestionIndex);
  const currentSectionIndex = useTestStore((s) => s.currentSectionIndex);
  const selectedOptions = useTestStore((s) => s.selectedOptions);
  const selectOption = useTestStore((s) => s.selectOption);

  // Test attempts are strictly linked to an active student, and gated by
  // entitlement — don't start the session (or its timer) until both hold.
  useEffect(() => {
    if (!activeStudent || !access.allowed) return;
    initSession(session);
  }, [session, initSession, activeStudent, access.allowed]);

  // A locked mock test opens the paywall instead of starting the exam.
  useEffect(() => {
    if (hasHydrated && activeStudent && !access.allowed) setPaywallOpen(true);
  }, [hasHydrated, activeStudent, access.allowed]);

  // A signed-in parent with no student profiles yet needs to onboard one first.
  useEffect(() => {
    if (hasHydrated && needsOnboarding) router.push("/onboarding");
  }, [hasHydrated, needsOnboarding, router]);

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

  // On submission, hand off to the rich diagnostic dashboard.
  useEffect(() => {
    if (submitted) router.push(`/exam/${session.examId}/results`);
  }, [submitted, router, session.examId]);

  const globalQuestionNumber = useMemo(() => {
    if (!storeSession) return 0;
    let count = 0;
    for (let i = 0; i < currentSectionIndex; i++) {
      count += storeSession.sections[i]?.questionIds.length ?? 0;
    }
    return count + currentQuestionIndex + 1;
  }, [storeSession, currentSectionIndex, currentQuestionIndex]);

  if (!hasHydrated) return null;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-16 text-center">
        <p className="text-lg font-semibold text-foreground">Sign in to start this test</p>
        <p className="text-sm text-muted-foreground">
          Test attempts and diagnostic reports are tied to a student profile.
        </p>
        <Button type="button" onClick={() => setAuthOpen(true)}>
          Sign In
        </Button>
        <PhoneAuthModal
          open={authOpen}
          onOpenChange={setAuthOpen}
          onAuthenticated={() => {
            const account = selectActiveAccount(useAuthStore.getState());
            if (!account || account.students.length === 0) router.push("/onboarding");
          }}
        />
      </div>
    );
  }

  if (needsOnboarding || !activeStudent) {
    return <div className="p-8 text-center text-muted-foreground">Setting up your student profile…</div>;
  }

  if (!access.allowed) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-16 text-center">
        <p className="text-lg font-semibold text-foreground">This mock test is locked</p>
        <p className="text-sm text-muted-foreground">
          {access.reason === "FREE_TIER_EXHAUSTED"
            ? "You've used your free mock test."
            : "Your current plan doesn't cover this exam."}
        </p>
        <Button type="button" onClick={() => setPaywallOpen(true)}>
          View plans
        </Button>
        <PaywallModal
          open={paywallOpen}
          onOpenChange={setPaywallOpen}
          feature="MOCK_TEST"
          targetExam={session.examType}
          suggestedPlans={access.suggestedPlans}
        />
      </div>
    );
  }

  if (!storeSession || submitted) {
    return <div className="p-8 text-center text-muted-foreground">Loading your diagnostic report…</div>;
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
