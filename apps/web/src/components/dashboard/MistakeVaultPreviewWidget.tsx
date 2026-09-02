import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Lightbulb } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";

import type { MistakeLogEntry, MistakeTagCategory } from "@/lib/auth/types";
import { MISTAKE_TAG_META } from "@/lib/exam/mistake-vault";

export interface MistakeVaultPreviewWidgetProps {
  mistakes: MistakeLogEntry[];
}

export function MistakeVaultPreviewWidget({ mistakes }: MistakeVaultPreviewWidgetProps) {
  const unreviewed = mistakes.filter((m) => !m.reviewed);
  const counts: Record<MistakeTagCategory, number> = {
    CARELESS_RUSHED: 0,
    CONCEPT_GAP: 0,
    CALCULATION_GAP: 0,
  };
  for (const mistake of unreviewed) counts[mistake.mistakeTag] += 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Mistake Vault
          </span>
          {unreviewed.length > 0 ? <Badge variant="destructive">{unreviewed.length} unreviewed</Badge> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {unreviewed.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            No unreviewed mistakes — nice work.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(Object.keys(MISTAKE_TAG_META) as MistakeTagCategory[])
              .filter((tag) => counts[tag] > 0)
              .map((tag) => (
                <Badge key={tag} variant="outline" className="gap-1 font-medium">
                  <AlertTriangle className="h-3 w-3" />
                  {MISTAKE_TAG_META[tag].label}: {counts[tag]}
                </Badge>
              ))}
          </div>
        )}

        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href="/dashboard/mistakes">
            Review in Mistake Vault
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
