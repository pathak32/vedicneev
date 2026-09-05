import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { LanguageCode } from "@/lib/exam/types";

/** Native-script label shown in language pickers, keyed by LanguageCode. */
export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
];

export interface LanguageStoreState {
  languageCode: LanguageCode;
  hasHydrated: boolean;
  setLanguage: (languageCode: LanguageCode) => void;
}

/**
 * The user's app-wide active language — e.g. the exam runner's language
 * dropdown (apps/web/src/components/exam/ExamHeader.tsx) writes here so the
 * choice survives page reloads and future sessions. Separate from
 * useTestStore's own `language` field, which is scoped to the exam
 * currently in progress and reset per session; useTestStore.initSession
 * seeds that field from this store so a returning student's language
 * choice carries over into their next exam without this store's state
 * being tied to (or reset by) any single exam session.
 */
export const useLanguageStore = create<LanguageStoreState>()(
  persist(
    (set) => ({
      languageCode: "en",
      hasHydrated: false,
      setLanguage: (languageCode) => set({ languageCode }),
    }),
    {
      name: "vedicneev-language",
      storage: createJSONStorage(() =>
        typeof window === "undefined"
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : localStorage
      ),
      partialize: (state) => ({ languageCode: state.languageCode }),
    }
  )
);

useLanguageStore.persist.onFinishHydration(() => {
  useLanguageStore.setState({ hasHydrated: true });
});
if (useLanguageStore.persist.hasHydrated()) {
  useLanguageStore.setState({ hasHydrated: true });
}
