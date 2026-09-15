import { Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

export interface ResultSummaryProps {
  grossSpeedWpm: number;
  netSpeedWpm: number;
  accuracyPercent: number;
  fullMistakes: number;
  halfMistakes: number;
  keyDepressions: number;
  backspaceCount: number;
  timeTakenSeconds: number;
}

const STATS: Array<{ key: keyof ResultSummaryProps; label: string; suffix?: string }> = [
  { key: "grossSpeedWpm", label: "Gross Speed", suffix: "wpm" },
  { key: "netSpeedWpm", label: "Net Speed", suffix: "wpm" },
  { key: "accuracyPercent", label: "Accuracy", suffix: "%" },
  { key: "fullMistakes", label: "Full Mistakes" },
  { key: "halfMistakes", label: "Half Mistakes" },
  { key: "keyDepressions", label: "Key Depressions" },
  { key: "backspaceCount", label: "Backspaces Used" },
  { key: "timeTakenSeconds", label: "Time Taken", suffix: "s" },
];

/** Server-renderable (no client JS needed) — the official Gross/Net Speed + Full/Half Mistake breakdown for one attempt, reused by both the results page and the dashboard's history rows. */
export function ResultSummary(props: ResultSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Official Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map(({ key, label, suffix }) => (
          <div key={key} className="rounded-lg bg-muted/40 p-3">
            <div className="text-2xl font-bold tabular-nums text-foreground">
              {typeof props[key] === "number" ? Math.round((props[key] as number) * 100) / 100 : props[key]}
              {suffix ? <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span> : null}
            </div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
