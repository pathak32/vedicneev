"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@vedicneev/ui";
import { ArrowLeft } from "lucide-react";

import { useT } from "@/lib/i18n/useT";

export interface FeatureExplainerExample {
  scenario: string;
  outcome: string;
}

export interface FeatureExplainerContent {
  title: string;
  intro: string;
  examples: FeatureExplainerExample[];
}

// Concrete worked examples, not restated marketing copy — the point of
// this modal is to show exactly how the feature behaves on a real input.
// English-only for now; the rest of this page's chrome (trigger button,
// "Back to features") already runs through useT() and stays localized.
export const FEATURE_EXPLAINERS: Record<"mistakeDiagnostics" | "mistakeVault", FeatureExplainerContent> = {
  mistakeDiagnostics: {
    title: "How Smart Mistake Diagnostics works",
    intro:
      "Every wrong answer is compared against the baseline time for that question type, not just marked right or wrong.",
    examples: [
      {
        scenario:
          "A student answers a Speed Calculation question in 8 seconds (baseline: ~35 seconds) — and gets it wrong.",
        outcome:
          "Classified as a careless slip, not a concept gap. Fast-and-wrong signals rushing, so the Mistake Vault tags it \"Review pace,\" not \"Review concept.\"",
      },
      {
        scenario: "A student answers a Nikhilam multiplication question in 90 seconds (well over baseline) — and gets it wrong.",
        outcome:
          "Classified as a real concept gap. Slow-and-wrong means the technique itself wasn't understood, so it's tagged \"Review concept\" with the matching speed-hack video linked directly.",
      },
    ],
  },
  mistakeVault: {
    title: "Inside the Mistake Vault",
    intro: "Every wrong answer across every mock test lands here once — never duplicated, never lost.",
    examples: [
      {
        scenario: "A mock test is submitted with 6 wrong answers across 3 subjects.",
        outcome: "All 6 are logged automatically, tagged by subject and section — no manual entry.",
      },
      {
        scenario: "Ten mock tests later, a student wants to review every Arithmetic mistake they've ever made.",
        outcome:
          "One filtered view shows all of them in one list — not scattered across 10 separate result pages — each with its original question, explanation, and a linked speed-hack video where one applies.",
      },
    ],
  },
};

interface FeatureExplainerModalProps {
  explainerKey: keyof typeof FEATURE_EXPLAINERS | null;
  onOpenChange: (open: boolean) => void;
}

export function FeatureExplainerModal({ explainerKey, onOpenChange }: FeatureExplainerModalProps) {
  const t = useT();
  const content = explainerKey ? FEATURE_EXPLAINERS[explainerKey] : null;

  return (
    <Dialog open={content !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {content ? (
          <>
            <DialogHeader>
              <DialogTitle>{content.title}</DialogTitle>
              <DialogDescription>{content.intro}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              {content.examples.map((example, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                  <p className="font-medium text-foreground">{example.scenario}</p>
                  <p className="mt-2 text-muted-foreground">{example.outcome}</p>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-fit">
              <ArrowLeft className="h-4 w-4" />
              {t("backToFeaturesLabel")}
            </Button>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
