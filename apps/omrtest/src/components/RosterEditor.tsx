"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button, Card, CardContent } from "@vedicneev/ui";
import { Input } from "@/components/ui/Input";

export interface RosterEditorEntry {
  id: string;
  rollNumber: string;
  studentName: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
}

interface RosterEditorProps {
  testBatchId: string;
  entries: RosterEditorEntry[];
}

type EditableField = "studentName" | "parentName" | "parentPhone" | "parentEmail";

/**
 * Plain editable table, no pagination — up to MAX_TOTAL_STUDENTS (2000)
 * rows renders and scrolls fine without it. Only rows whose fields
 * actually changed from what the GET returned are sent in the PATCH.
 */
export function RosterEditor({ testBatchId, entries: initialEntries }: RosterEditorProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [original] = useState(initialEntries);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateField(id: string, field: EditableField, value: string) {
    setSaved(false);
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  const changedRows = entries.filter((e) => {
    const before = original.find((o) => o.id === e.id);
    if (!before) return false;
    return (
      before.studentName !== e.studentName ||
      before.parentName !== e.parentName ||
      before.parentPhone !== e.parentPhone ||
      before.parentEmail !== e.parentEmail
    );
  });

  async function handleSave() {
    if (changedRows.length === 0) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/tests/${testBatchId}/roster`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: changedRows.map((e) => ({
            id: e.id,
            studentName: e.studentName,
            parentName: e.parentName,
            parentPhone: e.parentPhone,
            parentEmail: e.parentEmail,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save roster changes.");
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
    <div className="flex max-w-5xl flex-col gap-4">
      <Card className="border-slate-200">
        <CardContent className="p-0">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full min-w-[840px] text-left text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 text-slate-400">
                  <th className="py-2 pl-4 pr-2">Roll Number</th>
                  <th className="py-2 pr-2">Student Name</th>
                  <th className="py-2 pr-2">Parent Name</th>
                  <th className="py-2 pr-2">Parent Phone</th>
                  <th className="py-2 pr-4">Parent Email</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100">
                    <td className="py-2 pl-4 pr-2 font-medium text-slate-500">{entry.rollNumber}</td>
                    <td className="min-w-[160px] py-2 pr-2">
                      <Input
                        value={entry.studentName ?? ""}
                        onChange={(e) => updateField(entry.id, "studentName", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="min-w-[160px] py-2 pr-2">
                      <Input
                        value={entry.parentName ?? ""}
                        onChange={(e) => updateField(entry.id, "parentName", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="min-w-[140px] py-2 pr-2">
                      <Input
                        value={entry.parentPhone ?? ""}
                        onChange={(e) => updateField(entry.id, "parentPhone", e.target.value)}
                        placeholder="10-digit number"
                        className="h-8 text-xs"
                      />
                    </td>
                    <td className="min-w-[180px] py-2 pr-4">
                      <Input
                        value={entry.parentEmail ?? ""}
                        onChange={(e) => updateField(entry.id, "parentEmail", e.target.value)}
                        className="h-8 text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      {saved ? (
        <p role="status" className="text-sm font-medium text-success">
          Roster changes saved.
        </p>
      ) : null}

      <div>
        <Button type="button" onClick={handleSave} disabled={changedRows.length === 0 || saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            `Save Changes${changedRows.length > 0 ? ` (${changedRows.length})` : ""}`
          )}
        </Button>
      </div>
    </div>
  );
}
