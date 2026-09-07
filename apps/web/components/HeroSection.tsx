'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Award } from 'lucide-react';
import { useLanguageStore, SUPPORTED_LANGUAGES } from '@/lib/hooks/useLanguageStore';
import { localize } from '@/lib/exam/localize';
import { landingText } from '@/lib/marketing/landingLocalization';

export default function HeroSection() {
  const { languageCode, setLanguage } = useLanguageStore();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-white to-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-8">

          {/* Badge Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/90 text-amber-900 text-xs font-extrabold tracking-wider uppercase border border-amber-300 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            {localize(landingText.badge, languageCode)}
          </div>

          {/* Main Headline with Relaxed Line-Height to Prevent Indic Text Clipping */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-relaxed sm:leading-relaxed lg:leading-relaxed">
            {localize(landingText.title1, languageCode)}{' '}
            <span className="text-amber-600 underline decoration-amber-300 decoration-wavy decoration-1 underline-offset-8">
              {localize(landingText.titleHighlight, languageCode)}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto font-medium">
            {localize(landingText.subtitle, languageCode)}
          </p>

          {/* Fully Visible 6-Language Switcher Toolbar (Including Gujarati) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4 pb-2">
            <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mr-2">Select Language:</span>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs ${
                  languageCode === lang.code
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-105 ring-2 ring-amber-400'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-amber-50 hover:border-amber-400'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              href="/sprints"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-extrabold text-white bg-amber-600 rounded-2xl shadow-xl hover:bg-amber-700 transition-all gap-2 group"
            >
              {localize(landingText.ctaPrimary, languageCode)}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>

            <Link
              href="/blog"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-800 bg-white border-2 border-gray-300 rounded-2xl shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              {localize(landingText.ctaSecondary, languageCode)}
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-10 border-t border-gray-200/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>{localize(landingText.trust1, languageCode)}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <Award className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>{localize(landingText.trust2, languageCode)}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>{localize(landingText.trust3, languageCode)}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
