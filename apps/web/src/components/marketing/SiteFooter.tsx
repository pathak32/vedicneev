'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin } from 'lucide-react';

import { useT } from '@/lib/i18n/useT';

export function SiteFooter() {
  const t = useT();

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
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">{t("footerMission")}</p>
            <div className="flex items-center gap-3 text-xs text-amber-400 font-semibold pt-2">
              <ShieldCheck className="w-4 h-4" /> {t("footerCompliance")}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">{t("footerExamBoards")}</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link href="/exam/jnvst-live-mock" className="hover:text-amber-400 transition-colors">JNVST Class 6 & 9</Link></li>
              <li><Link href="/sprints" className="hover:text-amber-400 transition-colors">AISSEE Sainik School</Link></li>
              <li><Link href="/sprints" className="hover:text-amber-400 transition-colors">RMS Military Schools</Link></li>
              <li><Link href="/practice" className="hover:text-amber-400 transition-colors">{t("navFreePractice")}</Link></li>
            </ul>
          </div>

          {/* Resources & Learn */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">{t("footerResources")}</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link href="/learn" className="hover:text-amber-400 transition-colors">{t("footerVedicMaths")}</Link></li>
              <li><Link href="/blog" className="hover:text-amber-400 transition-colors">{t("footerBlog")}</Link></li>
              <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">{t("footerInstitutionalPricing")}</Link></li>
              <li><Link href="/faq" className="hover:text-amber-400 transition-colors">{t("footerFaq")}</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">{t("footerLegal")}</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">{t("footerPrivacy")}</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">{t("footerTerms")}</Link></li>
              <li className="flex items-center gap-2 text-gray-400 pt-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /> {t("footerLocation")}
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar — copyright only. Privacy/Terms/Support already live
            in the Legal & Compliance column above; repeating them here read
            as duplicate footer text. */}
        <div className="pt-8 text-center text-xs text-gray-500 sm:text-left">
          <p>© {new Date().getFullYear()} VedicNeev EdTech Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
