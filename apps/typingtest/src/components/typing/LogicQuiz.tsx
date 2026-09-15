"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { Loader2 } from "lucide-react";

export interface LogicQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export interface LogicQuizProps {
  attemptId: string;
  questions: LogicQuizQuestion[];
}

interface AnsweredQuestion {
  questionId: string;
  selectedIndex: number;
  responseMs: number;
}

/**
 * The "Typing Speed & Logic" dual-mode module's rapid-fire half: shown
 * immediately after a candidate submits a timed passage (see
 * app/exams/[slug]/logic/page.tsx), one MCQ at a time with per-question
 * response time tracked. correctIndex is deliberately never sent to the
 * client (these props only carry prompt/options) — grading happens
 * server-side in the /api/attempts/[id]/logic route, which is the only
 * place TypingLogicQuestion.correctIndex is read.
 */
export function LogicQuiz({ attemptId, questions }: LogicQuizProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([]);
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  async function finish(finalAnswers: AnsweredQuestion[]) {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/attempts/${attemptId}/logic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Could not save your logic quiz results.");
        setSubmitting(false);
        return;
      }
    } catch {
      setError("Network error while saving your results.");
      setSubmitting(false);
      return;
    }
    router.push(`/results/${attemptId}`);
  }

  function handleAnswer(optionIndex: number) {
    if (!question) return;
    const responseMs = Date.now() - questionStartedAt;
    const nextAnswers = [...answers, { questionId: question.id, selectedIndex: optionIndex, responseMs }];
    setAnswers(nextAnswers);

    if (isLast) {
      finish(nextAnswers);
      return;
    }
    setIndex((i) => i + 1);
    setQuestionStartedAt(Date.now());
  }

  if (!question) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-8">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span>Rapid-fire — answer as fast as you can</span>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-lg font-medium text-foreground">{question.prompt}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option, i) => (
          <Button
            key={i}
            type="button"
            variant="outline"
            size="lg"
            disabled={submitting}
            className="h-auto justify-start whitespace-normal py-3 text-left"
            onClick={() => handleAnswer(i)}
          >
            {option}
          </Button>
        ))}
      </div>

      {submitting ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Saving your results...
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
