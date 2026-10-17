"use client";

import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";

import { SUPPORTED_LANGUAGES, useLanguageStore } from "@/lib/hooks/useLanguageStore";

/** Extracted from SiteHeader so the minimal /start and /onboarding screens — which hide the full header — can still offer it. */
export function LanguageSwitcher() {
  const languageCode = useLanguageStore((s) => s.languageCode);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Choose language"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="uppercase">{languageCode}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 z-50 mt-1 w-44 rounded-xl border border-border bg-background py-2 shadow-xl">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="menuitem"
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-xs font-semibold transition-colors ${
                languageCode === lang.code
                  ? "bg-accent font-bold text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
