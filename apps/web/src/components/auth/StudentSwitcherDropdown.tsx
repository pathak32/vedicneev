"use client";

import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@vedicneev/ui";
import { Check, ChevronDown, LogOut, Plus, UserRound } from "lucide-react";

import { useActiveStudent } from "@/lib/auth/ActiveStudentContext";
import { useAuthStore } from "@/lib/auth/useAuthStore";

export function StudentSwitcherDropdown() {
  const router = useRouter();
  const { students, activeStudent, setActiveStudentId, canAddMoreStudents } = useActiveStudent();
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <UserRound className="h-4 w-4" />
          {activeStudent ? (
            <>
              <span className="font-semibold">{activeStudent.fullName}</span>
              <Badge variant="secondary" className="text-[10px]">
                {activeStudent.targetExam}
              </Badge>
            </>
          ) : (
            <span className="text-muted-foreground">Select student</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Student profiles</DropdownMenuLabel>
        {students.map((student) => (
          <DropdownMenuItem
            key={student.id}
            onSelect={() => setActiveStudentId(student.id)}
            className="justify-between"
          >
            <span className="flex flex-col">
              <span className="font-medium">{student.fullName}</span>
              <span className="text-xs text-muted-foreground">
                {student.targetExam} · Class {student.targetClass}
              </span>
            </span>
            {student.id === activeStudent?.id ? <Check className="h-4 w-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!canAddMoreStudents}
          onSelect={() => router.push("/onboarding")}
        >
          <Plus className="mr-2 h-4 w-4" />
          {canAddMoreStudents ? "Add Child" : "Maximum 3 profiles reached"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
