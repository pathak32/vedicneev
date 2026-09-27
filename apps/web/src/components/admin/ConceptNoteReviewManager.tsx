"use client";

import { useState } from "react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";
import type { ConceptNoteStatus } from "@vedicneev/db";
import { Check, Loader2, Pencil, RotateCcw, Save } from "lucide-react";

export interface EditableConceptNote {
  id: string;
  topicName: string;
  sectionName: string;
  title: string;
  explanation: string;
  workedExample: string;
  commonMistake: string;
  status: ConceptNoteStatus;
  reviewedByName: string | null;
}

function fieldClass() {
  return "mt-1 w-full rounded-md border border-border bg-background p-2 text-sm";
}

function NoteCard({
  note,
  onChange,
  onSave,
  onPublishToggle,
}: {
  note: EditableConceptNote;
  onChange: (patch: Partial<EditableConceptNote>) => void;
  onSave: () => void;
  onPublishToggle: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [dirty, setDirty] = useState(false);
  // Published notes start collapsed to a summary row — editing them is
  // still fully supported (nothing here ever locks a published note),
  // this is purely so a review queue with dozens of already-approved
  // notes doesn't render every one of them as a wide-open form. Drafts
  // (what actually needs action) always start expanded.
  const [expanded, setExpanded] = useState(note.status !== "PUBLISHED");

  async function handleSave() {
    setSaving(true);
    await onSave();
    setSaving(false);
    setDirty(false);
  }

  async function handleToggle() {
    setToggling(true);
    await onPublishToggle();
    setToggling(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base">{note.topicName}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {note.title}
            {note.reviewedByName ? ` · last reviewed by ${note.reviewedByName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={note.status === "PUBLISHED" ? "default" : "secondary"}>{note.status}</Badge>
          {!expanded ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setExpanded(true)} className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : null}
        </div>
      </CardHeader>
      {!expanded ? null : (
      <CardContent className="flex flex-col gap-3 pt-0">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Sub-concept title</label>
          <input
            value={note.title}
            onChange={(e) => {
              onChange({ title: e.target.value });
              setDirty(true);
            }}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Explanation</label>
          <textarea
            value={note.explanation}
            onChange={(e) => {
              onChange({ explanation: e.target.value });
              setDirty(true);
            }}
            rows={2}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Worked example</label>
          <textarea
            value={note.workedExample}
            onChange={(e) => {
              onChange({ workedExample: e.target.value });
              setDirty(true);
            }}
            rows={2}
            className={fieldClass()}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Common mistake</label>
          <textarea
            value={note.commonMistake}
            onChange={(e) => {
              onChange({ commonMistake: e.target.value });
              setDirty(true);
            }}
            rows={2}
            className={fieldClass()}
          />
        </div>

        <div className="flex justify-end gap-2">
          {note.status === "PUBLISHED" ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded(false)}>
              Collapse
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" disabled={!dirty || saving} onClick={handleSave} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save edits
          </Button>
          <Button type="button" size="sm" disabled={toggling} onClick={handleToggle} className="gap-1.5">
            {toggling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : note.status === "PUBLISHED" ? (
              <RotateCcw className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {note.status === "PUBLISHED" ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </CardContent>
      )}
    </Card>
  );
}

export function ConceptNoteReviewManager({ initialNotes }: { initialNotes: EditableConceptNote[] }) {
  const [notes, setNotes] = useState(initialNotes);

  function updateNote(id: string, patch: Partial<EditableConceptNote>) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  async function saveEdits(id: string) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    await fetch(`/api/admin/concept-notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: note.title,
        body: { explanation: note.explanation, workedExample: note.workedExample, commonMistake: note.commonMistake },
      }),
    });
  }

  async function togglePublish(id: string) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const action = note.status === "PUBLISHED" ? "unpublish" : "publish";
    const res = await fetch(`/api/admin/concept-notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (res.ok && data.note) {
      updateNote(id, { status: data.note.status, reviewedByName: note.reviewedByName });
    }
  }

  if (notes.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No concept notes drafted yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onChange={(patch) => updateNote(note.id, patch)}
          onSave={() => saveEdits(note.id)}
          onPublishToggle={() => togglePublish(note.id)}
        />
      ))}
    </div>
  );
}
