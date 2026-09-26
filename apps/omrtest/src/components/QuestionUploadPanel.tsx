"use client";

import { useRef, useState } from "react";
import { AlertTriangle, FileUp, Loader2, UploadCloud } from "lucide-react";

import { Button, Card, CardContent, cn } from "@vedicneev/ui";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

interface QuestionUploadPanelProps {
  testBatchId: string;
  totalQuestions: number;
}

interface EditableQuestion {
  questionNumber: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D" | "";
  warnings: string[];
}

interface DuplicateMatch {
  questionNumber: number;
  similarity: number;
  matchedBatchName: string;
  matchedText: string;
}

const SET_OPTIONS = [
  { value: "", label: "Base paper (no set variant)" },
  { value: "A", label: "Set A" },
  { value: "B", label: "Set B" },
  { value: "C", label: "Set C" },
  { value: "D", label: "Set D" },
];

const EXAM_CATEGORIES = ["JNVST", "AISSEE", "RMS"];

/**
 * Upload -> parse -> EDIT -> save. The middle step matters most:
 * apps/omrtest/src/lib/parsers/documentParser.ts is a pattern-based (not
 * ML) parser that won't perfectly read every document layout, so nothing
 * here is trusted or saved until an admin has reviewed/corrected this
 * exact table — see that parser's own comment.
 */
export function QuestionUploadPanel({ testBatchId, totalQuestions }: QuestionUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [setLabel, setSetLabel] = useState("");
  const [examCategory, setExamCategory] = useState("");
  const [parsing, setParsing] = useState(false);
  const [questions, setQuestions] = useState<EditableQuestion[] | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function pickFile(nextFile: File | null) {
    setFile(nextFile);
    setQuestions(null);
    setDuplicates([]);
    setError(null);
    setSaved(false);
  }

  async function handleParse() {
    if (!file) return;
    setParsing(true);
    setError(null);
    setSaved(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/tests/${testBatchId}/questions/parse`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not parse this document.");
        return;
      }
      setQuestions(
        (data.questions as {
          questionNumber: number;
          text: string;
          options: Partial<Record<string, string>>;
          correctOption: string | null;
          warnings: string[];
        }[]).map((q) => ({
          questionNumber: q.questionNumber,
          text: q.text,
          optionA: q.options.A ?? "",
          optionB: q.options.B ?? "",
          optionC: q.options.C ?? "",
          optionD: q.options.D ?? "",
          correctOption: (q.correctOption as EditableQuestion["correctOption"]) ?? "",
          warnings: q.warnings,
        }))
      );
      setDuplicates(data.duplicates ?? []);
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setParsing(false);
    }
  }

  function updateQuestion<K extends keyof EditableQuestion>(index: number, key: K, value: EditableQuestion[K]) {
    setQuestions((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] = { ...next[index]!, [key]: value };
      return next;
    });
  }

  const countMismatch = questions !== null && questions.length !== totalQuestions;
  const missingAnswers = questions?.filter((q) => !q.correctOption).length ?? 0;
  const canSave = questions !== null && !countMismatch && missingAnswers === 0 && !saving;

  async function handleSave() {
    if (!questions) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/tests/${testBatchId}/questions/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setLabel: setLabel || null,
          examCategory: examCategory || undefined,
          questions: questions.map((q) => ({
            questionNumber: q.questionNumber,
            text: q.text,
            options: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
            correctOption: q.correctOption,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save these questions.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <Card className="border-slate-200">
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="examCategory">Exam Board</Label>
              <Select id="examCategory" value={examCategory} onChange={(e) => setExamCategory(e.target.value)}>
                <option value="">Unchanged</option>
                {EXAM_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="setLabel">Set Variant</Label>
              <Select id="setLabel" value={setLabel} onChange={(e) => setSetLabel(e.target.value)}>
                {SET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-slate-500">
                Choose a set only if this document IS that set's own distinct paper (not one for our engine to
                shuffle).
              </p>
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) pickFile(dropped);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              dragOver ? "border-brand-indigo bg-brand-indigo/5" : "border-slate-300 hover:border-slate-400"
            )}
          >
            <UploadCloud className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-700">
              {file ? file.name : "Drag & drop a .docx or .pdf question paper, or click to browse"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Button type="button" onClick={handleParse} disabled={!file || parsing}>
            <FileUp className="h-4 w-4" aria-hidden="true" />
            {parsing ? "Parsing…" : "Parse Document"}
          </Button>

          {error ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {questions ? (
        <Card className="border-slate-200">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Preview — {questions.length} question{questions.length === 1 ? "" : "s"} extracted
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Review and correct every row before saving — the parser is pattern-based and won't read every layout
                perfectly.
              </p>
              {countMismatch ? (
                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  This batch has {totalQuestions} questions — {questions.length} were extracted. Add or remove rows to
                  match before saving.
                </p>
              ) : null}
            </div>

            {duplicates.length > 0 ? (
              <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-slate-700">
                <p className="font-medium">Possible duplicates found (text-similarity check, not saved anywhere):</p>
                <ul className="mt-1 list-disc pl-5">
                  {duplicates.map((d) => (
                    <li key={d.questionNumber}>
                      Question {d.questionNumber} looks like one in &ldquo;{d.matchedBatchName}&rdquo; (
                      {Math.round(d.similarity * 100)}% similar)
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Question Text</th>
                    <th className="py-2 pr-2">A</th>
                    <th className="py-2 pr-2">B</th>
                    <th className="py-2 pr-2">C</th>
                    <th className="py-2 pr-2">D</th>
                    <th className="py-2 pr-2">Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => (
                    <tr key={q.questionNumber} className="border-b border-slate-100 align-top">
                      <td className="py-2 pr-2 font-medium text-slate-500">
                        {q.questionNumber}
                        {q.warnings.length > 0 ? (
                          <AlertTriangle
                            className="mt-1 h-3.5 w-3.5 text-warning"
                            aria-label={q.warnings.join(" ")}
                          />
                        ) : null}
                      </td>
                      <td className="min-w-[220px] py-2 pr-2">
                        <Input
                          value={q.text}
                          onChange={(e) => updateQuestion(i, "text", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </td>
                      {(["optionA", "optionB", "optionC", "optionD"] as const).map((key) => (
                        <td key={key} className="min-w-[110px] py-2 pr-2">
                          <Input
                            value={q[key]}
                            onChange={(e) => updateQuestion(i, key, e.target.value)}
                            className="h-8 text-xs"
                          />
                        </td>
                      ))}
                      <td className="py-2 pr-2">
                        <Select
                          value={q.correctOption}
                          onChange={(e) => updateQuestion(i, "correctOption", e.target.value as EditableQuestion["correctOption"])}
                          className={cn("h-8 w-16 text-xs", !q.correctOption && "border-destructive")}
                        >
                          <option value="">—</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {missingAnswers > 0 ? (
              <p className="text-sm font-medium text-destructive">{missingAnswers} question(s) still need an answer selected.</p>
            ) : null}

            <Button type="button" onClick={handleSave} disabled={!canSave}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save Questions"
              )}
            </Button>

            {saved ? (
              <p role="status" className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-slate-700">
                Saved{setLabel ? ` as Set ${setLabel}` : " as the base paper"}. Any already-uploaded scans matching
                this content will be graded/re-graded automatically.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
