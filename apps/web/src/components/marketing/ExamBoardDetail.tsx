"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Play, Printer, ScanLine } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@vedicneev/ui";

import { useT } from "@/lib/i18n/useT";
import { BOARD_DATA, type BoardType, type ClassType } from "@/lib/marketing/examBoards";

export function ExamBoardDetail({ board }: { board: BoardType }) {
  const t = useT();
  const [selectedClass, setSelectedClass] = useState<ClassType>("6");

  const boardInfo = BOARD_DATA[board];
  const classInfo = boardInfo.classes[selectedClass];

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12">
      <Link href="/" className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("backToHomeLabel")}
      </Link>

      <div>
        <Badge variant="outline" className="mb-2 border-primary/40 text-xs font-bold text-primary">
          {t(boardInfo.badgeKey)}
        </Badge>
        <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">{t(boardInfo.nameKey)}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t(boardInfo.descKey)}</p>
      </div>

      <div className="flex items-center gap-2">
        {(["6", "9"] as ClassType[]).map((cls) => (
          <button
            key={cls}
            type="button"
            onClick={() => setSelectedClass(cls)}
            className={`rounded-xl border px-4 py-1.5 text-xs font-extrabold transition-all ${
              selectedClass === cls
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-accent"
            }`}
          >
            {t("classLabel")} {cls}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("examBoardPagePatternHeading")}</CardTitle>
          <CardDescription>
            {classInfo.duration} · {classInfo.totalMarks}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ul className="flex flex-col gap-2">
            {classInfo.sections.map((sec, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3 text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  {t(sec.nameKey)}
                </span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {sec.q} · {sec.marks}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t("eligibilityStandardsLabel")}
              </h3>
              <p className="mt-1 text-sm">
                <strong>{t("requirementLabel")}</strong> {t(classInfo.eligibilityKey)}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{t("eligibilityBlueprintNote")}</p>

            <div className="mt-auto flex flex-col gap-2 pt-2">
              <Button asChild size="lg">
                <Link href={classInfo.link}>
                  <Play className="h-4 w-4" />
                  {t("examBoardPageCta")}
                </Link>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/exam/${board}-class-${selectedClass}-demo/omr/print`}>
                    <Printer className="h-3.5 w-3.5" />
                    {t("printOmrLabel")}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/exam/${board}-class-${selectedClass}-demo/omr/scan`}>
                    <ScanLine className="h-3.5 w-3.5" />
                    {t("scanOmrLabel")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        {(Object.keys(BOARD_DATA) as BoardType[])
          .filter((b) => b !== board)
          .map((b) => (
            <Link
              key={b}
              href={`/exam-boards/${b}`}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {t(BOARD_DATA[b].nameKey).split(" ")[0]}
              <ArrowRight className="h-3 w-3" />
            </Link>
          ))}
      </div>
    </main>
  );
}
