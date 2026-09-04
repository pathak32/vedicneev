import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { useLanguageStore } from "../hooks/useLanguageStore";
import type { ExamQuestion, ExamSessionData, LanguageCode, QuestionStatus } from "../exam/types";

/** Determines the next status when the user saves (with or without a selected answer). */
function nextStatusOnSave(current: QuestionStatus, hasAnswer: boolean): QuestionStatus {
  const wasMarked = current === "MARKED_FOR_REVIEW" || current === "ANSWERED_AND_MARKED";
  if (hasAnswer) return wasMarked ? "ANSWERED_AND_MARKED" : "ANSWERED";
  return wasMarked ? "MARKED_FOR_REVIEW" : "VISITED";
}

/** Determines the next status when the user marks the question for review. */
function nextStatusOnMark(hasAnswer: boolean): QuestionStatus {
  return hasAnswer ? "ANSWERED_AND_MARKED" : "MARKED_FOR_REVIEW";
}

/** Determines the next status when the user clears their response. */
function nextStatusOnClear(current: QuestionStatus): QuestionStatus {
  return current === "ANSWERED_AND_MARKED" ? "MARKED_FOR_REVIEW" : "VISITED";
}

export interface TestStoreState {
  session: ExamSessionData | null;
  language: LanguageCode;

  currentSectionIndex: number;
  currentQuestionIndex: number;
  /** Last question index visited in each section, keyed by section index — restored on re-entry. */
  lastVisitedIndexBySection: number[];

  statuses: Record<string, QuestionStatus>;
  selectedOptions: Record<string, string | undefined>;
  timeSpentSeconds: Record<string, number>;

  overallRemainingSeconds: number;
  /** Sectional countdown, keyed by section key — only present for sections with a sectional time limit. */
  remainingSecondsBySection: Record<string, number>;

  /** ms timestamp when the current question became active; null when no session is loaded or it's submitted. */
  activeQuestionEnteredAt: number | null;
  /** ms timestamp of the last tick() call (or initSession) — used on rehydration to figure out how much real time passed while the page was reloading/closed, so a refresh can't be used to pause the clock. */
  lastTickAt: number | null;

  submitted: boolean;
  submittedAt: number | null;

  /** True once persisted state (sessionStorage) has been restored — gates initSession so a resumed attempt isn't immediately overwritten. */
  hasHydrated: boolean;

  initSession: (session: ExamSessionData) => void;
  /**
   * Loads a finished attempt from an external source (e.g. an OMR scan of a
   * paper sheet) directly into the "submitted" state, skipping the timer and
   * navigation flow entirely, so /exam/[examId]/results can render it the
   * same way it renders a normal in-app submission.
   */
  loadExternalSubmission: (
    session: ExamSessionData,
    selectedOptionsByQuestionId: Record<string, string | undefined>
  ) => void;
  setLanguage: (language: LanguageCode) => void;
  selectOption: (optionId: string) => void;
  clearResponse: () => void;
  saveAndNext: () => void;
  markForReviewAndNext: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToQuestionIndex: (sectionIndex: number, questionIndex: number) => void;
  switchSection: (sectionIndex: number) => void;
  tick: () => void;
  submitExam: () => void;
  reset: () => void;
}

const initialState = {
  session: null as ExamSessionData | null,
  language: "en" as LanguageCode,
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  lastVisitedIndexBySection: [] as number[],
  statuses: {} as Record<string, QuestionStatus>,
  selectedOptions: {} as Record<string, string | undefined>,
  timeSpentSeconds: {} as Record<string, number>,
  overallRemainingSeconds: 0,
  remainingSecondsBySection: {} as Record<string, number>,
  activeQuestionEnteredAt: null as number | null,
  lastTickAt: null as number | null,
  submitted: false,
  submittedAt: null as number | null,
  hasHydrated: false,
};

