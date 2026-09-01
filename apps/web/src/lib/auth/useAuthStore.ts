import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { sendOtp as mockSendOtp, verifyOtp as mockVerifyOtp } from "./mockAuthProvider";
import {
  MAX_STUDENT_PROFILES,
  type NewStudentInput,
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
  /** All known accounts in this browser, keyed by phone number — simulates per-user backend records without a real server. */
  accounts: Record<string, Account>;
  /** Phone of the currently signed-in account, or null when signed out. */
  activePhone: string | null;
  activeStudentId: string | null;
  testHistory: TestHistoryEntry[];

  /** Phone currently awaiting OTP verification; drives the auth modal's OTP step. */
  pendingOtpPhone: string | null;
  otpError: string | null;
  otpSending: boolean;
  otpVerifying: boolean;

  /** True once the persisted store has finished rehydrating from localStorage on the client. */
  hasHydrated: boolean;

  requestOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (code: string) => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>;
  cancelOtp: () => void;
  signOut: () => void;

  addStudent: (input: NewStudentInput) => StudentProfile;
  updateStudent: (id: string, patch: Partial<NewStudentInput>) => void;
  setActiveStudentId: (id: string) => void;

  recordTestResult: (entry: Omit<TestHistoryEntry, "id">) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      accounts: {},
      activePhone: null,
      activeStudentId: null,
      testHistory: [],
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
        set((state) => ({
          testHistory: [...state.testHistory, { ...entry, id: generateId() }],
        }));
      },
    }),
    {
      name: "vedicneev-auth",
      // Guard against SSR (Next.js server-renders "use client" components too)
      // and non-browser test environments, where `localStorage` doesn't exist —
      // fall back to a no-op store so module evaluation never throws there.
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
      }),
    }
  )
);

// `onRehydrateStorage`'s callback only receives the persisted slice, not the
// full store's actions — flip the flag directly via setState instead.
useAuthStore.persist.onFinishHydration(() => {
  useAuthStore.setState({ hasHydrated: true });
});
if (useAuthStore.persist.hasHydrated()) {
  useAuthStore.setState({ hasHydrated: true });
}

// ── Selectors ─────────────────────────────────────────────────────────

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
