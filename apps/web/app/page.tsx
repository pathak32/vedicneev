import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-gray-900">
                Vedic<span className="text-amber-600">Neev</span>
              </span>
            </Link>
            <nav className="hidden xl:flex items-center gap-2 text-xs font-medium text-gray-600">
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
                JNVST (Class 6 & 9)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 shadow-sm">
                AISSEE (Sainik)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 shadow-sm">
                RMS (Military)
              </span>
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <Link href="/store" className="hover:text-amber-600 transition-colors">Store</Link>
            <Link href="/sprints" className="hover:text-amber-600 transition-colors">Sunday Sprints</Link>
            <Link href="/blog" className="hover:text-amber-600 transition-colors">Blog</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sprints" className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-xl shadow-sm hover:bg-amber-700 transition-all">
              Free Mock Test
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/50 via-white to-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold uppercase border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              India’s Premier Government Boarding School Foundation
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight">
              Master Government Boarding School <span className="text-amber-600">Entrance Exams</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Comprehensive preparation for <strong className="text-gray-900">JNVST, AISSEE, and RMS</strong> (Classes 6 & 9) featuring real-percentile analytics and curated master papers[cite: 1].
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/sprints" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-amber-600 rounded-2xl shadow-lg hover:bg-amber-700 transition-all gap-2">
                Start Free Mock Test
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Exam Tracks Hub */}
        <section className="py-20 bg-gray-50/50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Choose Your Target Board & Class Tier
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "JNVST (Navodaya)", sub: "Class 6 & 9 Lateral", desc: "Complete preparation matching official blueprint ratios." },
                { title: "AISSEE (Sainik)", sub: "Class 6 & 9", desc: "Rigorous coverage across Mathematics, Intelligence, and Language." },
                { title: "RMS (Military)", sub: "Class 6 & 9", desc: "Advanced testing modules aligned with military school pattern." }
              ].map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-gray-100 text-gray-800">{t.sub}</span>
                    <h3 className="text-xl font-extrabold text-gray-900">{t.title}</h3>
                    <p className="text-sm text-gray-600">{t.desc}</p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <Link href="/sprints" className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl">
                      Explore Sprints & Mocks
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} VedicNeev EdTech Private Limited. All rights reserved[cite: 1].</p>
        </div>
      </footer>
    </div>
  );
}
