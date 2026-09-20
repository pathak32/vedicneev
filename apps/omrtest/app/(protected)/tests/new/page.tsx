"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Card, CardContent } from "@vedicneev/ui";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface FormState {
  batchName: string;
  testCode: string;
  subject: string;
  totalStudents: string;
  totalQuestions: string;
}

const EMPTY_FORM: FormState = { batchName: "", testCode: "", subject: "", totalStudents: "", totalQuestions: "" };

/**
 * The pre-download metadata gate — this page's whole point is that there
 * is no "download a blank OMR sheet" button anywhere without first
 * creating a real TestBatch (and, server-side, every one of its
 * TestBatchRosterEntry rows) here. Submit stays disabled until every
 * required field is present; the real validation (testCode uniqueness,
 * the totalStudents/totalQuestions bounds, the credit-balance cap) still
 * runs server-side in createTestBatch.ts regardless — this is a UX gate,
 * not the enforcement point.
 */
export default function NewTestPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isComplete =
    form.batchName.trim() !== "" &&
    form.testCode.trim() !== "" &&
    form.subject.trim() !== "" &&
    form.totalStudents.trim() !== "" &&
    form.totalQuestions.trim() !== "";

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchName: form.batchName,
          testCode: form.testCode,
          subject: form.subject,
          totalStudents: Number(form.totalStudents),
          totalQuestions: Number(form.totalQuestions),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create this test batch.");
        setSubmitting(false);
        return;
      }
      router.push(`/tests/${data.testBatchId}/sheets`);
    } catch {
      setError("Network error — could not reach the server.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="New Test"
        description="Every field below is required before OMR sheets can be generated for this batch."
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />

      <Card className="max-w-2xl border-slate-200">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="batchName">Batch Name</Label>
              <Input
                id="batchName"
                value={form.batchName}
                onChange={(e) => update("batchName", e.target.value)}
                placeholder="e.g. Physics Mock Test 4"
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="testCode">Test Code</Label>
              <Input
                id="testCode"
                value={form.testCode}
                onChange={(e) => update("testCode", e.target.value)}
                placeholder="e.g. PHY-MOCK-04"
                disabled={submitting}
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
                placeholder="e.g. Physics"
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalStudents">Total Students Appearing</Label>
                <Input
                  id="totalStudents"
                  type="number"
                  min={1}
                  value={form.totalStudents}
                  onChange={(e) => update("totalStudents", e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="totalQuestions">Total Questions</Label>
                <Input
                  id="totalQuestions"
                  type="number"
                  min={1}
                  value={form.totalQuestions}
                  onChange={(e) => update("totalQuestions", e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            {error ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={!isComplete || submitting} className="w-full sm:w-auto">
              {submitting ? "Creating…" : "Create Test & Generate Sheets"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
