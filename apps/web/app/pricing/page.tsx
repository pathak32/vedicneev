"use client";

import { useState } from "react";
import type { EntitlementExamType, PaidPlanId } from "@vedicneev/engine";

import { CheckoutFlow } from "@/components/pricing/CheckoutFlow";
import { PricingTable } from "@/components/pricing/PricingTable";
import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectActiveParent, useAuthStore } from "@/lib/auth/useAuthStore";
import { selectParentSubscription, useSubscriptionStore } from "@/lib/payments/useSubscriptionStore";

export default function PricingPage() {
  const parent = useAuthStore(selectActiveParent);
  const { activeStudent } = useActiveStudent();
  const subscription = useSubscriptionStore((s) => selectParentSubscription(s, parent?.id ?? null));
  const [checkout, setCheckout] = useState<{ planId: PaidPlanId; targetExam: EntitlementExamType | null } | null>(
    null
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 py-12 md:p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Plans for every stage of prep</h1>
        <p className="text-sm text-muted-foreground">
          Start free, then unlock a single exam or every exam across all your children&apos;s profiles.
        </p>
      </div>

      <PricingTable
        currentPlan={subscription?.plan ?? "FREE_EXPLORER"}
        defaultExam={activeStudent?.targetExam}
        onSelectPlan={(planId, targetExam) => {
          if (!parent) return;
          setCheckout({ planId, targetExam });
        }}
      />

      {!parent ? (
        <p className="text-center text-sm text-muted-foreground">Sign in from the header to purchase a plan.</p>
      ) : null}

      {checkout && parent ? (
        <CheckoutFlow
          planId={checkout.planId}
          targetExam={checkout.targetExam}
          parentId={parent.id}
          onCancel={() => setCheckout(null)}
          onSuccess={() => setCheckout(null)}
        />
      ) : null}
    </div>
  );
}
