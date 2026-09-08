'use client';
import React from 'react';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { BookOpen, Zap } from 'lucide-react';

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <SiteHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full space-y-6 text-center">
        <h1 className="text-4xl font-black text-gray-900">Vedic Math Speed-Computing Engine</h1>
        <p className="text-gray-600 max-w-xl mx-auto">Master ancient mathematical sutras designed to multiply calculation speed for competitive board exams.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto pt-6 text-left">
          <div className="p-6 border rounded-2xl bg-amber-50/50 border-amber-200">
            <Zap className="w-6 h-6 text-amber-600 mb-2" />
            <h3 className="font-bold text-gray-900">Nikhilam Multiplication Sutra</h3>
            <p className="text-xs text-gray-600 mt-1">Multiply numbers close to bases instantly without traditional carry-overs.</p>
          </div>
          <div className="p-6 border rounded-2xl bg-amber-50/50 border-amber-200">
            <BookOpen className="w-6 h-6 text-amber-600 mb-2" />
            <h3 className="font-bold text-gray-900">Urdhva Tiryagbhyam</h3>
            <p className="text-xs text-gray-600 mt-1">Vertically and crosswise general formula for multi-digit multiplication.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
