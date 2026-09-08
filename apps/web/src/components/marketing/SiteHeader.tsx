'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@vedicneev/ui';
import { LandingLanguageSelector } from './LandingLanguageSelector';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-black text-lg shadow-md">
            VN
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-gray-900 leading-none">
              VedicNeev
            </span>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">
              Foundation
            </span>
          </div>
        </Link>

        {/* Right: Navigation, Language Switcher, and Auth CTAs */}
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-600">
            <Link href="/sprints" className="hover:text-amber-600 transition-colors">Scholarship Sprints</Link>
            <Link href="/store" className="hover:text-amber-600 transition-colors">Store</Link>
            <Link href="/learn" className="hover:text-amber-600 transition-colors">Vedic Math</Link>
          </nav>

          <LandingLanguageSelector />

          <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-sm px-4">
            <Link href="/exam/jnvst-live-mock">Start Free Mock</Link>
          </Button>
        </div>

      </div>
    </header>
  );
}
