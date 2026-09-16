"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  RadioGroup,
  RadioGroupItem,
} from "@vedicneev/ui";
import { Loader2, Target } from "lucide-react";

import { localize } from "@/lib/localize";

export interface TargetExamOption {
  id: string;
  name: unknown;
  organization: string;
}

const OTHER_VALUE = "__other__";
const MAX_CUSTOM_NAME_LENGTH = 100;

export interface TargetExamSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exams: TargetExamOption[];
  currentExamId: string | null;
  /** Set only when the candidate previously typed a free-text exam instead of picking from the catalog. */
  currentCustomName?: string | null;
}

/**
 * Lets a candidate declare (or switch) which exam they're actively
 * preparing for — the "professional exam intent" this product captures
 * instead of any K-12 grade level. Grouped by organization since the
 * catalog spans many issuing bodies (RRB, High Courts, UPSSSC, Police...).
 * Includes an "Other" option with a free-text field for a candidate whose
 * exam isn't in the catalog yet, or who just wants general practice.
 */
export function TargetExamSelector({
  open,
  onOpenChange,
  exams,
  currentExamId,
  currentCustomName,
}: TargetExamSelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentExamId ?? (currentCustomName ? OTHER_VALUE : ""));
  const [customName, setCustomName] = useState(currentCustomName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const byOrg = new Map<string, TargetExamOption[]>();
    for (const exam of exams) {
      const list = byOrg.get(exam.organization) ?? [];
      list.push(exam);
      byOrg.set(exam.organization, list);
    }
    return [...byOrg.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [exams]);

  const isOther = selected === OTHER_VALUE;
  const trimmedCustomName = customName.trim();
  const canSave = isOther ? trimmedCustomName.length > 0 && trimmedCustomName.length <= MAX_CUSTOM_NAME_LENGTH : Boolean(selected);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/target-exam", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isOther
            ? { targetExamId: null, customTargetExamName: trimmedCustomName }
            : { targetExamId: selected || null, customTargetExamName: null }
        ),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Could not save your target exam.");
        setSaving(false);
        return;
      }
      onOpenChange(false);
      router.refresh();
    } catch {
      setError("Network error while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            What exam are you preparing for?
          </DialogTitle>
          <DialogDescription>
            Pick your active target exam. You can switch this any time as your prep moves to the next exam.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={selected} onValueChange={setSelected} className="flex flex-col gap-4">
          {grouped.map(([organization, orgExams]) => (
            <div key={organization} className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{organization}</p>
              {orgExams.map((exam) => (
                <label
                  key={exam.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm hover:bg-muted/40 has-[[data-state=checked]]:border-primary"
                >
                  <RadioGroupItem
                    value={exam.id}
                    className="h-4 w-4 shrink-0 rounded-full border border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                  />
                  <span className="text-foreground">{localize(exam.name)}</span>
                </label>
              ))}
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Not Listed?</p>
            <label
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm hover:bg-muted/40 has-[[data-state=checked]]:border-primary"
            >
              <RadioGroupItem
                value={OTHER_VALUE}
                className="h-4 w-4 shrink-0 rounded-full border border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              />
              <span className="text-foreground">Other — I'll type my own / just practicing generally</span>
            </label>
            {isOther ? (
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value.slice(0, MAX_CUSTOM_NAME_LENGTH))}
                placeholder="e.g. SSC CGL, or General practice"
                maxLength={MAX_CUSTOM_NAME_LENGTH}
                autoFocus
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Your target exam"
              />
            ) : null}
          </div>
        </RadioGroup>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="button" size="lg" className="w-full gap-2" disabled={saving || !canSave} onClick={handleSave}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Target Exam
        </Button>
      </DialogContent>
    </Dialog>
  );
}
