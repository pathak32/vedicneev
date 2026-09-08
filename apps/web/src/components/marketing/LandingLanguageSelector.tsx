'use client';

import React, { useState } from 'react';
import { Globe } from 'lucide-react';

export function LandingLanguageSelector() {
  const [lang, setLang] = useState<'gu' | 'en'>('gu');

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'gu' ? 'en' : 'gu'));
  };

  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 hover:bg-amber-50 hover:border-amber-300 text-xs font-bold text-gray-700 transition-all cursor-pointer"
      title="Click to toggle language / ભાષા બદલો"
    >
      <Globe className="w-3.5 h-3.5 text-amber-600" />
      <span>{lang === 'gu' ? 'ગુજરાતી / English' : 'English / ગુજરાતી'}</span>
    </button>
  );
}
