"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, ScanLine, Zap } from "lucide-react";

/**
 * Calculation assumptions — kept together so the numbers on the page are easy
 * to audit. At the defaults (300 students × 4 tests) manual checking comes to
 * 1,200 sheets × 2.4 min = 48 hours/month.
 */
const MANUAL_MINUTES_PER_SHEET = 2.4; // checking + totalling + marks entry
const FACULTY_COST_PER_HOUR_INR = 400;
const OMR_SECONDS_PER_SHEET = 0.4; // batch phone/scanner capture

const STUDENTS = { min: 50, max: 2000, step: 50, default: 300 };
const TESTS = { min: 1, max: 8, step: 1, default: 4 };

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-IN");

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.max(1, Math.ceil(minutes))} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export default function CoachingCalculatorPage() {
  const [students, setStudents] = useState(STUDENTS.default);
  const [tests, setTests] = useState(TESTS.default);

  const sheets = students * tests;
  const manualHours = (sheets * MANUAL_MINUTES_PER_SHEET) / 60;
  const manualCost = manualHours * FACULTY_COST_PER_HOUR_INR;
  const omrMinutes = (sheets * OMR_SECONDS_PER_SHEET) / 60;
  const omrCost = (omrMinutes / 60) * FACULTY_COST_PER_HOUR_INR;
  const hoursSaved = manualHours - omrMinutes / 60;
  const moneySaved = manualCost - omrCost;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 md:py-14">
      {/* Hero */}
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Coaching Operational Efficiency &amp; Time-Waste Calculator
        </p>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">
          Manual Grading vs. Automated Intelligence: What is Sunday Costing Your Academy?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
          Test your operational IQ. Slide to see how much time and faculty money manual paper checking drains from
          your coaching business every month.
        </p>
      </header>

      {/* Sliders */}
      <section className="flex flex-col gap-6 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <SliderField
          id="students"
          label="Active Student Batch Count"
          value={students}
          display={`${num.format(students)} students`}
          {...STUDENTS}
          onChange={setStudents}
        />
        <SliderField
          id="tests"
          label="Weekly Tests Conducted per Month"
          value={tests}
          display={`${tests} ${tests === 1 ? "test" : "tests"}`}
          {...TESTS}
          onChange={setTests}
        />
        <p className="text-center text-xs text-muted-foreground">
          = <span className="font-semibold text-foreground">{num.format(sheets)}</span> answer sheets to check every
          month
        </p>
      </section>

      {/* Comparison */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-live="polite">
        <div className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/30">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-red-700 dark:text-red-400">
            <Clock className="h-4 w-4" /> Manual Method
          </h2>
          <Stat label="Hours wasted / month" value={`${num.format(Math.round(manualHours))} hrs`} tone="bad" />
          <Stat label="Estimated teacher cost / month" value={inr.format(manualCost)} tone="bad" />
          <p className="text-xs text-red-700/80 dark:text-red-300/70">
            {MANUAL_MINUTES_PER_SHEET} min per sheet · {inr.format(FACULTY_COST_PER_HOUR_INR)}/hr faculty time
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            <ScanLine className="h-4 w-4" /> VedicNeev OMR Automation
          </h2>
          <Stat label="Scanning time / month" value={formatDuration(omrMinutes)} tone="good" />
          <Stat
            label="Saved every month"
            value={`${num.format(Math.floor(hoursSaved))} hrs · ${inr.format(moneySaved)}`}
            tone="good"
          />
          <p className="text-xs text-emerald-700/80 dark:text-emerald-300/70">
            Instant auto-grading, ranks &amp; reports — no manual totalling
          </p>
        </div>
      </section>

      {/* Savings banner */}
      <section className="rounded-2xl bg-primary p-6 text-center text-primary-foreground shadow-lg">
        <Zap className="mx-auto h-7 w-7" />
        <p className="mt-2 text-xl font-extrabold leading-snug md:text-3xl">
          You reclaim {num.format(Math.floor(hoursSaved))}+ teaching hours every single month.
        </p>
        <p className="mt-2 text-sm opacity-90">
          That&apos;s {inr.format(moneySaved * 12)} of faculty time back every year.
        </p>
      </section>

      {/* CTA */}
      <Link
        href="/onboarding"
        className="group mx-auto flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto md:text-lg"
      >
        Claim Your 10 Free OMR Scans Now
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Link>

      <p className="text-center text-[11px] text-muted-foreground">
        Estimates based on {MANUAL_MINUTES_PER_SHEET} min manual checking per sheet, {OMR_SECONDS_PER_SHEET}s OMR
        scan per sheet and {inr.format(FACULTY_COST_PER_HOUR_INR)}/hr faculty cost. Your numbers may vary.
      </p>
    </div>
  );
}

function SliderField({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
          {label}
        </label>
        <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-sm font-bold text-primary">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer touch-pan-y accent-primary"
      />
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{num.format(min)}</span>
        <span>{num.format(max)}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "good" | "bad" }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-2xl font-extrabold tabular-nums md:text-3xl ${
          tone === "bad" ? "text-red-700 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
