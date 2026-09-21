"use client";

import { useState } from "react";
import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@vedicneev/ui";
import { CREDIT_TOPUP_BUNDLES, INSTITUTE_TIER_CONFIG, type PaidInstituteTier } from "@vedicneev/engine";
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck, Wallet } from "lucide-react";

import { loadRazorpayCheckoutScript } from "@/lib/payments/loadRazorpayCheckout";

type CheckoutTarget =
  | { kind: "subscription"; tier: PaidInstituteTier }
  | { kind: "credit_topup"; topupId: string };

type Step = "creating-order" | "awaiting-payment" | "confirming" | "success" | "error";

interface OrderState {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string | null;
  mock: boolean;
  amountInr: number;
}

export interface BillingPageClientProps {
  /** The institute's real current tier, which may be ENTERPRISE (contact-sales, no self-serve checkout card below) — only STARTER/GROWTH ever match one of the plan cards. */
  currentTier: "STARTER" | "GROWTH" | "ENTERPRISE" | null;
  currentPeriodEnd: string | null;
  subscriptionStatus: "ACTIVE" | "EXPIRED" | "CANCELLED" | null;
  creditBalance: number;
}

function tierLabel(tier: "STARTER" | "GROWTH" | "ENTERPRISE"): string {
  return tier === "ENTERPRISE" ? "Enterprise" : INSTITUTE_TIER_CONFIG[tier].label;
}

/**
 * Every checkout here — a tier subscription or a credit top-up — is a
 * single 30-day-or-flat one-time Razorpay Order, not a recurring mandate
 * (see packages/engine/src/instituteBilling.ts's INSTITUTE_SUBSCRIPTION_
 * PERIOD_MS comment): "Subscribe"/"Renew" charges once and sets the
 * period end 30 days out, same as the consumer app's own Subscription
 * model. Nothing auto-renews.
 */
