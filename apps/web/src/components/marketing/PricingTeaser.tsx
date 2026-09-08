import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, cn } from "@vedicneev/ui";
import { PLAN_CONFIG } from "@vedicneev/engine";
import type { SubscriptionPlanId } from "@vedicneev/engine";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";
import { useT } from "@/lib/i18n/useT";
import type { DictionaryKey } from "@/lib/i18n/dictionary";

const HIGHLIGHT_PLAN = "VEDIC_ALL_ACCESS";

// PLAN_CONFIG (packages/engine) stores plain English strings, shared by
// billing/entitlement logic — translating it there would mean threading
// LanguageCode through a package with no other i18n awareness. Mapping by
// plan id here instead keeps that shared package untouched.
const PLAN_NAME_KEY: Record<SubscriptionPlanId, DictionaryKey> = {
  FREE_EXPLORER: "planFreeExplorer",
  EXAM_PASS: "planExamPass",
  VEDIC_ALL_ACCESS: "planVedicAllAccess",
};

const PLAN_FEATURE_KEYS: Record<SubscriptionPlanId, DictionaryKey[]> = {
  FREE_EXPLORER: ["planFreeFeature1", "planFreeFeature2", "planFreeFeature3"],
  EXAM_PASS: ["planExamPassFeature1", "planExamPassFeature2", "planExamPassFeature3"],
  VEDIC_ALL_ACCESS: ["planAllAccessFeature1", "planAllAccessFeature2", "planAllAccessFeature3"],
};

export function PricingTeaser() {
  const t = useT();

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-16 md:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">{t("pricingTeaserHeading")}</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">{t("pricingTeaserSubheading")}</p>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Object.values(PLAN_CONFIG).map((plan, index) => {
          const isHighlight = plan.id === HIGHLIGHT_PLAN;
          return (
            <Reveal key={plan.id} delayMs={index * 80}>
              <Card
                className={cn(
                  "flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  isHighlight ? "border-2 border-primary" : "hover:border-primary/50"
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-1.5 text-base">
                    {isHighlight ? <Sparkles className="h-4 w-4 text-primary" /> : null}
                    {t(PLAN_NAME_KEY[plan.id])}
                  </CardTitle>
                  <p className="text-2xl font-bold text-foreground">
                    {plan.priceInr === 0 ? t("priceFree") : `₹${plan.priceInr.toLocaleString("en-IN")}`}
                    {plan.priceInr > 0 ? (
                      <span className="text-sm font-normal text-muted-foreground"> {t("pricePerYear")}</span>
                    ) : null}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <ul className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
                    {PLAN_FEATURE_KEYS[plan.id].map((featureKey) => (
                      <li key={featureKey} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        {t(featureKey)}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant={isHighlight ? "default" : "outline"} className="mt-auto">
                    <Link href="/pricing">
                      {plan.priceInr === 0 ? t("startFree") : t("viewPlan")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="text-center">
        <Button asChild variant="link">
          <Link href="/pricing">{t("comparePlans")}</Link>
        </Button>
      </Reveal>
    </section>
  );
}
