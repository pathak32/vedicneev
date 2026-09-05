"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vedicneev/ui";
import { PLAN_CONFIG, type EntitlementExamType, type PaidPlanId } from "@vedicneev/engine";
import { Lock, Sparkles } from "lucide-react";

import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectActiveParent, useAuthStore } from "@/lib/auth/useAuthStore";
import type { StoredSubscription } from "@/lib/payments/useSubscriptionStore";
import { CheckoutFlow } from "./CheckoutFlow";

export type LockedFeature = "MOCK_TEST" | "OMR_SCANNER" | "MISTAKE_VAULT_SOLUTIONS" | "SPEED_HACK_CLINIC";

const FEATURE_COPY: Record<LockedFeature, { title: string; description: string }> = {
  MOCK_TEST: {
    title: "Unlock this mock test",
    description: "You've used your free mock test. Get an Exam Pass or All-Access to keep practicing.",
  },
  OMR_SCANNER: {
    title: "Unlock the OMR scanner",
    description: "Scan and auto-grade paper answer sheets with an Exam Pass or All-Access.",
  },
  MISTAKE_VAULT_SOLUTIONS: {
    title: "Unlock detailed Mistake Vault solutions",
    description: "Step-by-step remediation for every wrong answer is part of Vedic All-Access.",
  },
  SPEED_HACK_CLINIC: {
    title: "Unlock Vedic speed-math clinics",
    description: "Learn the shortcut behind every arithmetic question with Vedic All-Access.",
  },
};

export interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: LockedFeature;
  targetExam?: EntitlementExamType;
  suggestedPlans: PaidPlanId[];
  onUnlocked?: (subscription: StoredSubscription) => void;
}

export function PaywallModal({
  open,
  onOpenChange,
  feature,
  targetExam,
  suggestedPlans,
  onUnlocked,
}: PaywallModalProps) {
  const parent = useAuthStore(selectActiveParent);
  const { isAuthenticated } = useActiveStudent();
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlanId | null>(null);
  const copy = FEATURE_COPY[feature];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              {copy.title}
            </DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>

          {!isAuthenticated || !parent ? (
            <p className="text-sm text-muted-foreground">Sign in first to choose a plan.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {suggestedPlans.map((planId) => {
                const plan = PLAN_CONFIG[planId];
                return (
                  <button
                    key={planId}
                    type="button"
                    onClick={() => setCheckoutPlan(planId)}
                    className="flex items-center justify-between rounded-lg border-2 border-border p-4 text-left transition-colors hover:border-primary/50"
                  >
                    <span>
                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        {planId === "VEDIC_ALL_ACCESS" ? <Sparkles className="h-4 w-4 text-primary" /> : null}
                        {plan.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{plan.tagline}</span>
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      ₹{plan.priceInr.toLocaleString("en-IN")}
                    </span>
                  </button>
                );
              })}
              <Button asChild variant="outline" size="sm">
                <Link href="/pricing">Compare all plans</Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {checkoutPlan && parent ? (
        <CheckoutFlow
          planId={checkoutPlan}
          targetExam={checkoutPlan === "EXAM_PASS" ? (targetExam ?? null) : null}
          parentId={parent.id}
          parentPhone={parent.phone}
          onCancel={() => setCheckoutPlan(null)}
          onSuccess={(subscription) => {
            setCheckoutPlan(null);
            onOpenChange(false);
            onUnlocked?.(subscription);
          }}
        />
      ) : null}
    </>
  );
}
