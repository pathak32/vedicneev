'use client';
import React from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { CheckCircle2, Clock, Award, ArrowLeft } from 'lucide-react';

export default function JnvstMockPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <SiteHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-6">
        <Link href="/" className="inline-flex items-center text-xs font-bold text-amber-600 hover:underline mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase">JNVST Class 6 Simulation</span>
            <h1 className="text-3xl font-black">Official NTA / Navodaya Blueprint</h1>
            <p className="text-amber-100 text-sm">80 Questions • 100 Marks • 120 Minutes Strict Timing</p>
          </div>
          <button className="bg-white text-amber-900 hover:bg-amber-50 font-extrabold rounded-xl px-8 py-3 shadow transition-all cursor-pointer">
            Start Live Test Now
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 border rounded-2xl bg-gray-50 flex items-center gap-4">
            <Clock className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Timed Engine</h4>
              <p className="text-xs text-gray-600">Auto-submits upon completion.</p>
            </div>
          </div>
          <div className="p-5 border rounded-2xl bg-gray-50 flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Instant Analytics</h4>
              <p className="text-xs text-gray-600">Detailed percentile breakdown.</p>
            </div>
          </div>
          <div className="p-5 border rounded-2xl bg-gray-50 flex items-center gap-4">
            <Award className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">All-India Rank</h4>
              <p className="text-xs text-gray-600">Compare with peers nationally.</p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
