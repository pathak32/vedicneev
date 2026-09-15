import { ArrowUpRight, Zap } from "lucide-react";
import { Button } from "@vedicneev/ui";

import { vedicMindAiUrl } from "@/lib/ecosystem/vedicMindAi";

/** High-conversion cross-sell into Vedic Mind AI — placed on the dashboard, the
 * highest-traffic post-login screen, rather than the marketing homepage. */
export function EcosystemPromoCard() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Zap className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-bold text-foreground">Build faster calculation speed with Vedic Mind AI</p>
          <p className="text-sm text-muted-foreground">
            Sharpen mental math and Vedic sutra shortcuts on our sister platform — free drills, adaptive difficulty.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" className="shrink-0">
        <a href={vedicMindAiUrl("/", "ecosystem_banner")} target="_blank" rel="noopener noreferrer">
          Try Vedic Mind AI
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
