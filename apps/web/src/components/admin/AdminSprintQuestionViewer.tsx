"use client";

import { useState } from "react";
import { Badge, Card, CardContent, Switch, cn } from "@vedicneev/ui";
import { CheckCircle2 } from "lucide-react";

import type { SprintPoolQuestion } from "@/lib/admin/sprintQuestionPool";

export function AdminSprintQuestionViewer({ questions }: { questions: SprintPoolQuestion[] }) {
  const [verifiedById, setVerifiedById] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.verifiedAt !== null]))
  );
  const [pendingById, setPendingById] = useState<Record<string, boolean>>({});

  async function toggleVerified(question: SprintPoolQuestion, next: boolean) {
    setVerifiedById((prev) => ({ ...prev, [question.id]: next }));
    setPendingById((prev) => ({ ...prev, [question.id]: true }));
    try {
      const res = await fetch("/api/admin/sprint-questions/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: question.source, questionId: question.id, verified: next }),
      });
      if (!res.ok) throw new Error("Verify request failed.");
    } catch (err) {
      console.error("Failed to update verification status:", err);
      // Roll back — the server is the source of truth, not this toggle.
      setVerifiedById((prev) => ({ ...prev, [question.id]: !next }));
    } finally {
      setPendingById((prev) => ({ ...prev, [question.id]: false }));
    }
  }

  const verifiedCount = Object.values(verifiedById).filter(Boolean).length;

  const bySection = new Map<string, { sectionName: string; questions: SprintPoolQuestion[] }>();
  for (const q of questions) {
    const bucket = bySection.get(q.sectionKey) ?? { sectionName: q.sectionName, questions: [] };
    bucket.questions.push(q);
    bySection.set(q.sectionKey, bucket);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <p className="text-sm font-medium text-foreground">
          {verifiedCount} / {questions.length} verified
        </p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${questions.length > 0 ? (verifiedCount / questions.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {Array.from(bySection.entries()).map(([sectionKey, bucket]) => (
        <div key={sectionKey} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {bucket.sectionName} ({bucket.questions.length})
          </h2>
          {bucket.questions.map((q, i) => (
            <Card key={q.id} className={cn(verifiedById[q.id] && "border-emerald-500/40 bg-emerald-500/5")}>
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="flex-1 text-sm font-medium text-foreground">
                    Q{i + 1}. {q.content.en}
                  </p>
                  <Badge variant="outline">{q.difficulty}</Badge>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {q.options.map((o) => (
                    <li
                      key={o.key}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm",
                        o.isCorrect
                          ? "border-emerald-500/50 bg-emerald-500/10 font-medium text-emerald-700 dark:text-emerald-400"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {o.isCorrect ? <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5" /> : null}
                      {o.text.en}
                    </li>
                  ))}
                </ul>
                {q.explanation ? (
                  <p className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">{q.explanation.en}</p>
                ) : null}
                <label className="flex items-center gap-2 self-end text-sm font-medium text-foreground">
                  <Switch
                    checked={verifiedById[q.id] ?? false}
                    onCheckedChange={(checked) => toggleVerified(q, checked)}
                    disabled={pendingById[q.id]}
                  />
                  Verified by Team
                </label>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
