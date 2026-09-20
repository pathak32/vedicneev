import Link from "next/link";
import { Check } from "lucide-react";

import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@vedicneev/ui";

const TIERS = [
  {
    name: "Pay-Per-Scan Credit Bundles",
    tagline: "For a single branch or a seasonal batch",
    highlight: false,
    badge: "Flexible",
    features: [
      "Buy credits in bundles of 500, 1,000, or 2,000 scans",
      "Credits never expire — use them across test cycles",
      "Full analytics, Mistake Vault, and WhatsApp scorecards included",
      "Add branches anytime, pay only for scans used",
    ],
    cta: "Get a Bundle Quote",
  },
  {
    name: "Unlimited Annual Institutional License",
    tagline: "For multi-branch academies running exams year-round",
    highlight: true,
    badge: "Best for scale",
    features: [
      "Unlimited scans across every branch, all year",
      "Priority support through peak exam season",
      "Dedicated onboarding for multi-branch rollout",
      "Custom answer-key templates for your exam boards",
    ],
    cta: "Talk to Sales",
  },
];

export function PricingTiers() {
  return (
    <section id="pricing" className="bg-brand-navy py-20 text-white">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pricing that scales with your academy
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Start with credits for one branch, or move to an unlimited license once you&apos;re
            running batches across every campus.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={
                tier.highlight
                  ? "border-brand-indigo bg-white text-slate-900 shadow-xl ring-2 ring-brand-indigo"
                  : "border-white/15 bg-white/[0.04] text-white"
              }
            >
              <CardHeader>
                <Badge
                  className={
                    tier.highlight
                      ? "w-fit bg-brand-indigo text-white"
                      : "w-fit bg-white/10 text-white"
                  }
                >
                  {tier.badge}
                </Badge>
                <CardTitle className={tier.highlight ? "mt-2 text-slate-900" : "mt-2 text-white"}>
                  {tier.name}
                </CardTitle>
                <p className={tier.highlight ? "text-sm text-slate-500" : "text-sm text-white/60"}>
                  {tier.tagline}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          tier.highlight ? "text-brand-indigo" : "text-emerald-300"
                        }`}
                        aria-hidden="true"
                      />
                      <span className={tier.highlight ? "text-slate-600" : "text-white/70"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className={
                    tier.highlight
                      ? "w-full bg-brand-indigo text-white hover:bg-brand-indigo/90"
                      : "w-full bg-white text-brand-navy hover:bg-white/90"
                  }
                >
                  <Link href="mailto:hello@vedicneev.com?subject=OMR%20pricing%20enquiry">
                    {tier.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
