"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { calculateAdmissionProbability, checkMistakeVaultAccess, type CutoffExamType } from "@vedicneev/engine";
import { ArrowLeft, RotateCcw } from "lucide-react";

import { MistakeVaultDrawer } from "@/components/analytics/MistakeVaultDrawer";
import { ScoreHero, type CandidateProfile } from "@/components/analytics/ScoreHero";
import { SectionBreakdown } from "@/components/analytics/SectionBreakdown";
import { SpeedAccuracyMatrix } from "@/components/analytics/SpeedAccuracyMatrix";
import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectActiveParent, useAuthStore } from "@/lib/auth/useAuthStore";
import { SAMPLE_HISTORICAL_CUTOFFS, SAMPLE_STATES } from "@/lib/exam/cutoff-data";
import { buildDiagnosticReport } from "@/lib/exam/diagnostics";
import { getDemoSession } from "@/lib/exam/mock-data";
import { selectParentSubscription, useSubscriptionStore } from "@/lib/payments/useSubscriptionStore";
import { useTestStore } from "@/lib/stores/useTestStore";

export default function ExamResultsPage({ params }: { params: { examId: string } }) {
  const router = useRouter();
  const session = useTestStore((s) => s.session);
  const submitted = useTestStore((s) => s.submitted);
  const language = useTestStore((s) => s.language);
  const selectedOptions = useTestStore((s) => s.selectedOptions);
  const timeSpentSeconds = useTestStore((s) => s.timeSpentSeconds);
  const submittedAt = useTestStore((s) => s.submittedAt);
  const initSession = useTestStore((s) => s.initSession);
  const { activeStudent } = useActiveStudent();
  const recordTestResult = useAuthStore((s) => s.recordTestResult);
  const parent = useAuthStore(selectActiveParent);
  const subscription = useSubscriptionStore((s) => selectParentSubscription(s, parent?.id ?? null));
  const incrementFreeMockUsage = useSubscriptionStore((s) => s.incrementFreeMockUsage);
  const mistakeVaultAccess = useMemo(() => checkMistakeVaultAccess(subscription), [subscription]);
  const recordedForRef = useRef<string | null>(null);

  const [examType, setExamType] = useState<CutoffExamType>("JNVST");
  const [profile, setProfile] = useState<CandidateProfile>({
    state: SAMPLE_STATES[0],
    locality: "RURAL",
    category: "GEN",
  });

  const report = useMemo(() => {
    if (!session || !submitted) return null;
    return buildDiagnosticReport(session, selectedOptions, timeSpentSeconds);
  }, [session, submitted, selectedOptions, timeSpentSeconds]);

  const admissionProbability = useMemo(() => {
    if (!report) return null;
    return calculateAdmissionProbability(
      SAMPLE_HISTORICAL_CUTOFFS,
      { examType, state: profile.state, locality: profile.locality, category: profile.category },
      report.totalMarks,
      report.maxMarks
    );
  }, [report, examType, profile]);

  // Record this attempt against the active student once (guarded so re-renders / a
  // student switch mid-view don't double-count it).
  useEffect(() => {
    if (!report || !activeStudent || !session || !submittedAt) return;
    const recordKey = `${session.examId}-${submittedAt}`;
    if (recordedForRef.current === recordKey) return;
    recordedForRef.current = recordKey;
    recordTestResult({
      studentId: activeStudent.id,
      examId: session.examId,
      examName: session.templateName.en,
      totalMarks: report.totalMarks,
      maxMarks: report.maxMarks,
      accuracyPercent: report.accuracyPercent,
      submittedAt,
    });
    incrementFreeMockUsage(activeStudent.id);
  }, [report, activeStudent, session, submittedAt, recordTestResult, incrementFreeMockUsage]);

  // No finished session in the store for this exam (e.g. a direct link or a page refresh —
  // the demo keeps state in memory only). Point the user back to take the test.
  if (!session || session.examId !== params.examId || !submitted || !report || !admissionProbability) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-12 text-center">
        <p className="text-lg font-semibold text-foreground">No submitted attempt found</p>
        <p className="text-sm text-muted-foreground">
          Take the demo test first to see your diagnostic report.
        </p>
        <Button asChild>
          <Link href={`/exam/${params.examId}`}>
            <ArrowLeft className="h-4 w-4" />
            Go to exam
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 pb-16 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">{session.templateName[language]}</h1>
          <p className="text-sm text-muted-foreground">
            Diagnostic Report{activeStudent ? ` for ${activeStudent.fullName}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <MistakeVaultDrawer
            examId={params.examId}
            mistakes={report.mistakes}
            session={session}
            language={language}
            hasFullAccess={mistakeVaultAccess.allowed}
            suggestedPlans={mistakeVaultAccess.suggestedPlans}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              initSession(getDemoSession(params.examId) ?? session);
              router.push(`/exam/${params.examId}`);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Retake Demo
          </Button>
        </div>
      </div>

      <ScoreHero
        language={language}
        totalMarks={report.totalMarks}
        maxMarks={report.maxMarks}
        accuracyPercent={report.accuracyPercent}
        percentile={report.percentile}
        examType={examType}
        profile={profile}
        admissionProbability={admissionProbability}
        onExamTypeChange={setExamType}
        onProfileChange={(patch) => setProfile((p) => ({ ...p, ...patch }))}
      />

      <SpeedAccuracyMatrix reports={report.attemptedReports} language={language} />

      <SectionBreakdown sections={report.sectionBreakdown} topics={report.topicBreakdown} language={language} />
    </div>
  );
}
