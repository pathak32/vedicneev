"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Switch } from "@vedicneev/ui";
import { CheckCheck, MessageCircle } from "lucide-react";

import { ProgressChart } from "@/components/parent/ProgressChart";
import { SectionalStrengths } from "@/components/parent/SectionalStrengths";
import { StudentOverviewCard } from "@/components/parent/StudentOverviewCard";
import { WhatsAppPreviewModal } from "@/components/whatsapp/WhatsAppPreviewModal";
import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import type { NotificationPreferences } from "@/lib/auth/types";
import {
  selectNotificationPreferences,
  selectUnreviewedCarelessCount,
  selectUnreviewedMistakeCount,
  useAuthStore,
} from "@/lib/auth/useAuthStore";
import { studentToWhatsAppProfile } from "@/lib/whatsapp/buildReportPayload";

const PREFERENCE_ROWS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  {
    key: "instantScorecard",
    label: "Instant Test Scorecard",
    description: "WhatsApp message the moment a mock test is submitted.",
  },
  {
    key: "weeklyDigest",
    label: "Weekly Progress Digest",
    description: "A Sunday-evening summary of the week's tests and trends.",
  },
  {
    key: "dailyTip",
    label: "Speed-Math Tip of the Day",
    description: "One bite-sized Vedic Maths trick, daily.",
  },
];

export default function ParentCommandCenterPage() {
  const { hasHydrated, isAuthenticated, parent, students, activeStudent, activeStudentId, setActiveStudentId } =
    useActiveStudent();
  const testHistory = useAuthStore((s) => s.testHistory);
  const updateNotificationPreferences = useAuthStore((s) => s.updateNotificationPreferences);
  const markAllMistakesReviewed = useAuthStore((s) => s.markAllMistakesReviewed);
  const unreviewedTotal = useAuthStore((s) => (activeStudentId ? selectUnreviewedMistakeCount(s, activeStudentId) : 0));
  const unreviewedCareless = useAuthStore((s) =>
    activeStudentId ? selectUnreviewedCarelessCount(s, activeStudentId) : 0
  );
  const preferences = useAuthStore((s) => selectNotificationPreferences(s, parent?.id ?? null));

  const [testReportOpen, setTestReportOpen] = useState(false);

  const activeHistory = useMemo(
    () => (activeStudentId ? testHistory.filter((entry) => entry.studentId === activeStudentId) : []),
    [testHistory, activeStudentId]
  );

  const latestForActive = [...activeHistory].sort((a, b) => b.submittedAt - a.submittedAt)[0];

  if (!hasHydrated) {
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!isAuthenticated || !parent) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <h1 className="text-xl font-bold text-foreground">Parent Command Center</h1>
        <p className="text-sm text-muted-foreground">Sign in to view your children&apos;s progress and reports.</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <h1 className="text-xl font-bold text-foreground">Parent Command Center</h1>
        <p className="text-sm text-muted-foreground">Add a student profile to start tracking progress here.</p>
        <Button asChild>
          <Link href="/onboarding">Add a Student</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-4 pb-32 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Parent Command Center</h1>
        <p className="text-sm text-muted-foreground">
          Track every child&apos;s readiness in one place, and manage WhatsApp reports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => (
          <StudentOverviewCard
            key={student.id}
            student={student}
            history={testHistory.filter((entry) => entry.studentId === student.id)}
            isActive={student.id === activeStudentId}
            onSelect={() => setActiveStudentId(student.id)}
          />
        ))}
      </div>

      {activeStudent ? (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {activeStudent.fullName}&apos;s Progress — Last 5 Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart history={activeHistory} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sectional Strengths &amp; Weaknesses</CardTitle>
              </CardHeader>
              <CardContent>
                <SectionalStrengths history={activeHistory} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>Mistake Vault</span>
                {unreviewedTotal > 0 ? <Badge variant="destructive">{unreviewedTotal} unreviewed</Badge> : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {unreviewedTotal === 0
                  ? "No unreviewed mistakes — nice work."
                  : `${unreviewedTotal} unreviewed mistake${unreviewedTotal === 1 ? "" : "s"} across all tests, including ${unreviewedCareless} careless/rushed error${unreviewedCareless === 1 ? "" : "s"}.`}
              </p>
              {unreviewedTotal > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => markAllMistakesReviewed(activeStudent.id)}
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark All Reviewed
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">WhatsApp Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {PREFERENCE_ROWS.map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{row.label}</p>
                    <p className="text-xs text-muted-foreground">{row.description}</p>
                  </div>
                  <Switch
                    checked={preferences[row.key]}
                    onCheckedChange={(checked) =>
                      updateNotificationPreferences(parent.id, { [row.key]: checked })
                    }
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="secondary"
                className="w-fit"
                disabled={!latestForActive}
                onClick={() => setTestReportOpen(true)}
              >
                <MessageCircle className="h-4 w-4" />
                Send Test WhatsApp Report
              </Button>
              {!latestForActive ? (
                <p className="text-xs text-muted-foreground">
                  {activeStudent.fullName} hasn&apos;t completed a mock test yet — take one to enable this.
                </p>
              ) : null}
            </CardContent>
          </Card>

          {latestForActive && testReportOpen ? (
            <WhatsAppPreviewModal
              open={testReportOpen}
              onOpenChange={setTestReportOpen}
              report={{
                totalMarks: latestForActive.totalMarks,
                maxMarks: latestForActive.maxMarks,
                accuracyPercent: latestForActive.accuracyPercent,
                admissionChance: latestForActive.accuracyPercent >= 70 ? "HIGH" : latestForActive.accuracyPercent >= 45 ? "MODERATE" : "LOW",
                topMistakeTag: null,
                reportUrl: typeof window !== "undefined" ? `${window.location.origin}/exam/${latestForActive.examId}/results` : "",
              }}
              student={studentToWhatsAppProfile(activeStudent)}
              toPhone={parent.phone}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
