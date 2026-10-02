import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, CardContent } from "@vedicneev/ui";
import { BarChart3, FileText, ScanLine, ShieldCheck, Smartphone } from "lucide-react";

import { InstituteInterestForm } from "@/components/marketing/InstituteInterestForm";

const title = "OMR Grading for Coaching Institutes | VedicNeev";
const description =
  "Grade OMR sheets from a phone camera, get section-wise analysis and a mistake report for every student. Try one real test batch free with 10 grading credits.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/for-institutes" },
  openGraph: { title, description, url: "/for-institutes" },
  twitter: { title, description },
};

const STEPS = [
  {
    icon: FileText,
    heading: "1. Create the test",
    body: "Set up a batch and generate OMR sheets. Every student gets a sheet with their own roll number and a unique token. You can add the answer key later, even after printing.",
  },
  {
    icon: Smartphone,
    heading: "2. Print and run it",
    body: "Print the sheets and take the test as you always do. No special scanner, no new hardware.",
  },
  {
    icon: ScanLine,
    heading: "3. Scan with a phone",
    body: "Photograph each filled sheet. It is read and graded in under 3 seconds, and the report is ready for you to share.",
  },
];

const FEATURES = [
  {
    icon: BarChart3,
    heading: "Section-wise analysis",
    body: "See where each student and each batch lost marks, section by section, not just a total.",
  },
  {
    icon: FileText,
    heading: "A Mistake Vault for every student",
    body: "Every wrong answer is tagged as careless, a calculation slip, or a concept gap, so you know what to fix.",
  },
  {
    icon: ShieldCheck,
    heading: "One sheet, one student",
    body: "A second scan of the same sheet is rejected, so photocopies cannot sneak into your results.",
  },
];

const FAQ = [
  {
    q: "What do I need to try it?",
    a: "A smartphone, a printer and one real test batch. That is all.",
  },
  {
    q: "What if a photo is blurry?",
    a: "A sheet that cannot be read is rejected and does not use up a credit. Scan it again.",
  },
  {
    q: "Which exams does it suit?",
    a: "Any objective test on an OMR sheet. We built it with institutes preparing students for JNVST, Sainik School (AISSEE) and RMS in mind.",
  },
  {
    q: "What does it cost after the free trial?",
    a: "We will share the pricing with you before you pay anything. The trial itself costs nothing.",
  },
];

export default function ForInstitutesPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-12">
      <section className="flex flex-col items-start gap-5">
        <Badge variant="outline" className="border-primary/40 text-xs font-bold text-primary">
          For coaching institutes and schools
        </Badge>
        <h1 className="max-w-3xl text-4xl font-black tracking-tight text-foreground md:text-5xl">
          Stop making teachers check OMR sheets manually.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Grade an OMR sheet from your phone camera in under 3 seconds. Get scores, section-wise analysis and a mistake
          report for every student, on the same day as the test.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#get-started"
            className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Get 10 free grading credits
          </a>
          <span className="text-sm text-muted-foreground">One real test batch. No contract.</span>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-foreground">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, heading, body }) => (
            <Card key={heading}>
              <CardContent className="flex flex-col gap-2 p-5">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-foreground">{heading}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-foreground">What you get</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, heading, body }) => (
            <Card key={heading}>
              <CardContent className="flex flex-col gap-2 p-5">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-foreground">{heading}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="get-started" className="grid scroll-mt-24 gap-8 md:grid-cols-5">
        <div className="flex flex-col gap-3 md:col-span-2">
          <h2 className="text-2xl font-bold text-foreground">Try one real batch, free</h2>
          <p className="text-muted-foreground">
            Pick one real test from your institute. We grade it with you. You decide whether it saved you an evening.
          </p>
          <ul className="flex flex-col gap-2 text-sm text-foreground">
            <li>10 free grading credits</li>
            <li>No payment, no card, no contract</li>
            <li>We message you on WhatsApp to get started</li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <InstituteInterestForm />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-foreground">Questions</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="rounded-lg border border-border p-4">
              <h3 className="font-semibold text-foreground">{q}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="https://omrtest.vedicneev.com" className="font-medium text-primary hover:underline">
          Log in to OMR grading
        </a>
        . Built by the team behind{" "}
        <Link href="/" className="font-medium text-primary hover:underline">
          VedicNeev
        </Link>{" "}
        and Vedic Mind AI.
      </p>
    </main>
  );
}
