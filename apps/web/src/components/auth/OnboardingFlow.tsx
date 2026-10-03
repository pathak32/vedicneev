"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, cn } from "@vedicneev/ui";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { useAuthStore } from "@/lib/auth/useAuthStore";
import type { Locality, NewStudentInput, QuotaCategory, TargetClass, TargetExam } from "@/lib/auth/types";
import { SUPPORTED_LANGUAGES } from "@/lib/hooks/useLanguageStore";
import type { LanguageCode } from "@/lib/exam/types";

const TARGET_CLASSES: TargetClass[] = [5, 6, 8, 9];
const TARGET_EXAMS: { value: TargetExam; label: string }[] = [
  { value: "JNVST", label: "JNVST (Navodaya Vidyalaya)" },
  { value: "RMS", label: "RMS (Rashtriya Military School)" },
  { value: "AISSEE", label: "AISSEE (Sainik School)" },
  { value: "UPSS", label: "UPSS (UP Sainik School)" },
  { value: "DPS", label: "Elite Private Schools (DPS & similar)" },
];
const LANGUAGES: { value: LanguageCode; label: string }[] = SUPPORTED_LANGUAGES.map((l) => ({
  value: l.code,
  label: l.label,
}));
const LOCALITIES: { value: Locality; label: string }[] = [
  { value: "RURAL", label: "Rural" },
  { value: "URBAN", label: "Urban" },
];
const QUOTA_CATEGORIES: { value: QuotaCategory; label: string }[] = [
  { value: "GEN", label: "General" },
  { value: "OBC", label: "OBC" },
  { value: "SC", label: "SC" },
  { value: "ST", label: "ST" },
  { value: "DEFENSE", label: "Defense" },
];

const STEPS = ["Child & Grade", "Target Exams", "Quota & Category"];

export interface OnboardingFlowProps {
  onComplete: () => void;
}

function OptionGrid<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-colors",
            value === option.value
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-card text-foreground hover:border-primary/50"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Same visual language as OptionGrid, but any number of options can be active at once — used for picking every exam a student wants to prepare for in one pass. */
function MultiOptionGrid<T extends string>({
  options,
  values,
  onToggle,
}: {
  options: { value: T; label: string }[];
  values: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const checked = values.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={checked}
            onClick={() => onToggle(option.value)}
            className={cn(
              "flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-colors",
              checked
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-foreground hover:border-primary/50"
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2",
                checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
              )}
            >
              {checked ? <CheckCircle2 className="h-3 w-3" /> : null}
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const addStudent = useAuthStore((s) => s.addStudent);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [targetClass, setTargetClass] = useState<TargetClass | null>(null);
  // Multi-select: a student preparing for several exams at once (e.g. every
  // Navodaya-style option — JNVST + RMS + AISSEE + UPSS) gets one
  // StudentProfile per exam below, all sharing this same name/class/language/
  // locality/quota — rather than repeating the whole wizard per exam.
  const [targetExams, setTargetExams] = useState<TargetExam[]>([]);
  const [languagePreference, setLanguagePreference] = useState<LanguageCode | null>("en");
  // Pre-selected (not forced) so a parent in a hurry can just tap through
  // this step — still fully editable before finishing.
  const [locality, setLocality] = useState<Locality | null>("URBAN");
  const [quotaCategory, setQuotaCategory] = useState<QuotaCategory | null>("GEN");

  const canProceedStep0 = fullName.trim().length > 0 && targetClass !== null;
  const canProceedStep1 = targetExams.length > 0 && languagePreference !== null;
  const canFinish = locality !== null && quotaCategory !== null;

  function toggleExam(exam: TargetExam) {
    setTargetExams((prev) => (prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]));
  }

  function handleFinish() {
    if (!targetClass || targetExams.length === 0 || !languagePreference || !locality || !quotaCategory) return;
    try {
      for (const targetExam of targetExams) {
        const input: NewStudentInput = {
          fullName: fullName.trim(),
          targetClass,
          targetExam,
          languagePreference,
          locality,
          quotaCategory,
        };
        addStudent(input);
      }
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add this student profile.");
    }
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          {STEPS.map((label, index) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  index < step
                    ? "bg-primary text-primary-foreground"
                    : index === step
                      ? "border-2 border-primary text-primary"
                      : "border-2 border-border text-muted-foreground"
                )}
              >
                {index < step ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </div>
              {index < STEPS.length - 1 ? (
                <div className={cn("h-0.5 flex-1", index < step ? "bg-primary" : "bg-border")} />
              ) : null}
            </div>
          ))}
        </div>
        <CardTitle className="text-lg">{STEPS[step]}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {step === 0 ? (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground" htmlFor="child-name">
                Child&apos;s full name
              </label>
              <input
                id="child-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-base"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Target class / grade</p>
              <OptionGrid
                options={TARGET_CLASSES.map((c) => ({ value: c, label: `Class ${c}` }))}
                value={targetClass}
                onChange={setTargetClass}
              />
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">
                Target exam{targetExams.length > 1 ? "s" : ""}
                <span className="ml-1 font-normal text-muted-foreground">(pick as many as apply)</span>
              </p>
              <MultiOptionGrid options={TARGET_EXAMS} values={targetExams} onToggle={toggleExam} />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Primary language</p>
              <OptionGrid options={LANGUAGES} value={languagePreference} onChange={setLanguagePreference} />
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Locality</p>
              <OptionGrid options={LOCALITIES} value={locality} onChange={setLocality} />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Reservation category</p>
              <OptionGrid options={QUOTA_CATEGORIES} value={quotaCategory} onChange={setQuotaCategory} />
            </div>
          </>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" disabled={!canFinish} onClick={handleFinish}>
              Finish Setup
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
