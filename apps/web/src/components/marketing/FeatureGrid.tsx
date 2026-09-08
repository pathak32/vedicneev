import { Card, CardContent } from "@vedicneev/ui";

import { Reveal } from "@/components/marketing/Reveal";
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

export function FeatureGrid() {
  const t = useT();

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
          return (
            <Reveal key={feature.title} delayMs={index * 80}>
              <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{t(titleKey)}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(descKey)}</p>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
