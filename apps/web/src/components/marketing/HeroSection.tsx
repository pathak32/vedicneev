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

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="space-y-8 text-center lg:col-span-7 lg:text-left">
            {/* Quest badge — live-dot ping + per-language tagline */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-900/90 px-4 py-1.5 text-xs font-semibold text-amber-400 shadow-inner shadow-amber-500/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
              </span>
              <span>{HERO_BADGES[activeLanguage]} • JNVST | RMS | AISSEE 2026</span>
            </div>

            {/* Kinetic headline — a genuinely FIXED height (not min-height,
                which still lets the box grow and push everything below it
                down when a longer script rotates in) sized to the tallest
                of the 5 languages at each breakpoint, measured directly in
                the browser: ~159px worst case below the sm breakpoint,
                ~240px at and above it (Tamil/Bengali both wrap to 3 lines
                at text-6xl). Shorter headlines just sit vertically centered
                in the extra space instead of shrinking the box. */}
            <div className="flex h-44 items-center justify-center sm:h-64 lg:justify-start">
              <h1
                key={activeLanguage}
                className="animate-in fade-in slide-in-from-bottom-2 bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-4xl font-black leading-[1.1] tracking-tight text-transparent duration-500 motion-reduce:animate-none sm:text-6xl"
              >
                {HERO_HEADLINES[activeLanguage]}
              </h1>
            </div>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl lg:mx-0">
              India&rsquo;s premier gamified entrance engine. Master{" "}
              <strong className="font-semibold text-amber-400">Vedic Math sutras</strong>, smart error correction,
              and real-time OMR tests in your regional language.
            </p>

            {/* Kinetic language selector — writes straight to useLanguageStore, so a choice here is the same app-wide preference the exam runner reads. */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Instant multi-language engine — click to switch app-wide:
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
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

            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row lg:justify-start">
              <Link
                href="/exam/demo-jnvst"
                className="w-full -translate-y-0 transform rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-center font-extrabold text-slate-950 shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:from-amber-400 hover:to-amber-500 sm:w-auto"
              >
                Start Free Mock Test
              </Link>
              <Link
                href="/blog"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-8 py-4 text-center font-semibold text-slate-200 transition-all hover:bg-slate-800 sm:w-auto"
              >
                Read Exam Strategy
              </Link>
            </div>
          </div>

          {/* Gamified command-card preview */}
          <div className="lg:col-span-5">
            <div className="group relative rounded-3xl border border-slate-800/80 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-amber-500/40 sm:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono text-xs font-medium text-amber-400/90">vedic-quest-engine.preview</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950 p-4">
                  <div>
                    <p className="text-xs text-slate-400">Target Boarding School Tier</p>
                    <p className="mt-0.5 text-sm font-bold text-amber-400">JNVST &amp; RMS Class 6 Elite</p>
                  </div>
                  <span className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs text-emerald-400">
                    ONLINE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950 p-4">
                    <p className="text-xs text-slate-400">Calculation Multiplier</p>
                    <p className="mt-1 text-2xl font-black text-white">
                      10<span className="text-base">×</span> <span className="text-xs font-normal text-amber-400">Sutras</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950 p-4">
                    <p className="text-xs text-slate-400">Study Streak</p>
                    <p className="mt-1 text-2xl font-black text-amber-400">
                      7<span className="text-base">d</span> <span className="text-xs font-normal text-emerald-400">🔥</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-800/80 bg-slate-950 p-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Daily Quest Mastery</span>
                    <span className="text-amber-400">85% Complete</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
                    <div className="h-full w-[85%] animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 motion-reduce:animate-none" />
                  </div>
                  <p className="pt-0.5 text-[11px] text-slate-500">🛡️ Mistake Vault — 12 cleared this week</p>
                </div>

                <p className="text-[11px] text-slate-600">
                  Illustrative preview — real progress syncs live once you sign in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
