"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button, Card, CardContent } from "@vedicneev/ui";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

interface Branch {
  id: string;
  name: string;
}

interface Assignment {
  subject: string;
  classLevel: string;
}

interface NewTestFormProps {
  isFaculty: boolean;
  branches: Branch[];
  /** Only meaningful when isFaculty — the faculty's own (subject, classLevel) rows to pick from, never free-text. */
  assignments: Assignment[];
}

interface FormState {
  batchName: string;
  testCode: string;
  subject: string;
  classLevel: string;
  branchId: string;
  totalStudents: string;
  totalQuestions: string;
}

function encodeAssignment(a: Assignment): string {
  return `${a.subject}\u0000${a.classLevel}`;
}

function decodeAssignment(value: string): Assignment {
  const [subject, classLevel] = value.split("\u0000");
  return { subject: subject ?? "", classLevel: classLevel ?? "" };
}

/**
 * The pre-download metadata gate — this page's whole point is that there
 * is no "download a blank OMR sheet" button anywhere without first
 * creating a real TestBatch (and, server-side, every one of its
 * TestBatchRosterEntry rows) here. Submit stays disabled until every
 * required field is present; the real validation (testCode uniqueness,
 * the totalStudents/totalQuestions bounds, the credit-balance cap, and —
 * for FACULTY — the subject/class scope check) still runs server-side in
 * createTestBatch.ts/the API route regardless — this is a UX gate, not
 * the enforcement point.
 */
export function NewTestForm({ isFaculty, branches, assignments }: NewTestFormProps) {
  const router = useRouter();
  const firstAssignment = assignments[0];
  const [form, setForm] = useState<FormState>({
    batchName: "",
    testCode: "",
    subject: firstAssignment?.subject ?? "",
    classLevel: firstAssignment?.classLevel ?? "",
    branchId: branches[0]?.id ?? "",
    totalStudents: "",
    totalQuestions: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isComplete =
    form.batchName.trim() !== "" &&
    form.testCode.trim() !== "" &&
    form.subject.trim() !== "" &&
    form.classLevel.trim() !== "" &&
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
          classLevel: form.classLevel,
          branchId: form.branchId || undefined,
          totalStudents: Number(form.totalStudents),
          totalQuestions: Number(form.totalQuestions),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create this test batch.");
        toast.error(data.error ?? "Could not create this test batch.");
        setSubmitting(false);
        return;
      }
      toast.success("Test batch created.");
      router.push(`/tests/${data.testBatchId}/sheets`);
    } catch {
      setError("Network error — could not reach the server.");
      toast.error("Network error — could not reach the server.");
      setSubmitting(false);
    }
  }

  if (isFaculty && assignments.length === 0) {
    return (
      <Card className="max-w-2xl border-slate-200">
        <CardContent className="p-6">
          <p className="text-sm text-slate-600">
            You have no subject/class assignment yet — ask your institute director to add one before you can create a
            test.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
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

          {isFaculty ? (
            <div>
              <Label htmlFor="assignment">Subject / Class</Label>
              <Select
                id="assignment"
                value={encodeAssignment({ subject: form.subject, classLevel: form.classLevel })}
                onChange={(e) => {
                  const { subject, classLevel } = decodeAssignment(e.target.value);
                  setForm((prev) => ({ ...prev, subject, classLevel }));
                }}
                disabled={submitting}
              >
                {assignments.map((a) => (
                  <option key={encodeAssignment(a)} value={encodeAssignment(a)}>
                    {a.subject} · Class {a.classLevel}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="classLevel">Class</Label>
                  <Input
                    id="classLevel"
                    value={form.classLevel}
                    onChange={(e) => update("classLevel", e.target.value)}
                    placeholder="e.g. 6"
                    disabled={submitting}
                  />
                </div>
              </div>

              {branches.length > 0 ? (
                <div>
                  <Label htmlFor="branchId">Branch</Label>
                  <Select id="branchId" value={form.branchId} onChange={(e) => update("branchId", e.target.value)} disabled={submitting}>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : null}
            </>
          )}

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
  );
}
