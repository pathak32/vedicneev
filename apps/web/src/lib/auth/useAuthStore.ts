import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { sendOtp as mockSendOtp, verifyOtp as mockVerifyOtp } from "./mockAuthProvider";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  MAX_STUDENT_PROFILES,
  type MistakeLogEntry,
  type NewStudentInput,
  type NotificationPreferences,
  type ParentAccount,
  type StudentProfile,
  type TestHistoryEntry,
} from "./types";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface Account {
  parent: ParentAccount;
  students: StudentProfile[];
}

export interface AuthStoreState {
  accounts: Record<string, Account>;
  activePhone: string | null;
  activeStudentId: string | null;
  testHistory: TestHistoryEntry[];
  mistakeLog: MistakeLogEntry[];
  notificationPreferencesByParentId: Record<string, NotificationPreferences>;

  pendingOtpPhone: string | null;
  otpError: string | null;
  otpSending: boolean;
  otpVerifying: boolean;
  hasHydrated: boolean;

  requestOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (code: string) => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>;
  cancelOtp: () => void;
  signOut: () => void;

  addStudent: (input: NewStudentInput) => StudentProfile;
  updateStudent: (id: string, patch: Partial<NewStudentInput>) => void;
  setActiveStudentId: (id: string) => void;

  recordTestResult: (entry: Omit<TestHistoryEntry, "id">) => TestHistoryEntry;
  logMistakes: (entries: Omit<MistakeLogEntry, "id" | "reviewed">[]) => void;
  markAllMistakesReviewed: (studentId: string) => void;

  updateNotificationPreferences: (parentId: string, patch: Partial<NotificationPreferences>) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      accounts: {},
      activePhone: null,
      activeStudentId: null,
      testHistory: [],
      mistakeLog: [],
      notificationPreferencesByParentId: {},
      pendingOtpPhone: null,
      otpError: null,
      otpSending: false,
      otpVerifying: false,
      hasHydrated: false,

      requestOtp: async (phone) => {
        set({ otpSending: true, otpError: null });
        const result = await mockSendOtp(phone);
        set({
          otpSending: false,
          otpError: result.error ?? null,
          pendingOtpPhone: result.success ? phone : null,
        });
        return result;
      },

