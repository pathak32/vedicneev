"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@vedicneev/ui";

import { ExamPlayer } from "@/components/exam/ExamPlayer";
import type { ExamSessionData } from "@/lib/exam/types";
import { useTestStore } from "@/lib/stores/useTestStore";

// This route calls the generate-mock API on mount and is entirely
// session-specific once loaded — same noindex reasoning as the rest of
// /exam/* (see app/exam/[examId]/layout.tsx), just declared directly here
// since this route is a static sibling of [examId], not a child of it.
export const dynamic = "force-dynamic";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; session: ExamSessionData; warnings: string[] };

/**
 * Instant-launch entry point for a freshly assembled JNVST mock — fetches
 * a new paper from /api/exams/jnvst/generate-mock on mount and hands it
 * straight to <ExamPlayer>, which owns auth/onboarding/entitlement gating
 * and calls useTestStore.initSession itself once a student is active. No
 * static examId lookup here (unlike /exam/[examId]), since every visit
 * assembles a genuinely new paper rather than replaying a fixed one.
 */
export default function JnvstLiveMockPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

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
      setState({ status: "ready", session: restored.session, warnings: [] });
      return;
    }

    fetch("/api/exams/jnvst/generate-mock", { method: "POST" })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: "error", message: data.error ?? "Could not assemble a mock paper." });
          return;
        }
        setState({ status: "ready", session: data.session, warnings: data.warnings ?? [] });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", message: "Network error — please try again." });
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  return <ExamPlayer session={state.session} practiceMode />;
}
