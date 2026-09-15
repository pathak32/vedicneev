"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { Loader2 } from "lucide-react";

import { VirtualKeyboard } from "./VirtualKeyboard";

export interface TypingArenaProps {
  examSlug: string;
  attemptEndpoint: string;
  passageId: string;
  passageText: string;
  durationSeconds: number;
  backspacePolicy: "DISABLED" | "ENABLED_WITH_PENALTY";
  layout: "QWERTY" | "INSCRIPT" | "REMINGTON";
}

type CharState = "correct" | "incorrect" | "pending";

function classifyChar(target: string, typed: string | undefined): CharState {
  if (typed === undefined) return "pending";
  return typed === target ? "correct" : "incorrect";
}

/**
 * The typing simulation itself: renders the passage as per-character spans
 * colored against the live typed value, runs the countdown, enforces the
 * exam's backspace policy, and — on time-up or manual submit — POSTs the
 * final typed text + elapsed time to attemptEndpoint. Grading itself
 * (Gross/Net speed, mistakes) happens server-side via
 * evaluateTypingAttempt — this component never computes a score, only
 * captures the raw attempt.
 */
export function TypingArena({
  examSlug,
  attemptEndpoint,
  passageId,
  passageText,
  durationSeconds,
  backspacePolicy,
  layout,
}: TypingArenaProps) {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const submittedRef = useRef(false);

  const submit = useCallback(
    async (finalTyped: string) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      setError(null);

      const timeTakenSeconds = startedAt ? (Date.now() - startedAt) / 1000 : durationSeconds;

      try {
        const res = await fetch(attemptEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            passageId,
            typedText: finalTyped,
            timeTakenSeconds,
            backspaceCount,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not submit your attempt. Please try again.");
          submittedRef.current = false;
          setSubmitting(false);
          return;
        }
        router.push(`/results/${data.attemptId}`);
      } catch {
        setError("Network error while submitting. Please try again.");
        submittedRef.current = false;
        setSubmitting(false);
      }
    },
    [attemptEndpoint, backspaceCount, durationSeconds, passageId, router, startedAt]
  );

  useEffect(() => {
    if (startedAt === null) return;
    if (secondsLeft <= 0) {
      submit(typed);
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, secondsLeft]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (startedAt === null) setStartedAt(Date.now());
    setTyped(e.target.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (backspacePolicy === "DISABLED" && e.key === "Backspace") {
      e.preventDefault();
      return;
    }
    if (e.key === "Backspace") setBackspaceCount((c) => c + 1);
  }

  const chars = useMemo(() => Array.from(passageText), [passageText]);
  const typedChars = useMemo(() => Array.from(typed), [typed]);
  const nextChar = typedChars.length < chars.length ? chars[typedChars.length]! : null;
  const progressPercent = Math.min(100, Math.round((typedChars.length / Math.max(chars.length, 1)) * 100));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8">
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">Exam: {examSlug}</span>
        <span
          className={`text-lg font-bold tabular-nums ${secondsLeft <= 30 ? "text-destructive" : "text-foreground"}`}
        >
          {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:{String(secondsLeft % 60).padStart(2, "0")}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
      </div>

      <div
        className="select-none rounded-lg border border-border bg-card p-5 text-lg leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {chars.map((char, i) => {
          const state = classifyChar(char, typedChars[i]);
          const className =
            state === "correct" ? "type-char-correct" : state === "incorrect" ? "type-char-incorrect" : "type-char-pending";
          return (
            <span key={i} className={i === typedChars.length ? `${className} type-char-cursor` : className}>
              {char}
            </span>
          );
        })}
      </div>

      <textarea
        ref={inputRef}
        autoFocus
        value={typed}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={submitting || secondsLeft <= 0}
        rows={3}
        className="w-full rounded-lg border border-input bg-background p-3 font-mono text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Start typing here — the timer starts on your first keystroke."
        aria-label="Typing input"
      />

      {backspacePolicy === "DISABLED" ? (
        <p className="text-sm text-muted-foreground">Backspace is disabled for this exam, as per the real test rules.</p>
      ) : (
        <p className="text-sm text-muted-foreground">Backspaces used so far: {backspaceCount}</p>
      )}

      {layout === "QWERTY" ? <VirtualKeyboard nextChar={nextChar} /> : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="button" size="lg" disabled={submitting} onClick={() => submit(typed)} className="gap-2">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Submit Test
      </Button>
    </div>
  );
}
