"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, Shuffle } from "lucide-react";

import { Button, Card, CardContent } from "@vedicneev/ui";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

interface MultiSetPanelProps {
  testBatchId: string;
  /** Passed down from AnswerKeyForm's own load, not re-fetched here, so this panel can gate its button on the exact same "is the master key complete" check that form already computed. */
  hasCompleteAnswerKey: boolean;
}

const SET_COUNT_OPTIONS = [2, 3, 4, 5];

/**
 * "Generate Multi-Set Papers" — shuffles the batch's master answer key
 * into SET_1..SET_N (packages/engine's generateQuestionSets, via POST
 * .../generate-sets) and, once that's run at least once, lists a
 * Question Paper + OMR Sheets download per set. Re-running with a new
 * set count simply overwrites the previous setMappings and roster
 * assignments — there's no "undo," same one-shot-mutation convention
 * /tests/new's own metadata gate already uses.
 */
export function MultiSetPanel({ testBatchId, hasCompleteAnswerKey }: MultiSetPanelProps) {
  const [loading, setLoading] = useState(true);
  const [setLabels, setSetLabels] = useState<string[] | null>(null);
  const [setCount, setSetCount] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tests/${testBatchId}/answer-key`)
      .then((res) => res.json())
      .then((data: { setLabels?: string[] | null }) => {
        if (!cancelled) setSetLabels(data.setLabels ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [testBatchId]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/tests/${testBatchId}/generate-sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setCount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not generate sets.");
        return;
      }
      setSetLabels(data.setLabels);
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setGenerating(false);
    }
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

  return (
    <Card className="max-w-2xl border-slate-200">
      <CardContent className="space-y-4 p-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Multi-Set Papers</h2>
          <p className="mt-1 text-xs text-slate-500">
            Shuffle the answer key into 2-5 sets, each with its own question order — every set is scored automatically
            from the Set bubble a student fills on their OMR sheet, no manual re-marking needed.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <div>
            <Label htmlFor="setCount">Number of sets</Label>
            <Select
              id="setCount"
              value={String(setCount)}
              onChange={(e) => setSetCount(Number(e.target.value))}
              disabled={generating || !hasCompleteAnswerKey}
            >
              {SET_COUNT_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {count} sets
                </option>
              ))}
            </Select>
          </div>
          <Button type="button" onClick={handleGenerate} disabled={generating || !hasCompleteAnswerKey}>
            <Shuffle className="h-4 w-4" aria-hidden="true" />
            {generating ? "Generating…" : "Generate Multi-Set Papers"}
          </Button>
        </div>

        {!hasCompleteAnswerKey ? (
          <p className="text-xs text-slate-500">Save a complete master answer key above before generating sets.</p>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}

        {setLabels && setLabels.length > 0 ? (
          <div className="flex flex-col gap-2 rounded-md border border-slate-200 p-3">
            {setLabels.map((setCode) => (
              <div key={setCode} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-900">{setCode.replace("_", " ")}</span>
                <div className="flex gap-3">
                  <a
                    href={`/api/tests/${testBatchId}/sets/${setCode}/paper`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-indigo hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    Question Paper
                  </a>
                  <a
                    href={`/api/tests/${testBatchId}/sheets?set=${setCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-indigo hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    OMR Sheets
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
