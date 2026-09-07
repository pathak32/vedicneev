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
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/50 via-white to-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">

          {/* Badge Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold tracking-wide uppercase border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {localize(landingText.badge, languageCode)}
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight sm:leading-tight lg:leading-tight">
            {localize(landingText.title1, languageCode)}{' '}
            <span className="text-amber-600">{localize(landingText.titleHighlight, languageCode)}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            {localize(landingText.subtitle, languageCode)}
          </p>

          {/* Native 6-Language Switcher Toolbar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 pb-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  languageCode === lang.code
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/sprints"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-amber-600 rounded-2xl shadow-lg hover:bg-amber-700 transition-all gap-2 group"
            >
              {localize(landingText.ctaPrimary, languageCode)}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/blog"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-gray-700 bg-white border border-gray-300 rounded-2xl shadow-sm hover:bg-gray-50 transition-all"
            >
              {localize(landingText.ctaSecondary, languageCode)}
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{localize(landingText.trust1, languageCode)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <Award className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{localize(landingText.trust2, languageCode)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{localize(landingText.trust3, languageCode)}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