      verifyOtp: async (code) => {
        const phone = get().pendingOtpPhone;
        if (!phone) return { success: false, error: "Request an OTP first." };

        set({ otpVerifying: true, otpError: null });
        const result = await mockVerifyOtp(code);
        if (!result.success) {
          set({ otpVerifying: false, otpError: result.error ?? null });
          return result;
        }

        // Sync user to Supabase PostgreSQL database
        try {
          await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
          });
        } catch (err) {
          console.error("Failed to sync user to database:", err);
        }

        const state = get();
        const existing = state.accounts[phone];
        const isNewUser = !existing;
        const account: Account = existing ?? {
          parent: { id: generateId(), phone, createdAt: Date.now() },
          students: [],
        };

        set({
          accounts: { ...state.accounts, [phone]: account },
          activePhone: phone,
          activeStudentId: account.students[0]?.id ?? null,
          pendingOtpPhone: null,
          otpVerifying: false,
          otpError: null,
        });

        return { success: true, isNewUser };
      },

      cancelOtp: () => set({ pendingOtpPhone: null, otpError: null }),
      signOut: () => set({ activePhone: null, activeStudentId: null }),

      addStudent: (input) => {
        const state = get();
        const phone = state.activePhone;
        const account = phone ? state.accounts[phone] : undefined;
        if (!phone || !account) throw new Error("Sign in before adding a student profile.");
        if (account.students.length >= MAX_STUDENT_PROFILES) {
          throw new Error(`You can add up to ${MAX_STUDENT_PROFILES} student profiles.`);
        }

        const student: StudentProfile = {
          id: generateId(),
          parentId: account.parent.id,
          createdAt: Date.now(),
          ...input,
        };

        set({
          accounts: {
            ...state.accounts,
            [phone]: { ...account, students: [...account.students, student] },
          },
          activeStudentId: state.activeStudentId ?? student.id,
        });

        return student;
      },

      updateStudent: (id, patch) => {
        const state = get();
        const phone = state.activePhone;
        const account = phone ? state.accounts[phone] : undefined;
        if (!phone || !account) return;

        set({
          accounts: {
            ...state.accounts,
            [phone]: {
              ...account,
              students: account.students.map((s) => (s.id === id ? { ...s, ...patch } : s)),
            },
          },
        });
      },

      setActiveStudentId: (id) => {
        const state = get();
        const account = state.activePhone ? state.accounts[state.activePhone] : undefined;
        if (!account?.students.some((s) => s.id === id)) return;
        set({ activeStudentId: id });
      },

      recordTestResult: (entry) => {
        const historyEntry: TestHistoryEntry = { ...entry, id: generateId() };
        set((state) => ({
          testHistory: [...state.testHistory, historyEntry],
        }));
        return historyEntry;
      },

      logMistakes: (entries) => {
        if (entries.length === 0) return;
        const logged: MistakeLogEntry[] = entries.map((entry) => ({
          ...entry,
          id: generateId(),
          reviewed: false,
        }));
        set((state) => ({ mistakeLog: [...state.mistakeLog, ...logged] }));
      },

      markAllMistakesReviewed: (studentId) => {
        set((state) => ({
          mistakeLog: state.mistakeLog.map((m) => (m.studentId === studentId ? { ...m, reviewed: true } : m)),
        }));
      },

      updateNotificationPreferences: (parentId, patch) => {
        set((state) => ({
          notificationPreferencesByParentId: {
            ...state.notificationPreferencesByParentId,
            [parentId]: {
              ...(state.notificationPreferencesByParentId[parentId] ?? DEFAULT_NOTIFICATION_PREFERENCES),
              ...patch,
            },
          },
        }));
      },
    }),
    {
      name: "vedicneev-auth",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : localStorage
      ),
      partialize: (state) => ({
        accounts: state.accounts,
        activePhone: state.activePhone,
        activeStudentId: state.activeStudentId,
        testHistory: state.testHistory,
        mistakeLog: state.mistakeLog,
        notificationPreferencesByParentId: state.notificationPreferencesByParentId,
      }),
    }
  )
);

useAuthStore.persist.onFinishHydration(() => {
  useAuthStore.setState({ hasHydrated: true });
});
if (useAuthStore.persist.hasHydrated()) {
  useAuthStore.setState({ hasHydrated: true });
}

export function selectActiveAccount(state: AuthStoreState): Account | null {
  return state.activePhone ? (state.accounts[state.activePhone] ?? null) : null;
}

export function selectActiveParent(state: AuthStoreState): ParentAccount | null {
  return selectActiveAccount(state)?.parent ?? null;
}

export function selectActiveStudents(state: AuthStoreState): StudentProfile[] {
  return selectActiveAccount(state)?.students ?? [];
}

export function selectActiveStudent(state: AuthStoreState): StudentProfile | null {
  const students = selectActiveStudents(state);
  return students.find((s) => s.id === state.activeStudentId) ?? null;
}

export function selectStudentTestHistory(state: AuthStoreState, studentId: string): TestHistoryEntry[] {
  return state.testHistory.filter((entry) => entry.studentId === studentId);
}

export function selectMistakeLogForStudent(state: AuthStoreState, studentId: string): MistakeLogEntry[] {
  return state.mistakeLog.filter((m) => m.studentId === studentId);
}

export function selectUnreviewedMistakeCount(state: AuthStoreState, studentId: string): number {
  return state.mistakeLog.filter((m) => m.studentId === studentId && !m.reviewed).length;
}

export function selectUnreviewedCarelessCount(state: AuthStoreState, studentId: string): number {
  return state.mistakeLog.filter(
    (m) => m.studentId === studentId && !m.reviewed && m.mistakeTag === "CARELESS_RUSHED"
  ).length;
}

export function selectNotificationPreferences(
  state: AuthStoreState,
  parentId: string | null
): NotificationPreferences {
  if (!parentId) return DEFAULT_NOTIFICATION_PREFERENCES;
  return state.notificationPreferencesByParentId[parentId] ?? DEFAULT_NOTIFICATION_PREFERENCES;
}
