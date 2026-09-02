import type { LanguageCode } from "@/lib/exam/types";

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
  /** Snapshotted at submission time (see DiagnosticReport.percentile) — the cohort itself isn't stored, so this can't be recomputed later. */
  percentile: number;
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
  mistakeTag: MistakeTagCategory;
  reviewed: boolean;
  createdAt: number;
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
