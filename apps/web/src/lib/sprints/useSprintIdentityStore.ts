import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Tracks "which registration am I" per sprint, for guests and signed-in
 * parents alike — a guest has no User row at all, so this (not
 * useAuthStore) is the only place a browser remembers its sprint entry.
 * Purely a client-side convenience: the server is still what actually
 * enforces single-attempt (SprintSubmission.registrationId is @unique),
 * this just avoids asking someone to re-enter their details every time
 * they come back to the same sprint in the same browser.
 */
export interface SprintEntry {
  registrationId: string;
  participantName: string;
  phone: string;
  state: string;
  hasSubmitted: boolean;
}

interface SprintIdentityState {
  bySprintId: Record<string, SprintEntry>;
  hasHydrated: boolean;
  registerEntry: (sprintId: string, entry: SprintEntry) => void;
  markSubmitted: (sprintId: string) => void;
}

export const useSprintIdentityStore = create<SprintIdentityState>()(
  persist(
    (set) => ({
      bySprintId: {},
      hasHydrated: false,

      registerEntry: (sprintId, entry) => {
        set((state) => ({ bySprintId: { ...state.bySprintId, [sprintId]: entry } }));
      },

      markSubmitted: (sprintId) => {
        set((state) => {
          const existing = state.bySprintId[sprintId];
          if (!existing) return state;
          return { bySprintId: { ...state.bySprintId, [sprintId]: { ...existing, hasSubmitted: true } } };
        });
      },
    }),
    {
      name: "vedicneev-sprint-identity",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : localStorage
      ),
      partialize: (state) => ({ bySprintId: state.bySprintId }),
    }
  )
);

useSprintIdentityStore.persist.onFinishHydration(() => {
  useSprintIdentityStore.setState({ hasHydrated: true });
});
if (useSprintIdentityStore.persist.hasHydrated()) {
  useSprintIdentityStore.setState({ hasHydrated: true });
}

export function selectSprintEntry(state: SprintIdentityState, sprintId: string): SprintEntry | null {
  return state.bySprintId[sprintId] ?? null;
}
