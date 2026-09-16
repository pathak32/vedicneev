import { Badge, Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";
import { Flame } from "lucide-react";

/**
 * Static placeholder only — deliberately no keystroke capture/logging
 * behind this. A real per-key weak-spot heatmap needs a timestamped log of
 * every keystroke, which this app doesn't collect (and shouldn't, purely
 * for request/storage volume reasons at this scale) — this card exists so
 * the roadmap item is visible without committing to that data pipeline yet.
 */
export function WeakKeyHeatmapCard() {
  return (
    <Card className="opacity-70">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="h-4 w-4 text-muted-foreground" />
            Adaptive Weak-Key AI Heatmap
          </CardTitle>
          <Badge variant="secondary">Coming Soon</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        See exactly which keys slow you down most, with AI-suggested drills to fix them.
      </CardContent>
    </Card>
  );
}
