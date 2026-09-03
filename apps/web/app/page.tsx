"use client";

import Link from "next/link";
import { Award, ClipboardList, Printer, ScanLine, Sparkles } from "lucide-react";

import { formatDuration } from "@vedicneev/engine";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vedicneev/ui";

import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { FinalCta } from "@/components/marketing/FinalCta";
import { PricingTeaser } from "@/components/marketing/PricingTeaser";
import { Reveal } from "@/components/marketing/Reveal";
import { TestimonialCarousel } from "@/components/marketing/TestimonialCarousel";
import { TrustBadges } from "@/components/marketing/TrustBadges";
import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectStudentTestHistory, useAuthStore } from "@/lib/auth/useAuthStore";

export default function HomePage() {
  const sampleTimeLimit = formatDuration(45 * 60);
  const { hasHydrated, activeStudent } = useActiveStudent();
  const history = useAuthStore((s) =>
    activeStudent ? selectStudentTestHistory(s, activeStudent.id) : []
  );

  return (
    <main className="flex flex-col">
      <section className="flex flex-col items-center gap-8 px-4 pb-20 pt-16 text-center md:px-8 md:pt-24">
        <Reveal className="flex max-w-2xl flex-col items-center gap-4">
          <Badge variant="outline" className="gap-1.5 text-xs font-medium">
            <Sparkles className="h-3 w-3 text-primary" />
            K-8 entrance exam prep
          </Badge>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
            Prep that diagnoses mistakes, not just scores tests
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Full-length JNVST, AISSEE, and RMS mock tests with instant speed-vs-accuracy diagnostics and a
            Mistake Vault that turns every wrong answer into a lesson.
          </p>
        </Reveal>

        <Reveal delayMs={120} className="w-full max-w-md">
          <Card className="w-full text-left shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Vedic Neev
              </CardTitle>
              <CardDescription>
                {hasHydrated && activeStudent
                  ? `Ready for ${activeStudent.fullName} · ${activeStudent.targetExam}, Class ${activeStudent.targetClass}`
                  : `Practice engine ready — sample section time limit: ${sampleTimeLimit}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild size="lg">
                <Link href="/exam/demo-jnvst">Start a mock test</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/exam/demo-jnvst/omr/print">
                  <Printer className="h-4 w-4" />
                  Print OMR sheet
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/exam/demo-jnvst/omr/scan">
                  <ScanLine className="h-4 w-4" />
                  Scan a filled OMR sheet
                </Link>
              </Button>
            </CardContent>
          </Card>
        </Reveal>

        {hasHydrated && activeStudent ? (
          <Reveal delayMs={200} className="w-full max-w-md">
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

        <Reveal delayMs={280}>
          <TrustBadges />
        </Reveal>
      </section>

      <div className="divide-y divide-border">
        <FeatureGrid />
        <TestimonialCarousel />
        <PricingTeaser />
      </div>

      <FinalCta />
    </main>
  );
}
