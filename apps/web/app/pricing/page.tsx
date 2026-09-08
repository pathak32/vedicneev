'use client';
import React from 'react';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { Check } from 'lucide-react';
import { Button } from '@vedicneev/ui';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <SiteHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full space-y-8 text-center">
        <h1 className="text-4xl font-black text-gray-900">Institutional & Parent Pricing Plans</h1>
        <p className="text-gray-600 max-w-xl mx-auto">Select the precise foundation tier to unlock unlimited mock simulations.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-6 text-left">
          <div className="border rounded-3xl p-8 bg-gray-50 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Foundation Explorer</h3>
              <p className="text-3xl font-black text-amber-600">Free</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600" /> 2 Free JNVST Mock Simulations</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600" /> Basic Vedic Math Videos</li>
              </ul>
            </div>
            <Button className="mt-8 bg-gray-900 text-white font-bold rounded-xl w-full">Current Plan</Button>
          </div>
          <div className="border-2 border-amber-600 rounded-3xl p-8 bg-white shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">Most Popular</div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Elite Scholarship Pass</h3>
              <p className="text-3xl font-black text-amber-600">₹2,499 <span className="text-xs text-gray-500 font-normal">/ year</span></p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600" /> Unlimited JNVST, AISSEE & RMS Mocks</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600" /> All National Scholarship Sprints</li>
              </ul>
            </div>
            <Button className="mt-8 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl w-full">Upgrade Now</Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
