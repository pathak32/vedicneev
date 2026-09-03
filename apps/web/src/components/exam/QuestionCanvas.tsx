"use client";

import { Badge, cn } from "@vedicneev/ui";
import { RadioGroup, RadioGroupItem } from "@vedicneev/ui";

import { localize } from "@/lib/exam/localize";
import type { ExamQuestion, LanguageCode } from "@/lib/exam/types";

const OPTION_LABELS = ["A", "B", "C", "D"];

const DIFFICULTY_VARIANT: Record<ExamQuestion["difficulty"], "secondary" | "default" | "destructive"> = {
  EASY: "secondary",
  MEDIUM: "default",
  HARD: "destructive",
};

export interface QuestionCanvasProps {
  question: ExamQuestion;
  language: LanguageCode;
  questionNumber: number;
  selectedOption: string | undefined;
  onSelect: (optionId: string) => void;
}

export function QuestionCanvas({
  question,
  language,
  questionNumber,
  selectedOption,
  onSelect,
}: QuestionCanvasProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Q{questionNumber}</Badge>
        <Badge variant={DIFFICULTY_VARIANT[question.difficulty]}>{question.difficulty}</Badge>
      </div>

      <p className="text-xl font-semibold leading-relaxed text-foreground md:text-2xl">
        {localize(question.content, language)}
      </p>

      {question.figureMetadata?.type === "svg" && question.figureMetadata.markup ? (
        <div
          className="flex justify-center rounded-lg border border-border bg-muted/40 p-6 text-foreground [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-md"
          // Trusted, admin-authored question-bank content only — never end-user input.
          dangerouslySetInnerHTML={{ __html: question.figureMetadata.markup }}
        />
      ) : null}

      {question.figureMetadata?.type === "image" && question.figureMetadata.url ? (
        <div className="flex justify-center rounded-lg border border-border bg-muted/40 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.figureMetadata.url}
            alt=""
            className="max-h-64 w-auto rounded-md object-contain"
          />
        </div>
      ) : null}

      <RadioGroup
        value={selectedOption ?? ""}
        onValueChange={onSelect}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        aria-label="Answer options"
      >
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option.id;
          return (
            <RadioGroupItem
              key={option.id}
              value={option.id}
              className={cn(
                "group flex min-h-[64px] cursor-pointer items-center gap-3 rounded-xl border-2 p-4 text-left text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-lg",
                isSelected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40 text-muted-foreground"
                )}
              >
                {OPTION_LABELS[index]}
              </span>
              <span className="flex-1">
                {option.text?.[language] ?? option.text?.en ?? ""}
              </span>
              {option.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={option.imageUrl} alt="" className="h-10 w-10 object-contain" />
              ) : null}
              <span className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground sm:inline">
                {index + 1}
              </span>
            </RadioGroupItem>
          );
        })}
      </RadioGroup>
    </div>
  );
}
