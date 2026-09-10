"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent, cn } from "@vedicneev/ui";

import { ExamPlayer } from "@/components/exam/ExamPlayer";
import { localize } from "@/lib/exam/localize";
import type { JnvstBlueprint } from "@/lib/exam/jnvstMockService";
import type { ExamQuestion, ExamSessionData } from "@/lib/exam/types";
import { useLanguageStore } from "@/lib/hooks/useLanguageStore";
import { useTestStore } from "@/lib/stores/useTestStore";

// This route calls the generate-mock API on mount and is entirely
// session-specific once loaded — same noindex reasoning as the rest of
// /exam/* (see app/exam/[examId]/layout.tsx), just declared directly here
// since this route is a static sibling of [examId], not a child of it.
export const dynamic = "force-dynamic";

type LoadState =
  | { status: "intro" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; session: ExamSessionData; allowAnonymous: boolean };

/** One clickable sample question, answer/explanation revealed on click — same pattern as /practice/[topicKey]'s SampleQuestionCard. */
function SampleQuestionCard({ question }: { question: ExamQuestion }) {
  const language = useLanguageStore((s) => s.languageCode);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
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

/**
 * Instant-launch entry point for a freshly assembled JNVST mock. Now opens
 * on an intro screen — the blueprint (via /api/exams/jnvst/blueprint) plus
 * up to 3 real sample questions (via /api/exams/jnvst/samples), no sign-in
 * required to see either — with two explicit CTAs: "Sign in first" (the
 * original flow, unchanged: fetches the mock and hands it to <ExamPlayer>,
 * which still gates on isAuthenticated) and "Sign in later" (same fetch,
 * but <ExamPlayer allowAnonymous> skips that gate and runs the attempt
 * immediately; sign-in is deferred to app/exam/[examId]/results, which
 * prompts for it before revealing the score).
 */
export default function JnvstLiveMockPage() {
  const [state, setState] = useState<LoadState>({ status: "intro" });
  const [blueprint, setBlueprint] = useState<JnvstBlueprint | null>(null);
  const [samples, setSamples] = useState<ExamQuestion[]>([]);
  const language = useLanguageStore((s) => s.languageCode);

  useEffect(() => {
    // Resume an in-progress attempt from useTestStore's sessionStorage on
    // reload instead of always drawing a brand new random paper under a
    // *different* examId — see the identical fix/comment in
    // app/exam/live/[templateSlug]/page.tsx, which this route's pattern
    // was generalized from (and shared this bug before this fix).
    const restored = useTestStore.getState();
    if (
      restored.session &&
      !restored.submitted &&
      restored.session.examId.startsWith("jnvst-live-mock-")
    ) {
      setState({ status: "ready", session: restored.session, allowAnonymous: false });
    }
  }, []);

  useEffect(() => {
    if (state.status !== "intro") return;
    let cancelled = false;
    Promise.all([
      fetch("/api/exams/jnvst/blueprint").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/exams/jnvst/samples").then((res) => (res.ok ? res.json() : { questions: [] })),
    ]).then(([blueprintData, samplesData]) => {
      if (cancelled) return;
      if (blueprintData && !("error" in blueprintData)) setBlueprint(blueprintData);
      setSamples(samplesData.questions ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [state.status]);

  function startMock(allowAnonymous: boolean) {
    let cancelled = false;
    setState({ status: "loading" });

    fetch("/api/exams/jnvst/generate-mock", { method: "POST" })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: "error", message: data.error ?? "Could not assemble a mock paper." });
          return;
        }
        setState({ status: "ready", session: data.session, allowAnonymous });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", message: "Network error — please try again." });
      });

    return () => {
      cancelled = true;
    };
  }

  if (state.status === "intro") {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-8 p-4 pb-16 pt-12 md:p-8">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">JNVST Class 6 Mock Exam Series</p>
          <p className="text-sm text-muted-foreground">
            A full-length paper matching the real exam blueprint — see what it covers before you start.
          </p>
        </div>

        {blueprint ? (
          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{blueprint.totalQuestions} questions</Badge>
                <Badge variant="secondary">{blueprint.totalMarks} marks</Badge>
                <Badge variant="secondary">{blueprint.durationMinutes} minutes</Badge>
              </div>
              <div className="flex flex-col gap-1">
                {blueprint.sections.map((section) => (
                  <div key={section.key} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{localize(section.name, language)}</span>
                    <span className="text-muted-foreground">{section.questionCount} questions</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {samples.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Try a few first — no sign-in needed
            </p>
            {samples.map((q) => (
              <SampleQuestionCard key={q.id} question={q} />
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <Button type="button" onClick={() => startMock(false)}>
            Sign in first
          </Button>
          <Button type="button" variant="outline" onClick={() => startMock(true)}>
            Sign in later — start now
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Either way, your diagnostic report is saved once you sign in.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-lg font-semibold text-foreground">Assembling your JNVST mock paper…</p>
        <p className="text-sm text-muted-foreground">Drawing a fresh 80-question set from the practice bank.</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-16 text-center">
        <p className="text-lg font-semibold text-foreground">Couldn&apos;t start this mock</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <Button asChild variant="outline">
          <Link href="/exam/demo-jnvst">Try the demo mock instead</Link>
        </Button>
      </div>
    );
  }

  return <ExamPlayer session={state.session} practiceMode allowAnonymous={state.allowAnonymous} />;
}
