"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, FileUp, Loader2, Sparkles, UploadCloud } from "lucide-react";

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
  /** "" = not yet tagged. Purely a UI convenience for filtering the Subsection dropdown — never sent to the server. */
  subjectId: string;
  /** "" = not yet tagged. The only taxonomy field actually persisted. */
  subsectionId: string;
}

interface DuplicateMatch {
  questionNumber: number;
  similarity: number;
  matchedBatchName: string;
  matchedText: string;
}

interface TaxonomySubsectionOption {
  id: string;
  name: string;
}

interface TaxonomySubjectOption {
  id: string;
  name: string;
  subsections: TaxonomySubsectionOption[];
}

interface BankTopicOption {
  id: string;
  name: string;
  questionCount: number;
}

interface BankSectionOption {
  key: string;
  name: string;
  topics: BankTopicOption[];
}

function findSubjectIdForSubsection(subjects: TaxonomySubjectOption[], subsectionId: string): string {
  return subjects.find((s) => s.subsections.some((sub) => sub.id === subsectionId))?.id ?? "";
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
type PanelMode = "upload" | "bank";

export function QuestionUploadPanel({ testBatchId, totalQuestions }: QuestionUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<PanelMode>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [setLabel, setSetLabel] = useState("");
  const [examCategory, setExamCategory] = useState("");
  const [parsing, setParsing] = useState(false);
  const [questions, setQuestions] = useState<EditableQuestion[] | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [taxonomySubjects, setTaxonomySubjects] = useState<TaxonomySubjectOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Bank-generation mode's own state — kept separate from the upload
  // flow's file/parsing state since the two are mutually exclusive ways
  // of arriving at the same `questions` preview below.
  const [bankSections, setBankSections] = useState<BankSectionOption[] | null>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [generating, setGenerating] = useState(false);
  const [generateWarnings, setGenerateWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (mode !== "bank" || bankSections !== null || bankLoading) return;
    setBankLoading(true);
    fetch(`/api/tests/${testBatchId}/questions/bank-topics`)
      .then((res) => res.json())
      .then((data: { sections?: BankSectionOption[]; error?: string }) => {
        if (data.error) {
          setBankError(data.error);
          return;
        }
        setBankSections(data.sections ?? []);
      })
      .catch(() => setBankError("Could not load the question bank."))
      .finally(() => setBankLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const allocatedTotal = Object.values(allocations).reduce((sum, n) => sum + (n || 0), 0);

  function updateAllocation(topicId: string, count: number) {
    setAllocations((prev) => ({ ...prev, [topicId]: Math.max(0, count) }));
  }

  async function handleGenerate() {
    const chosen = Object.entries(allocations)
      .filter(([, count]) => count > 0)
      .map(([topicId, count]) => ({ topicId, count }));
    if (chosen.length === 0) return;

    setGenerating(true);
    setError(null);
    setSaved(false);
    setGenerateWarnings([]);
    try {
      const res = await fetch(`/api/tests/${testBatchId}/questions/generate-from-bank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations: chosen }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not generate questions from the bank.");
        return;
      }
      const subjects: TaxonomySubjectOption[] = data.taxonomySubjects ?? [];
      setTaxonomySubjects(subjects);
      setQuestions(
        (data.questions as {
          questionNumber: number;
          text: string;
          options: Partial<Record<string, string>>;
          correctOption: string | null;
          warnings: string[];
          suggestedSubsectionId: string | null;
        }[]).map((q) => {
          const subsectionId = q.suggestedSubsectionId ?? "";
          return {
            questionNumber: q.questionNumber,
            text: q.text,
            optionA: q.options.A ?? "",
            optionB: q.options.B ?? "",
            optionC: q.options.C ?? "",
            optionD: q.options.D ?? "",
            correctOption: (q.correctOption as EditableQuestion["correctOption"]) ?? "",
            warnings: q.warnings,
            subsectionId,
            subjectId: subsectionId ? findSubjectIdForSubsection(subjects, subsectionId) : "",
          };
        })
      );
      setGenerateWarnings(data.warnings ?? []);
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setGenerating(false);
    }
  }

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
      const subjects: TaxonomySubjectOption[] = data.taxonomySubjects ?? [];
      setTaxonomySubjects(subjects);
      setQuestions(
        (data.questions as {
          questionNumber: number;
          text: string;
          options: Partial<Record<string, string>>;
          correctOption: string | null;
          warnings: string[];
          suggestedSubsectionId: string | null;
        }[]).map((q) => {
          const subsectionId = q.suggestedSubsectionId ?? "";
          return {
            questionNumber: q.questionNumber,
            text: q.text,
            optionA: q.options.A ?? "",
            optionB: q.options.B ?? "",
            optionC: q.options.C ?? "",
            optionD: q.options.D ?? "",
            correctOption: (q.correctOption as EditableQuestion["correctOption"]) ?? "",
            warnings: q.warnings,
            subsectionId,
            subjectId: subsectionId ? findSubjectIdForSubsection(subjects, subsectionId) : "",
          };
        })
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

  function updateSubject(index: number, subjectId: string) {
    setQuestions((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      // Changing the subject invalidates whatever subsection was picked
      // under the old one — never leave a subsectionId that doesn't
      // belong to the newly selected subject.
      next[index] = { ...next[index]!, subjectId, subsectionId: "" };
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
            subsectionId: q.subsectionId || null,
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
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 sm:w-80">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
            mode === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
          Upload Document
        </button>
        <button
          type="button"
          onClick={() => setMode("bank")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
            mode === "bank" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Generate from Bank
        </button>
      </div>

      {mode === "upload" ? (
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
                {file ? file.name : "Drag & drop a .docx, .pdf, .txt, or .csv question paper, or click to browse"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf,.txt,.csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain,text/csv,application/vnd.ms-excel"
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
      ) : (
        <Card className="border-slate-200">
          <CardContent className="space-y-5 p-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Generate a paper from the question bank</h2>
              <p className="mt-1 text-xs text-slate-500">
                Pick how many questions to draw from each topic — real, already-tagged questions from the shared bank,
                assembled and shuffled into one paper. No typing required.
              </p>
            </div>

            {bankLoading ? (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading available topics…
              </p>
            ) : bankError ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {bankError}
              </p>
            ) : bankSections && bankSections.length === 0 ? (
              <p className="text-sm text-slate-500">
                No question bank content is available for this batch's exam board/class yet — use Upload Document
                instead.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {bankSections?.map((section) => (
                  <div key={section.key}>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{section.name}</h3>
                    <div className="mt-2 flex flex-col gap-2">
                      {section.topics.map((topic) => (
                        <div key={topic.id} className="flex items-center justify-between gap-3">
                          <Label htmlFor={`topic-${topic.id}`} className="mb-0 flex-1 font-normal">
                            {topic.name}{" "}
                            <span className="text-xs text-slate-400">({topic.questionCount} available)</span>
                          </Label>
                          <Input
                            id={`topic-${topic.id}`}
                            type="number"
                            min={0}
                            max={topic.questionCount}
                            value={allocations[topic.id] || ""}
                            onChange={(e) => updateAllocation(topic.id, Number(e.target.value) || 0)}
                            className="h-8 w-20 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
                  <span className="text-slate-600">
                    {allocatedTotal} of {totalQuestions} questions allocated
                  </span>
                  <Button type="button" size="sm" onClick={handleGenerate} disabled={allocatedTotal === 0 || generating}>
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    {generating ? "Generating…" : "Generate Paper"}
                  </Button>
                </div>

                {allocatedTotal !== totalQuestions && allocatedTotal > 0 ? (
                  <p className="flex items-center gap-1.5 text-xs text-warning">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    This batch needs {totalQuestions} questions — you've allocated {allocatedTotal}.
                  </p>
                ) : null}
              </div>
            )}

            {generateWarnings.length > 0 ? (
              <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-slate-700">
                {generateWarnings.map((w) => (
                  <p key={w}>{w}</p>
                ))}
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}

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
                    <th className="py-2 pr-2">Subject</th>
                    <th className="py-2 pr-2">Subsection</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => {
                    const subject = taxonomySubjects.find((s) => s.id === q.subjectId);
                    return (
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
                        <td className="min-w-[130px] py-2 pr-2">
                          <Select
                            value={q.subjectId}
                            onChange={(e) => updateSubject(i, e.target.value)}
                            className="h-8 text-xs"
                            disabled={taxonomySubjects.length === 0}
                          >
                            <option value="">Untagged</option>
                            {taxonomySubjects.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </Select>
                        </td>
                        <td className="min-w-[160px] py-2 pr-2">
                          <Select
                            value={q.subsectionId}
                            onChange={(e) => updateQuestion(i, "subsectionId", e.target.value)}
                            className="h-8 text-xs"
                            disabled={!subject}
                          >
                            <option value="">—</option>
                            {subject?.subsections.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
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
