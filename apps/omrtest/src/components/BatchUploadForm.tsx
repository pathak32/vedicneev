"use client";

import { useState } from "react";

interface BatchUploadFormProps {
  testBatchId: string;
}

type UploadStatus =
  | "GRADED"
  | "QUEUED"
  | "REJECTED_DUPLICATE"
  | "REJECTED_ROSTER_MISMATCH"
  | "REJECTED_UNREADABLE"
  | "NEEDS_MANUAL_REVIEW";

interface GradingSummary {
  totalMarks: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  invalidCount: number;
}

interface UploadResult {
  fileName: string;
  status: UploadStatus | "ERROR";
  reason?: string;
  rollNumber?: string;
  gradingResult?: GradingSummary;
}

const STATUS_LABEL: Record<UploadResult["status"], string> = {
  GRADED: "Graded",
  QUEUED: "Queued (held)",
  REJECTED_DUPLICATE: "Rejected — duplicate",
  REJECTED_ROSTER_MISMATCH: "Rejected — no roster match",
  REJECTED_UNREADABLE: "Rejected — unreadable",
  NEEDS_MANUAL_REVIEW: "Needs manual review",
  ERROR: "Upload failed",
};

/**
 * Uploads one or many scanned sheet photos to POST /api/tests/[id]/upload,
 * one at a time — an admin scanning a physical stack of sheets uploads
 * them all in one sitting, so this accepts a multi-file selection but
 * sends them sequentially (not in parallel) rather than forcing a
 * one-sheet-at-a-time round trip through this page. Every result (graded,
 * queued, or any rejection reason) is shown in a running list as it comes
 * back — a rejection is a normal, informative outcome here, not a UI
 * error state, matching how the ingestion route itself treats it.
 */
export function BatchUploadForm({ testBatchId }: BatchUploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [results, setResults] = useState<UploadResult[]>([]);

  async function uploadOne(file: File): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/tests/${testBatchId}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) {
        return { fileName: file.name, status: "ERROR", reason: data.error };
      }
      return {
        fileName: file.name,
        status: data.status,
        reason: data.reason,
        rollNumber: data.rollNumber,
        gradingResult: data.gradingResult,
      };
    } catch {
      return { fileName: file.name, status: "ERROR", reason: "Network error — could not reach the server." };
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0 || uploading) return;

    setUploading(true);
    setProgress({ done: 0, total: files.length });

    for (let i = 0; i < files.length; i++) {
      const result = await uploadOne(files[i]!);
      setResults((prev) => [result, ...prev]);
      setProgress({ done: i + 1, total: files.length });
    }

    setUploading(false);
    setFiles([]);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="sheetFiles">Scanned sheet photo(s)</label>
        <input
          id="sheetFiles"
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          disabled={uploading}
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        {files.length > 0 ? (
          <p>
            {files.length} file{files.length === 1 ? "" : "s"} selected.
          </p>
        ) : null}
        <button type="submit" disabled={files.length === 0 || uploading}>
          {uploading ? `Uploading ${progress?.done ?? 0} / ${progress?.total ?? 0}…` : "Upload & Grade"}
        </button>
      </form>

      {results.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Result</th>
              <th>Roll Number</th>
              <th>Score</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, i) => (
              <tr key={i}>
                <td>{result.fileName}</td>
                <td>{STATUS_LABEL[result.status]}</td>
                <td>{result.rollNumber ?? "—"}</td>
                <td>
                  {result.gradingResult
                    ? `${result.gradingResult.totalMarks} (${result.gradingResult.correctCount} correct, ${result.gradingResult.incorrectCount} incorrect, ${result.gradingResult.unattemptedCount} blank, ${result.gradingResult.invalidCount} ambiguous)`
                    : "—"}
                </td>
                <td>{result.reason ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
