"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";
import {
  buildWhatsAppPlaintextMessage,
  calculateAdmissionProbability,
  checkMistakeVaultAccess,
  formatWhatsAppDiagnosticPayload,
  type CutoffExamType,
} from "@vedicneev/engine";
import { ArrowLeft, MessageCircle, RotateCcw } from "lucide-react";

import { MistakeVaultDrawer } from "@/components/analytics/MistakeVaultDrawer";
import { ScoreHero, type CandidateProfile } from "@/components/analytics/ScoreHero";
import { SectionBreakdown } from "@/components/analytics/SectionBreakdown";
import { SpeedAccuracyMatrix } from "@/components/analytics/SpeedAccuracyMatrix";
import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectActiveParent, selectNotificationPreferences, useAuthStore } from "@/lib/auth/useAuthStore";
import { SAMPLE_HISTORICAL_CUTOFFS, SAMPLE_STATES } from "@/lib/exam/cutoff-data";
import { buildDiagnosticReport } from "@/lib/exam/diagnostics";
import { getDemoSession } from "@/lib/exam/mock-data";
import { selectParentSubscription, useSubscriptionStore } from "@/lib/payments/useSubscriptionStore";
import { useTestStore } from "@/lib/stores/useTestStore";
import { dispatchWhatsAppReport, type DispatchResult } from "@/lib/whatsapp/dispatchReport";
import { buildDiagnosticReportForWhatsApp, studentToWhatsAppProfile } from "@/lib/whatsapp/buildReportPayload";

// Renders entirely from client-side session/store state (nothing to
// prerender) — force dynamic so the build never attempts static collection.
export const dynamic = "force-dynamic";

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
  const logMistakes = useAuthStore((s) => s.logMistakes);
  const parent = useAuthStore(selectActiveParent);
  const notificationPreferences = useAuthStore((s) => selectNotificationPreferences(s, parent?.id ?? null));
  const subscription = useSubscriptionStore((s) => selectParentSubscription(s, parent?.id ?? null));
  const incrementFreeMockUsage = useSubscriptionStore((s) => s.incrementFreeMockUsage);
  const mistakeVaultAccess = useMemo(() => checkMistakeVaultAccess(subscription), [subscription]);
  const recordedForRef = useRef<string | null>(null);
  const [autoDispatchResult, setAutoDispatchResult] = useState<DispatchResult | null>(null);

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
  // student switch mid-view don't double-count it), then fan out into the Mistake
  // Vault log and — if the parent opted in — an auto-dispatched WhatsApp scorecard.
  useEffect(() => {
    if (!report || !activeStudent || !session || !submittedAt || !admissionProbability) return;
    const recordKey = `${session.examId}-${submittedAt}`;
    if (recordedForRef.current === recordKey) return;
    recordedForRef.current = recordKey;

    const historyEntry = recordTestResult({
      studentId: activeStudent.id,
      examId: session.examId,
      examName: session.templateName.en,
      totalMarks: report.totalMarks,
      maxMarks: report.maxMarks,
      accuracyPercent: report.accuracyPercent,
      submittedAt,
      sectionBreakdown: report.sectionBreakdown.map((s) => ({
        sectionKey: s.key,
        sectionName: s.name.en,
        accuracyPercent: s.accuracyPercent,
      })),
    });
    incrementFreeMockUsage(activeStudent.id);

    // Sync the completed test session and mistakes to Supabase
    if (parent?.phone) {
      fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          phone: parent.phone,
          examTemplateSlug: session.examId,
          totalScore: report.totalMarks,
          maxScore: report.maxMarks,
          percentile: report.accuracyPercent,
          timeTakenSeconds: typeof timeSpentSeconds === "number" ? timeSpentSeconds : 0,
          responses: report.mistakes.map((m) => ({
            questionId: m.question.id,
            isCorrect: false,
            mistakeTag: m.mistakeTag,
            timeSpentSeconds: 0,
          })),
        }),
      }).catch((err) => console.error("Failed to sync exam session to DB:", err));
    }

    if (report.mistakes.length > 0) {
      logMistakes(
        report.mistakes.map((m) => ({
          studentId: activeStudent.id,
          examId: session.examId,
          testHistoryEntryId: historyEntry.id,
          questionId: m.question.id,
          questionNumber: m.questionNumber,
          mistakeTag: m.mistakeTag,
          createdAt: submittedAt,
        }))
      );
    }

    if (notificationPreferences.instantScorecard && parent?.phone) {
      const reportUrl = typeof window !== "undefined" ? window.location.href : "";
      const payload = formatWhatsAppDiagnosticPayload(
        buildDiagnosticReportForWhatsApp(report, admissionProbability, reportUrl),
        studentToWhatsAppProfile(activeStudent),
        parent.phone
      );
      dispatchWhatsAppReport(payload.payload)
        .then(setAutoDispatchResult)
        .catch(() => setAutoDispatchResult({ success: false, mock: false, messageId: null, error: "Network error." }));
    }
  }, [
    report,
    activeStudent,
    session,
    submittedAt,
    admissionProbability,
    recordTestResult,
    incrementFreeMockUsage,
    logMistakes,
    notificationPreferences.instantScorecard,
    parent?.phone,
  ]);

  // Built in an effect, not a render-time useMemo: right after the router.push from the
  // exam player, window.location still briefly reflects the previous route during render,
  // so reading it here would silently truncate the link (caught via manual testing).
  const [whatsAppShareUrl, setWhatsAppShareUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!report || !admissionProbability || !activeStudent) {
      setWhatsAppShareUrl(null);
      return;
    }
    const message = buildWhatsAppPlaintextMessage(
      buildDiagnosticReportForWhatsApp(report, admissionProbability, window.location.href),
      studentToWhatsAppProfile(activeStudent)
    );
    setWhatsAppShareUrl(`https://wa.me/?text=${encodeURIComponent(message)}`);
  }, [report, admissionProbability, activeStudent]);

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
        <div className="flex flex-wrap gap-2">
          <MistakeVaultDrawer
            examId={params.examId}
            mistakes={report.mistakes}
            session={session}
            language={language}
            hasFullAccess={mistakeVaultAccess.allowed}
            suggestedPlans={mistakeVaultAccess.suggestedPlans}
          />
          {whatsAppShareUrl ? (
            <Button type="button" variant="outline" asChild>
              <a href={whatsAppShareUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                Share Report via WhatsApp
              </a>
            </Button>
          ) : null}
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

      {autoDispatchResult?.success ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
          <MessageCircle className="h-3.5 w-3.5" />
          {autoDispatchResult.mock
            ? "Instant scorecard logged (demo mode — simulated, no WhatsApp Business API connected)."
            : "Instant scorecard sent to the registered parent WhatsApp number."}
        </div>
      ) : null}

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
