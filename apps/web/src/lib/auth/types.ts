import type { ExamQuestion, LanguageCode, Multilingual, VedicSpeedHack } from "@/lib/exam/types";

export type TargetExam = "JNVST" | "AISSEE" | "RMS" | "DPS";
export type TargetClass = 5 | 6 | 8 | 9;
export type Locality = "RURAL" | "URBAN";
export type QuotaCategory = "GEN" | "OBC" | "SC" | "ST" | "DEFENSE";

export const MAX_STUDENT_PROFILES = 3;

export interface ParentAccount {
  id: string;
  /** 10-digit Indian mobile number, no country code. */
  phone: string;
  createdAt: number;
}

export interface StudentProfile {
  id: string;
  parentId: string;
  fullName: string;
  targetExam: TargetExam;
  targetClass: TargetClass;
  languagePreference: LanguageCode;
  locality: Locality;
  quotaCategory: QuotaCategory;
  createdAt: number;
}

export type NewStudentInput = Omit<StudentProfile, "id" | "parentId" | "createdAt">;

export interface SectionAccuracySnapshot {
  sectionKey: string;
  sectionName: string;
  accuracyPercent: number;
}

export interface TestHistoryEntry {
  id: string;
  studentId: string;
  examId: string;
  examName: string;
  totalMarks: number;
  maxMarks: number;
  accuracyPercent: number;
  /** Real percentile among other VedicNeev test-takers of this exam template, computed server-side at submission time (see calculateRealPercentile in packages/engine/src/scoring.ts) — null when that attempt wasn't a full mock (e.g. topic practice) or the comparison cohort was too small. */
  percentile: number | null;
  submittedAt: number;
  /** Snapshotted at submission time, so the Parent Command Center can chart section trends across attempts. */
  sectionBreakdown: SectionAccuracySnapshot[];
}

export type MistakeTagCategory = "CARELESS_RUSHED" | "CONCEPT_GAP" | "CALCULATION_GAP";

/** One durable mistake record per wrong answer, so the Parent Command Center can accumulate an "unreviewed errors" count across every attempt, not just the most recent one. */
export interface MistakeLogEntry {
  id: string;
  studentId: string;
  examId: string;
  testHistoryEntryId: string;
  questionId: string;
  questionNumber: number;
  /** Snapshotted at log time so the Mistake Vault can show "your answer" vs. the correct one without re-deriving the graded attempt. */
  selectedOption?: string;
  mistakeTag: MistakeTagCategory;
  reviewed: boolean;
  createdAt: number;
  /**
   * Snapshotted at log time (results/page.tsx), same convention as
   * selectedOption above. Nothing durable exists that could re-derive a
   * real attempt's actual question set later — TestHistoryEntry only keeps
   * score summaries, useTestStore's session is ephemeral sessionStorage,
   * and live-mock papers draw PYQ pools non-deterministically — so this is
   * the only reliable way for the Mistake Vault to show the real question
   * content afterward instead of a fabricated placeholder.
   */
  question: ExamQuestion;
  sectionName: Multilingual;
  speedHack: VedicSpeedHack | null;
}

export interface NotificationPreferences {
  instantScorecard: boolean;
  weeklyDigest: boolean;
  dailyTip: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  instantScorecard: true,
  weeklyDigest: false,
  dailyTip: false,
};
