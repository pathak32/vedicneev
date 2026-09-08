'use client';

import React from 'react';
import { Globe } from 'lucide-react';

export function LandingLanguageSelector() {
  return (
    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 text-xs font-bold text-gray-700">
      <Globe className="w-3.5 h-3.5 text-amber-600" />
      <span>ગુજરાતી / English</span>
    </div>
  );
}
