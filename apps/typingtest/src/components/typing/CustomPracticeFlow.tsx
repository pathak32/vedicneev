"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Switch } from "@vedicneev/ui";

import { TypingArena } from "./TypingArena";

const DURATION_OPTIONS = [
  { label: "5 minutes", seconds: 300 },
  { label: "10 minutes", seconds: 600 },
  { label: "15 minutes", seconds: 900 },
];

const MIN_LENGTH = 40;

/** Two-phase client flow for Custom Text Practice — compose (paste text + configure), then hand off straight into the same TypingArena catalog exams use, just with customPassageText instead of a passageId. */
export function CustomPracticeFlow() {
  const [text, setText] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(600);
  const [backspaceDisabled, setBackspaceDisabled] = useState(false);
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <TypingArena
        examSlug="custom-practice"
        attemptEndpoint="/api/attempts"
        customPassageText={text}
        passageText={text}
        durationSeconds={durationSeconds}
        backspacePolicy={backspaceDisabled ? "DISABLED" : "ENABLED_WITH_PENALTY"}
        layout="QWERTY"
      />
    );
  }

  return (
    <div className="container flex max-w-2xl flex-col gap-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Custom Text Practice</h1>
        <p className="text-sm text-muted-foreground">
          Paste any passage, legal draft, or official text — get graded with the same Gross/Net Speed, Accuracy, and
          Full/Half Mistake breakdown as the official catalog.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Text</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Paste or type the passage you want to practice on..."
            className="w-full rounded-lg border border-input bg-background p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Custom practice text"
          />
          <p className="text-xs text-muted-foreground">
            {text.trim().length} characters {text.trim().length < MIN_LENGTH ? `(minimum ${MIN_LENGTH})` : ""}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-foreground">Duration:</span>
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.seconds}
                type="button"
                onClick={() => setDurationSeconds(option.seconds)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  durationSeconds === option.seconds
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <Switch checked={backspaceDisabled} onCheckedChange={setBackspaceDisabled} />
            Disable backspace (simulate a strict exam)
          </label>

          <Button
            type="button"
            size="lg"
            disabled={text.trim().length < MIN_LENGTH}
            onClick={() => setStarted(true)}
          >
            Start Custom Test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
