"use client";

import { useState } from "react";
import { Card, CardContent } from "@vedicneev/ui";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";
import { FeatureExplainerModal, FEATURE_EXPLAINERS } from "@/components/marketing/FeatureExplainerModal";
import { FEATURES } from "@/lib/marketing/features";
import { useT } from "@/lib/i18n/useT";
import type { DictionaryKey } from "@/lib/i18n/dictionary";

// FEATURES is ordered to match these key pairs 1:1 — see features.ts.
const FEATURE_KEYS: [DictionaryKey, DictionaryKey][] = [
  ["feature1Title", "feature1Desc"],
  ["feature2Title", "feature2Desc"],
  ["feature3Title", "feature3Desc"],
  ["feature4Title", "feature4Desc"],
  ["feature5Title", "feature5Desc"],
  ["feature6Title", "feature6Desc"],
];

// Only the first two cards (Smart Mistake Diagnostics, The Mistake Vault)
// get an interactive worked-example explainer — the rest are straightforward
// enough not to need one. Keyed by FEATURES index.
const EXPLAINER_BY_INDEX: Record<number, keyof typeof FEATURE_EXPLAINERS> = {
  0: "mistakeDiagnostics",
  1: "mistakeVault",
};

export function FeatureGrid() {
  const t = useT();
  const [openExplainer, setOpenExplainer] = useState<keyof typeof FEATURE_EXPLAINERS | null>(null);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-16 md:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">{t("featureHeading")}</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">{t("featureSubheading")}</p>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          const [titleKey, descKey] = FEATURE_KEYS[index] ?? ["feature1Title", "feature1Desc"];
          const explainerKey = EXPLAINER_BY_INDEX[index];

          const cardBody = (
            <CardContent className="flex h-full flex-col gap-3 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{t(titleKey)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(descKey)}</p>
              {explainerKey ? (
                <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-primary">
                  {t("featureExplainerCta")}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              ) : null}
            </CardContent>
          );

          return (
            <Reveal key={feature.title} delayMs={index * 80}>
              {explainerKey ? (
                <button
                  type="button"
                  onClick={() => setOpenExplainer(explainerKey)}
                  className="block w-full text-left"
                >
                  <Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
                    {cardBody}
                  </Card>
                </button>
              ) : (
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
                  {cardBody}
                </Card>
              )}
            </Reveal>
          );
        })}
      </div>

      <FeatureExplainerModal explainerKey={openExplainer} onOpenChange={(open) => !open && setOpenExplainer(null)} />
    </section>
  );
}
