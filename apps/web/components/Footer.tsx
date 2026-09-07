import Link from 'next/link';
import { ShieldCheck, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                Vedic<span className="text-amber-500">Neev</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              India's premier digital foundation platform for government boarding school entrance examinations, delivering elite mock runners, real-percentile analytics, and weekly national scholarship sprints.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure, Transparent, & Standardized Testing</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/sprints" className="hover:text-amber-400 transition-colors">Sunday Sprints</Link></li>
              <li><Link href="/store" className="hover:text-amber-400 transition-colors">Mock Storefront</Link></li>
              <li><Link href="/practice" className="hover:text-amber-400 transition-colors">Practice Engine</Link></li>
              <li><Link href="/blog" className="hover:text-amber-400 transition-colors">Exam Strategy Blog</Link></li>
            </ul>
          </div>

          {/* Exam Boards */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Exam Boards</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/sprints" className="hover:text-amber-400 transition-colors">JNVST (Classes 6 & 9)</Link></li>
              <li><Link href="/sprints" className="hover:text-amber-400 transition-colors">AISSEE (Sainik Schools)</Link></li>
              <li><Link href="/sprints" className="hover:text-amber-400 transition-colors">RMS (Military Schools)</Link></li>
              <li><Link href="/dashboard/library" className="hover:text-amber-400 transition-colors">PYQ Archives</Link></li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Compliance & Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Refund & Pricing Policy</Link></li>
              <li><Link href="/admin/login" className="hover:text-amber-400 transition-colors text-gray-500">Admin Portal</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} VedicNeev EdTech Private Limited. All rights reserved[cite: 1].</p>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Built with precision for India's future leaders</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
