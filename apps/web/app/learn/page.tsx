import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Zap } from "lucide-react";

import { Button } from "@vedicneev/ui";

export const metadata: Metadata = {
  title: "Vedic Math Speed-Computing Engine",
  description:
    "Vedic Neev's speed-math and aptitude acceleration is powered by Vedic Mind AI — try the live demo.",
};

const VEDIC_MIND_AI_URL = "https://www.vedicmindai.in/demo";

/**
 * Vedic Math instruction isn't reimplemented here — Vedic Neev is a child
 * app of Vedic Mind AI (see CLAUDE.md) and hands this off to that product's
 * own speed-math engine rather than maintaining a second, static copy of
 * the same sutras.
 */
export default function LearnPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
        <Sparkles className="h-3.5 w-3.5" /> Powered by Vedic Mind AI
      </span>

      <h1 className="text-4xl font-black tracking-tight text-foreground">
        Vedic Math Speed-Computing Engine
      </h1>

      <p className="max-w-xl text-muted-foreground">
        Vedic Neev&apos;s calculation-speed acceleration — the Nikhilam and Urdhva Tiryagbhyam sutras, and every other
        shortcut used across our mock tests — runs on Vedic Mind AI, our dedicated speed-math and aptitude engine.
        Try it live instead of a static lesson page.
      </p>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted/40 p-8">
        <Zap className="h-8 w-8 text-primary" />
        <p className="max-w-sm text-sm text-muted-foreground">
          Interactive drills, adaptive difficulty, and instant feedback on every sutra — built and maintained on
          Vedic Mind AI, not duplicated here.
        </p>
        <Button asChild size="lg">
          <a href={VEDIC_MIND_AI_URL} target="_blank" rel="noopener noreferrer">
            Try the Vedic Mind AI demo
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <Link href="/exam/demo-jnvst" className="text-sm font-medium text-primary hover:underline">
        Or jump straight into a full mock test →
      </Link>
    </main>
  );
}
