"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@vedicneev/ui";
import { BookOpenCheck, Clock, ListChecks, Rocket } from "lucide-react";

// Type-only import — erased at compile time, so this never pulls
// jnvstMockService.ts's Prisma/@vedicneev/db dependency into the client
// bundle (see the bundle-size fix on PublishBatchControl.tsx for why that
// matters: a runtime import here would ship the whole Prisma client to
// the browser).
import type { JnvstBlueprint } from "@/lib/exam/jnvstMockService";

type BlueprintState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; blueprint: JnvstBlueprint };

/**
 * The homepage's dedicated entry point for the JNVST Phase 1 engine — a
 * prominent launch CTA plus a live blueprint summary, both pointing at
 * /exam/jnvst-live-mock and /api/exams/jnvst/blueprint respectively
 * (apps/web/src/lib/exam/jnvstMockService.ts). Supersedes the earlier,
 * easy-to-miss "Generate a fresh JNVST mock" outline button buried in the
 * practice-engine card.
 */
export function JnvstLiveMockPromo() {
  const [state, setState] = useState<BlueprintState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/exams/jnvst/blueprint")
      .then(async (res) => {
        if (!res.ok) throw new Error("blueprint fetch failed");
        const blueprint = (await res.json()) as JnvstBlueprint;
        if (!cancelled) setState({ status: "ready", blueprint });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="w-full max-w-4xl px-4 md:px-0">
      <div className="grid grid-cols-1 gap-4 rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 md:grid-cols-2 md:p-6">
        <Card className="flex flex-col justify-between border-primary/30 shadow-sm">
          <CardHeader>
            <Badge variant="outline" className="w-fit gap-1.5 border-primary/40 text-xs font-medium text-primary">
              <Rocket className="h-3 w-3" />
              Phase 1 · JNVST Class 6
            </Badge>
            <CardTitle className="text-xl">JNVST Class 6 Live Mock</CardTitle>
            <CardDescription>
              A freshly assembled, full-length paper drawn from our growing Previous-Year-Question practice bank —
              a new mix of questions every time, not a fixed static demo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full">
              <Link href="/exam/jnvst-live-mock">
                <Rocket className="h-4 w-4" />
                Launch JNVST Class 6 Live Mock
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-primary" />
              Exam Blueprint
            </CardTitle>
            <CardDescription>What this paper covers, exactly as JNVST Class 6 is structured.</CardDescription>
          </CardHeader>
          <CardContent>
            {state.status === "loading" ? (
              <div className="flex flex-col gap-2" aria-live="polite" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-5 w-full animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : state.status === "error" ? (
              <p className="text-sm text-muted-foreground">
                80 Questions · 100 Marks · 120 Minutes · No negative marking.
              </p>
            ) : (
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <BookOpenCheck className="h-3.5 w-3.5 text-primary" />
                    {state.blueprint.totalQuestions} Questions
                  </span>
                  <span className="font-medium">{state.blueprint.totalMarks} Marks</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {state.blueprint.durationMinutes} Minutes
                  </span>
                </div>
                <ul className="flex flex-col gap-1 text-muted-foreground">
                  {state.blueprint.sections.map((section) => (
                    <li key={section.key} className="flex items-center justify-between">
                      <span>{section.name.en}</span>
                      <span className="font-medium text-foreground">{section.questionCount} Q</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">
                  {state.blueprint.negativeMarkingRatio === 0
                    ? "No negative marking."
                    : `${state.blueprint.negativeMarkingRatio} marks deducted per wrong answer.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
