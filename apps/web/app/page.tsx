"use client";

import Link from "next/link";
import { Award, ClipboardList, Printer, ScanLine, Sparkles } from "lucide-react";

import { formatDuration } from "@vedicneev/engine";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vedicneev/ui";

import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { selectStudentTestHistory, useAuthStore } from "@/lib/auth/useAuthStore";

export default function HomePage() {
  const sampleTimeLimit = formatDuration(45 * 60);
  const { hasHydrated, activeStudent } = useActiveStudent();
  const history = useAuthStore((s) =>
    activeStudent ? selectStudentTestHistory(s, activeStudent.id) : []
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Vedic Neev
          </CardTitle>
          <CardDescription>
            {hasHydrated && activeStudent
              ? `Ready for ${activeStudent.fullName} · ${activeStudent.targetExam}, Class ${activeStudent.targetClass}`
              : `Practice engine ready — sample section time limit: ${sampleTimeLimit}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/exam/demo-jnvst">Start a mock test</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/exam/demo-jnvst/omr/print">
              <Printer className="h-4 w-4" />
              Print OMR sheet
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/exam/demo-jnvst/omr/scan">
              <ScanLine className="h-4 w-4" />
              Scan a filled OMR sheet
            </Link>
          </Button>
        </CardContent>
      </Card>

      {hasHydrated && activeStudent ? (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-primary" />
              {activeStudent.fullName}&apos;s Test History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attempts yet — take the mock test above.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {[...history]
                  .sort((a, b) => b.submittedAt - a.submittedAt)
                  .map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-foreground">{entry.examName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {entry.totalMarks}/{entry.maxMarks}
                      </Badge>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
