"use client";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vedicneev/ui";
import { PLAN_CONFIG, type EntitlementExamType, type PaidPlanId } from "@vedicneev/engine";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";

import { loadRazorpayCheckoutScript } from "@/lib/payments/loadRazorpayCheckout";
import type { CreateOrderResponse, RazorpayPaymentPayload, VerifyPaymentResponse } from "@/lib/payments/types";
import { useSubscriptionStore, type StoredSubscription } from "@/lib/payments/useSubscriptionStore";

type CheckoutStep = "creating-order" | "awaiting-payment" | "verifying" | "error";

export interface CheckoutFlowProps {
  planId: PaidPlanId;
  targetExam: EntitlementExamType | null;
  parentId: string;
  /** Identifies the real User row server-side — see POST /api/razorpay/verify-payment, which upserts by phone the same way apps/web/app/api/auth/sync/route.ts does at sign-in. */
  parentPhone: string;
  onSuccess: (subscription: StoredSubscription) => void;
  onCancel: () => void;
}

/**
 * Owns the whole create-order → pay → verify → activate pipeline. When no
 * real Razorpay keys are configured, `/api/razorpay/create-order` returns a
 * `mock: true` order and this renders a clearly-labeled demo confirmation
 * (no card/payment fields — just "Simulate Successful Payment") instead of
 * opening the real checkout.js widget.
 */
export function CheckoutFlow({ planId, targetExam, parentId, parentPhone, onSuccess, onCancel }: CheckoutFlowProps) {
  const [step, setStep] = useState<CheckoutStep>("creating-order");
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<CreateOrderResponse | null>(null);
  const activateSubscription = useSubscriptionStore((s) => s.activateSubscription);
  const plan = PLAN_CONFIG[planId];

  const verifyRef = useRef<(payload: RazorpayPaymentPayload) => Promise<void>>();
  verifyRef.current = async (payload: RazorpayPaymentPayload) => {
    setStep("verifying");
    try {
      const res = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, phone: parentPhone, planId, targetExam }),
      });
      const data: VerifyPaymentResponse = await res.json();
      if (!res.ok || !data.verified) throw new Error(data.error ?? "Payment could not be verified.");

      // The server just wrote the real Subscription row (POST
      // /api/razorpay/verify-payment) — this local store still drives the
      // UI's instant reactivity, so mirror the server's response into it
      // rather than re-deriving amount/validUntil client-side, in case a
      // future price or validity-period change lands only on the server.
      const subscription = activateSubscription({
        parentId,
        plan: planId,
        targetExam,
        amountPaid: data.subscription?.amountPaid ?? plan.priceInr,
        razorpayOrderId: payload.razorpay_order_id,
        razorpayPaymentId: payload.razorpay_payment_id,
        validUntil: data.subscription ? new Date(data.subscription.validUntil).getTime() : undefined,
      });
      onSuccess(subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment verification failed.");
      setStep("error");
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function openRealCheckout(orderData: CreateOrderResponse) {
      const loaded = await loadRazorpayCheckoutScript();
      if (cancelled) return;
      if (!loaded || !window.Razorpay) {
        setError("Could not load the payment gateway. Please try again.");
        setStep("error");
        return;
      }
      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "Vedic Neev",
        description: `${plan.name}${targetExam ? ` — ${targetExam}` : ""}`,
        handler: (response: RazorpayPaymentPayload) => {
          void verifyRef.current?.(response);
        },
        modal: { ondismiss: () => onCancel() },
      });
      rzp.open();
    }

    async function run() {
      setStep("creating-order");
      setError(null);
      try {
        const res = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, targetExam }),
        });
        const data: CreateOrderResponse & { error?: string } = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not start checkout.");
        if (cancelled) return;

        setOrder(data);
        setStep("awaiting-payment");
        if (!data.mock) await openRealCheckout(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not start checkout.");
          setStep("error");
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, targetExam]);

  function handleSimulatePayment() {
    if (!order) return;
    void verifyRef.current?.({
      razorpay_order_id: order.orderId,
      razorpay_payment_id: `pay_mock_${Math.random().toString(36).slice(2)}`,
      razorpay_signature: "mock_signature",
    });
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {plan.name}
            {targetExam ? ` — ${targetExam}` : ""}
          </DialogTitle>
          <DialogDescription>₹{plan.priceInr.toLocaleString("en-IN")}</DialogDescription>
        </DialogHeader>

        {step === "creating-order" || step === "verifying" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            {step === "creating-order" ? "Setting up checkout…" : "Verifying your payment…"}
          </div>
        ) : null}

        {step === "awaiting-payment" && order?.mock ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-3 text-sm">
              <p className="font-semibold text-foreground">Demo checkout</p>
              <p className="text-muted-foreground">
                No payment gateway is connected yet — this simulates a successful Razorpay payment. No real
                charge will be made.
              </p>
            </div>
            <Button type="button" size="lg" onClick={handleSimulatePayment}>
              Simulate Successful Payment
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        ) : null}

        {step === "awaiting-payment" && order && !order.mock ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Complete your payment in the Razorpay window.
          </p>
        ) : null}

        {step === "error" ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
            <Button type="button" variant="outline" onClick={onCancel}>
              Close
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
