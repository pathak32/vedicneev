'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Globe, BookOpen, Award, ShieldAlert, ChevronDown } from 'lucide-react';
import { useLanguageStore, SUPPORTED_LANGUAGES } from '@/lib/hooks/useLanguageStore';

export default function Navbar() {
  const { languageCode, setLanguage } = useLanguageStore();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* LEFT SIDE: Nav Links, Core Pages, and Language Switcher */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-5 text-sm font-bold text-gray-700">
            <Link href="/learn" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" /> Learn
            </Link>
            <Link href="/blog" className="hover:text-amber-600 transition-colors">
              Blog
            </Link>
            <Link href="/pricing" className="hover:text-amber-600 transition-colors">
              Pricing
            </Link>
          </nav>

          {/* Compact Language Selector Dropdown / Toggle in Left Header */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-gray-800 hover:bg-amber-50 hover:border-amber-300 transition-all">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span className="uppercase">{languageCode}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>
            <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-2 hidden group-hover:block z-50">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                    languageCode === lang.code
                      ? 'bg-amber-50 text-amber-900 font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER / FLOATING EXAM PILLS (JNVST, AISSEE, RMS Full Forms) */}
        <div className="hidden xl:flex items-center gap-2 bg-amber-50/70 border border-amber-200/60 px-4 py-1.5 rounded-full">
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-900">
            <Award className="w-3.5 h-3.5 text-amber-600" /> Active Boards:
          </span>
          <span className="text-[11px] font-bold text-gray-700 bg-white px-2 py-0.5 rounded-md shadow-2xs border border-amber-100" title="Jawahar Navodaya Vidyalaya Selection Test">
            JNVST (Navodaya)
          </span>
          <span className="text-[11px] font-bold text-gray-700 bg-white px-2 py-0.5 rounded-md shadow-2xs border border-amber-100" title="All India Sainik School Entrance Examination">
            AISSEE (Sainik)
          </span>
          <span className="text-[11px] font-bold text-gray-700 bg-white px-2 py-0.5 rounded-md shadow-2xs border border-amber-100" title="Rashtriya Military Schools">
            RMS (Military)
          </span>
        </div>

        {/* RIGHT SIDE: Logo and Brand Name (VedicNeev), plus Quick CTAs */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/sprints" className="text-xs font-bold text-gray-700 hover:text-amber-600 transition-colors">
              Mock Exam Series
            </Link>
            <Link href="/practice" className="text-xs font-bold text-gray-700 hover:text-amber-600 transition-colors">
              Free Practice
            </Link>
            <Link href="/scholarship" className="text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 hover:bg-amber-100 transition-all flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Weekly Scholarship
            </Link>
          </div>

          {/* Logo & Brand Name on the Far Right */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="text-right">
              <span className="block text-base font-black tracking-tight text-gray-900 group-hover:text-amber-600 transition-colors">
                VedicNeev
              </span>
              <span className="block text-[10px] font-bold tracking-wider text-amber-600 uppercase">
                Boarding School Prep
              </span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-600 flex items-center justify-center text-white font-black shadow-md shadow-amber-600/30 group-hover:scale-105 transition-transform">
              VN
            </div>
          </Link>
        </div>

      </div>
    </header>
  );
}
