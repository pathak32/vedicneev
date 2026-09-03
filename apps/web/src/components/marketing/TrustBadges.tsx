import { Badge } from "@vedicneev/ui";

const EXAMS = ["JNVST", "AISSEE (Sainik School)", "RMS", "DPS & Elite Private Schools"];

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {EXAMS.map((exam) => (
        <Badge key={exam} variant="outline" className="text-xs font-medium text-muted-foreground">
          {exam}
        </Badge>
      ))}
    </div>
  );
}
