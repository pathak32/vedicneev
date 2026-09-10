"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Switch,
} from "@vedicneev/ui";
import { Pencil, Plus, Trash2 } from "lucide-react";

import type { SpeedChallengeQuestion } from "@vedicneev/db";

type QuestionRow = Pick<SpeedChallengeQuestion, "id" | "question" | "options" | "correct" | "topic" | "isActive">;

interface FormState {
  question: string;
  topic: string;
  options: string[];
  correct: number;
}

const EMPTY_FORM: FormState = { question: "", topic: "", options: ["", "", "", ""], correct: 0 };

export function AdminSpeedChallengeManager({ initialQuestions }: { initialQuestions: QuestionRow[] }) {
  const [questions, setQuestions] = useState<QuestionRow[]>(initialQuestions);
  const [editing, setEditing] = useState<QuestionRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(q: QuestionRow) {
    setEditing(q);
    setForm({
      question: q.question,
      topic: q.topic,
      options: q.options.length >= 2 ? q.options : [...q.options, "", ""].slice(0, 4),
      correct: q.correct,
    });
    setError(null);
    setDialogOpen(true);
  }

  function updateOption(idx: number, value: string) {
    setForm((f) => ({ ...f, options: f.options.map((o, i) => (i === idx ? value : o)) }));
  }

  async function handleSave() {
    const trimmedOptions = form.options.map((o) => o.trim()).filter((o) => o.length > 0);
    if (!form.question.trim() || !form.topic.trim() || trimmedOptions.length < 2) {
      setError("Question, topic, and at least 2 options are required.");
      return;
    }
    if (form.correct >= trimmedOptions.length) {
      setError("Correct-answer selection is out of range for the current options.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const body = { question: form.question.trim(), topic: form.topic.trim(), options: trimmedOptions, correct: form.correct };
      const res = await fetch(editing ? `/api/admin/speed-challenge/${editing.id}` : "/api/admin/speed-challenge", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");

      if (editing) {
        setQuestions((prev) => prev.map((q) => (q.id === editing.id ? data.question : q)));
      } else {
        setQuestions((prev) => [data.question, ...prev]);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this Speed Challenge question? This cannot be undone.")) return;
    const prev = questions;
    setQuestions((q) => q.filter((item) => item.id !== id));
    const res = await fetch(`/api/admin/speed-challenge/${id}`, { method: "DELETE" });
    if (!res.ok) setQuestions(prev);
  }

  async function toggleActive(q: QuestionRow, next: boolean) {
    setPendingToggleId(q.id);
    setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, isActive: next } : item)));
    try {
      const res = await fetch(`/api/admin/speed-challenge/${q.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, isActive: !next } : item)));
    } finally {
      setPendingToggleId(null);
    }
  }

  const activeCount = questions.filter((q) => q.isActive).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {activeCount} active / {questions.length} total — the homepage widget draws only from active questions.
        </p>
        <Button type="button" size="sm" onClick={openCreate} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Question
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {questions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No Speed Challenge questions yet — add one to make the homepage widget playable.
          </p>
        ) : (
          questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{q.topic}</Badge>
                    {!q.isActive ? <Badge variant="outline">Inactive</Badge> : null}
                  </div>
                  <p className="mt-1.5 truncate text-sm font-medium text-foreground">{q.question}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    Correct: {q.options[q.correct] ?? "—"} · {q.options.length} options
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Switch
                    checked={q.isActive}
                    disabled={pendingToggleId === q.id}
                    onCheckedChange={(checked) => toggleActive(q, checked)}
                    aria-label="Active"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => openEdit(q)} aria-label="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" onClick={() => handleDelete(q.id)} aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit question" : "Add question"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Question</label>
              <textarea
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                rows={2}
                className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Topic</label>
              <input
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Options — select the correct one
              </label>
              <div className="mt-1 flex flex-col gap-2">
                {form.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={form.correct === idx}
                      onChange={() => setForm((f) => ({ ...f, correct: idx }))}
                    />
                    <input
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="w-full rounded-md border border-border bg-background p-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="button" onClick={handleSave} disabled={saving} className="mt-2">
              {saving ? "Saving…" : editing ? "Save changes" : "Create question"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
