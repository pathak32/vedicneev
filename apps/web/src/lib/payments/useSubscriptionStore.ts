import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { EntitlementExamType, ParentSubscription, PaidPlanId, SubscriptionStatus } from "@vedicneev/engine";

/**
 * Client-side mirror of packages/db's Subscription model. No live database
 * is connected in this project (same situation as useAuthStore for
 * User/Student), so this store — persisted to localStorage — is the actual
 * runtime source of truth for the demo; swapping in real persistence later
 * only means writing to Prisma wherever `activateSubscription` is called.
 */
export interface StoredSubscription {
  id: string;
  parentId: string;
  plan: PaidPlanId;
  targetExam: EntitlementExamType | null;
  status: SubscriptionStatus;
  amountPaid: number;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  validUntil: number | null;
  createdAt: number;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export interface ActivateSubscriptionInput {
  parentId: string;
  plan: PaidPlanId;
  targetExam: EntitlementExamType | null;
  amountPaid: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
}

interface SubscriptionStoreState {
  /** One current subscription per parent — a new purchase replaces the previous one. */
  subscriptionsByParentId: Record<string, StoredSubscription>;
  /** Free-tier mock-test usage, keyed by student id. */
  freeMockTestsUsedByStudentId: Record<string, number>;
  /** Free-preview short-video usage, keyed by student id. */
  freeShortsPreviewedByStudentId: Record<string, number>;
  hasHydrated: boolean;

  activateSubscription: (input: ActivateSubscriptionInput) => StoredSubscription;
  cancelSubscription: (parentId: string) => void;
  incrementFreeMockUsage: (studentId: string) => void;
  incrementFreeShortsPreview: (studentId: string) => void;
}

export const useSubscriptionStore = create<SubscriptionStoreState>()(
  persist(
    (set, get) => ({
      subscriptionsByParentId: {},
      freeMockTestsUsedByStudentId: {},
      freeShortsPreviewedByStudentId: {},
      hasHydrated: false,

      activateSubscription: (input) => {
        const subscription: StoredSubscription = {
          id: generateId(),
          parentId: input.parentId,
          plan: input.plan,
          targetExam: input.targetExam,
          status: "ACTIVE",
          amountPaid: input.amountPaid,
          razorpayOrderId: input.razorpayOrderId,
          razorpayPaymentId: input.razorpayPaymentId,
          validUntil: Date.now() + ONE_YEAR_MS,
          createdAt: Date.now(),
        };
        set((state) => ({
          subscriptionsByParentId: { ...state.subscriptionsByParentId, [input.parentId]: subscription },
        }));
        return subscription;
      },

      cancelSubscription: (parentId) => {
        const existing = get().subscriptionsByParentId[parentId];
        if (!existing) return;
        set((state) => ({
          subscriptionsByParentId: {
            ...state.subscriptionsByParentId,
            [parentId]: { ...existing, status: "CANCELLED" },
          },
        }));
      },

      incrementFreeMockUsage: (studentId) => {
        set((state) => ({
          freeMockTestsUsedByStudentId: {
            ...state.freeMockTestsUsedByStudentId,
            [studentId]: (state.freeMockTestsUsedByStudentId[studentId] ?? 0) + 1,
          },
        }));
      },

      incrementFreeShortsPreview: (studentId) => {
        set((state) => ({
          freeShortsPreviewedByStudentId: {
            ...state.freeShortsPreviewedByStudentId,
            [studentId]: (state.freeShortsPreviewedByStudentId[studentId] ?? 0) + 1,
          },
        }));
      },
    }),
    {
      name: "vedicneev-subscription",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : localStorage
      ),
      partialize: (state) => ({
        subscriptionsByParentId: state.subscriptionsByParentId,
        freeMockTestsUsedByStudentId: state.freeMockTestsUsedByStudentId,
        freeShortsPreviewedByStudentId: state.freeShortsPreviewedByStudentId,
      }),
    }
  )
);

useSubscriptionStore.persist.onFinishHydration(() => {
  useSubscriptionStore.setState({ hasHydrated: true });
});
if (useSubscriptionStore.persist.hasHydrated()) {
  useSubscriptionStore.setState({ hasHydrated: true });
}

// ── Selectors ─────────────────────────────────────────────────────────

export function selectParentSubscription(
  state: SubscriptionStoreState,
  parentId: string | null
): ParentSubscription | null {
  if (!parentId) return null;
  const stored = state.subscriptionsByParentId[parentId];
  if (!stored) return null;
  return { plan: stored.plan, targetExam: stored.targetExam, status: stored.status, validUntil: stored.validUntil };
}

export function selectFreeMockTestsUsed(state: SubscriptionStoreState, studentId: string | null): number {
  if (!studentId) return 0;
  return state.freeMockTestsUsedByStudentId[studentId] ?? 0;
}

export function selectFreeShortsPreviewed(state: SubscriptionStoreState, studentId: string | null): number {
  if (!studentId) return 0;
  return state.freeShortsPreviewedByStudentId[studentId] ?? 0;
}
