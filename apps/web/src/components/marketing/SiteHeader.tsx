'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';

export function SiteHeader() {
  const [lang, setLang] = useState<'gu' | 'en'>('gu');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
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

        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-600">
            <Link href="/sprints" className="hover:text-amber-600 transition-colors">Scholarship Sprints</Link>
            <Link href="/store" className="hover:text-amber-600 transition-colors">Store</Link>
            <Link href="/learn" className="hover:text-amber-600 transition-colors">Vedic Math</Link>
            <Link href="/pricing" className="hover:text-amber-600 transition-colors">Pricing</Link>
          </nav>

          <button 
            onClick={() => setLang(prev => prev === 'gu' ? 'en' : 'gu')}
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 hover:bg-amber-50 hover:border-amber-300 text-xs font-bold text-gray-700 transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'gu' ? 'ગુજરાતી / English' : 'English / ગુજરાતી'}</span>
          </button>

          <Link href="/exam/jnvst-live-mock" className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm rounded-xl shadow-sm px-4 py-2.5 transition-all">
            Start Free Mock
          </Link>
        </div>

      </div>
    </header>
  );
}
