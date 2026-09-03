import type { LanguageCode, Multilingual } from "./types";

/** Reads `map[language]`, falling back to English when that language's translation hasn't been added yet. */
export function localize(map: Multilingual, language: LanguageCode): string {
  return map[language] ?? map.en;
}
