import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Target, Clock, ListOrdered, Search, PenSquare } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@vedicneev/ui";

export const metadata: Metadata = {
  title: "Exam Strategy & Success Blueprint",
  description:
    "How to actually prepare for JNVST, AISSEE, and RMS — accuracy-first practice, section timing, a two-pass attempt strategy, and how to use the Mistake Vault.",
};

const STRATEGIES = [
  {
    icon: Target,
    title: "Master accuracy before speed",
    body: "Negative marking (where it applies) punishes guesswork more than a slow, careful answer. Build accuracy first with untimed practice, then add the clock once the underlying method is solid.",
  },
  {
    icon: Clock,
    title: "Time-box each section by marks, not question count",
    body: "Divide the total exam duration by section weight, not by how many questions it has. A 50-mark Mathematics section deserves more minutes per question than a 25-mark General Knowledge section.",
  },
  {
    icon: ListOrdered,
    title: "Attempt in two passes",
    body: "First pass: answer every question you're sure of and skip the rest — don't stall. Second pass: return to skipped questions with whatever time remains, so one hard question never costs you several easy marks elsewhere.",
  },
  {
    icon: Search,
    title: "Use the Mistake Vault, not just the score",
    body: "A score tells you what happened. The Mistake Vault tells you why — a careless slip or a real concept gap — so the next practice session targets the actual weak point instead of re-doing everything.",
  },
  {
    icon: PenSquare,
    title: "Simulate real exam conditions at least once",
    body: "Practice on a printed OMR sheet under the exact time limit before exam day, so filling bubbles under pressure is never the first time it happens for real.",
  },
];

export default function ExamStrategyPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12">
      <Link href="/" className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Home
      </Link>

      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
          Exam Strategy &amp; Success Blueprint
        </h1>
        <p className="mt-3 text-muted-foreground">
          How students actually prepare for JNVST, AISSEE, and RMS — not generic study advice, but the specific
          habits this platform is built to support.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {STRATEGIES.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title}>
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base">{s.title}</CardTitle>
                  <CardDescription className="mt-1">{s.body}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-muted-foreground">Put this into practice on a real, full-length paper.</p>
          <Button asChild size="lg">
            <Link href="/exam/demo-jnvst">
              Start a Free Full-Length Mock
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
