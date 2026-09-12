"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@vedicneev/ui";

import type { LanguageCode } from "@/lib/exam/types";
import { SUPPORTED_LANGUAGES, useLanguageStore } from "@/lib/hooks/useLanguageStore";
import { SpeedChallengeWidget } from "@/components/marketing/SpeedChallengeWidget";

const ROTATE_INTERVAL_MS = 4000;

const HERO_HEADLINES: Record<LanguageCode, string> = {
  en: "Master Government Boarding School Entrances",
  hi: "सरकारी प्रवेश परीक्षा की संपूर्ण तैयारी",
  mr: "शासकीय निवासी शाळा प्रवेश परीक्षा तयारी",
  bn: "সরকারি আবাসিক বিদ্যালয় ভর্তি পরীক্ষায় দক্ষতা অর্জন করুন",
  ta: "அரசு உறைவிடப் பள்ளி நுழைவுத் தேர்வில் திறமை பெறுங்கள்",
  gu: "સરકારી નિવાસી શાળા પ્રવેશ પરીક્ષાની સંપૂર્ણ તૈયારી",
};

// Short per-language quest taglines for the top badge. Deliberately avoid
// outcome-guarantee language ("success guaranteed") for an exam-prep
// product — no admission can honestly be promised, so these stay energetic
// without overpromising.
const HERO_BADGES: Record<LanguageCode, string> = {
  en: "⚡ 10x Vedic Speed",
  hi: "🎯 सटीक तैयारी",
  mr: "🚀 स्मार्ट सराव",
  bn: "💡 স্মার্ট শিক্ষা",
  ta: "🔥 வேக பயிற்சி",
  gu: "⚡ ઝડપી અભ્યાસ",
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
    <section className="relative overflow-hidden border-b border-slate-900 bg-slate-950 py-24 text-white lg:py-36">
      {/* Immersive ambient glow mesh — two offset blurred blobs (amber + emerald) rather than a single 3-stop gradient, so it reads as a mesh instead of a flat wash. */}
      <div className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[560px] rounded-full bg-amber-500/15 blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[420px] w-[560px] rounded-full bg-emerald-500/10 blur-[130px]" />
      {/* Subtle grid, faded toward the edges so it reads as texture, not noise. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1e293b1a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 text-center">
          {/* Quest badge — live-dot ping + per-language tagline */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-900/90 px-4 py-1.5 text-xs font-semibold text-amber-400 shadow-inner shadow-amber-500/10">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            <span>{HERO_BADGES[activeLanguage]} • JNVST | RMS | AISSEE 2026</span>
          </div>

          {/* Kinetic headline — a min-height (not fixed) so Indic scripts'
              taller ascenders/descenders (matras, conjuncts) never clip:
              generous 1.35 leading plus vertical padding gives every script
              headroom, and clamp() scales the font itself between
              breakpoints instead of jumping text-4xl -> text-6xl, which is
              what caused the worst clipping on narrow viewports. */}
          <div className="flex min-h-[7rem] items-center justify-center py-2 sm:min-h-[9rem]">
            <h1
              key={activeLanguage}
              className="animate-in fade-in slide-in-from-bottom-2 bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-[clamp(1.75rem,5.5vw,3.75rem)] font-black leading-[1.35] tracking-tight text-transparent duration-500 motion-reduce:animate-none"
            >
              {HERO_HEADLINES[activeLanguage]}
            </h1>
          </div>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
            India&rsquo;s premier gamified entrance engine. Master{" "}
            <strong className="font-semibold text-amber-400">Vedic Math sutras</strong>, smart error correction,
            and real-time OMR tests in your regional language.
          </p>

          {/* Kinetic language selector — writes straight to useLanguageStore, so a choice here is the same app-wide preference the exam runner reads. */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Instant multi-language engine — click to switch app-wide:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => selectLanguage(l.code)}
                  aria-pressed={activeLanguage === l.code}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-300",
                    activeLanguage === l.code
                      ? "scale-105 bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50"
                      : "border border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  {shortLabel(l.label)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link
              href="/#exam-boards"
              className="w-full -translate-y-0 transform rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-center font-extrabold text-slate-950 shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:from-amber-400 hover:to-amber-500 sm:w-auto"
            >
              Start Free Mock Test
            </Link>
            <Link
              href="/exam-strategy"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-8 py-4 text-center font-semibold text-slate-200 transition-all hover:bg-slate-800 sm:w-auto"
            >
              Read Exam Strategy
            </Link>
          </div>

          {/* Gamified lead-gen widget — DB-backed via /api/speed-challenge/questions, not hardcoded content. */}
          <div className="pt-8">
            <SpeedChallengeWidget />
          </div>
        </div>
      </div>
    </section>
  );
}
