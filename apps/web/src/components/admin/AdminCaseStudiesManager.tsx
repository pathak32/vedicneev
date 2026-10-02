"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent } from "@vedicneev/ui";
import type { PilotFeedback, PilotFeedbackStatus } from "@vedicneev/db";
import { Loader2 } from "lucide-react";

const STATUS_LABEL: Record<PilotFeedbackStatus, string> = {
  REQUESTED: "Waiting for reply",
  RESPONDED: "Needs review",
  APPROVED: "Approved",
  DECLINED: "Declined",
};

/** Splits an answer into sentences so a featured quote can be picked verbatim with a click. */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function Answer({
  label,
  text,
  selected,
  canPick,
  onPick,
}: {
  label: string;
  text: string | null;
  selected: string | null;
  canPick: boolean;
  onPick: (sentence: string) => void;
}) {
  if (!text) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">
        {sentences(text).map((s, i) => {
          const isSelected = selected === s;
          return canPick ? (
            <button
              key={i}
              type="button"
              onClick={() => onPick(s)}
              className={`mr-1 rounded px-0.5 text-left hover:bg-primary/10 ${isSelected ? "bg-primary/20 font-medium" : ""}`}
            >
              {s}
            </button>
          ) : (
            <span key={i} className="mr-1">
              {s}
            </span>
          );
        })}
      </p>
    </div>
  );
}

export function AdminCaseStudiesManager({ initialItems }: { initialItems: PilotFeedback[] }) {
  const [items, setItems] = useState<PilotFeedback[]>(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftedId, setDraftedId] = useState<string | null>(null);

  function replace(updated: PilotFeedback) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  async function patch(id: string, data: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/case-studies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save.");
      replace(json.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusyId(null);
    }
  }

  async function createDraft(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/case-studies/${id}/draft`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not create the draft.");
      setDraftedId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the draft.");
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No feedback requests yet. Open a lead in <Link href="/admin/leads" className="text-primary underline">/admin/leads</Link>{" "}
        and use &quot;Request feedback&quot; once they have tried a batch.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {items.map((item) => {
        const busy = busyId === item.id;
        const canPick = item.status === "RESPONDED" || item.status === "APPROVED";

        return (
          <Card key={item.id}>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{item.instituteName}</p>
                <Badge variant={item.status === "APPROVED" ? "default" : "outline"} className={item.status === "APPROVED" ? "bg-emerald-600 text-white" : undefined}>
                  {STATUS_LABEL[item.status]}
                </Badge>
                {item.status !== "REQUESTED" ? (
                  <>
                    <Badge variant={item.consentQuote ? "secondary" : "destructive"}>
                      {item.consentQuote ? "OK to quote" : "Do not quote"}
                    </Badge>
                    {item.consentQuote ? (
                      <Badge variant="outline">{item.consentName ? "OK to name" : "Keep anonymous"}</Badge>
                    ) : null}
                    {item.wouldUseAgain ? <Badge variant="outline">Use again: {item.wouldUseAgain}</Badge> : null}
                  </>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                {item.contactName}
                {item.state ? `, ${item.state}` : ""}
                {item.respondedAt
                  ? ` · replied ${new Date(item.respondedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                  : ""}
              </p>

              {item.status === "REQUESTED" ? (
                <p className="text-sm text-muted-foreground">
                  Link sent, no answer yet. Follow up from the lead&apos;s card in /admin/leads.
                </p>
              ) : (
                <div className="flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-3">
                  <Answer label="How they checked sheets before" text={item.answerBefore} selected={item.publishQuote} canPick={canPick && item.consentQuote} onPick={(s) => patch(item.id, { publishQuote: s })} />
                  <Answer label="What they noticed" text={item.answerExperience} selected={item.publishQuote} canPick={canPick && item.consentQuote} onPick={(s) => patch(item.id, { publishQuote: s })} />
                  <Answer label="What was missing" text={item.answerMissing} selected={item.publishQuote} canPick={canPick && item.consentQuote} onPick={(s) => patch(item.id, { publishQuote: s })} />
                  {item.consentQuote ? (
                    <p className="text-xs text-muted-foreground">
                      {item.publishQuote ? (
                        <>Featured quote: &quot;{item.publishQuote}&quot;</>
                      ) : (
                        "Click a sentence above to feature it. It is copied exactly as they wrote it."
                      )}
                    </p>
                  ) : (
                    <p className="text-xs text-destructive">
                      No consent to quote. Use this only as private feedback to improve the product.
                    </p>
                  )}
                </div>
              )}

              {item.status === "RESPONDED" || item.status === "APPROVED" ? (
                <div className="flex flex-wrap gap-2">
                  {item.status === "RESPONDED" ? (
                    <>
                      <Button type="button" size="sm" disabled={busy || !item.consentQuote || !item.publishQuote} onClick={() => patch(item.id, { status: "APPROVED" })}>
                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        Approve for publishing
                      </Button>
                      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => patch(item.id, { status: "DECLINED" })}>
                        Keep private
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button type="button" size="sm" disabled={busy || draftedId === item.id} onClick={() => createDraft(item.id)}>
                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        Create LinkedIn draft
                      </Button>
                      {draftedId === item.id ? (
                        <Link href="/admin/content" className="self-center text-sm text-primary underline">
                          Draft created. Open Content Library
                        </Link>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
