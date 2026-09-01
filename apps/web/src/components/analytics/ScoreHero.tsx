"use client";

import { Badge, Card, CardContent, cn } from "@vedicneev/ui";
import type { AdmissionProbabilityResult, CutoffCategory, CutoffExamType, CutoffLocality } from "@vedicneev/engine";
import { Award, Target, TrendingUp } from "lucide-react";

import { CATEGORY_OPTIONS, LOCALITY_OPTIONS, SAMPLE_STATES } from "@/lib/exam/cutoff-data";
import type { LanguageCode } from "@/lib/exam/types";

export interface CandidateProfile {
  state: string;
  locality: CutoffLocality;
  category: CutoffCategory;
}

export interface ScoreHeroProps {
  language: LanguageCode;
  totalMarks: number;
  maxMarks: number;
  accuracyPercent: number;
  percentile: number;
  examType: CutoffExamType;
  profile: CandidateProfile;
  admissionProbability: AdmissionProbabilityResult;
  onExamTypeChange: (examType: CutoffExamType) => void;
  onProfileChange: (patch: Partial<CandidateProfile>) => void;
}

const CHANCE_STYLES: Record<AdmissionProbabilityResult["selectionChance"], { label: string; color: string; bar: string }> = {
  LOW: { label: "Low Selection Chance", color: "text-red-600", bar: "bg-red-500" },
  MODERATE: { label: "Moderate Selection Chance", color: "text-amber-600", bar: "bg-amber-500" },
  HIGH: { label: "High Selection Chance", color: "text-emerald-600", bar: "bg-emerald-500" },
};

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/60 p-4 text-center">
      <div className="text-primary">{icon}</div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function ScoreHero({
  language,
  totalMarks,
  maxMarks,
  accuracyPercent,
  percentile,
  examType,
  profile,
  admissionProbability,
  onExamTypeChange,
  onProfileChange,
}: ScoreHeroProps) {
  const chance = CHANCE_STYLES[admissionProbability.selectionChance];

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="grid grid-cols-3 gap-3">
          <StatTile
            icon={<Award className="h-5 w-5" />}
            label="Total Marks"
            value={`${totalMarks} / ${maxMarks}`}
          />
          <StatTile
            icon={<Target className="h-5 w-5" />}
            label="Accuracy"
            value={`${accuracyPercent.toFixed(0)}%`}
          />
          <StatTile
            icon={<TrendingUp className="h-5 w-5" />}
            label="National Percentile"
            value={`${percentile.toFixed(0)}th`}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">Admission Probability Meter</h3>
            <Badge variant="outline" className={cn("font-semibold", chance.color)}>
              {chance.label}
            </Badge>
          </div>

          <div className="relative h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-red-200 via-amber-200 to-emerald-200 dark:from-red-950 dark:via-amber-950 dark:to-emerald-950">
            <div
              className={cn("absolute top-0 h-full w-1 rounded-full", chance.bar)}
              style={{ left: `${admissionProbability.probabilityIndex}%` }}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {admissionProbability.cutoffPercentage !== null
              ? `You're at ${admissionProbability.studentPercentage.toFixed(1)}% vs. a historical cutoff of ${admissionProbability.cutoffPercentage.toFixed(1)}% for this profile.`
              : `No historical cutoff on file for this profile — showing a score-only estimate.`}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1 sm:grid-cols-4">
            <select
              className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
              value={examType}
              onChange={(e) => onExamTypeChange(e.target.value as CutoffExamType)}
              aria-label="Exam"
            >
              <option value="JNVST">JNVST</option>
              <option value="AISSEE">AISSEE</option>
            </select>
            <select
              className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
              value={profile.state}
              onChange={(e) => onProfileChange({ state: e.target.value })}
              aria-label="State"
            >
              {SAMPLE_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
              value={profile.locality}
              onChange={(e) => onProfileChange({ locality: e.target.value as CutoffLocality })}
              aria-label="Locality"
            >
              {LOCALITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
              value={profile.category}
              onChange={(e) => onProfileChange({ category: e.target.value as CutoffCategory })}
              aria-label="Category"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {language === "hi" ? (
            <p className="text-[11px] italic text-muted-foreground">
              यह एक अनुमानित संकेतक है, वास्तविक चयन संभावना नहीं। नमूना ऐतिहासिक आंकड़ों पर आधारित।
            </p>
          ) : (
            <p className="text-[11px] italic text-muted-foreground">
              This is a heuristic planning indicator, not a statistical guarantee — based on sample
              historical data.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
