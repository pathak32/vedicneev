"use client";

import { useLanguageStore } from "./useLanguageStore";
import { DICTIONARY, type DictionaryKey } from "./dictionary";

/**
 * `const t = useT(); t("navDashboard")` — reads this app's own language
 * store (not apps/web's), so the toggle in this app's header applies
 * everywhere this hook is used here. Falls back to English on a missing
 * key rather than rendering blank — same convention as apps/web's useT().
 */
export function useT() {
  const languageCode = useLanguageStore((s) => s.languageCode);
  return (key: DictionaryKey) => DICTIONARY[key][languageCode] ?? DICTIONARY[key].en;
}
