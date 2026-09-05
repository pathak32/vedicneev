"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@vedicneev/ui";

import { ExamPlayer } from "@/components/exam/ExamPlayer";
import type { ExamSessionData } from "@/lib/exam/types";
import { useTestStore } from "@/lib/stores/useTestStore";

// Session-specific once loaded, same as app/exam/jnvst-live-mock/page.tsx —
// noindex is applied by the parent app/exam/live/layout.tsx.
export const dynamic = "force-dynamic";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; session: ExamSessionData; warnings: string[] };

/**
 * Board/class-agnostic live-mock launcher — generalizes
 * app/exam/jnvst-live-mock/page.tsx (which stays as-is for the original
 * JNVST Class 6 route) to any seeded ExamTemplate slug, e.g.
 * /exam/live/jnvst-class-9, /exam/live/aissee-class-9,
 * /exam/live/rms-class-9. Fetches a fresh paper from
 * /api/exams/generate-mock on mount and hands it straight to
 * <ExamPlayer>, which owns auth/onboarding/entitlement gating and calls
 * useTestStore.initSession itself once a student is active.
 */
export default function ExamLiveMockPage() {
  const params = useParams<{ templateSlug: string }>();
  const templateSlug = params.templateSlug;
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    // A reload (or any remount) of this route must resume the in-progress
    // attempt already sitting in useTestStore's sessionStorage instead of
    // always drawing a brand new random paper — otherwise every refresh
    // would silently discard the student's answers and timer under a
    // *different* examId, defeating useTestStore's whole persistence
    // design. Only fetch a fresh paper when there's no matching,
    // not-yet-submitted attempt for this exact template already resumable.
    const restored = useTestStore.getState();
    if (
      restored.session &&
      !restored.submitted &&
      restored.session.examId.startsWith(`${templateSlug}-live-mock-`)
    ) {
      setState({ status: "ready", session: restored.session, warnings: [] });
      return;
    }

    fetch(`/api/exams/generate-mock?slug=${encodeURIComponent(templateSlug)}`, { method: "POST" })
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
  }, [templateSlug]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-lg font-semibold text-foreground">Assembling your mock paper…</p>
        <p className="text-sm text-muted-foreground">Drawing a fresh question set from the practice bank.</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-16 text-center">
        <p className="text-lg font-semibold text-foreground">Couldn&apos;t start this mock</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <Button asChild variant="outline">
          <Link href="/exam/live">Back to mock test catalog</Link>
        </Button>
      </div>
    );
  }

  return <ExamPlayer session={state.session} practiceMode />;
}
