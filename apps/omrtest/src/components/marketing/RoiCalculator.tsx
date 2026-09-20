"use client";

import { useMemo, useState } from "react";
import { Clock, IndianRupee } from "lucide-react";

import { Card, CardContent } from "@vedicneev/ui";

const MIN_STUDENTS = 100;
const MAX_STUDENTS = 2000;
const STEP = 50;
const DEFAULT_STUDENTS = 500;

// Illustrative assumptions, shown to the visitor in the disclaimer below —
// not measured customer data, just what the slider's estimate is built on.
const MANUAL_MINUTES_PER_SHEET = 3;
const PAPER_COST_PER_SHEET_INR = 6;

export function RoiCalculator() {
  const [students, setStudents] = useState(DEFAULT_STUDENTS);

  const { hoursSaved, rupeesSaved } = useMemo(() => {
    const totalMinutes = students * MANUAL_MINUTES_PER_SHEET;
    return {
      hoursSaved: Math.round((totalMinutes / 60) * 10) / 10,
      rupeesSaved: students * PAPER_COST_PER_SHEET_INR,
    };
  }, [students]);

  return (
    <section id="calculator" className="bg-white py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            See what one test cycle costs you today
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Move the slider to your student count and see the time and paper cost a single
            batch scan eliminates.
          </p>
        </div>

        <Card className="mx-auto mt-10 max-w-3xl border-slate-200 shadow-md">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <label htmlFor="student-count" className="text-sm font-medium text-slate-700">
                Number of students per test cycle
              </label>
              <span className="rounded-full bg-brand-indigo/10 px-3 py-1 text-sm font-semibold text-brand-indigo">
                {students.toLocaleString("en-IN")} students
              </span>
            </div>

            <input
              id="student-count"
              type="range"
              min={MIN_STUDENTS}
              max={MAX_STUDENTS}
              step={STEP}
              value={students}
              onChange={(event) => setStudents(Number(event.target.value))}
              className="mt-4 w-full accent-brand-indigo"
              aria-valuetext={`${students} students`}
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>{MIN_STUDENTS.toLocaleString("en-IN")}</span>
              <span>{MAX_STUDENTS.toLocaleString("en-IN")}</span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-indigo shadow-sm">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="mt-3 text-2xl font-bold text-slate-900">{hoursSaved} hrs</p>
                <p className="text-sm text-slate-500">of manual grading time saved</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-indigo shadow-sm">
                  <IndianRupee className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="mt-3 text-2xl font-bold text-slate-900">
                  ₹{rupeesSaved.toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-slate-500">in paper, printing &amp; logistics cut</p>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-400">
              Estimates assume {MANUAL_MINUTES_PER_SHEET} minutes of manual checking and ₹
              {PAPER_COST_PER_SHEET_INR} of paper/printing/logistics per sheet — illustrative,
              based on typical academy workflows.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