export const useTestStore = create<TestStoreState>()(
  persist(
    (set, get) => {
      /** Adds elapsed dwell time on the current question to its running total. Call before any navigation or answer change. */
      function commitElapsed() {
        const state = get();
        if (!state.session || state.activeQuestionEnteredAt === null || state.submitted) return;
        const questionId = selectCurrentQuestionId(state);
        if (!questionId) return;
        const elapsedMs = Date.now() - state.activeQuestionEnteredAt;
        const elapsedSeconds = Math.max(0, elapsedMs / 1000);
        set((s) => ({
          timeSpentSeconds: {
            ...s.timeSpentSeconds,
            [questionId]: (s.timeSpentSeconds[questionId] ?? 0) + elapsedSeconds,
          },
          activeQuestionEnteredAt: Date.now(),
        }));
      }

      function visitQuestion(sectionIndex: number, questionIndex: number) {
        const state = get();
        const section = state.session?.sections[sectionIndex];
        const questionId = section?.questionIds[questionIndex];
        if (!questionId) return;
        set((s) => {
          const current = s.statuses[questionId] ?? "UNVISITED";
          return {
            currentSectionIndex: sectionIndex,
            currentQuestionIndex: questionIndex,
            statuses: {
              ...s.statuses,
              [questionId]: current === "UNVISITED" ? "VISITED" : current,
            },
            activeQuestionEnteredAt: Date.now(),
          };
        });
      }

      return {
        ...initialState,

        initSession: (session) => {
          const statuses: Record<string, QuestionStatus> = {};
          for (const question of Object.values(session.questionsById)) {
            statuses[question.id] = "UNVISITED";
          }
          const remainingSecondsBySection: Record<string, number> = {};
          for (const section of session.sections) {
            if (section.timeLimitSeconds !== null) {
              remainingSecondsBySection[section.key] = section.timeLimitSeconds;
            }
          }
          const firstQuestionId = session.sections[0]?.questionIds[0];

          set({
            ...initialState,
            session,
            // Carry the student's app-wide language preference into this fresh
            // session instead of always defaulting to English.
            language: useLanguageStore.getState().languageCode,
            statuses: firstQuestionId ? { ...statuses, [firstQuestionId]: "VISITED" } : statuses,
            lastVisitedIndexBySection: session.sections.map(() => 0),
            overallRemainingSeconds: session.totalDurationSeconds,
            remainingSecondsBySection,
            activeQuestionEnteredAt: Date.now(),
            lastTickAt: Date.now(),
            hasHydrated: true,
          });
        },

        loadExternalSubmission: (session, selectedOptionsByQuestionId) => {
          const statuses: Record<string, QuestionStatus> = {};
          const selectedOptions: Record<string, string | undefined> = {};
          const timeSpentSeconds: Record<string, number> = {};
          for (const question of Object.values(session.questionsById)) {
            const selected = selectedOptionsByQuestionId[question.id];
            selectedOptions[question.id] = selected;
            statuses[question.id] = selected !== undefined ? "ANSWERED" : "UNVISITED";
            timeSpentSeconds[question.id] = 0;
          }

          set({
            ...initialState,
            session,
            language: useLanguageStore.getState().languageCode,
            statuses,
            selectedOptions,
            timeSpentSeconds,
            lastVisitedIndexBySection: session.sections.map(() => 0),
            overallRemainingSeconds: 0,
            remainingSecondsBySection: {},
            activeQuestionEnteredAt: null,
            lastTickAt: null,
            submitted: true,
            submittedAt: Date.now(),
            hasHydrated: true,
          });
        },

        setLanguage: (language) => set({ language }),

        selectOption: (optionId) => {
          commitElapsed();
          const state = get();
          const questionId = selectCurrentQuestionId(state);
          if (!questionId) return;
          set((s) => ({
            selectedOptions: { ...s.selectedOptions, [questionId]: optionId },
            statuses: {
              ...s.statuses,
              [questionId]: nextStatusOnSave(s.statuses[questionId] ?? "UNVISITED", true),
            },
          }));
        },

        clearResponse: () => {
          commitElapsed();
          const state = get();
          const questionId = selectCurrentQuestionId(state);
          if (!questionId) return;
          set((s) => ({
            selectedOptions: { ...s.selectedOptions, [questionId]: undefined },
            statuses: {
              ...s.statuses,
              [questionId]: nextStatusOnClear(s.statuses[questionId] ?? "UNVISITED"),
            },
          }));
        },

        saveAndNext: () => {
          commitElapsed();
          const state = get();
          const questionId = selectCurrentQuestionId(state);
          if (questionId) {
            const hasAnswer = state.selectedOptions[questionId] !== undefined;
            set((s) => ({
              statuses: {
                ...s.statuses,
                [questionId]: nextStatusOnSave(s.statuses[questionId] ?? "UNVISITED", hasAnswer),
              },
            }));
          }
          get().goToNext();
        },

        markForReviewAndNext: () => {
          commitElapsed();
          const state = get();
          const questionId = selectCurrentQuestionId(state);
          if (questionId) {
            const hasAnswer = state.selectedOptions[questionId] !== undefined;
            set((s) => ({
              statuses: { ...s.statuses, [questionId]: nextStatusOnMark(hasAnswer) },
            }));
          }
          get().goToNext();
        },

        goToNext: () => {
          commitElapsed();
          const state = get();
          if (!state.session) return;
          const section = state.session.sections[state.currentSectionIndex];
          if (!section) return;

          if (state.currentQuestionIndex < section.questionIds.length - 1) {
            visitQuestion(state.currentSectionIndex, state.currentQuestionIndex + 1);
            return;
          }
          if (state.currentSectionIndex < state.session.sections.length - 1) {
            get().switchSection(state.currentSectionIndex + 1);
          }
        },

        goToPrevious: () => {
          commitElapsed();
          const state = get();
          if (!state.session) return;

          if (state.currentQuestionIndex > 0) {
            visitQuestion(state.currentSectionIndex, state.currentQuestionIndex - 1);
            return;
          }
          if (state.currentSectionIndex > 0) {
            const prevSectionIndex = state.currentSectionIndex - 1;
            const prevSection = state.session.sections[prevSectionIndex];
            if (prevSection) {
              get().switchSection(prevSectionIndex);
              visitQuestion(prevSectionIndex, prevSection.questionIds.length - 1);
            }
          }
        },

        goToQuestionIndex: (sectionIndex, questionIndex) => {
          commitElapsed();
          visitQuestion(sectionIndex, questionIndex);
          set((s) => {
            const lastVisitedIndexBySection = [...s.lastVisitedIndexBySection];
            lastVisitedIndexBySection[sectionIndex] = questionIndex;
            return { lastVisitedIndexBySection };
          });
        },

        switchSection: (sectionIndex) => {
          const state = get();
          if (!state.session || sectionIndex === state.currentSectionIndex) return;
          commitElapsed();
          const resumeIndex = state.lastVisitedIndexBySection[sectionIndex] ?? 0;
          set((s) => {
            const lastVisitedIndexBySection = [...s.lastVisitedIndexBySection];
            lastVisitedIndexBySection[s.currentSectionIndex] = s.currentQuestionIndex;
            return { lastVisitedIndexBySection };
          });
          visitQuestion(sectionIndex, resumeIndex);
        },

        tick: () => {
          const state = get();
          if (!state.session || state.submitted) return;

          const overallRemainingSeconds = Math.max(0, state.overallRemainingSeconds - 1);
          const currentSection = state.session.sections[state.currentSectionIndex];
          const remainingSecondsBySection = { ...state.remainingSecondsBySection };

          let sectionExpired = false;
          if (currentSection && remainingSecondsBySection[currentSection.key] !== undefined) {
            const next = Math.max(0, remainingSecondsBySection[currentSection.key]! - 1);
            remainingSecondsBySection[currentSection.key] = next;
            sectionExpired = next === 0;
          }

          set({ overallRemainingSeconds, remainingSecondsBySection, lastTickAt: Date.now() });

          if (overallRemainingSeconds === 0) {
            get().submitExam();
            return;
          }
          if (sectionExpired && state.currentSectionIndex < state.session.sections.length - 1) {
            get().switchSection(state.currentSectionIndex + 1);
          }
        },

        submitExam: () => {
          commitElapsed();
          set({ submitted: true, submittedAt: Date.now(), activeQuestionEnteredAt: null, lastTickAt: null });
        },

        reset: () => set({ ...initialState, hasHydrated: true }),
      };
    },
    {
      name: "vedicneev-test-session",
      // sessionStorage, not localStorage — an in-progress timed attempt
      // should survive an accidental reload, but not silently resume days
      // later after the tab (and, implicitly, the exam sitting) was closed.
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : sessionStorage
      ),
    }
  )
);

