import {
  calculatePercentile,
  calculateRawScore,
  calculateSpeedDeficit,
  classifyLatencyAccuracyBatch,
  summarizeSpeedAccuracy,
  type MarkingScheme,
  type ScoredResponse,
  type SpeedAccuracyQuadrant,
  type SpeedAccuracySummary,
  type SpeedDeficitInput,
  type SpeedDeficitSummary,
} from "@vedicneev/engine";

import type { ExamQuestion, ExamSessionData, Multilingual } from "./types";
import { SAMPLE_PERCENTILE_COHORT } from "./cutoff-data";
import { TOPIC_NAMES } from "./mock-data";

export interface AttemptedQuestionReport {
  question: ExamQuestion;
  questionNumber: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  quadrant: SpeedAccuracyQuadrant;
  speedRatio: number;
}

export interface MistakeReport {
  question: ExamQuestion;
  questionNumber: number;
  selectedOption: string | undefined;
  timeSpentSeconds: number;
  recommendedSeconds: number;
  quadrant: "RUSHED_CARELESS" | "STRUGGLED_CONCEPT_GAP";
  mistakeTag: "CARELESS_RUSHED" | "CONCEPT_GAP";
}

export interface GroupAccuracy {
  key: string;
  name: Multilingual;
  correct: number;
  attempted: number;
  total: number;
  accuracyPercent: number;
}

export interface TopicAccuracy extends GroupAccuracy {
  sectionKey: string;
}

export interface DiagnosticReport {
  totalMarks: number;
  maxMarks: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  /** Accuracy among attempted questions only (correct / (correct + incorrect)). */
  accuracyPercent: number;
  percentile: number;
  speedAccuracySummary: SpeedAccuracySummary;
  speedDeficit: SpeedDeficitSummary;
  attemptedReports: AttemptedQuestionReport[];
  mistakes: MistakeReport[];
  sectionBreakdown: GroupAccuracy[];
  topicBreakdown: TopicAccuracy[];
}

function buildGroupAccuracy(
  questions: ExamQuestion[],
  selectedOptions: Record<string, string | undefined>,
  groupKeyFn: (q: ExamQuestion) => string,
  nameLookup: (key: string) => Multilingual
): GroupAccuracy[] {
  const buckets = new Map<string, { correct: number; attempted: number; total: number }>();
  for (const question of questions) {
    const key = groupKeyFn(question);
    const bucket = buckets.get(key) ?? { correct: 0, attempted: 0, total: 0 };
    bucket.total += 1;
    const selected = selectedOptions[question.id];
    if (selected !== undefined) {
      bucket.attempted += 1;
      if (selected === question.correctOption) bucket.correct += 1;
    }
    buckets.set(key, bucket);
  }
  return Array.from(buckets.entries()).map(([key, v]) => ({
    key,
    name: nameLookup(key),
    ...v,
    accuracyPercent: v.attempted > 0 ? (v.correct / v.attempted) * 100 : 0,
  }));
}

/**
 * Turns a finished exam session (from the Zustand test store) into the
 * full diagnostic report consumed by the results dashboard.
 */
export function buildDiagnosticReport(
  session: ExamSessionData,
  selectedOptions: Record<string, string | undefined>,
  timeSpentSeconds: Record<string, number>
): DiagnosticReport {
  const allQuestions = Object.values(session.questionsById);
  const orderedQuestionIds = session.sections.flatMap((s) => s.questionIds);
  const questionNumberById = new Map(orderedQuestionIds.map((id, i) => [id, i + 1]));

  const scoredResponses: ScoredResponse[] = [];
  const attempted: { question: ExamQuestion; isCorrect: boolean; timeSpentSeconds: number }[] = [];

  for (const question of allQuestions) {
    const selected = selectedOptions[question.id];
    if (selected === undefined) {
      scoredResponses.push({ outcome: "unattempted" });
      continue;
    }
    const isCorrect = selected === question.correctOption;
    scoredResponses.push({ outcome: isCorrect ? "correct" : "incorrect" });
    attempted.push({ question, isCorrect, timeSpentSeconds: timeSpentSeconds[question.id] ?? 0 });
  }

  const scheme: MarkingScheme = {
    correctMarks: 1,
    negativeMarks: session.negativeMarkingRatio,
    unattemptedMarks: 0,
  };
  const rawScoreResult = calculateRawScore(scoredResponses, scheme);

  const classified = classifyLatencyAccuracyBatch(
    attempted.map((a) => ({
      questionId: a.question.id,
      isCorrect: a.isCorrect,
      timeSpentSeconds: a.timeSpentSeconds,
      baselineTimeSeconds: a.question.timeLimitSeconds,
    }))
  );
  const classifiedById = new Map(classified.map((c) => [c.questionId, c]));

  const attemptedReports: AttemptedQuestionReport[] = attempted.map(({ question, isCorrect, timeSpentSeconds: t }) => {
    const c = classifiedById.get(question.id)!;
    return {
      question,
      questionNumber: questionNumberById.get(question.id) ?? 0,
      isCorrect,
      timeSpentSeconds: t,
      quadrant: c.quadrant,
      speedRatio: c.speedRatio,
    };
  });

  const mistakes: MistakeReport[] = attemptedReports
    .filter((r): r is AttemptedQuestionReport & { isCorrect: false } => !r.isCorrect)
    .map((r) => {
      const c = classifiedById.get(r.question.id)!;
      return {
        question: r.question,
        questionNumber: r.questionNumber,
        selectedOption: selectedOptions[r.question.id],
        timeSpentSeconds: r.timeSpentSeconds,
        recommendedSeconds: r.question.timeLimitSeconds,
        quadrant: c.quadrant as "RUSHED_CARELESS" | "STRUGGLED_CONCEPT_GAP",
        mistakeTag: c.mistakeTag!,
      };
    });

  const speedDeficitInputs: SpeedDeficitInput[] = classified.map((c) => ({ ...c, marks: 1 }));
  const speedDeficit = calculateSpeedDeficit(speedDeficitInputs);

  const percentile = calculatePercentile({
    score: rawScoreResult.rawScore,
    cohortScores: SAMPLE_PERCENTILE_COHORT,
  });

  const sectionNameByKey = new Map(session.sections.map((s) => [s.key, s.name]));
  const sectionBreakdown = buildGroupAccuracy(
    allQuestions,
    selectedOptions,
    (q) => q.sectionKey,
    (key) => sectionNameByKey.get(key) ?? { en: key, hi: key }
  );

  const topicBreakdown: TopicAccuracy[] = buildGroupAccuracy(
    allQuestions,
    selectedOptions,
    (q) => q.topicKey,
    (key) => TOPIC_NAMES[key] ?? { en: key, hi: key }
  ).map((t) => ({
    ...t,
    sectionKey: allQuestions.find((q) => q.topicKey === t.key)?.sectionKey ?? "",
  }));

  const attemptedCount = rawScoreResult.correctCount + rawScoreResult.incorrectCount;

  return {
    totalMarks: rawScoreResult.rawScore,
    maxMarks: rawScoreResult.totalQuestions,
    correctCount: rawScoreResult.correctCount,
    incorrectCount: rawScoreResult.incorrectCount,
    unattemptedCount: rawScoreResult.unattemptedCount,
    accuracyPercent: attemptedCount > 0 ? (rawScoreResult.correctCount / attemptedCount) * 100 : 0,
    percentile,
    speedAccuracySummary: summarizeSpeedAccuracy(classified),
    speedDeficit,
    attemptedReports,
    mistakes,
    sectionBreakdown,
    topicBreakdown,
  };
}
