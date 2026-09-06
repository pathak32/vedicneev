"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { localize } from "@/lib/exam/localize";
import type { PracticeTopicSummary } from "@/lib/exam/topicPracticeService";
import { useLanguageStore } from "@/lib/hooks/useLanguageStore";

// Session-specific once the student's target exam is known, same as
// app/practice/[topicKey] — noindex is applied by this route's own layout.
export const dynamic = "force-dynamic";

type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; topics: PracticeTopicSummary[] };

/**
 * Topic-practice catalog — the missing discovery step ahead of
 * /practice/[topicKey], which until now could only be reached by typing
 * its URL directly. Fetches /api/practice, passing the active student's
 * own targetExam so exam-restricted topics (e.g. Sainik School GK, RMS
 * Current Affairs) are filtered to the right audience — see
 * apps/web/src/lib/exam/topicPracticeService.ts's listPracticeTopics for
 * the real filtering logic. A signed-out visitor (or a student with no
 * targetExam set) sees only exam-agnostic topics, never a restricted one.
 */
export default function PracticeCatalogPage() {
  const { activeStudent } = useActiveStudent();
  const language = useLanguageStore((s) => s.languageCode);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    const query = activeStudent?.targetExam ? `?targetExam=${encodeURIComponent(activeStudent.targetExam)}` : "";
    fetch(`/api/practice${query}`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: "error", message: data.error ?? "Could not load the practice catalog." });
          return;
        }
        setState({ status: "ready", topics: data.topics });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", message: "Network error — please try again." });
      });
    return () => {
      cancelled = true;
    };
  }, [activeStudent?.targetExam]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-lg font-semibold text-foreground">Loading the practice catalog…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-16 text-center">
        <p className="text-lg font-semibold text-foreground">Couldn&apos;t load the practice catalog</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  const bySection = new Map<string, { name: string; topics: PracticeTopicSummary[] }>();
  for (const topic of state.topics) {
    const bucket = bySection.get(topic.sectionKey) ?? { name: localize(topic.sectionName, language), topics: [] };
    bucket.topics.push(topic);
    bySection.set(topic.sectionKey, bucket);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-4 pb-16 md:p-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">Practice by Topic</h1>
        <p className="text-sm text-muted-foreground">
          {activeStudent
            ? `Showing topics for ${activeStudent.targetExam}, plus every topic open to all students.`
            : "Sign in and set a target exam to see exam-specific topics too."}
        </p>
      </div>

      {state.topics.length === 0 ? (
        <p className="text-sm text-muted-foreground">No practice topics are available yet.</p>
      ) : (
        Array.from(bySection.entries()).map(([sectionKey, bucket]) => (
          <div key={sectionKey} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{bucket.name}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {bucket.topics.map((topic) => (
                <Card key={topic.key}>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                    <CardTitle className="text-base">{localize(topic.name, language)}</CardTitle>
                    {topic.targetExam ? <Badge variant="secondary">{topic.targetExam} only</Badge> : null}
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">{topic.questionCount} questions</span>
                    <Button asChild size="sm">
                      <Link href={`/practice/${topic.key}`}>Practice</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
