import { useLanguageStore } from "@/lib/hooks/useLanguageStore";
import { DICTIONARY, type DictionaryKey } from "./dictionary";

/**
 * `const t = useT(); t("navLearn")` — reads the same global language store
 * the hero section and header switcher already write to, so a language
 * choice anywhere on the site applies everywhere this hook is used. Falls
 * back to English on a missing translation rather than rendering blank.
 */
export function useT() {
  const languageCode = useLanguageStore((s) => s.languageCode);
  return (key: DictionaryKey) => DICTIONARY[key][languageCode] ?? DICTIONARY[key].en;
}
