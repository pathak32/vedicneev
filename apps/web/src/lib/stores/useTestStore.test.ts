import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ExamQuestion, ExamSessionData } from "@/lib/exam/types";
import { selectStatusCounts, useTestStore } from "./useTestStore";

function makeQuestion(id: string, sectionKey: string, correctOption: string): ExamQuestion {
  return {
    id,
    sectionKey,
    topicKey: "topic",
    difficulty: "EASY",
    content: { en: `Question ${id}`, hi: `प्रश्न ${id}` },
    options: [
      { id: "a", text: { en: "A", hi: "A" } },
      { id: "b", text: { en: "B", hi: "B" } },
      { id: "c", text: { en: "C", hi: "C" } },
      { id: "d", text: { en: "D", hi: "D" } },
    ],
    correctOption,
    timeLimitSeconds: 60,
  };
}

const fixtureSession: ExamSessionData = {
  examId: "fixture",
  examType: "JNVST",
  templateName: { en: "Fixture Exam", hi: "फिक्सचर परीक्षा" },
  totalDurationSeconds: 100,
  negativeMarkingRatio: 0.25,
  sections: [
    {
      key: "s1",
      name: { en: "Section 1", hi: "खंड 1" },
      order: 1,
      timeLimitSeconds: 5,
      questionIds: ["q1", "q2"],
    },
    {
      key: "s2",
      name: { en: "Section 2", hi: "खंड 2" },
      order: 2,
      timeLimitSeconds: null,
      questionIds: ["q3", "q4"],
    },
  ],
  questionsById: {
    q1: makeQuestion("q1", "s1", "a"),
    q2: makeQuestion("q2", "s1", "b"),
    q3: makeQuestion("q3", "s2", "c"),
    q4: makeQuestion("q4", "s2", "d"),
  },
  speedHacksById: {},
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  useTestStore.getState().initSession(fixtureSession);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useTestStore", () => {
  it("visits the first question on init and leaves the rest unvisited", () => {
    const state = useTestStore.getState();
    expect(state.statuses.q1).toBe("VISITED");
    expect(state.statuses.q2).toBe("UNVISITED");
    expect(state.statuses.q3).toBe("UNVISITED");
    expect(state.statuses.q4).toBe("UNVISITED");
    expect(state.currentSectionIndex).toBe(0);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.overallRemainingSeconds).toBe(100);
    expect(state.remainingSecondsBySection.s1).toBe(5);
    expect(state.remainingSecondsBySection.s2).toBeUndefined();
  });

  it("selecting an option marks the question ANSWERED and records the selection", () => {
    useTestStore.getState().selectOption("a");
    const state = useTestStore.getState();
    expect(state.selectedOptions.q1).toBe("a");
    expect(state.statuses.q1).toBe("ANSWERED");
  });

  it("clearing a response reverts ANSWERED back to VISITED", () => {
    useTestStore.getState().selectOption("a");
    useTestStore.getState().clearResponse();
    const state = useTestStore.getState();
    expect(state.selectedOptions.q1).toBeUndefined();
    expect(state.statuses.q1).toBe("VISITED");
  });

  it("clearing a response on an ANSWERED_AND_MARKED question keeps it marked", () => {
    useTestStore.getState().selectOption("a");
    useTestStore.getState().markForReviewAndNext(); // marks q1 ANSWERED_AND_MARKED, advances to q2
    useTestStore.getState().goToPrevious(); // back to q1
    expect(useTestStore.getState().statuses.q1).toBe("ANSWERED_AND_MARKED");

    useTestStore.getState().clearResponse();
    const state = useTestStore.getState();
    expect(state.selectedOptions.q1).toBeUndefined();
    expect(state.statuses.q1).toBe("MARKED_FOR_REVIEW");
  });

  it("marking for review without an answer sets MARKED_FOR_REVIEW and advances", () => {
    useTestStore.getState().markForReviewAndNext();
    const state = useTestStore.getState();
    expect(state.statuses.q1).toBe("MARKED_FOR_REVIEW");
    expect(state.currentQuestionIndex).toBe(1);
  });

  it("saveAndNext without an answer leaves the question VISITED and advances", () => {
    useTestStore.getState().saveAndNext();
    const state = useTestStore.getState();
    expect(state.statuses.q1).toBe("VISITED");
    expect(state.currentQuestionIndex).toBe(1);
  });

  it("saveAndNext preserves MARKED_FOR_REVIEW when saving without an answer", () => {
    useTestStore.getState().markForReviewAndNext(); // q1 -> MARKED_FOR_REVIEW, moves to q2
    useTestStore.getState().goToPrevious(); // back to q1
    useTestStore.getState().saveAndNext(); // no answer selected on q1
    expect(useTestStore.getState().statuses.q1).toBe("MARKED_FOR_REVIEW");
  });

  it("accumulates dwell time on a question before navigating away", () => {
    vi.advanceTimersByTime(12_000);
    useTestStore.getState().saveAndNext();
    const state = useTestStore.getState();
    expect(state.timeSpentSeconds.q1).toBeCloseTo(12, 0);
  });

  it("accumulates additional dwell time across multiple checkpoints on the same question", () => {
    vi.advanceTimersByTime(5_000);
    useTestStore.getState().selectOption("a"); // checkpoint: +5s
    vi.advanceTimersByTime(3_000);
    useTestStore.getState().clearResponse(); // checkpoint: +3s
    expect(useTestStore.getState().timeSpentSeconds.q1).toBeCloseTo(8, 0);
  });

  it("goToNext crosses from the last question of a section into the next section", () => {
    useTestStore.getState().goToQuestionIndex(0, 1); // last question of section 1
    useTestStore.getState().goToNext();
    const state = useTestStore.getState();
    expect(state.currentSectionIndex).toBe(1);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.statuses.q3).toBe("VISITED");
  });

  it("switchSection resumes the last-visited question index in that section", () => {
    useTestStore.getState().goToQuestionIndex(0, 1); // visit q2
    useTestStore.getState().switchSection(1); // go to section 2
    useTestStore.getState().switchSection(0); // back to section 1
    expect(useTestStore.getState().currentQuestionIndex).toBe(1);
  });

  it("tick decrements both overall and sectional remaining time", () => {
    useTestStore.getState().tick();
    const state = useTestStore.getState();
    expect(state.overallRemainingSeconds).toBe(99);
    expect(state.remainingSecondsBySection.s1).toBe(4);
  });

  it("tick auto-advances to the next section when the sectional timer reaches zero", () => {
    for (let i = 0; i < 5; i++) useTestStore.getState().tick();
    const state = useTestStore.getState();
    expect(state.currentSectionIndex).toBe(1);
    expect(state.remainingSecondsBySection.s1).toBe(0);
  });

  it("tick auto-submits the exam when the overall timer reaches zero", () => {
    for (let i = 0; i < 100; i++) useTestStore.getState().tick();
    const state = useTestStore.getState();
    expect(state.submitted).toBe(true);
    expect(state.overallRemainingSeconds).toBe(0);
  });

  it("tick is a no-op once the exam is submitted", () => {
    useTestStore.getState().submitExam();
    useTestStore.getState().tick();
    expect(useTestStore.getState().overallRemainingSeconds).toBe(100);
  });

  it("tallies status counts correctly, double-counting ANSWERED_AND_MARKED in both buckets", () => {
    useTestStore.getState().selectOption("a");
    useTestStore.getState().markForReviewAndNext(); // q1: ANSWERED_AND_MARKED, moves to q2 (visited)
    useTestStore.getState().saveAndNext(); // q2: VISITED (no answer); crosses into section 2, visiting q3
    // q4 remains UNVISITED

    const counts = selectStatusCounts(useTestStore.getState());
    expect(counts.ANSWERED_AND_MARKED).toBe(1);
    expect(counts.VISITED).toBe(2); // q2 and q3
    expect(counts.UNVISITED).toBe(1); // q4
    expect(counts.ANSWERED).toBe(0);
    expect(counts.MARKED_FOR_REVIEW).toBe(0);
  });
});
