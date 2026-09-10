"use client";

import { useState } from "react";
import { Button } from "@vedicneev/ui";
import { Loader2 } from "lucide-react";

/**
 * Collects email/mobile right after a guest checkout succeeds — see
 * StoreCheckoutDialog's "success" step, and POST
 * /api/checkout/guest-contact for what happens with these values. Never
 * shown for an already-identified purchase (parentPhone was passed to
 * StoreCheckoutDialog), only for the frictionless guest path.
 */
export function GuestContactForm({ purchaseIds, onDone }: { purchaseIds: string[]; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() && !phone.trim()) {
      setError("Enter an email or a mobile number.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/guest-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseIds, email: email.trim() || undefined, phone: phone.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Could not save your contact details.");
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your contact details.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2 text-left">
      <p className="text-sm font-medium text-foreground">Where should we send your access details?</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Mobile number"
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button type="button" onClick={handleSubmit} disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
      </Button>
    </div>
  );
}
