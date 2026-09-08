import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ExamTracksHub } from '@/components/marketing/ExamTracksHub';
import { FeatureGrid } from '@/components/marketing/FeatureGrid';
import { Testimonials } from '@/components/marketing/Testimonials';
import { PricingTeaser } from '@/components/marketing/PricingTeaser';
import { FinalCTA } from '@/components/marketing/FinalCTA';
import { SpeedChallengeWidget } from '@/components/marketing/SpeedChallengeWidget';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col selection:bg-amber-500 selection:text-black">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 border-b border-gray-800/60">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/20">
            ★ Institutional-Grade Entrance Preparation
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Master Government Boarding School Entrances
          </h1>
          
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            India's premier gamified entrance program featuring <span className="text-amber-400 font-bold">Vedic Math sutras</span>, smart diagnostic tracking, and real OMR-aligned exam simulations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/exam/jnvst-live-mock"
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all text-base"
            >
              Start Free Mock Test
            </Link>
            <Link
              href="/exam-strategy"
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold px-8 py-4 rounded-2xl border border-gray-700 transition-all text-base"
            >
              Read Exam Strategy
            </Link>
          </div>

          {/* Speed Challenge Widget Embedded in Hero */}
          <div className="pt-8">
            <SpeedChallengeWidget />
          </div>

        </div>
      </section>

      {/* Exam Tracks Hub */}
      <ExamTracksHub />

      {/* Feature Grid */}
      <FeatureGrid />

      {/* Testimonials */}
      <Testimonials />

      {/* Pricing Teaser */}
      <PricingTeaser />

      {/* Final CTA */}
      <FinalCTA />

      <SiteFooter />
    </div>
  );
}