/**
 * Corrects the timers for real time that passed while this tab was
 * closed/reloaded, then marks hydration done — otherwise a refresh would
 * silently "pause" the countdown, since the interval driving tick() stops
 * the moment the page unmounts and only resumes once ExamPlayer remounts.
 * Wired via the external persist.onFinishHydration API (the same one
 * useAuthStore.ts and useLanguageStore.ts already use successfully) rather
 * than the onRehydrateStorage config option, which doesn't reliably fire
 * on the very first automatic hydration in this app's Next.js build.
 */
function applyRehydrationCatchUp(state: TestStoreState) {
  if (!state.session || state.submitted || state.lastTickAt === null) {
    useTestStore.setState({ hasHydrated: true });
    return;
  }
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - state.lastTickAt) / 1000));
  const currentSection = state.session.sections[state.currentSectionIndex];
  const remainingSecondsBySection = { ...state.remainingSecondsBySection };
  if (currentSection && remainingSecondsBySection[currentSection.key] !== undefined) {
    remainingSecondsBySection[currentSection.key] = Math.max(
      0,
      remainingSecondsBySection[currentSection.key]! - elapsedSeconds
    );
  }
  useTestStore.setState({
    overallRemainingSeconds: Math.max(0, state.overallRemainingSeconds - elapsedSeconds),
    remainingSecondsBySection,
    // The reload gap shouldn't count as dwell time on whichever question
    // happened to be open when the tab closed.
    activeQuestionEnteredAt: Date.now(),
    lastTickAt: Date.now(),
    hasHydrated: true,
  });
}

