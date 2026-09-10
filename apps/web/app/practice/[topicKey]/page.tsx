"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Button, Card, CardContent, cn, Switch } from "@vedicneev/ui";

import { ExamPlayer } from "@/components/exam/ExamPlayer";
import { localize } from "@/lib/exam/localize";
import type { ExamQuestion, ExamSessionData } from "@/lib/exam/types";
import { useLanguageStore } from "@/lib/hooks/useLanguageStore";
import { useTestStore } from "@/lib/stores/useTestStore";

/**
 * One clickable sample question, answer/explanation revealed on click —
 * the pre-auth preview shown above the Timed/Untimed picker. Practice
 * only: no scoring, no submission, nothing persisted.
 */
function SampleQuestionCard({ question }: { question: ExamQuestion }) {
  const language = useLanguageStore((s) => s.languageCode);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="text-[10px] uppercase">
            {question.difficulty}
          </Badge>
        </div>
        <p className="text-sm font-medium text-foreground">{localize(question.content, language)}</p>
        <div className="flex flex-col gap-2">
          {question.options.map((option) => {
            const isCorrect = option.id === question.correctOption;
            const isSelected = option.id === selected;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelected(option.id)}
                disabled={selected !== null}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                  selected === null && "border-border hover:border-primary/50",
                  selected !== null && isCorrect && "border-emerald-500 bg-emerald-500/10",
                  selected !== null && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                  selected !== null && !isSelected && !isCorrect && "border-border opacity-60"
                )}
              >
                {option.text ? localize(option.text, language) : option.id}
              </button>
            );
          })}
        </div>
        {selected && question.explanation ? (
          <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            {localize(question.explanation, language)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

// Session-specific once loaded, same as app/exam/live/[templateSlug]/page.tsx —
// noindex is applied by the parent app/practice/[topicKey]/layout.tsx.
export const dynamic = "force-dynamic";

type LoadState =
  | { status: "choosing" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; session: ExamSessionData };

/** "figure_matching" -> "Figure Matching" — just for the pre-start screen, before the real bilingual Topic.name has been fetched. */
function readableTopicLabel(topicKey: string): string {
  return topicKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Single-topic drill launcher — the topic-practice counterpart to
 * app/exam/live/[templateSlug]/page.tsx. Shows a Timed/Untimed choice
 * before starting (the choice is baked into the session for its whole
 * duration, not something a student can flip mid-attempt to dodge an
 * imminent auto-submit), then fetches the session from
 * /api/practice/[topicKey] (see apps/web/src/lib/exam/topicPracticeService.ts
 * for the real logic) and hands it to <ExamPlayer>, which owns
 * auth/onboarding/entitlement gating and calls useTestStore.initSession
 * itself once a student is active.
 */
export default function TopicPracticePage() {
  const params = useParams<{ topicKey: string }>();
  const topicKey = params.topicKey;
  const [state, setState] = useState<LoadState>({ status: "choosing" });
  const [untimed, setUntimed] = useState(true);
  const [samples, setSamples] = useState<ExamQuestion[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/practice/${encodeURIComponent(topicKey)}`)
      .then((res) => (res.ok ? res.json() : { questions: [] }))
      .then((data) => {
        if (!cancelled) setSamples(data.questions ?? []);
      })
      .catch(() => {
        if (!cancelled) setSamples([]);
      });
    return () => {
      cancelled = true;
    };
  }, [topicKey]);

  useEffect(() => {
    // A reload (or any remount) of this route must resume the in-progress
    // attempt already sitting in useTestStore's sessionStorage instead of
    // sending the student back through the Timed/Untimed picker — same
    // reasoning as the live-mock launcher this mirrors. Only resumable when
    // it's for this exact topic and still in progress; the picker is
    // skipped entirely in that case, since the choice was already made.
    const restored = useTestStore.getState();
    if (
      restored.session &&
      !restored.submitted &&
      restored.session.examId.startsWith(`topic-practice-${topicKey}-`)
    ) {
      setState({ status: "ready", session: restored.session });
    }
  }, [topicKey]);

  function startPractice() {
    let cancelled = false;
    setState({ status: "loading" });

    fetch(`/api/practice/${encodeURIComponent(topicKey)}?untimed=${untimed}`, { method: "POST" })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: "error", message: data.error ?? "Could not start this practice session." });
          return;
        }
        setState({ status: "ready", session: data.session });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", message: "Network error — please try again." });
      });

    return () => {
      cancelled = true;
    };
  }

  if (state.status === "choosing") {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-8 p-8 pt-16">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">{readableTopicLabel(topicKey)} Practice</p>
          <p className="text-sm text-muted-foreground">Choose how you&apos;d like to practice.</p>
        </div>

        {samples && samples.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Try a few first — no sign-in needed
            </p>
            {samples.map((q) => (
              <SampleQuestionCard key={q.id} question={q} />
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-6 text-center">
          <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 p-4 text-left">
            <span>
              <span className="block text-sm font-medium text-foreground">
                {untimed ? "Untimed" : "Timed"}
              </span>
              <span className="block text-xs text-muted-foreground">
                {untimed
                  ? "No clock — work through every question at your own pace."
                  : "A real countdown, like the actual exam."}
              </span>
            </span>
            <Switch checked={!untimed} onCheckedChange={(checked) => setUntimed(!checked)} aria-label="Toggle timed mode" />
          </label>
          <Button type="button" onClick={startPractice}>
            Start Practice
          </Button>
        </div>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-lg font-semibold text-foreground">Loading your practice set…</p>
        <p className="text-sm text-muted-foreground">Drawing questions from the topic bank.</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-16 text-center">
        <p className="text-lg font-semibold text-foreground">Couldn&apos;t start this practice session</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return <ExamPlayer session={state.session} practiceMode />;
}
