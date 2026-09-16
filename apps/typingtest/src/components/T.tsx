"use client";

import { useT } from "@/lib/i18n/useT";
import type { DictionaryKey } from "@/lib/i18n/dictionary";

/** Inline translated text node — `<T k="dashboardTitle" />` — for dropping a single dictionary string into an otherwise-server-rendered page without converting the whole page to a client component. */
export function T({ k }: { k: DictionaryKey }) {
  const t = useT();
  return <>{t(k)}</>;
}
