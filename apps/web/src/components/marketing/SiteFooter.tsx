'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, BookOpen, Mail, Phone, MapPin } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white font-black shadow-md shadow-amber-600/30">
                VN
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                VedicNeev
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
              Elite institutional preparation for Jawahar Navodaya Vidyalaya (JNVST), All India Sainik School (AISSEE), and Rashtriya Military Schools (RMS) with multi-lingual support and Vedic mathematics acceleration.
            </p>
            <div className="flex items-center gap-3 text-xs text-amber-400 font-semibold pt-2">
              <ShieldCheck className="w-4 h-4" /> 100% NTA & Sainik School Blueprint Compliant
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Exam Boards</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link href="/exam/jnvst-live-mock" className="hover:text-amber-400 transition-colors">JNVST Class 6 & 9</Link></li>
              <li><Link href="/sprints" className="hover:text-amber-400 transition-colors">AISSEE Sainik School</Link></li>
              <li><Link href="/sprints" className="hover:text-amber-400 transition-colors">RMS Military Schools</Link></li>
              <li><Link href="/practice" className="hover:text-amber-400 transition-colors">Free Practice Engine</Link></li>
            </ul>
          </div>

          {/* Resources & Learn */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link href="/learn" className="hover:text-amber-400 transition-colors">Vedic Maths Shortcuts</Link></li>
              <li><Link href="/blog" className="hover:text-amber-400 transition-colors">Exam Strategy Blog</Link></li>
              <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Institutional Pricing</Link></li>
              <li><Link href="/faq" className="hover:text-amber-400 transition-colors">Parent FAQ</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Compliance & Legal</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
              <li className="flex items-center gap-2 text-gray-400 pt-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /> New Delhi & Lucknow, India
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} VedicNeev EdTech Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-400">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-400">Terms</Link>
            <Link href="/faq" className="hover:text-gray-400">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
