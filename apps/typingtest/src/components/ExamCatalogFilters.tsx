"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import { localize } from "@/lib/localize";

export interface CatalogExam {
  id: string;
  slug: string;
  name: unknown;
  organization: string;
  language: string;
  layout: "QWERTY" | "INSCRIPT" | "REMINGTON";
  durationSeconds: number;
  difficulty: string;
}

const ALL = "ALL";

/** Client-side filters over the already-fetched catalog — the exam count is small enough that a round-trip per filter change would be pure overhead. */
export function ExamCatalogFilters({ exams }: { exams: CatalogExam[] }) {
  const [organization, setOrganization] = useState(ALL);
  const [layout, setLayout] = useState(ALL);
  const [duration, setDuration] = useState(ALL);

  const organizations = useMemo(() => [...new Set(exams.map((e) => e.organization))].sort(), [exams]);
  const durations = useMemo(() => [...new Set(exams.map((e) => e.durationSeconds))].sort((a, b) => a - b), [exams]);

  const filtered = exams.filter(
    (exam) =>
      (organization === ALL || exam.organization === organization) &&
      (layout === ALL || exam.layout === layout) &&
      (duration === ALL || exam.durationSeconds === Number(duration))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <select
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter by organization"
        >
          <option value={ALL}>All organizations</option>
          {organizations.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>

        <select
          value={layout}
          onChange={(e) => setLayout(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter by keyboard layout"
        >
          <option value={ALL}>All layouts</option>
          <option value="QWERTY">English (QWERTY)</option>
          <option value="INSCRIPT">Hindi (Inscript)</option>
          <option value="REMINGTON">Hindi (Remington)</option>
        </select>

        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter by duration"
        >
          <option value={ALL}>All durations</option>
          {durations.map((seconds) => (
            <option key={seconds} value={seconds}>
              {Math.round(seconds / 60)} min
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((exam) => (
          <Link key={exam.id} href={`/exams/${exam.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{localize(exam.name)}</CardTitle>
                  <Badge variant="outline">{exam.language}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span>{exam.organization}</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">{Math.round(exam.durationSeconds / 60)} min</Badge>
                  <Badge variant="secondary">{exam.layout}</Badge>
                  <Badge variant="secondary">{exam.difficulty}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No exams match these filters.</p>
      ) : null}
    </div>
  );
}
