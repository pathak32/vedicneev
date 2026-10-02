"use client";

import { useState } from "react";
import { Button } from "@vedicneev/ui";
import { CheckCircle2, Loader2 } from "lucide-react";

interface FormState {
  instituteName: string;
  directorName: string;
  city: string;
  district: string;
  state: string;
  phoneNumber: string;
  details: string;
  website: string;
}

const EMPTY: FormState = {
  instituteName: "",
  directorName: "",
  city: "",
  district: "",
  state: "",
  phoneNumber: "",
  details: "",
  website: "",
};

const FIELD = "mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

export function InstituteInterestForm() {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    // Campaign tags from the link the visitor arrived on, e.g.
    // /for-institutes?utm_source=linkedin&utm_medium=post&utm_campaign=oct-12
    const params = new URLSearchParams(window.location.search);

    try {
      const res = await fetch("/api/institutes/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          utmSource: params.get("utm_source") ?? params.get("ref") ?? "",
          utmMedium: params.get("utm_medium") ?? "",
          utmCampaign: params.get("utm_campaign") ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        <h3 className="text-lg font-bold text-foreground">Thank you. We have your details.</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          We will message you on WhatsApp to set up your free test batch. Keep one real test ready, and we will grade it
          together.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-foreground">
          Institute name
          <input
            required
            maxLength={120}
            value={values.instituteName}
            onChange={(e) => update("instituteName", e.target.value)}
            className={FIELD}
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          Your name
          <input
            required
            maxLength={120}
            value={values.directorName}
            onChange={(e) => update("directorName", e.target.value)}
            className={FIELD}
          />
        </label>
        <label className="text-sm font-medium text-foreground">
          City or town
          <input required maxLength={80} value={values.city} onChange={(e) => update("city", e.target.value)} className={FIELD} />
        </label>
        <label className="text-sm font-medium text-foreground">
          District <span className="font-normal text-muted-foreground">(optional)</span>
          <input maxLength={80} value={values.district} onChange={(e) => update("district", e.target.value)} className={FIELD} />
        </label>
        <label className="text-sm font-medium text-foreground">
          State
          <input required maxLength={80} value={values.state} onChange={(e) => update("state", e.target.value)} className={FIELD} />
        </label>
        <label className="text-sm font-medium text-foreground">
          WhatsApp number
          <input
            required
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            maxLength={20}
            value={values.phoneNumber}
            onChange={(e) => update("phoneNumber", e.target.value)}
            className={FIELD}
          />
        </label>
      </div>

      <label className="text-sm font-medium text-foreground">
        Which exams do you prepare students for, and how many students per test?{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
        <textarea
          rows={3}
          maxLength={500}
          value={values.details}
          onChange={(e) => update("details", e.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </label>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => update("website", e.target.value)} />
        </label>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" disabled={submitting} className="gap-2">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Get my 10 free grading credits
      </Button>
      <p className="text-xs text-muted-foreground">
        We will only use your number to message you about this trial. No spam, no contract.
      </p>
    </form>
  );
}
