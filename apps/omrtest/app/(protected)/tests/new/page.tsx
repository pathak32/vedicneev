"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <main>
      <h1>New Test</h1>
      <p>Every field below is required before OMR sheets can be generated for this batch.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="batchName">Batch Name</label>
        <input
          id="batchName"
          value={form.batchName}
          onChange={(e) => update("batchName", e.target.value)}
          placeholder="e.g. Physics Mock Test 4"
          disabled={submitting}
        />

        <label htmlFor="testCode">Test Code</label>
        <input
          id="testCode"
          value={form.testCode}
          onChange={(e) => update("testCode", e.target.value)}
          placeholder="e.g. PHY-MOCK-04"
          disabled={submitting}
        />

        <label htmlFor="subject">Subject</label>
        <input
          id="subject"
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          placeholder="e.g. Physics"
          disabled={submitting}
        />

        <label htmlFor="totalStudents">Total Students Appearing</label>
        <input
          id="totalStudents"
          type="number"
          min={1}
          value={form.totalStudents}
          onChange={(e) => update("totalStudents", e.target.value)}
          disabled={submitting}
        />

        <label htmlFor="totalQuestions">Total Questions</label>
        <input
          id="totalQuestions"
          type="number"
          min={1}
          value={form.totalQuestions}
          onChange={(e) => update("totalQuestions", e.target.value)}
          disabled={submitting}
        />

        <button type="submit" disabled={!isComplete || submitting}>
          {submitting ? "Creating…" : "Create Test & Generate Sheets"}
        </button>
      </form>

      {error ? <p role="alert">{error}</p> : null}
    </main>
  );
}
