export interface SectionAllocation {
  /** Unique key for the section, e.g. "non_verbal_reasoning" */
  key: string;
  /** Number of questions in the section */
  questionCount: number;
  /** Seconds allotted per question in this section */
  secondsPerQuestion: number;
}

export interface TimerState {
  totalSeconds: number;
  elapsedSeconds: number;
}

/** Seconds remaining, floored at 0. */
export function remainingSeconds(state: TimerState): number {
  return Math.max(0, state.totalSeconds - state.elapsedSeconds);
}

/** Fraction of the total time that has elapsed, clamped to [0, 1]. */
export function elapsedFraction(state: TimerState): number {
  if (state.totalSeconds <= 0) return 1;
  return Math.min(1, Math.max(0, state.elapsedSeconds / state.totalSeconds));
}

/** Formats a duration in seconds as `H:MM:SS` (or `M:SS` when under an hour). */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const ss = String(secs).padStart(2, "0");

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Total seconds for a test made up of multiple timed sections. */
export function totalTestSeconds(sections: SectionAllocation[]): number {
  return sections.reduce(
    (sum, section) => sum + section.questionCount * section.secondsPerQuestion,
    0
  );
}

/**
 * Expected elapsed time at a given question index within a section, assuming
 * even pacing — used to render "on pace" / "behind pace" indicators.
 */
export function expectedElapsedAtQuestion(
  section: SectionAllocation,
  questionIndex: number
): number {
  const clampedIndex = Math.min(
    Math.max(0, questionIndex),
    section.questionCount
  );
  return clampedIndex * section.secondsPerQuestion;
}

export type Pace = "ahead" | "on_pace" | "behind";

const PACE_TOLERANCE_SECONDS = 5;

/** Compares actual elapsed time against the expected pace for a question index. */
export function evaluatePace(
  section: SectionAllocation,
  questionIndex: number,
  actualElapsedSeconds: number
): Pace {
  const expected = expectedElapsedAtQuestion(section, questionIndex);
  const delta = actualElapsedSeconds - expected;

  if (delta > PACE_TOLERANCE_SECONDS) return "behind";
  if (delta < -PACE_TOLERANCE_SECONDS) return "ahead";
  return "on_pace";
}
