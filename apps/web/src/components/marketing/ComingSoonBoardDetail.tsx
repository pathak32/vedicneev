import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, PenLine, ScrollText, Sparkles } from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@vedicneev/ui";

import type { BoardType } from "@/lib/marketing/examBoards";
import { COMING_SOON_BOARD_DATA, type ComingSoonBoardType } from "@/lib/marketing/comingSoonBoards";

const OTHER_BOARD_LABELS: Record<BoardType, string> = { jnvst: "JNVST", aissee: "AISSEE", rms: "RMS" };

/**
 * The lighter-weight sibling to ExamBoardDetail.tsx — for a board whose
 * real syllabus structure is ready (subject/subsection + a one-line
 * explanation each) but whose question bank, mock tests, and OMR practice
 * aren't built yet. Deliberately doesn't pretend those features exist:
 * the "Coming Soon" card is the honest state, not a disabled-looking
 * button pretending to almost work.
 */
export function ComingSoonBoardDetail({ board }: { board: ComingSoonBoardType }) {
  const info = COMING_SOON_BOARD_DATA[board];
  const hasQuestionBank = info.subjects.some((subject) => subject.subsections.some((sub) => sub.topicKey));

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12">
      <Link href="/" className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </Link>

      <div>
        <Badge variant="outline" className="mb-2 border-primary/40 text-xs font-bold text-primary">
          {info.badge}
        </Badge>
        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">{info.name}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{info.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ScrollText className="h-4 w-4 text-primary" />
            Exam Pattern
          </CardTitle>
          <CardDescription>{info.conductedBy}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {info.papers.map((paper) => (
              <div key={paper.name} className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-sm font-semibold text-foreground">{paper.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{paper.detail}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Eligibility</h3>
            <p className="mt-1 text-sm">{info.eligibility}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Syllabus</CardTitle>
          <CardDescription>Every subject and its subsections, at a glance.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {info.subjects.map((subject) => (
            <div key={subject.name}>
              <h3 className="text-sm font-bold text-foreground">{subject.name}</h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {subject.subsections.map((sub) => (
                  <li key={sub.name} className="rounded-lg border border-border bg-muted/30 p-2.5 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>
                        <span className="font-medium text-foreground">{sub.name}</span>
                        <span className="text-muted-foreground"> — {sub.blurb}</span>
                      </span>
                      {sub.topicKey ? (
                        <Link
                          href={`/practice/${sub.topicKey}`}
                          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2 py-1 text-xs font-bold text-primary hover:bg-primary/10"
                        >
                          <PenLine className="h-3 w-3" />
                          Practice Questions
                        </Link>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clock className="h-5 w-5" />
          </span>
          {hasQuestionBank ? (
            <>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Full-length mock test & OMR practice — coming soon
              </p>
              <p className="max-w-md text-xs text-muted-foreground">
                Topic-wise practice questions are live now — tap &quot;Practice Questions&quot; on any subsection
                above. A full timed mock paper and OMR scanning for {info.name.split(" ")[0]} are being built next.
              </p>
            </>
          ) : (
            <>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Question bank, mock tests & OMR practice — coming soon
              </p>
              <p className="max-w-md text-xs text-muted-foreground">
                The full {info.name.split(" ")[0]} question bank and live mock experience is being built next. This
                page will update automatically once it&apos;s ready.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        {(Object.keys(OTHER_BOARD_LABELS) as BoardType[]).map((b) => (
          <Link
            key={b}
            href={`/exam-boards/${b}`}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {OTHER_BOARD_LABELS[b]}
            <ArrowRight className="h-3 w-3" />
          </Link>
        ))}
      </div>
    </main>
  );
}
