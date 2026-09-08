'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@vedicneev/ui';
import { Sparkles, ArrowRight } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="w-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" /> India&apos;s Premier Digital Foundation (Neev)
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
          सरकारों निवासां शाळा प्रवेश परीक्षांची संपूर्ण तयारी
        </h1>
        
        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-medium">
          Indian premier-governed entrance engine. Master Vedic math shortcut speed-accurately, and master JNVST, AISSEE & RMS entrance exams.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-lg px-8">
            <Link href="/exam/jnvst-live-mock">Start Free Mock Test <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-gray-700 text-white hover:bg-gray-800 font-extrabold rounded-xl px-8">
            <Link href="/sprints">National Scholarship Sprints</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
