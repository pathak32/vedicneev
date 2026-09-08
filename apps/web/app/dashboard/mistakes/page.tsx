"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Switch, cn } from "@vedicneev/ui";
import { checkMistakeVaultAccess } from "@vedicneev/engine";
import { Lock, Sparkles } from "lucide-react";

import { MistakeDetailCard } from "@/components/dashboard/mistakes/MistakeDetailCard";
import { PaywallModal } from "@/components/pricing/PaywallModal";
import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import type { MistakeTagCategory } from "@/lib/auth/types";
import { selectActiveParent, selectMistakeLogForStudent, useAuthStore } from "@/lib/auth/useAuthStore";
import { MISTAKE_TAG_META, resolveMistakeQuestion } from "@/lib/exam/mistake-vault";
import { selectParentSubscription, useSubscriptionStore } from "@/lib/payments/useSubscriptionStore";

// Renders entirely from client-side store state — force dynamic so the
// build never attempts to prerender a signed-out shell.
export const dynamic = "force-dynamic";

const SUBJECT_ALL = "ALL";
const TAG_ALL = "ALL";

export default function MistakeVaultPage() {
  const { hasHydrated, isAuthenticated, students, activeStudent } = useActiveStudent();
  const mistakeLog = useAuthStore((s) => (activeStudent ? selectMistakeLogForStudent(s, activeStudent.id) : []));
  const toggleMistakeReviewed = useAuthStore((s) => s.toggleMistakeReviewed);
  const parent = useAuthStore(selectActiveParent);
  const subscription = useSubscriptionStore((s) => selectParentSubscription(s, parent?.id ?? null));
  const mistakeVaultAccess = useMemo(() => checkMistakeVaultAccess(subscription), [subscription]);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const [subjectFilter, setSubjectFilter] = useState<string>(SUBJECT_ALL);
  const [tagFilter, setTagFilter] = useState<MistakeTagCategory | typeof TAG_ALL>(TAG_ALL);
  const [showReviewed, setShowReviewed] = useState(false);

  const language = activeStudent?.languagePreference ?? "en";

  const resolved = useMemo(() => {
    return mistakeLog
      .map((entry) => {
        const resolvedQuestion = resolveMistakeQuestion(entry);
        return resolvedQuestion ? { entry, ...resolvedQuestion } : null;
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => b.entry.createdAt - a.entry.createdAt);
  }, [mistakeLog]);

  const subjectOptions = useMemo(() => {
    const bySection = new Map<string, { key: string; name: string; count: number }>();
    for (const { question, session } of resolved) {
      const name = session.sections.find((s) => s.key === question.sectionKey)?.name[language] ?? question.sectionKey;
      const existing = bySection.get(question.sectionKey);
      bySection.set(question.sectionKey, { key: question.sectionKey, name, count: (existing?.count ?? 0) + 1 });
    }
    return Array.from(bySection.values());
  }, [resolved, language]);

  const tagCounts = useMemo(() => {
    const counts: Record<MistakeTagCategory, number> = { CARELESS_RUSHED: 0, CONCEPT_GAP: 0, CALCULATION_GAP: 0 };
    for (const { entry } of resolved) if (!entry.reviewed) counts[entry.mistakeTag] += 1;
    return counts;
  }, [resolved]);

  const filtered = useMemo(
    () =>
      resolved.filter(({ entry, question }) => {
        if (!showReviewed && entry.reviewed) return false;
        if (subjectFilter !== SUBJECT_ALL && question.sectionKey !== subjectFilter) return false;
        if (tagFilter !== TAG_ALL && entry.mistakeTag !== tagFilter) return false;
        return true;
      }),
    [resolved, showReviewed, subjectFilter, tagFilter]
  );

  const unreviewedCount = resolved.filter((r) => !r.entry.reviewed).length;
  const attemptCount = new Set(resolved.map((r) => r.entry.testHistoryEntryId)).size;
  const primaryExamId = resolved[0]?.entry.examId ?? null;

  if (!hasHydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Mistake Vault</h1>
        <p className="text-sm text-muted-foreground">Sign in to review your mistakes and practice weak areas.</p>
      </div>
    );
  }

  if (students.length === 0 || !activeStudent) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-xl font-bold text-foreground">Mistake Vault</h1>
        <p className="text-sm text-muted-foreground">Add a student profile to start tracking mistakes here.</p>
        <Button asChild>
          <Link href="/onboarding">Add a Student</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mistake Vault</h1>
          <p className="text-sm text-muted-foreground">
            {resolved.length === 0
              ? `No mistakes logged yet for ${activeStudent.fullName} — nice work.`
              : `${resolved.length} mistake${resolved.length === 1 ? "" : "s"} across ${attemptCount} attempt${attemptCount === 1 ? "" : "s"}, ${unreviewedCount} unreviewed.`}
          </p>
        </div>
        {primaryExamId ? (
          <Button asChild>
            <Link href={`/exam/${primaryExamId}?mode=practice`}>
              <Sparkles className="h-4 w-4" />
              Start Practice Session
            </Link>
          </Button>
        ) : null}
      </div>

      {resolved.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Mistakes from your mock tests will show up here, filterable by subject and type, with explanations and
          targeted practice.
        </div>
      ) : !mistakeVaultAccess.allowed ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border p-10 text-center">
          <Lock className="h-8 w-8 text-primary" />
          <p className="text-base font-semibold text-foreground">Detailed solutions are part of Vedic All-Access</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Unlock step-by-step explanations, speed-hack videos, and concept clinics for every mistake with Vedic
            All-Access.
          </p>
          <Button type="button" onClick={() => setPaywallOpen(true)}>
            Unlock Vedic All-Access
          </Button>
          <PaywallModal
            open={paywallOpen}
            onOpenChange={setPaywallOpen}
            feature="MISTAKE_VAULT_SOLUTIONS"
            suggestedPlans={mistakeVaultAccess.suggestedPlans}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSubjectFilter(SUBJECT_ALL)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  subjectFilter === SUBJECT_ALL
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50"
                )}
              >
                All Subjects
              </button>
              {subjectOptions.map((subject) => (
                <button
                  key={subject.key}
                  type="button"
                  onClick={() => setSubjectFilter(subject.key)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    subjectFilter === subject.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {subject.name} ({subject.count})
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTagFilter(TAG_ALL)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  tagFilter === TAG_ALL
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50"
                )}
              >
                All Types
              </button>
              {(Object.keys(MISTAKE_TAG_META) as MistakeTagCategory[]).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTagFilter(tag)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    tagFilter === tag
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {MISTAKE_TAG_META[tag].label}
                  {tagCounts[tag] > 0 ? ` (${tagCounts[tag]})` : ""}
                </button>
              ))}
            </div>

            <label className="flex w-fit items-center gap-2 pt-1 text-xs font-medium text-muted-foreground">
              <Switch checked={showReviewed} onCheckedChange={setShowReviewed} />
              Show reviewed mistakes
            </label>
          </div>

          <div className="flex flex-col gap-3">
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No mistakes match these filters.
              </div>
            ) : (
              filtered.map(({ entry, question, session }) => (
                <MistakeDetailCard
                  key={entry.id}
                  entry={entry}
                  question={question}
                  session={session}
                  language={language}
                  onToggleReviewed={toggleMistakeReviewed}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
