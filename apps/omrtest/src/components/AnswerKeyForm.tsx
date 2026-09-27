"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Pencil, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button, Card, CardContent } from "@vedicneev/ui";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

interface AnswerKeyFormProps {
  testBatchId: string;
  totalQuestions: number;
  /** Fires after every successful save, with whether the saved key is now complete — MultiSetPanel (a sibling, not a child) needs this to unlock, since it can't see this form's own state otherwise. */
  onSaved?: (isComplete: boolean) => void;
  /** Fires whenever the confirmed state changes (initial load, a save that un-confirms it, or an explicit Confirm) — same cross-sibling need as onSaved. */
  onConfirmedChange?: (confirmed: boolean) => void;
}

interface AnswerKeyState {
  compactAnswerKey: string | null;
  queuedUploadsAwaitingKey: number;
  confirmed: boolean;
}

interface SaveResult {
  regradedCount: number;
  stillHeldCount: number;
}

/**
 * The compact fast-entry answer key editor — one letter per question,
 * e.g. "BDACB..." rather than totalQuestions individual dropdowns, which
 * is how an admin transcribing a real paper key actually works. Saving
 * also re-grades any sheet that was uploaded before this key existed (see
 * PATCH /api/tests/[id]/answer-key's own comment) — this form surfaces
 * that outcome (how many got graded just now) so "set the key" reads as a
 * complete action, not just a silent field update.
 *
 * Two modes, not one persistent textarea: once a key is already saved,
 * showing the raw editable field with no indication it's already been set
 * reads as "did that save actually work?" — SAVED mode shows a plain
 * summary + an explicit Edit action instead.
 */
export function AnswerKeyForm({ testBatchId, totalQuestions, onSaved, onConfirmedChange }: AnswerKeyFormProps) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<AnswerKeyState | null>(null);
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tests/${testBatchId}/answer-key`)
      .then((res) => res.json())
      .then((data: AnswerKeyState & { error?: string }) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
        } else {
          setState(data);
          setValue(data.compactAnswerKey?.replace(/\?/g, "") ?? "");
          // Start in SAVED mode whenever a key already exists — only a
          // never-set batch (compactAnswerKey null) opens straight into
          // the editable field.
          setEditing(!data.compactAnswerKey);
          onConfirmedChange?.(data.confirmed);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load the current answer key.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testBatchId]);

  async function handleConfirm() {
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch(`/api/tests/${testBatchId}/answer-key/confirm`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not confirm the answer key.");
        toast.error(data.error ?? "Could not confirm the answer key.");
        return;
      }
      setState((prev) => (prev ? { ...prev, confirmed: true } : prev));
      onConfirmedChange?.(true);
      toast.success("Answer key confirmed.");
    } catch {
      setError("Network error — could not reach the server.");
      toast.error("Network error — could not reach the server.");
    } finally {
      setConfirming(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveResult(null);

    try {
      const res = await fetch(`/api/tests/${testBatchId}/answer-key`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerKey: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save the answer key.");
        toast.error(data.error ?? "Could not save the answer key.");
        setSaving(false);
        return;
      }
      setSaveResult({ regradedCount: data.regradedCount, stillHeldCount: data.stillHeldCount });
      setState((prev) =>
        prev ? { ...prev, compactAnswerKey: value, queuedUploadsAwaitingKey: data.stillHeldCount, confirmed: false } : prev
      );
      setEditing(false);
      onSaved?.(true);
      // The save just un-confirmed this key server-side (see the PATCH
      // route's own comment) — reflect that immediately rather than
      // waiting for a reload.
      onConfirmedChange?.(false);
      toast.success("Answer key saved.");
    } catch {
      setError("Network error — could not reach the server.");
      toast.error("Network error — could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit() {
    setError(null);
    setSaveResult(null);
    setEditing(true);
  }

  function handleCancelEdit() {
    setValue(state?.compactAnswerKey?.replace(/\?/g, "") ?? "");
    setError(null);
    setEditing(false);
  }

  if (loading) {
    return (
      <Card className="max-w-2xl border-slate-200">
        <CardContent className="flex items-center gap-2 p-6 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading…
        </CardContent>
      </Card>
    );
  }

  const cleaned = value.trim().toUpperCase().replace(/[\s,]+/g, "");
  const isComplete = cleaned.length === totalQuestions;

  return (
    <Card className="max-w-2xl border-slate-200">
      <CardContent className="space-y-5 p-6">
        {state && state.queuedUploadsAwaitingKey > 0 ? (
          <p role="status" className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-slate-700">
            {state.queuedUploadsAwaitingKey} uploaded sheet{state.queuedUploadsAwaitingKey === 1 ? "" : "s"} are waiting on
            this key and will be graded automatically as soon as you save it.
          </p>
        ) : null}

        {!editing && state?.compactAnswerKey ? (
          <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Answer key saved</p>
              <p className="text-xs text-slate-500">{totalQuestions} / {totalQuestions} questions</p>
            </div>
            <div className="flex items-center gap-2">
              {state.confirmed ? (
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Confirmed
                </span>
              ) : (
                <Button type="button" size="sm" onClick={handleConfirm} disabled={confirming}>
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {confirming ? "Confirming…" : "Confirm Answer Key"}
                </Button>
              )}
              <Button type="button" variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="answerKey">
                Answer key ({totalQuestions} questions — one letter each, A/B/C/D, in question order)
              </Label>
              <Textarea
                id="answerKey"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. BDACB..."
                rows={6}
                disabled={saving}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                {cleaned.length} / {totalQuestions} entered
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={!isComplete || saving}>
                {saving ? "Saving…" : "Save Answer Key"}
              </Button>
              {state?.compactAnswerKey ? (
                <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={saving}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        )}

        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}

        {saveResult ? (
          <p role="status" className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-slate-700">
            Saved. {saveResult.regradedCount} previously-uploaded sheet{saveResult.regradedCount === 1 ? "" : "s"} graded
            just now
            {saveResult.stillHeldCount > 0
              ? `; ${saveResult.stillHeldCount} still held (out of scan credits, or already superseded).`
              : "."}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
