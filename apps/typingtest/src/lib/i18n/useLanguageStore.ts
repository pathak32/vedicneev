import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TypingLanguageCode = "en" | "hi";

export const SUPPORTED_LANGUAGES: { code: TypingLanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
];

export interface LanguageStoreState {
  languageCode: TypingLanguageCode;
  hasHydrated: boolean;
  setLanguage: (languageCode: TypingLanguageCode) => void;
}

/**
 * This app's own EN/HI-only language store — app-local rather than shared,
 * same duplication convention as src/lib/supabase/env.ts and
 * src/lib/auth/phoneFormat.ts in this app. Mirrors apps/web's
 * useLanguageStore.ts exactly (Zustand + persist, localStorage-backed) but
 * scoped to this app's own two supported languages rather than that app's
 * six, and under its own storage key so the two don't collide/interfere
 * even though a visitor may have both subdomains open.
 */
export const useLanguageStore = create<LanguageStoreState>()(
  persist(
    (set) => ({
      languageCode: "en",
      hasHydrated: false,
      setLanguage: (languageCode) => set({ languageCode }),
    }),
    {
      name: "vedicneev-typingtest-language",
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
