"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { CheckCircle2, ScanLine, XCircle } from "lucide-react";

import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";

// Renders entirely from a client-side fetch keyed by the signed-in
// session — force dynamic so the build never prerenders a signed-out
// shell, matching every other dashboard page's convention.
export const dynamic = "force-dynamic";

interface ScanProduct {
  id: string;
  title: string;
}

interface EvaluatedResponse {
  questionNumber: number;
  outcome: "CORRECT" | "INCORRECT" | "UNATTEMPTED" | "INVALID_MULTIPLE_FILL";
  selectedOption?: string;
  correctOption: string;
  marksAwarded: number;
}

type ScanResult =
  | { status: "UNREADABLE"; reason: string }
  | {
      status: "SCORED";
      totalMarks: number;
      maxMarks: number;
      correctCount: number;
      incorrectCount: number;
      unattemptedCount: number;
      invalidCount: number;
      breakdown: EvaluatedResponse[];
    };

/**
 * The login-gated scan-and-score page for the sample-paper-book product —
 * Phase 3's dropdown-first version (see this feature's own design notes:
 * a printed per-set code was deliberately deferred, shipping this simpler
 * picker first). Lists only this account's own PAID purchases
 * (/api/sample-book/purchases), then posts the chosen set + a photo to
 * /api/sample-book/scan, which re-checks entitlement server-side before
 * grading anything.
 */
function ScanPageContent() {
  const { hasHydrated, isAuthenticated } = useActiveStudent();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ScanProduct[] | null>(null);
  const [productId, setProductId] = useState<string>(searchParams.get("productId") ?? "");
  const [setNumber, setSetNumber] = useState<string>("1");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/sample-book/purchases")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products ?? []);
        if (!productId && data.products?.length) setProductId(data.products[0].id);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !file) return;

    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("setNumber", setNumber);
      formData.append("file", file);

      const res = await fetch("/api/sample-book/scan", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok && res.status !== 422) {
        setError(data.error ?? "Something went wrong — please try again.");
        return;
      }
      if (data.status === "UNREADABLE") {
        setResult({ status: "UNREADABLE", reason: data.reason });
        return;
      }
      setResult({
        status: "SCORED",
        totalMarks: data.totalMarks,
        maxMarks: data.maxMarks,
        correctCount: data.correctCount,
        incorrectCount: data.incorrectCount,
        unattemptedCount: data.unattemptedCount,
        invalidCount: data.invalidCount,
        breakdown: data.breakdown,
      });
    } catch {
      setError("Could not reach the server — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hasHydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Scan & Score</h1>
        <p className="text-sm text-muted-foreground">Log in with the WhatsApp number you purchased with to scan a sheet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 pb-16">
      <div className="flex items-center gap-2">
        <ScanLine className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Scan & Score</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Fill a sample paper&apos;s OMR sheet, photograph it flat in good light with all 4 corner squares visible, then upload it here for an
        instant score — free for buyers of this book.
      </p>

      {products !== null && products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No scannable sample-paper books on your account yet. Buy one from the Store first.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Book</span>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              required
            >
              {products === null ? <option>Loading…</option> : null}
              {products?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Set number</span>
            <input
              type="number"
              min={1}
              max={20}
              value={setNumber}
              onChange={(e) => setSetNumber(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Photo of your filled OMR sheet</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
              required
            />
          </label>

          <Button type="submit" disabled={submitting || !productId || !file}>
            {submitting ? "Scoring…" : "Get my score"}
          </Button>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </form>
      )}

      {result?.status === "UNREADABLE" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <XCircle className="h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold text-foreground">Could not read this sheet</p>
            <p className="text-sm text-muted-foreground">{result.reason}</p>
          </div>
        </div>
      ) : null}

      {result?.status === "SCORED" ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {result.totalMarks} / {result.maxMarks}
              </p>
              <p className="text-xs text-muted-foreground">
                {result.correctCount} correct · {result.incorrectCount} incorrect · {result.unattemptedCount} unattempted
                {result.invalidCount > 0 ? ` · ${result.invalidCount} double-filled (voided)` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {result.breakdown.map((r) => (
              <span
                key={r.questionNumber}
                title={`Q${r.questionNumber}: ${r.selectedOption ?? "—"} (correct: ${r.correctOption})`}
                className={
                  "flex h-7 w-7 items-center justify-center rounded text-[11px] font-medium " +
                  (r.outcome === "CORRECT"
                    ? "bg-green-100 text-green-700"
                    : r.outcome === "UNATTEMPTED"
                      ? "bg-muted text-muted-foreground"
                      : "bg-destructive/10 text-destructive")
                }
              >
                {r.questionNumber}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={null}>
      <ScanPageContent />
    </Suspense>
  );
}
