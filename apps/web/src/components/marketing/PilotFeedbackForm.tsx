"use client";

import { useState } from "react";
import { Button } from "@vedicneev/ui";
import { CheckCircle2, Loader2 } from "lucide-react";

const AREA = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

export function PilotFeedbackForm({ token, contactName }: { token: string; contactName: string }) {
  const [answerBefore, setAnswerBefore] = useState("");
  const [answerExperience, setAnswerExperience] = useState("");
  const [answerMissing, setAnswerMissing] = useState("");
  const [wouldUseAgain, setWouldUseAgain] = useState("");
  const [consentQuote, setConsentQuote] = useState(false);
  const [consentName, setConsentName] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/feedback/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerBefore, answerExperience, answerMissing, wouldUseAgain, consentQuote, consentName }),
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
        <h2 className="text-lg font-bold text-foreground">Thank you, {contactName}.</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Your answers help us build something that is genuinely useful for institutes. We will not share anything unless
          you ticked the box, and we will check with you before we do.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
      <label className="text-sm font-medium text-foreground">
        1. How did you check OMR sheets before, and roughly how long did a test take?
        <textarea rows={3} maxLength={1500} value={answerBefore} onChange={(e) => setAnswerBefore(e.target.value)} className={AREA} />
      </label>

      <label className="text-sm font-medium text-foreground">
        2. What did you notice when you graded your batch?
        <textarea
          rows={3}
          maxLength={1500}
          value={answerExperience}
          onChange={(e) => setAnswerExperience(e.target.value)}
          className={AREA}
        />
      </label>

      <label className="text-sm font-medium text-foreground">
        3. What was missing, confusing or slow? Be blunt.
        <textarea rows={3} maxLength={1500} value={answerMissing} onChange={(e) => setAnswerMissing(e.target.value)} className={AREA} />
      </label>

      <fieldset className="text-sm font-medium text-foreground">
        Would you use it again?
        <div className="mt-2 flex gap-4 font-normal">
          {(
            [
              ["yes", "Yes"],
              ["maybe", "Maybe"],
              ["no", "No"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-1.5">
              <input type="radio" name="wouldUseAgain" value={value} checked={wouldUseAgain === value} onChange={() => setWouldUseAgain(value)} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
        <label className="flex items-start gap-2">
          <input type="checkbox" checked={consentQuote} onChange={(e) => setConsentQuote(e.target.checked)} className="mt-1" />
          <span>You may quote my answers above on LinkedIn and the VedicNeev website. (Optional)</span>
        </label>
        <label className={`flex items-start gap-2 ${consentQuote ? "" : "opacity-50"}`}>
          <input
            type="checkbox"
            disabled={!consentQuote}
            checked={consentName}
            onChange={(e) => setConsentName(e.target.checked)}
            className="mt-1"
          />
          <span>You may use my name and my institute&apos;s name with the quote. (Optional)</span>
        </label>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" disabled={submitting} className="gap-2">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Send my feedback
      </Button>
    </form>
  );
}
