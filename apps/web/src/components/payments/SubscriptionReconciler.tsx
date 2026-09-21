"use client";

import { useEffect, useRef } from "react";

import { selectActiveAccount, useAuthStore } from "@/lib/auth/useAuthStore";
import { useSubscriptionStore } from "@/lib/payments/useSubscriptionStore";
import type { SubscriptionStatusResponse } from "@/lib/payments/types";

/**
 * Closes the gap CheckoutFlow.tsx's payment-verification bug shares a root
 * cause with: every entitlement check in this app (checkPracticeAccess,
 * checkMistakeVaultAccess, the pricing page) reads ONLY
 * useSubscriptionStore's localStorage mirror, never the database. If a
 * payment's `verified: true` response is lost — tab closed or reloaded
 * between Razorpay's success callback and that response arriving — the real
 * Subscription row exists, but nothing in the UI ever asks for it again, so
 * the customer sees "Buy Now" forever despite having paid.
 *
 * Mounted once, site-wide (see app/layout.tsx), with no UI of its own —
 * same "silent sync on mount" convention as EcosystemReferralListener. On
 * every hydrated, signed-in render it asks GET /api/subscription/status for
 * the database's view and, only when it has a currently-ACTIVE subscription
 * the local store doesn't already reflect, merges it in. It never removes a
 * subscription the store already has — an expired/cancelled DB row here
 * just means "nothing newer to reconcile," not "revoke local access."
 */
export function SubscriptionReconciler() {
  const hasAuthHydrated = useAuthStore((s) => s.hasHydrated);
  const activePhone = useAuthStore((s) => s.activePhone);
  const account = useAuthStore(selectActiveAccount);
  const hasSubscriptionHydrated = useSubscriptionStore((s) => s.hasHydrated);
  const activateSubscription = useSubscriptionStore((s) => s.activateSubscription);
  const reconciledFor = useRef<string | null>(null);

  useEffect(() => {
    if (!hasAuthHydrated || !hasSubscriptionHydrated) return;
    const parentId = account?.parent.id ?? null;
    if (!parentId || reconciledFor.current === parentId) return;
    reconciledFor.current = parentId;

    const localSubscription = useSubscriptionStore.getState().subscriptionsByParentId[parentId];
    const localIsActive =
      localSubscription?.status === "ACTIVE" &&
      (localSubscription.validUntil === null || localSubscription.validUntil > Date.now());
    if (localIsActive) return;

    const url = activePhone
      ? `/api/subscription/status?phone=${encodeURIComponent(activePhone)}`
      : "/api/subscription/status";

    fetch(url)
      .then((res) => res.json() as Promise<SubscriptionStatusResponse>)
      .then((data) => {
        if (!data.subscription) return;
        activateSubscription({
          parentId,
          plan: data.subscription.plan,
          targetExam: data.subscription.targetExam,
          amountPaid: data.subscription.amountPaid,
          razorpayOrderId: data.subscription.razorpayOrderId,
          razorpayPaymentId: data.subscription.razorpayPaymentId,
          validUntil: new Date(data.subscription.validUntil).getTime(),
        });
      })
      .catch((err) => console.error("Failed to reconcile subscription status:", err));
  }, [hasAuthHydrated, hasSubscriptionHydrated, account, activePhone, activateSubscription]);

  return null;
}