export function BillingPageClient({ currentTier, currentPeriodEnd, subscriptionStatus, creditBalance }: BillingPageClientProps) {
  const [target, setTarget] = useState<CheckoutTarget | null>(null);
  const [step, setStep] = useState<Step>("creating-order");
  const [order, setOrder] = useState<OrderState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCurrentAndActive = (tier: PaidInstituteTier) =>
    currentTier === tier && subscriptionStatus === "ACTIVE" && currentPeriodEnd && new Date(currentPeriodEnd) > new Date();

  async function startCheckout(next: CheckoutTarget) {
    setTarget(next);
    setStep("creating-order");
    setError(null);
    setOrder(null);

    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          next.kind === "subscription" ? { kind: "subscription", tier: next.tier } : { kind: "credit_topup", topupId: next.topupId }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout.");

      const orderState: OrderState = {
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        keyId: data.keyId,
        mock: data.mock,
        amountInr: data.amountInr,
      };
      setOrder(orderState);
      setStep("awaiting-payment");

      if (!orderState.mock) {
        const loaded = await loadRazorpayCheckoutScript();
        if (!loaded || !window.Razorpay) {
          setError("Could not load the payment gateway. Please try again.");
          setStep("error");
          return;
        }
        const rzp = new window.Razorpay({
          key: orderState.keyId,
          amount: orderState.amount,
          currency: orderState.currency,
          order_id: orderState.orderId,
          name: "VedicNeev Institute Suite",
          description: next.kind === "subscription" ? `${INSTITUTE_TIER_CONFIG[next.tier].label} plan` : "Scan credit top-up",
          method: { upi: true },
          handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
            void confirmPayment(response, next),
          modal: { ondismiss: () => setStep("error") },
        });
        rzp.open();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setStep("error");
    }
  }

  async function confirmPayment(
    response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
    next: CheckoutTarget
  ) {
    setStep("confirming");
    try {
      const res = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...response,
          ...(next.kind === "subscription" ? { kind: "subscription", tier: next.tier } : { kind: "credit_topup", topupId: next.topupId }),
        }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setStep("success");
        return;
      }
      setError(data.error ?? "Payment could not be confirmed.");
      setStep("error");
    } catch {
      setError("Payment could not be confirmed — if you were charged, it will still sync automatically shortly.");
      setStep("error");
    }
  }

  function handleSimulatePayment() {
    if (!order || !target) return;
    void fetch("/api/razorpay/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: order.orderId,
        razorpay_payment_id: `pay_mock_${Math.random().toString(36).slice(2)}`,
        razorpay_signature: "mock_signature",
        ...(target.kind === "subscription" ? { kind: "subscription", tier: target.tier } : { kind: "credit_topup", topupId: target.topupId }),
      }),
    })
      .then((res) => res.json())
      .then((data) => setStep(data.verified ? "success" : "error"));
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="border-slate-200">
        <CardContent className="flex items-center gap-4 p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-indigo/10 text-brand-indigo">
            <Wallet className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-slate-900">{creditBalance} credits</p>
            <p className="text-sm text-slate-500">
              {currentTier
                ? `${tierLabel(currentTier)} plan${
                    currentPeriodEnd ? ` — renews ${new Date(currentPeriodEnd).toLocaleDateString("en-IN")}` : ""
                  }`
                : "No active subscription — running on your welcome credit grant."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Subscription Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.values(INSTITUTE_TIER_CONFIG)).map((plan) => (
            <Card key={plan.tier} className="border-slate-200">
              <CardHeader>
                {isCurrentAndActive(plan.tier) ? <Badge className="w-fit">Current plan</Badge> : null}
                <CardTitle>{plan.label}</CardTitle>
                <p className="text-sm text-slate-500">{plan.tagline}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  ₹{plan.priceInr.toLocaleString("en-IN")}
                  <span className="text-sm font-normal text-slate-500"> /month</span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  {plan.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={Boolean(isCurrentAndActive(plan.tier))}
                  onClick={() => void startCheckout({ kind: "subscription", tier: plan.tier })}
                >
                  {isCurrentAndActive(plan.tier) ? "Active" : currentTier ? "Switch Plan" : "Subscribe"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Scan Credit Top-Ups</h2>
        <p className="mb-3 text-sm text-slate-500">Credits never expire and stack on top of your plan&apos;s monthly grant.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {Object.values(CREDIT_TOPUP_BUNDLES).map((bundle) => (
            <Card key={bundle.id} className="border-slate-200">
              <CardHeader>
                <CardTitle>{bundle.credits.toLocaleString("en-IN")} scans</CardTitle>
                <p className="text-2xl font-bold text-slate-900">₹{bundle.priceInr.toLocaleString("en-IN")}</p>
              </CardHeader>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => void startCheckout({ kind: "credit_topup", topupId: bundle.id })}
                >
                  Buy
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {target ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <Card className="w-full max-w-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-5 w-5 text-brand-indigo" aria-hidden="true" />
                {target.kind === "subscription" ? `${INSTITUTE_TIER_CONFIG[target.tier].label} plan` : "Scan credit top-up"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {step === "creating-order" || step === "confirming" ? (
                <div className="flex flex-col items-center gap-3 py-6 text-sm text-slate-500">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-indigo" aria-hidden="true" />
                  {step === "creating-order" ? "Setting up checkout…" : "Confirming your payment…"}
                </div>
              ) : null}

              {step === "awaiting-payment" && order?.mock ? (
                <div className="flex flex-col gap-3">
                  <div className="rounded-lg border border-dashed border-brand-indigo/50 bg-brand-indigo/5 p-3 text-sm">
                    <p className="font-semibold text-slate-900">Demo checkout</p>
                    <p className="text-slate-500">
                      No payment gateway is connected yet — this simulates a successful Razorpay payment. No real
                      charge will be made.
                    </p>
                  </div>
                  <Button onClick={handleSimulatePayment}>Simulate Successful Payment</Button>
                  <Button variant="outline" onClick={() => setTarget(null)}>
                    Cancel
                  </Button>
                </div>
              ) : null}

              {step === "awaiting-payment" && order && !order.mock ? (
                <p className="py-6 text-center text-sm text-slate-500">Complete your payment in the Razorpay window.</p>
              ) : null}

              {step === "success" ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
                  <p className="font-semibold text-slate-900">Payment successful!</p>
                  <Button onClick={() => window.location.reload()}>Done</Button>
                </div>
              ) : null}

              {step === "error" ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {error}
                  </div>
                  <Button variant="outline" onClick={() => setTarget(null)}>
                    Close
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
