"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vedicneev/ui";
import { applyPromoDiscount, type PromoDiscountType } from "@vedicneev/engine";
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck, Tag } from "lucide-react";

import { loadRazorpayCheckoutScript } from "@/lib/payments/loadRazorpayCheckout";
import type { StoreProduct } from "@/lib/store/types";

type Step = "form" | "creating-order" | "awaiting-payment" | "polling" | "success" | "error";

interface AppliedPromo {
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  influencerName: string;
}

export interface StoreCheckoutDialogProps {
  primaryProduct: StoreProduct;
  /** The 1-click order-bump offer (the OMR Kit) — omitted when the primary product IS the OMR Kit. */
  bumpProduct?: StoreProduct;
  parentPhone: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function StoreCheckoutDialog({ primaryProduct, bumpProduct, parentPhone, onCancel, onSuccess }: StoreCheckoutDialogProps) {
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [includeBump, setIncludeBump] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [order, setOrder] = useState<{ orderId: string; amount: number; currency: string; keyId: string | null; mock: boolean } | null>(null);
  const [purchaseIds, setPurchaseIds] = useState<string[]>([]);

  const primaryFinalPrice = applyPromoDiscount(
    primaryProduct.sellingPrice,
    appliedPromo ? { discountType: appliedPromo.discountType, discountValue: appliedPromo.discountValue } : null
  );
  const totalPrice = primaryFinalPrice + (includeBump && bumpProduct ? bumpProduct.sellingPrice : 0);

  async function handleApplyPromo() {
    const code = promoInput.trim();
    if (!code) return;
    setValidatingPromo(true);
    setPromoError(null);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) throw new Error(data.error ?? "This promo code isn't valid.");
      setAppliedPromo({
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        influencerName: data.influencerName,
      });
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(err instanceof Error ? err.message : "This promo code isn't valid.");
    } finally {
      setValidatingPromo(false);
    }
  }

  const pollRef = useRef<(purchaseIds: string[]) => Promise<void>>();
  pollRef.current = async (ids: string[]) => {
    setStep("polling");
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      try {
        const res = await fetch(`/api/checkout/status?purchaseIds=${ids.join(",")}`);
        const data = await res.json();
        if (data.status === "PAID") {
          setStep("success");
          onSuccess();
          return;
        }
        if (data.status === "FAILED") {
          setError("The payment failed. Please try again.");
          setStep("error");
          return;
        }
      } catch {
        // transient — keep polling
      }
    }
    setError("We couldn't confirm your payment yet. Check /dashboard/library shortly, or contact support.");
    setStep("error");
  };

  async function handlePay() {
    setStep("creating-order");
    setError(null);
    try {
      const productIds = [primaryProduct.id, ...(includeBump && bumpProduct ? [bumpProduct.id] : [])];
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds, promoCode: appliedPromo?.code, phone: parentPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start checkout.");

      setOrder(data);
      setPurchaseIds(data.purchaseIds);
      setStep("awaiting-payment");

      if (!data.mock) {
        const loaded = await loadRazorpayCheckoutScript();
        if (!loaded || !window.Razorpay) {
          setError("Could not load the payment gateway. Please try again.");
          setStep("error");
          return;
        }
        const rzp = new window.Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: "Vedic Neev",
          description: primaryProduct.title,
          handler: () => void pollRef.current?.(data.purchaseIds),
          modal: { ondismiss: () => setStep("form") },
        });
        rzp.open();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setStep("error");
    }
  }

  function handleSimulatePayment() {
    if (!order) return;
    void fetch("/api/webhook/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "payment.captured",
        payload: { payment: { entity: { id: `pay_mock_${Math.random().toString(36).slice(2)}`, order_id: order.orderId } } },
      }),
    }).then(() => pollRef.current?.(purchaseIds));
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {primaryProduct.title}
          </DialogTitle>
          <DialogDescription>
            <span className="mr-1.5 text-muted-foreground line-through">
              ₹{primaryProduct.displayPrice.toLocaleString("en-IN")}
            </span>
            <span className="font-semibold text-foreground">₹{primaryFinalPrice.toLocaleString("en-IN")}</span>
          </DialogDescription>
        </DialogHeader>

        {step === "form" ? (
          <div className="flex flex-col gap-3">
            {bumpProduct ? (
              <label className="flex items-start gap-2 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-3 text-sm">
                <input
                  type="checkbox"
                  checked={includeBump}
                  onChange={(e) => setIncludeBump(e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <span>
                  <span className="font-semibold text-foreground">
                    Add the {bumpProduct.title} for just ₹{bumpProduct.sellingPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="block text-xs text-muted-foreground">One-click add-on — MRP ₹{bumpProduct.displayPrice.toLocaleString("en-IN")}.</span>
                </span>
              </label>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="promo-code" className="text-sm font-medium text-foreground">
                Have a promo code?
              </label>
              <div className="flex gap-2">
                <input
                  id="promo-code"
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="e.g. GAURAV199"
                  className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm uppercase"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleApplyPromo} disabled={validatingPromo || !promoInput.trim()}>
                  {validatingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
              {appliedPromo ? (
                <p className="flex items-center gap-1 text-xs text-emerald-600">
                  <Tag className="h-3 w-3" />
                  {appliedPromo.discountType === "PERCENTAGE" ? `${appliedPromo.discountValue}% off` : `₹${appliedPromo.discountValue} off`}{" "}
                  applied — code by {appliedPromo.influencerName}
                </p>
              ) : null}
              {promoError ? <p className="text-xs text-destructive">{promoError}</p> : null}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
              <span className="font-medium text-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>

            <Button type="button" size="lg" onClick={handlePay}>
              Pay ₹{totalPrice.toLocaleString("en-IN")}
            </Button>
          </div>
        ) : null}

        {step === "creating-order" || step === "polling" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            {step === "creating-order" ? "Setting up checkout…" : "Confirming your payment…"}
          </div>
        ) : null}

        {step === "awaiting-payment" && order?.mock ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-3 text-sm">
              <p className="font-semibold text-foreground">Demo checkout</p>
              <p className="text-muted-foreground">
                No payment gateway is connected yet — this simulates a successful Razorpay payment. No real charge
                will be made.
              </p>
            </div>
            <Button type="button" size="lg" onClick={handleSimulatePayment}>
              Simulate Successful Payment
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep("form")}>
              Back
            </Button>
          </div>
        ) : null}

        {step === "awaiting-payment" && order && !order.mock ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Complete your payment in the Razorpay window.</p>
        ) : null}

        {step === "success" ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            <p className="font-semibold text-foreground">Purchase complete!</p>
            <Button asChild size="lg">
              <Link href="/dashboard/library">Go to My Library</Link>
            </Button>
          </div>
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
