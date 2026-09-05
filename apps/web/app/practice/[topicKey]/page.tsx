"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@vedicneev/ui";

import { ExamPlayer } from "@/components/exam/ExamPlayer";
import type { ExamSessionData } from "@/lib/exam/types";
import { useTestStore } from "@/lib/stores/useTestStore";

// Session-specific once loaded, same as app/exam/live/[templateSlug]/page.tsx —
// noindex is applied by the parent app/practice/[topicKey]/layout.tsx.
export const dynamic = "force-dynamic";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; session: ExamSessionData };

/**
 * Single-topic drill launcher — the topic-practice counterpart to
 * app/exam/live/[templateSlug]/page.tsx. Fetches a fresh session from
 * /api/practice/[topicKey] on mount (see
 * apps/web/src/lib/exam/topicPracticeService.ts for the real logic) and
 * hands it straight to <ExamPlayer>, which owns auth/onboarding/entitlement
 * gating and calls useTestStore.initSession itself once a student is
 * active. Every question in the topic is included, untimed, no negative
 * marking — see topicPracticeService.ts's ExamSessionData assembly.
 */
export default function TopicPracticePage() {
  const params = useParams<{ topicKey: string }>();
  const topicKey = params.topicKey;
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    // A reload (or any remount) of this route must resume the in-progress
    // attempt already sitting in useTestStore's sessionStorage instead of
    // always drawing a brand new session — same reasoning as the live-mock
    // launcher this mirrors. Only fetch a fresh session when there's no
    // matching, not-yet-submitted attempt for this exact topic already
    // resumable.
    const restored = useTestStore.getState();
    if (
      restored.session &&
      !restored.submitted &&
      restored.session.examId.startsWith(`topic-practice-${topicKey}-`)
    ) {
      setState({ status: "ready", session: restored.session });
      return;
    }

    fetch(`/api/practice/${encodeURIComponent(topicKey)}`, { method: "POST" })
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
  }, [topicKey]);

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
