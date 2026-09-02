"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Switch,
  cn,
} from "@vedicneev/ui";
import { PLAN_CONFIG, type EntitlementExamType, type PaidPlanId, type ParentSubscription } from "@vedicneev/engine";
import { Sparkles } from "lucide-react";

import { CheckoutFlow } from "@/components/pricing/CheckoutFlow";
import { PricingTable } from "@/components/pricing/PricingTable";
import { useSubscriptionStore } from "@/lib/payments/useSubscriptionStore";

export interface SubscriptionManagerProps {
  parentId: string;
  subscription: ParentSubscription | null;
  defaultExam?: EntitlementExamType;
}

const STATUS_META: Record<ParentSubscription["status"], { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-400" },
  CANCELLED: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
  EXPIRED: { label: "Expired", className: "bg-amber-500/15 text-amber-700 border-amber-500/40 dark:text-amber-400" },
};

/** Compact subscription status plus a one-tap All-Access toggle, so a parent can upgrade, downgrade, or cancel without leaving the Command Center. */
export function SubscriptionManager({ parentId, subscription, defaultExam }: SubscriptionManagerProps) {
  const cancelSubscription = useSubscriptionStore((s) => s.cancelSubscription);
  const [comparePlansOpen, setComparePlansOpen] = useState(false);
  const [checkout, setCheckout] = useState<{ planId: PaidPlanId; targetExam: EntitlementExamType | null } | null>(
    null
  );

  const isActive =
    !!subscription &&
    subscription.status === "ACTIVE" &&
    (subscription.validUntil === null || subscription.validUntil > Date.now());
  const isAllAccessActive = isActive && subscription?.plan === "VEDIC_ALL_ACCESS";
  const currentPlan = subscription?.plan ?? "FREE_EXPLORER";
  const planConfig = PLAN_CONFIG[currentPlan];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{planConfig.name}</p>
          {subscription ? (
            <Badge variant="outline" className={cn("font-medium", STATUS_META[subscription.status].className)}>
              {STATUS_META[subscription.status].label}
            </Badge>
          ) : null}
          {isActive && subscription?.plan === "EXAM_PASS" && subscription.targetExam ? (
            <Badge variant="outline" className="text-[10px]">
              {subscription.targetExam}
            </Badge>
          ) : null}
        </div>
        {isActive ? (
          <Button type="button" variant="outline" size="sm" onClick={() => cancelSubscription(parentId)}>
            Cancel Subscription
          </Button>
        ) : null}
      </div>

      {isActive && subscription?.validUntil ? (
        <p className="text-xs text-muted-foreground">
          Renews {new Date(subscription.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Vedic All-Access
          </p>
          <p className="text-xs text-muted-foreground">
            {isAllAccessActive
              ? "Unlimited mock tests, full Mistake Vault remediation, and speed-math clinics for every child."
              : "Switch on to unlock every exam, the full Mistake Vault, and speed-hack clinics for all your children."}
          </p>
        </div>
        <Switch
          checked={isAllAccessActive}
          onCheckedChange={(next) => {
            if (next) setCheckout({ planId: "VEDIC_ALL_ACCESS", targetExam: null });
            else cancelSubscription(parentId);
          }}
        />
      </div>

      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setComparePlansOpen(true)}>
        Compare All Plans
      </Button>

      <Dialog open={comparePlansOpen} onOpenChange={setComparePlansOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Plans for every stage of prep</DialogTitle>
          </DialogHeader>
          <PricingTable
            currentPlan={isActive ? currentPlan : "FREE_EXPLORER"}
            defaultExam={defaultExam}
            onSelectPlan={(planId, targetExam) => {
              setComparePlansOpen(false);
              setCheckout({ planId, targetExam });
            }}
          />
        </DialogContent>
      </Dialog>

      {checkout ? (
        <CheckoutFlow
          planId={checkout.planId}
          targetExam={checkout.targetExam}
          parentId={parentId}
          onCancel={() => setCheckout(null)}
          onSuccess={() => setCheckout(null)}
        />
      ) : null}
    </div>
  );
}
