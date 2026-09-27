"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@vedicneev/ui";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

interface Branch {
  id: string;
  name: string;
}

interface AssignmentRow {
  subject: string;
  classLevel: string;
}

const EMPTY_ROW: AssignmentRow = { subject: "", classLevel: "" };

export function AddFacultyForm({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [assignments, setAssignments] = useState<AssignmentRow[]>([{ ...EMPTY_ROW }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateAssignment(index: number, key: keyof AssignmentRow, value: string) {
    setAssignments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index]!, [key]: value };
      return next;
    });
  }

  const validAssignments = assignments.filter((a) => a.subject.trim() && a.classLevel.trim());
  const isComplete = name.trim() !== "" && phone.trim() !== "" && branchId !== "" && validAssignments.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/institute/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, branchId, assignments: validAssignments }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not add this faculty account.");
        return;
      }
      setName("");
      setPhone("");
      setAssignments([{ ...EMPTY_ROW }]);
      router.refresh();
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="facultyName">Faculty Name</Label>
          <Input
            id="facultyName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            disabled={submitting}
          />
        </div>
        <div>
          <Label htmlFor="facultyPhone">WhatsApp Number</Label>
          <Input
            id="facultyPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile number"
            disabled={submitting}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="facultyBranch">Branch</Label>
        <Select id="facultyBranch" value={branchId} onChange={(e) => setBranchId(e.target.value)} disabled={submitting}>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Subjects &amp; Classes Taught</Label>
        <div className="mt-2 flex flex-col gap-2">
          {assignments.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={row.subject}
                onChange={(e) => updateAssignment(i, "subject", e.target.value)}
                placeholder="Subject, e.g. Mathematics"
                disabled={submitting}
                className="flex-1"
              />
              <Input
                value={row.classLevel}
                onChange={(e) => updateAssignment(i, "classLevel", e.target.value)}
                placeholder="Class, e.g. 6"
                disabled={submitting}
                className="w-28"
              />
              <button
                type="button"
                onClick={() => setAssignments((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={submitting || assignments.length === 1}
                className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-destructive disabled:opacity-40"
                aria-label="Remove this assignment"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAssignments((prev) => [...prev, { ...EMPTY_ROW }])}
          disabled={submitting}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-indigo hover:underline"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add another subject/class
        </button>
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={!isComplete || submitting}>
        {submitting ? "Adding…" : "Add Faculty"}
      </Button>
    </form>
  );
}
