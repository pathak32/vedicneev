"use client";

import { SUPPORTED_LANGUAGES, useLanguageStore } from "@/lib/i18n/useLanguageStore";

/**
 * Two real, always-visible buttons rather than apps/web's hover-reveal
 * dropdown — fully reachable by keyboard/screen reader with no extra
 * interaction step, satisfying "accessible language toggle" directly
 * rather than needing the focus-within patch apps/web's own switcher
 * needed (see SiteHeader.tsx's LanguageSwitcher).
 */
export function LanguageToggle() {
  const languageCode = useLanguageStore((s) => s.languageCode);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return (
    <div role="group" aria-label="Choose language" className="flex items-center rounded-full border border-border bg-muted p-0.5 text-xs font-bold">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          aria-pressed={languageCode === lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            languageCode === lang.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
