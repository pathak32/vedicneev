"use client";

import { useState } from "react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, cn } from "@vedicneev/ui";
import { PLAN_CONFIG, type EntitlementExamType, type PaidPlanId, type SubscriptionPlanId } from "@vedicneev/engine";
import { Check, Sparkles } from "lucide-react";

const EXAM_OPTIONS: { value: EntitlementExamType; label: string }[] = [
  { value: "JNVST", label: "JNVST" },
  { value: "AISSEE", label: "AISSEE" },
  { value: "RMS", label: "RMS" },
  { value: "DPS", label: "Elite Private Schools" },
];

export interface PricingTableProps {
  currentPlan?: SubscriptionPlanId | null;
  defaultExam?: EntitlementExamType;
  onSelectPlan: (planId: PaidPlanId, targetExam: EntitlementExamType | null) => void;
}

export function PricingTable({ currentPlan, defaultExam = "JNVST", onSelectPlan }: PricingTableProps) {
  const [examForPass, setExamForPass] = useState<EntitlementExamType>(defaultExam);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Free Explorer */}
      <Card className={cn(currentPlan === "FREE_EXPLORER" && "border-primary")}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            {PLAN_CONFIG.FREE_EXPLORER.name}
            {currentPlan === "FREE_EXPLORER" ? <Badge variant="secondary">Current</Badge> : null}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{PLAN_CONFIG.FREE_EXPLORER.tagline}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-3xl font-bold text-foreground">₹0</p>
          <ul className="flex flex-col gap-2 text-sm">
            {PLAN_CONFIG.FREE_EXPLORER.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {f}
              </li>
            ))}
          </ul>
          <Button type="button" variant="outline" disabled className="mt-auto">
            Included automatically
          </Button>
        </CardContent>
      </Card>

      {/* Exam Pass */}
      <Card className={cn(currentPlan === "EXAM_PASS" && "border-primary")}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            {PLAN_CONFIG.EXAM_PASS.name}
            {currentPlan === "EXAM_PASS" ? <Badge variant="secondary">Current</Badge> : null}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{PLAN_CONFIG.EXAM_PASS.tagline}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-3xl font-bold text-foreground">
            ₹{PLAN_CONFIG.EXAM_PASS.priceInr.toLocaleString("en-IN")}
            <span className="text-sm font-normal text-muted-foreground"> / year</span>
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            {PLAN_CONFIG.EXAM_PASS.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {f}
              </li>
            ))}
          </ul>
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={examForPass}
            onChange={(e) => setExamForPass(e.target.value as EntitlementExamType)}
            aria-label="Exam for Exam Pass"
          >
            {EXAM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button type="button" className="mt-auto" onClick={() => onSelectPlan("EXAM_PASS", examForPass)}>
            Get Exam Pass
          </Button>
        </CardContent>
      </Card>

      {/* Vedic All-Access */}
      <Card className={cn("border-2", currentPlan === "VEDIC_ALL_ACCESS" ? "border-primary" : "border-primary/40")}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              {PLAN_CONFIG.VEDIC_ALL_ACCESS.name}
            </span>
            {currentPlan === "VEDIC_ALL_ACCESS" ? (
              <Badge variant="secondary">Current</Badge>
            ) : (
              <Badge>Best Value</Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{PLAN_CONFIG.VEDIC_ALL_ACCESS.tagline}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-3xl font-bold text-foreground">
            ₹{PLAN_CONFIG.VEDIC_ALL_ACCESS.priceInr.toLocaleString("en-IN")}
            <span className="text-sm font-normal text-muted-foreground"> / year</span>
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            {PLAN_CONFIG.VEDIC_ALL_ACCESS.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            type="button"
            className="mt-auto"
            onClick={() => onSelectPlan("VEDIC_ALL_ACCESS", null)}
          >
            Get All-Access
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
