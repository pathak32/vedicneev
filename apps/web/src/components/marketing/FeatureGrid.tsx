import { Card, CardContent } from "@vedicneev/ui";

import { Reveal } from "@/components/marketing/Reveal";
import { FEATURES } from "@/lib/marketing/features";

export function FeatureGrid() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-16 md:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          A practice engine that diagnoses, not just scores
        </h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Every mock test feeds the same set of engines behind the results, the Mistake Vault, and the
          Parent Command Center — here&apos;s what&apos;s actually running under the hood.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Reveal key={feature.title} delayMs={index * 80}>
              <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
