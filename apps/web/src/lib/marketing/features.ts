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
 *   - Admission Probability Meter: packages/engine/src/scoring.ts + cutoff-data.ts
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
    title: "Admission Probability Meter",
    description:
      "Scores are checked against historical cutoffs by exam, state, locality, and reservation category, so a percentile turns into a real read on selection chances.",
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
