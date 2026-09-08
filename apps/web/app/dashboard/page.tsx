"use client";

import { useMemo } from "react";
import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { Button } from "@vedicneev/ui";

import { ExamSummaryCard } from "@/components/dashboard/ExamSummaryCard";
import { MistakeVaultPreviewWidget } from "@/components/dashboard/MistakeVaultPreviewWidget";
import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectMistakeLogForStudent, selectStudentTestHistory, useAuthStore } from "@/lib/auth/useAuthStore";

// Renders entirely from client-side store state — force dynamic so the
// build never attempts to prerender a signed-out shell.
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { hasHydrated, isAuthenticated, students, activeStudent } = useActiveStudent();
  const history = useAuthStore((s) => (activeStudent ? selectStudentTestHistory(s, activeStudent.id) : []));
  const mistakes = useAuthStore((s) => (activeStudent ? selectMistakeLogForStudent(s, activeStudent.id) : []));

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => b.submittedAt - a.submittedAt),
    [history]
  );

  const accuracyTrendById = useMemo(() => {
    const chronological = [...history].sort((a, b) => a.submittedAt - b.submittedAt);
    const map = new Map<string, number | null>();
    chronological.forEach((entry, i) => {
      const previous = chronological[i - 1];
      map.set(entry.id, previous ? entry.accuracyPercent - previous.accuracyPercent : null);
    });
    return map;
  }, [history]);

  if (!hasHydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Student Dashboard</h1>
        <p className="text-sm text-muted-foreground">Sign in to see your exam history and Mistake Vault.</p>
      </div>
    );
  }

  if (students.length === 0 || !activeStudent) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Student Dashboard</h1>
        <p className="text-sm text-muted-foreground">Add a student profile to start tracking progress here.</p>
        <Button asChild>
          <Link href="/onboarding">Add a Student</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {activeStudent.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            {activeStudent.targetExam} · Class {activeStudent.targetClass}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/exam/live">Live Mocks (Class 6 &amp; 9)</Link>
          </Button>
          <Button asChild>
            <Link href="/exam/demo-jnvst">
              <NotebookPen className="h-4 w-4" />
              Take a Mock Test
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Recent Exam Summaries</h2>
        {sortedHistory.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No mock tests taken yet. Start your first one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedHistory.map((entry) => (
              <ExamSummaryCard
                key={entry.id}
                entry={entry}
                accuracyTrend={accuracyTrendById.get(entry.id) ?? null}
              />
            ))}
          </div>
        )}
      </div>

      <MistakeVaultPreviewWidget mistakes={mistakes} />
    </div>
  );
}
