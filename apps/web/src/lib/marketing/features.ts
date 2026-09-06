import type { LucideIcon } from "lucide-react";
import { Brain, Gauge, Languages, ScanLine, TrendingUp, Vault } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Each entry describes a real, shipped capability (packages/engine) — not
 * aspirational copy. Keep this in sync with what the product actually does:
 *   - Speed/accuracy classification: packages/engine/src/diagnostics.ts
 *   - Vedic speed-math shortcuts: apps/web/src/lib/exam/mock-data.ts (speedHacks)
 *   - Peer percentile: packages/engine/src/scoring.ts's calculateRealPercentile,
 *     computed server-side from real prior TestSession attempts — see POST
 *     /api/exam/submit/route.ts. The admission-probability comparison
 *     alongside it still runs on cutoff-data.ts's explicitly-labeled sample
 *     data, not verified official cutoffs — don't claim otherwise here
 *     until that's replaced with a sourced dataset.
 *   - OMR scan/grade: apps/web/src/lib/exam/omr-bridge.ts + components/omr
 */
export const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: "Smart Mistake Diagnostics",
    description:
      "Every wrong answer is automatically classified as a careless slip or a real concept gap by comparing time spent against the question's baseline — not just marked right or wrong.",
  },
  {
    icon: Vault,
    title: "The Mistake Vault",
    description:
      "Every mistake is logged once, tagged, and tracked until reviewed — filterable by subject, with the explanation and a linked speed-hack video right where the wrong answer was made.",
  },
  {
    icon: Gauge,
    title: "Vedic Speed-Math Shortcuts",
    description:
      "Real Vedic Maths techniques — the ×11 sandwich rule, squaring numbers ending in 5, Nikhilam multiplication near a base — surfaced exactly on the questions where they apply.",
  },
  {
    icon: TrendingUp,
    title: "Real Peer Percentile",
    description:
      "See exactly where a score ranks against other VedicNeev students who've taken the same mock — not a generic estimate, a live percentile computed from real attempts.",
  },
  {
    icon: ScanLine,
    title: "Print-and-Scan OMR Grading",
    description:
      "Print a real OMR sheet for offline practice, then scan the filled sheet with a phone camera for instant, automatic grading — no manual entry.",
  },
  {
    icon: Languages,
    title: "Bilingual, Section by Section",
    description:
      "Every question, explanation, and diagnostic renders in English or Hindi, switchable mid-test, matching how JNVST and AISSEE are actually set.",
  },
];
