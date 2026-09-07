import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LEFT: Brand Logo & Floating Exam Full-Form Badges */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Vedic<span className="text-amber-600">Neev</span>
            </span>
          </Link>

          {/* Floating Exam Full-Form Badges (Desktop) */}
          <nav className="hidden xl:flex items-center gap-2 text-xs font-medium text-gray-600">
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-sm" title="Jawahar Navodaya Vidyalaya Selection Test">
              JNVST (Class 6 & 9)
            </span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 shadow-sm" title="All India Sainik School Entrance Examination">
              AISSEE (Sainik)
            </span>
            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 shadow-sm" title="Rashtriya Military School">
              RMS (Military)
            </span>
          </nav>
        </div>

        {/* CENTER: Core Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
          <Link href="/store" className="hover:text-amber-600 transition-colors">Store</Link>
          <Link href="/sprints" className="hover:text-amber-600 transition-colors">Sunday Sprints</Link>
          <Link href="/blog" className="hover:text-amber-600 transition-colors">Blog</Link>
        </div>

        {/* FAR RIGHT: Language Selector & Primary CTA */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center gap-1.5 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <Globe className="w-4 h-4 text-gray-500" />
            <select className="bg-transparent border-none focus:outline-none cursor-pointer text-xs font-medium">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
              <option value="bn">বাংলা</option>
              <option value="ta">தமிழ்</option>
              <option value="gu">ગુજરાતી</option>
            </select>
          </div>

          <Link
            href="/sprints"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-xl shadow-sm hover:bg-amber-700 transition-all"
          >
            Free Mock Test
          </Link>
        </div>

      </div>
    </header>
  );
}
