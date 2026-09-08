'use client';
import React from 'react';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { Button } from '@vedicneev/ui';
import { Trophy, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SprintsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <SiteHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> National Competitive Sprints
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Scholarship Sprints & Live Tracks</h1>
          <p className="text-gray-600 font-medium">Intensive timed modules engineered for JNVST, AISSEE, and RMS aspirants.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {['JNVST Class 6 Elite Sprint', 'AISSEE Sainik School Sprint', 'RMS Military Foundation Sprint'].map((title, idx) => (
            <div key={idx} className="border border-gray-200 rounded-2xl p-6 bg-gray-50 flex flex-col justify-between shadow-sm hover:border-amber-500 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-600">Complete 80-question pattern evaluation with Vedic math shortcut integration.</p>
              </div>
              <Button asChild className="mt-6 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl">
                <Link href="/exam/jnvst-live-mock">Launch Sprint <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
