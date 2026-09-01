"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { MAX_STUDENT_PROFILES, type ParentAccount, type StudentProfile } from "./types";
import {
  selectActiveParent,
  selectActiveStudent,
  selectActiveStudents,
  useAuthStore,
} from "./useAuthStore";

export interface ActiveStudentContextValue {
  hasHydrated: boolean;
  isAuthenticated: boolean;
  parent: ParentAccount | null;
  students: StudentProfile[];
  activeStudent: StudentProfile | null;
  activeStudentId: string | null;
  setActiveStudentId: (id: string) => void;
  canAddMoreStudents: boolean;
  needsOnboarding: boolean;
}

const ActiveStudentContext = createContext<ActiveStudentContextValue | null>(null);

export function ActiveStudentProvider({ children }: { children: ReactNode }) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const parent = useAuthStore(selectActiveParent);
  const students = useAuthStore(selectActiveStudents);
  const activeStudent = useAuthStore(selectActiveStudent);
  const activeStudentId = useAuthStore((s) => s.activeStudentId);
  const setActiveStudentId = useAuthStore((s) => s.setActiveStudentId);

  const value = useMemo<ActiveStudentContextValue>(
    () => ({
      hasHydrated,
      isAuthenticated: !!parent,
      parent,
      students,
      activeStudent,
      activeStudentId,
      setActiveStudentId,
      canAddMoreStudents: students.length < MAX_STUDENT_PROFILES,
      needsOnboarding: hasHydrated && !!parent && students.length === 0,
    }),
    [hasHydrated, parent, students, activeStudent, activeStudentId, setActiveStudentId]
  );

  return <ActiveStudentContext.Provider value={value}>{children}</ActiveStudentContext.Provider>;
}

export function useActiveStudent(): ActiveStudentContextValue {
  const ctx = useContext(ActiveStudentContext);
  if (!ctx) throw new Error("useActiveStudent must be used within an ActiveStudentProvider");
  return ctx;
}
