/** Pulls one language out of a bilingual Json field ({en, hi, ...}), matching Question.content's convention — "en" is always present, so it's the fallback for a language that hasn't been translated yet. */
export function localize(value: unknown, lang: string = "en"): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const picked = obj[lang] ?? obj.en;
    if (typeof picked === "string") return picked;
  }
  return "";
}

/** Same as localize(), but for a bilingual array field (TypingLogicQuestion.options: { en: string[], hi: string[] }). */
export function localizeArray(value: unknown, lang: string = "en"): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const picked = obj[lang] ?? obj.en;
    if (Array.isArray(picked)) return picked.filter((v): v is string => typeof v === "string");
  }
  return [];
}