useTestStore.persist.onFinishHydration(applyRehydrationCatchUp);
if (useTestStore.persist.hasHydrated()) {
  applyRehydrationCatchUp(useTestStore.getState());
}

// ── Selectors ─────────────────────────────────────────────────────────

export function selectCurrentSection(state: TestStoreState) {
  return state.session?.sections[state.currentSectionIndex] ?? null;
}

export function selectCurrentQuestionId(state: TestStoreState): string | null {
  const section = selectCurrentSection(state);
  if (!section) return null;
  return section.questionIds[state.currentQuestionIndex] ?? null;
}

export function selectCurrentQuestion(state: TestStoreState): ExamQuestion | null {
  const questionId = selectCurrentQuestionId(state);
  if (!questionId || !state.session) return null;
  return state.session.questionsById[questionId] ?? null;
}

export interface StatusCounts {
  UNVISITED: number;
  VISITED: number;
  ANSWERED: number;
  MARKED_FOR_REVIEW: number;
  ANSWERED_AND_MARKED: number;
}

export function selectStatusCounts(state: TestStoreState, sectionKey?: string): StatusCounts {
  const counts: StatusCounts = {
    UNVISITED: 0,
    VISITED: 0,
    ANSWERED: 0,
    MARKED_FOR_REVIEW: 0,
    ANSWERED_AND_MARKED: 0,
  };
  if (!state.session) return counts;

  const section = sectionKey ? state.session.sections.find((s) => s.key === sectionKey) : null;
  const questionIds = section ? section.questionIds : Object.keys(state.session.questionsById);

  for (const id of questionIds) {
    const status = state.statuses[id] ?? "UNVISITED";
    counts[status] += 1;
  }
  return counts;
}
