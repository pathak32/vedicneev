"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Target, TrendingUp, Users } from "lucide-react";

import { Badge, Card, CardContent, cn } from "@vedicneev/ui";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { CutoffDonutChart } from "@/components/charts/CutoffDonutChart";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { accuracyColor, CHART_COLORS } from "@/components/charts/colors";
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
    <details className="mb-3 rounded-md border border-slate-200 bg-slate-50" open>
      <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:text-brand-indigo">
        By Subject &amp; Subsection — accuracy
      </summary>
      <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
        {[...bySubject.values()].map(({ subjectName, rows: subjectRows }) => {
          const chartData = subjectRows
            .map((row) => {
              const attempted = row.correctCount + row.incorrectCount;
              const accuracy = attempted > 0 ? (row.correctCount / attempted) * 100 : 0;
              return { label: row.subsectionName, value: accuracy, color: accuracyColor(accuracy) };
            })
            .sort((a, b) => a.value - b.value);
          return (
            <div key={subjectName}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{subjectName}</h3>
              <HorizontalBarChart data={chartData} max={100} valueSuffix="%" />
            </div>
          );
        })}
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
      <td className="py-2 pr-4">
        <div className="flex items-center gap-2">
          <span className="w-9 text-slate-600">{fmtPercent(student.percent)}</span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full", above ? "bg-success" : "bg-destructive")}
              style={{ width: `${Math.min(100, student.percent)}%` }}
            />
          </div>
        </div>
      </td>
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

  const abovePct = batch.appeared > 0 ? (aboveCount / batch.appeared) * 100 : 0;

  return (
    <details className="rounded-md border border-slate-200 bg-white transition-colors hover:border-brand-indigo/30">
      <summary className="flex cursor-pointer select-none flex-col gap-2 px-4 py-3 text-sm">
        <div className="flex items-center justify-between gap-4">
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
        </div>
        {batch.appeared > 0 ? (
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-success" style={{ width: `${abovePct}%` }} />
            <div className="h-full bg-destructive" style={{ width: `${100 - abovePct}%` }} />
          </div>
        ) : null}
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

  const branchAverages = useMemo(() => {
    return branches
      .map((branch) => {
        let appeared = 0;
        let scoreSum = 0;
        for (const subject of branch.subjects) {
          for (const classNode of subject.classes) {
            for (const batch of classNode.batches) {
              appeared += batch.appeared;
              scoreSum += batch.averagePercent * batch.appeared;
            }
          }
        }
        const avg = appeared > 0 ? scoreSum / appeared : 0;
        return { label: branch.branchName, value: avg, color: accuracyColor(avg) };
      })
      .filter((row) => row.value > 0 || branches.length === 1);
  }, [branches]);

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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Above vs Below Cutoff</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS.success }} />
                  Above
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS.destructive }} />
                  Below
                </span>
              </div>
            </div>
            <CutoffDonutChart above={totals.aboveCutoff} below={totals.appeared - totals.aboveCutoff} />
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">Branch-wise Average</h2>
            {branchAverages.length > 0 ? (
              <HorizontalBarChart data={branchAverages} max={100} valueSuffix="%" />
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">No graded results yet.</p>
            )}
          </CardContent>
        </Card>
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
