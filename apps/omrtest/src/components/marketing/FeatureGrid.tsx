import { Languages, LayoutGrid, MessageCircleMore, ScanEye, ShieldCheck, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

const FEATURES = [
  {
    icon: ScanEye,
    title: "AI Homography Alignment",
    description:
      "Every phone photo — tilted, curled, or shadowed — is auto-corrected to a perfect flat scan before grading starts.",
  },
  {
    icon: ShieldCheck,
    title: "Zero Paper-Jam Errors",
    description:
      "No feeders, no scanners, no jams. A smartphone camera and our alignment engine replace the whole hardware stack.",
  },
  {
    icon: MessageCircleMore,
    title: "Instant WhatsApp Parent Scorecards",
    description:
      "The moment a batch is graded, every parent gets their child's scorecard on WhatsApp — no app, no portal login.",
  },
  {
    icon: LayoutGrid,
    title: "Multi-Branch Isolation",
    description:
      "Run every campus as its own tenant. Staff, batches, and results stay scoped to the branch they belong to.",
  },
  {
    icon: Sparkles,
    title: "Section-Wise Analytics & Mistake Vault",
    description:
      "See exactly which sections and question types cost marks, and build a per-student vault of recurring mistakes.",
  },
  {
    icon: Languages,
    title: "Bilingual OMR Support",
    description:
      "Question sets and reports render in English or Hindi from the same answer key — one setup, both languages.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="bg-slate-50 py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything a residential academy needs to grade at scale
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Purpose-built for the batch sizes and turnaround pressure of entrance-exam coaching.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-indigo/10 text-brand-indigo">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <CardTitle className="mt-3 text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-slate-600">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
