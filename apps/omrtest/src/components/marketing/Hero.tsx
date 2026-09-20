import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, MessageCircle, ScanLine } from "lucide-react";

import { Button } from "@vedicneev/ui";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-gradient text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="container relative grid gap-14 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
            Built for JNVST · AISSEE · RMS coaching academies
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Turn Any Smartphone into an{" "}
            <span className="text-transparent [background-clip:text] [-webkit-background-clip:text] bg-gradient-to-r from-sky-300 to-indigo-200">
              Instant OMR Grading Machine
            </span>{" "}
            for Your Residential Coaching Academy
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Scan a full batch of answer sheets in minutes, not days. VedicNeev grades every
            sheet, isolates results by branch, and pushes each student&apos;s scorecard to their
            parent&apos;s WhatsApp — automatically.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-white text-brand-navy hover:bg-white/90">
              <Link href="/login">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Login with WhatsApp
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="#pricing">
                Book a Demo
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              No app install for parents
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              Onboard a branch in under 10 minutes
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="mb-4 flex items-center justify-between text-xs font-medium text-white/60">
                <span className="flex items-center gap-1.5">
                  <ScanLine className="h-3.5 w-3.5" aria-hidden="true" />
                  Scanning batch — Class 6, Sec B
                </span>
                <span className="text-emerald-300">Aligned</span>
              </div>
              <div className="grid grid-cols-10 gap-1.5">
                {Array.from({ length: 40 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full ${
                      i % 7 === 0 ? "bg-sky-300" : "bg-white/15"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10">
                <ArrowRight className="h-4 w-4 rotate-90 text-white/70" aria-hidden="true" />
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white p-5 text-brand-navy shadow-2xl shadow-black/40">
              <div className="mb-4 flex items-center justify-between text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                  Student Analytics Report
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  Graded
                </span>
              </div>
              <div className="flex items-end gap-2">
                {[62, 88, 74, 95, 58, 81].map((height, i) => (
                  <span
                    key={i}
                    className="w-full rounded-t-sm bg-brand-indigo/80"
                    style={{ height: `${height * 0.6}px` }}
                  />
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Sectional accuracy sent to WhatsApp in real time
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
