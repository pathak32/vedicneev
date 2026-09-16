import { diffTypedWords, type WordDiffEntry } from "@vedicneev/engine";
import { Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

const CLASS_BY_STATUS: Record<WordDiffEntry["status"], string> = {
  correct: "word-diff-correct",
  full: "word-diff-full",
  half: "word-diff-half",
  omitted: "word-diff-full",
};

/** Server-renderable word-by-word breakdown of one attempt against its target text — green/correct, red/full+omitted, yellow/half, matching the exact mistake classification evaluateTypingAttempt already graded on. */
export function SentenceXRay({ targetText, typedText }: { targetText: string; typedText: string }) {
  const words = diffTypedWords(targetText, typedText);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sentence X-Ray</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-lg leading-relaxed">
          {words.map((entry, i) => (
            <span key={i} className={CLASS_BY_STATUS[entry.status]}>
              {entry.word}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full word-diff-correct" style={{ backgroundColor: "currentColor" }} />
            Correct
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--destructive))" }} />
            Full mistake (omission / wrong word)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(45 93% 55%)" }} />
            Half mistake (spacing / capitalization / punctuation)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
