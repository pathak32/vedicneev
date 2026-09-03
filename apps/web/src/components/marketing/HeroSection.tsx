"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@vedicneev/ui";

import type { LanguageCode } from "@/lib/exam/types";
import { SUPPORTED_LANGUAGES, useLanguageStore } from "@/lib/hooks/useLanguageStore";

const ROTATE_INTERVAL_MS = 4000;

const HERO_HEADLINES: Record<LanguageCode, string> = {
  en: "Master Government Boarding School Entrances",
  hi: "सरकारी प्रवेश परीक्षा की संपूर्ण तैयारी",
  mr: "शासकीय निवासी शाळा प्रवेश परीक्षा तयारी",
  bn: "সরকারি আবাসিক বিদ্যালয় ভর্তি পরীক্ষায় দক্ষতা অর্জন করুন",
  ta: "அரசு உறைவிடப் பள்ளி நுழைவுத் தேர்வில் திறமை பெறுங்கள்",
};

/** Short native-script label for the compact language pills — derives from the shared catalog's "Native (English)" label instead of a second hardcoded list. */
function shortLabel(label: string): string {
  return label.split(" (")[0] ?? label;
}

export function HeroSection() {
  const storedLanguage = useLanguageStore((s) => s.languageCode);
  const hasHydrated = useLanguageStore((s) => s.hasHydrated);
  const setStoredLanguage = useLanguageStore((s) => s.setLanguage);

  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>("en");
  const [autoRotate, setAutoRotate] = useState(true);

  // Once the persisted language preference (set here or in the exam
  // runner — see apps/web/src/components/exam/ExamHeader.tsx) has
  // hydrated client-side, show it immediately instead of always starting
  // the rotation from English.
  useEffect(() => {
    if (hasHydrated) {
      setActiveLanguage(storedLanguage);
      setAutoRotate(false);
    }
  }, [hasHydrated, storedLanguage]);

  useEffect(() => {
    if (!autoRotate) return;
    const timer = window.setInterval(() => {
      setActiveLanguage((prev) => {
        const index = SUPPORTED_LANGUAGES.findIndex((l) => l.code === prev);
        return SUPPORTED_LANGUAGES[(index + 1) % SUPPORTED_LANGUAGES.length]!.code;
      });
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [autoRotate]);

  function selectLanguage(code: LanguageCode) {
    setAutoRotate(false);
    setActiveLanguage(code);
    // Persists app-wide — picking a language here carries into the exam
    // runner's language picker too, same store both read from.
    setStoredLanguage(code);
  }

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-white lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[350px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-amber-400">
              <span>🚀 India&rsquo;s 5-Language Boarding School Engine</span>
            </div>

            <div className="flex h-24 items-center justify-center sm:h-20 lg:justify-start">
              <h1
                key={activeLanguage}
                className="animate-in fade-in slide-in-from-bottom-2 text-3xl font-extrabold leading-tight tracking-tight duration-500 motion-reduce:animate-none sm:text-5xl"
              >
                {HERO_HEADLINES[activeLanguage]}
              </h1>
            </div>

            <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-lg lg:mx-0">
              Targeted preparation for <strong className="text-slate-200">JNVST, RMS, and AISSEE</strong> (Classes
              6 &amp; 9) powered by adaptive error correction, real-time OMR simulation, and regional language
              support.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 lg:justify-start">
              <span className="text-xs font-medium text-slate-500">Test in:</span>
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => selectLanguage(l.code)}
                  aria-pressed={activeLanguage === l.code}
                  className={cn(
                    "rounded px-2.5 py-1 text-xs font-semibold transition-colors",
                    activeLanguage === l.code
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  )}
                >
                  {shortLabel(l.label)}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row lg:justify-start">
              <Link
                href="/exam/demo-jnvst"
                className="w-full rounded-xl bg-amber-500 px-8 py-3.5 text-center font-bold text-slate-950 shadow-lg shadow-amber-500/10 transition-colors hover:bg-amber-400 sm:w-auto"
              >
                Start Free Mock Test
              </Link>
              <Link
                href="/blog"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-8 py-3.5 text-center font-semibold text-slate-200 transition-colors hover:bg-slate-800 sm:w-auto"
              >
                Read Exam Strategy Blogs
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500" />
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <span className="font-mono text-xs text-slate-400">parent-command-center.v2</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950 p-4">
                  <div>
                    <p className="text-xs text-slate-400">Target Examination</p>
                    <p className="text-sm font-bold text-amber-400">AISSEE &amp; JNVST Class 6</p>
                  </div>
                  <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                    Active Sync
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-800/60 bg-slate-950 p-4">
                    <p className="text-xs text-slate-400">Mock Accuracy</p>
                    <p className="mt-1 text-xl font-extrabold text-white">88.4%</p>
                  </div>
                  <div className="rounded-xl border border-slate-800/60 bg-slate-950 p-4">
                    <p className="text-xs text-slate-400">Mistake Vault</p>
                    <p className="mt-1 text-xl font-extrabold text-amber-400">12 Cleared</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3 text-xs text-amber-300/90">
                  <span>💡</span>
                  <span>Illustrative preview — synced in real time via our secure Supabase Postgres backend.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
