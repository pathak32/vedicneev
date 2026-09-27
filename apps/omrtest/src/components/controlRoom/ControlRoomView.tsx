"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Target, TrendingUp, Users } from "lucide-react";

import { Badge, Card, CardContent, cn } from "@vedicneev/ui";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import type { BranchNode, StudentResult } from "@/lib/institute/controlRoomData";
import type { SubsectionPerformanceRow } from "@/lib/institute/subsectionPerformance";

function fmtPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function MetricCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <Card className="border-slate-200 transition-shadow hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-brand-indigo/10 text-brand-indigo">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SubsectionBreakdown({ rows }: { rows: SubsectionPerformanceRow[] }) {
  if (rows.length === 0) return null;

  const bySubject = new Map<string, { subjectName: string; rows: SubsectionPerformanceRow[] }>();
  for (const row of rows) {
    const existing = bySubject.get(row.subjectId);
    if (existing) existing.rows.push(row);
    else bySubject.set(row.subjectId, { subjectName: row.subjectName, rows: [row] });
  }

  return (
    <details className="mb-3 rounded-md border border-slate-200 bg-slate-50">
      <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:text-brand-indigo">
        By Subject &amp; Subsection
      </summary>
      <div className="flex flex-col gap-3 px-4 pb-4 pt-1">
        {[...bySubject.values()].map(({ subjectName, rows: subjectRows }) => (
          <div key={subjectName}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{subjectName}</h3>
            <table className="mt-1 w-full text-left text-xs">
              <tbody>
                {subjectRows
                  .sort((a, b) => {
                    const accA = a.correctCount / (a.correctCount + a.incorrectCount || 1);
                    const accB = b.correctCount / (b.correctCount + b.incorrectCount || 1);
                    return accA - accB;
                  })
                  .map((row) => {
                    const attempted = row.correctCount + row.incorrectCount;
                    const accuracy = attempted > 0 ? (row.correctCount / attempted) * 100 : 0;
                    return (
                      <tr key={row.subsectionId} className="border-b border-slate-100 last:border-0">
                        <td className="py-1.5 pr-4 text-slate-700">{row.subsectionName}</td>
                        <td className="py-1.5 pr-4 text-slate-500">
                          {row.correctCount}/{attempted} correct
                        </td>
                        <td className="py-1.5 pr-4 font-medium text-slate-900">{fmtPercent(accuracy)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </details>
  );
}

function StudentRow({ student, cutoff }: { student: StudentResult; cutoff: number }) {
  const above = student.percent >= cutoff;
  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50">
      <td className="py-2 pr-4 font-medium text-slate-700">{student.rollNumber}</td>
      <td className="py-2 pr-4 text-slate-600">{student.studentName ?? "—"}</td>
      <td className="py-2 pr-4 text-slate-600">
        {student.correctCount}/{student.totalQuestions}
      </td>
      <td className="py-2 pr-4 text-slate-600">{fmtPercent(student.percent)}</td>
      <td className="py-2 pr-4">
        <Badge
          className={cn(
            "border-transparent",
            above ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}
        >
          {above ? "Above cutoff" : "Below cutoff"}
        </Badge>
      </td>
    </tr>
  );
}

function BatchSection({ batch, cutoff }: { batch: BranchNode["subjects"][number]["classes"][number]["batches"][number]; cutoff: number }) {
  const aboveCount = batch.students.filter((s) => s.percent >= cutoff).length;
  const belowCount = batch.appeared - aboveCount;

  return (
    <details className="rounded-md border border-slate-200 bg-white transition-colors hover:border-brand-indigo/30">
      <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-4 py-3 text-sm">
        <div>
          <span className="font-medium text-slate-900">{batch.batchName}</span>
          <span className="ml-2 text-slate-400">({batch.testCode})</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>
            {batch.appeared}/{batch.totalStudents} appeared
          </span>
          <span>Avg {fmtPercent(batch.averagePercent)}</span>
          <Badge className="border-transparent bg-success/10 text-success">{aboveCount} above</Badge>
          <Badge className="border-transparent bg-destructive/10 text-destructive">{belowCount} below</Badge>
          <Link href={`/tests/${batch.id}/sheets`} className="font-medium text-brand-indigo hover:underline" onClick={(e) => e.stopPropagation()}>
            Open batch
          </Link>
        </div>
      </summary>
      <div className="border-t border-slate-100 px-4 py-3">
        {batch.students.length === 0 ? (
          <p className="text-sm text-slate-500">No graded sheets yet for this batch.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400">
                  <th className="py-2 pr-4 font-medium">Roll No.</th>
                  <th className="py-2 pr-4 font-medium">Student</th>
                  <th className="py-2 pr-4 font-medium">Score</th>
                  <th className="py-2 pr-4 font-medium">%</th>
                  <th className="py-2 pr-4 font-medium">Cutoff</th>
                </tr>
              </thead>
              <tbody>
                {batch.students.map((s) => (
                  <StudentRow key={s.rosterEntryId} student={s} cutoff={cutoff} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </details>
  );
}

function ClassSection({ classNode, cutoff }: { classNode: BranchNode["subjects"][number]["classes"][number]; cutoff: number }) {
  const appeared = classNode.batches.reduce((sum, b) => sum + b.appeared, 0);
  const avg =
    appeared > 0
      ? classNode.batches.reduce((sum, b) => sum + b.averagePercent * b.appeared, 0) / appeared
      : 0;

  return (
    <details className="rounded-md border border-slate-200 bg-slate-50" open>
      <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-4 py-2.5 text-sm font-medium text-slate-800">
        <span>Class {classNode.classLevel}</span>
        <span className="text-xs font-normal text-slate-500">
          {appeared} appeared · Avg {fmtPercent(avg)}
        </span>
      </summary>
      <div className="flex flex-col gap-2 px-4 pb-4 pt-1">
        {classNode.batches.map((batch) => (
          <BatchSection key={batch.id} batch={batch} cutoff={cutoff} />
        ))}
      </div>
    </details>
  );
}

function SubjectSection({ subject, cutoff }: { subject: BranchNode["subjects"][number]; cutoff: number }) {
  return (
    <details className="rounded-md border border-slate-200" open>
      <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-slate-900">{subject.subject}</summary>
      <div className="flex flex-col gap-2 px-3 pb-3 pt-1">
        {subject.classes.map((classNode) => (
          <ClassSection key={classNode.classLevel} classNode={classNode} cutoff={cutoff} />
        ))}
      </div>
    </details>
  );
}

function BranchSection({
  branch,
  cutoff,
  subsectionPerformance,
  index,
}: {
  branch: BranchNode;
  cutoff: number;
  subsectionPerformance: SubsectionPerformanceRow[];
  index: number;
}) {
  const branchSubsectionRows = subsectionPerformance.filter((row) => row.branchId === branch.branchId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Card className="border-slate-200 p-4">
        <h2 className="mb-3 text-base font-semibold text-slate-900">{branch.branchName}</h2>
        <SubsectionBreakdown rows={branchSubsectionRows} />
        <div className="flex flex-col gap-2">
          {branch.subjects.map((subject) => (
            <SubjectSection key={subject.subject} subject={subject} cutoff={cutoff} />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

export function ControlRoomView({
  branches,
  subsectionPerformance,
}: {
  branches: BranchNode[];
  subsectionPerformance: SubsectionPerformanceRow[];
}) {
  const [cutoff, setCutoff] = useState(40);

  const totals = useMemo(() => {
    let appeared = 0;
    let scoreSum = 0;
    let aboveCutoff = 0;
    for (const branch of branches) {
      for (const subject of branch.subjects) {
        for (const classNode of subject.classes) {
          for (const batch of classNode.batches) {
            appeared += batch.appeared;
            scoreSum += batch.averagePercent * batch.appeared;
            aboveCutoff += batch.students.filter((s) => s.percent >= cutoff).length;
          }
        }
      }
    }
    return { appeared, avg: appeared > 0 ? scoreSum / appeared : 0, aboveCutoff };
  }, [branches, cutoff]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard icon={Users} value={totals.appeared} label="Total appeared (all branches)" />
        <MetricCard icon={TrendingUp} value={fmtPercent(totals.avg)} label="Overall average" />
        <MetricCard
          icon={Target}
          value={totals.appeared > 0 ? `${totals.aboveCutoff}/${totals.appeared}` : "—"}
          label={`Above ${cutoff}% cutoff`}
        />
      </div>

      <Card className="border-slate-200">
        <CardContent className="flex flex-wrap items-end gap-4 p-4">
          <div className="max-w-[160px]">
            <Label htmlFor="cutoff">Cutoff %</Label>
            <Input
              id="cutoff"
              type="number"
              min={0}
              max={100}
              value={cutoff}
              onChange={(e) => setCutoff(Number(e.target.value) || 0)}
            />
          </div>
          <p className="pb-2 text-xs text-slate-500">Drag the cutoff to instantly re-slice every branch below.</p>
        </CardContent>
      </Card>

      {branches.length === 0 ? (
        <p className="text-sm text-slate-500">No test batches yet.</p>
      ) : (
        branches.map((branch, index) => (
          <BranchSection
            key={branch.branchId ?? "unassigned"}
            branch={branch}
            cutoff={cutoff}
            subsectionPerformance={subsectionPerformance}
            index={index}
          />
        ))
      )}
    </div>
  );
}
