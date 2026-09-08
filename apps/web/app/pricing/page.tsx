"use client";

import { useState } from "react";
import type { EntitlementExamType, PaidPlanId } from "@vedicneev/engine";
import { ShieldCheck } from "lucide-react";

import { CheckoutFlow } from "@/components/pricing/CheckoutFlow";
import { PricingTable } from "@/components/pricing/PricingTable";
import { FinalCta } from "@/components/marketing/FinalCta";
import { Reveal } from "@/components/marketing/Reveal";
import { TestimonialCarousel } from "@/components/marketing/TestimonialCarousel";
import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectActiveParent, useAuthStore } from "@/lib/auth/useAuthStore";
import { selectParentSubscription, useSubscriptionStore } from "@/lib/payments/useSubscriptionStore";

const TRUST_SIGNALS = ["No credit card for the free tier", "Cancel anytime", "Covers every child on your account"];

export default function PricingPage() {
  const parent = useAuthStore(selectActiveParent);
  const { activeStudent } = useActiveStudent();
  const subscription = useSubscriptionStore((s) => selectParentSubscription(s, parent?.id ?? null));
  const [checkout, setCheckout] = useState<{ planId: PaidPlanId; targetExam: EntitlementExamType | null } | null>(
    null
  );

  return (
    <div className="flex flex-col">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 py-12 md:p-8">
        <Reveal className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Plans for every stage of prep
          </h1>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Start free, then unlock a single exam or every exam across all your children&apos;s profiles.
          </p>
        </Reveal>

        <Reveal delayMs={100} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {TRUST_SIGNALS.map((signal) => (
            <span key={signal} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              {signal}
            </span>
          ))}
        </Reveal>

        <Reveal delayMs={150}>
          <PricingTable
            currentPlan={subscription?.plan ?? "FREE_EXPLORER"}
            defaultExam={activeStudent?.targetExam}
            onSelectPlan={(planId, targetExam) => {
              if (!parent) return;
              setCheckout({ planId, targetExam });
            }}
          />
        </Reveal>

        {!parent ? (
          <p className="text-center text-sm text-muted-foreground">Sign in from the header to purchase a plan.</p>
        ) : null}
      </div>

      <TestimonialCarousel />
      <FinalCta />

      {checkout && parent ? (
        <CheckoutFlow
          planId={checkout.planId}
          targetExam={checkout.targetExam}
          parentId={parent.id}
          parentPhone={parent.phone}
          onCancel={() => setCheckout(null)}
          onSuccess={() => setCheckout(null)}
        />
      ) : null}
    </div>
  );
}
