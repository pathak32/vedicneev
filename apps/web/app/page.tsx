"use client";

import Link from "next/link";
import { Award, ClipboardList, Headphones, ArrowRight } from "lucide-react";

import { Badge, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import { ExamTracksHub } from "@/components/marketing/ExamTracksHub";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { FinalCta } from "@/components/marketing/FinalCta";
import { HeroSection } from "@/components/marketing/HeroSection";
import { PricingTeaser } from "@/components/marketing/PricingTeaser";
import { Reveal } from "@/components/marketing/Reveal";
import { TestimonialCarousel } from "@/components/marketing/TestimonialCarousel";
import { TrustBadges } from "@/components/marketing/TrustBadges";
import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectStudentTestHistory, useAuthStore } from "@/lib/auth/useAuthStore";

export default function HomePage() {
  const { hasHydrated, activeStudent } = useActiveStudent();
  const history = useAuthStore((s) =>
    activeStudent ? selectStudentTestHistory(s, activeStudent.id) : []
  );

  return (
    <main className="flex flex-col">
      <HeroSection />

      <section className="flex flex-col items-center gap-8 px-4 pb-20 pt-12 text-center md:px-8">
        {/* Compact podcast trigger — the full player lives on its own hub
            page (/podcasts) instead of embedding audio into the homepage's
            main content flow. */}
        <Reveal delayMs={60} className="w-full max-w-md">
          <Link
            href="/podcasts"
            className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-left transition-colors hover:bg-accent"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Headphones className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-foreground">Listen: The Great Debate</span>
              <span className="block text-xs text-muted-foreground">Mock Tests vs. Mistake Analysis — Podcast Hub</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </Reveal>

        {hasHydrated && activeStudent ? (
          <Reveal delayMs={120} className="w-full max-w-md">
            <Card className="w-full text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  {activeStudent.fullName}&apos;s Test History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No attempts yet — take the mock test above.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {[...history]
                      .sort((a, b) => b.submittedAt - a.submittedAt)
                      .map((entry) => (
                        <li
                          key={entry.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                        >
                          <div>
                            <p className="font-medium text-foreground">{entry.examName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {entry.totalMarks}/{entry.maxMarks}
                          </Badge>
                        </li>
                      ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </Reveal>
        ) : null}

        <Reveal delayMs={200}>
          <TrustBadges />
        </Reveal>
      </section>

      <ExamTracksHub />

      <div className="divide-y divide-border">
        <FeatureGrid />
        <TestimonialCarousel />
        <PricingTeaser />
      </div>

      <FinalCta />
    </main>
  );
}
