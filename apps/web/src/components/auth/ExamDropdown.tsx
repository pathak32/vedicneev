"use client";

import { useState } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@vedicneev/ui";
import { Check, ChevronDown, GraduationCap } from "lucide-react";

import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { useAuthStore } from "@/lib/auth/useAuthStore";
import type { TargetExam } from "@/lib/auth/types";
import { ExamSelectorModal } from "./ExamSelectorModal";

const SWITCHABLE_EXAMS: Extract<TargetExam, "JNVST" | "AISSEE" | "RMS">[] = ["JNVST", "AISSEE", "RMS"];

/**
 * Persistent header control for switching the active student's target exam
 * track on the fly. Quick switches happen straight from the menu; "Compare
 * tracks" opens the richer ExamSelectorModal for the same choice. Both paths
 * call useAuthStore's updateStudent, which already persists to Zustand
 * (localStorage) and best-effort syncs to the parent's User row in Postgres
 * (see app/api/auth/sync/route.ts) — nothing extra to wire up here.
 */
export function ExamDropdown() {
  const { activeStudent, activeStudentId } = useActiveStudent();
  const updateStudent = useAuthStore((s) => s.updateStudent);
  const [compareOpen, setCompareOpen] = useState(false);

  if (!activeStudent || !activeStudentId) return null;

  function selectExam(exam: TargetExam) {
    if (!activeStudentId) return;
    updateStudent(activeStudentId, { targetExam: exam });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            {activeStudent.targetExam}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Target exam track</DropdownMenuLabel>
          {SWITCHABLE_EXAMS.map((exam) => (
            <DropdownMenuItem key={exam} onSelect={() => selectExam(exam)} className="justify-between">
              {exam}
              {exam === activeStudent.targetExam ? <Check className="h-4 w-4 text-primary" /> : null}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setCompareOpen(true)}>Compare tracks…</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExamSelectorModal
        open={compareOpen}
        onOpenChange={setCompareOpen}
        currentExam={activeStudent.targetExam}
        onSelect={(exam) => {
          selectExam(exam);
          setCompareOpen(false);
        }}
      />
    </>
  );
}
