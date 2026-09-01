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

export interface TestHistoryEntry {
  id: string;
  studentId: string;
  examId: string;
  examName: string;
  totalMarks: number;
  maxMarks: number;
  accuracyPercent: number;
  submittedAt: number;
}
