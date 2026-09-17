"use client";

import { useEffect, useState } from "react";

interface AnswerKeyFormProps {
  testBatchId: string;
  totalQuestions: number;
}

interface AnswerKeyState {
  compactAnswerKey: string | null;
  queuedUploadsAwaitingKey: number;
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
 */
export function AnswerKeyForm({ testBatchId, totalQuestions }: AnswerKeyFormProps) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<AnswerKeyState | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);

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
  }, [testBatchId]);

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
        setSaving(false);
        return;
      }
      setSaveResult({ regradedCount: data.regradedCount, stillHeldCount: data.stillHeldCount });
      setState((prev) => (prev ? { ...prev, compactAnswerKey: value, queuedUploadsAwaitingKey: data.stillHeldCount } : prev));
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading…</p>;

  const cleaned = value.trim().toUpperCase().replace(/[\s,]+/g, "");
  const isComplete = cleaned.length === totalQuestions;

  return (
    <div>
      {state && state.queuedUploadsAwaitingKey > 0 ? (
        <p role="status">
          {state.queuedUploadsAwaitingKey} uploaded sheet{state.queuedUploadsAwaitingKey === 1 ? "" : "s"} are waiting on this key
          and will be graded automatically as soon as you save it.
        </p>
      ) : null}

      <form onSubmit={handleSubmit}>
        <label htmlFor="answerKey">
          Answer key ({totalQuestions} questions — one letter each, A/B/C/D, in question order)
        </label>
        <textarea
          id="answerKey"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. BDACB..."
          rows={6}
          disabled={saving}
        />
        <p>
          {cleaned.length} / {totalQuestions} entered
        </p>
        <button type="submit" disabled={!isComplete || saving}>
          {saving ? "Saving…" : "Save Answer Key"}
        </button>
      </form>

      {error ? <p role="alert">{error}</p> : null}

      {saveResult ? (
        <p role="status">
          Saved. {saveResult.regradedCount} previously-uploaded sheet{saveResult.regradedCount === 1 ? "" : "s"} graded just now
          {saveResult.stillHeldCount > 0
            ? `; ${saveResult.stillHeldCount} still held (out of scan credits, or already superseded).`
            : "."}
        </p>
      ) : null}
    </div>
  );
}
