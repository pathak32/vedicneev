"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

import { Button, Card, CardContent } from "@vedicneev/ui";
import { Label } from "@/components/ui/Label";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

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

const STATUS_TONE: Record<UploadResult["status"], StatusTone> = {
  GRADED: "success",
  QUEUED: "warning",
  REJECTED_DUPLICATE: "destructive",
  REJECTED_ROSTER_MISMATCH: "destructive",
  REJECTED_UNREADABLE: "destructive",
  NEEDS_MANUAL_REVIEW: "warning",
  ERROR: "destructive",
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
    <div className="space-y-6">
      <Card className="max-w-2xl border-slate-200">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="sheetFiles">Scanned sheet photo(s)</Label>
              <label
                htmlFor="sheetFiles"
                className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition-colors hover:border-brand-indigo hover:bg-brand-indigo/5"
              >
                <UploadCloud className="h-6 w-6 text-slate-400" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-700">
                  {files.length > 0
                    ? `${files.length} file${files.length === 1 ? "" : "s"} selected`
                    : "Click to choose photos, or capture with your camera"}
                </span>
                <span className="text-xs text-slate-400">JPG or PNG, one photo per sheet</span>
              </label>
              <input
                id="sheetFiles"
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                disabled={uploading}
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="sr-only"
              />
            </div>
            <Button type="submit" disabled={files.length === 0 || uploading}>
              {uploading ? `Uploading ${progress?.done ?? 0} / ${progress?.total ?? 0}…` : "Upload & Grade"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 ? (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3 font-medium">File</th>
                  <th className="px-6 py-3 font-medium">Result</th>
                  <th className="px-6 py-3 font-medium">Roll Number</th>
                  <th className="px-6 py-3 font-medium">Score</th>
                  <th className="px-6 py-3 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((result, i) => (
                  <tr key={i} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{result.fileName}</td>
                    <td className="px-6 py-4">
                      <StatusBadge tone={STATUS_TONE[result.status]}>{STATUS_LABEL[result.status]}</StatusBadge>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{result.rollNumber ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {result.gradingResult
                        ? `${result.gradingResult.totalMarks} (${result.gradingResult.correctCount} correct, ${result.gradingResult.incorrectCount} incorrect, ${result.gradingResult.unattemptedCount} blank, ${result.gradingResult.invalidCount} ambiguous)`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{result.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
