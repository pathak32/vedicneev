import Link from "next/link";
import { Download } from "lucide-react";

import { Button } from "@vedicneev/ui";

/**
 * Self-monetization CTA injected into every blog article (see
 * BlogArticle.tsx) — points at the same /store SKUs StorePageClient.tsx
 * already sells (the "Printable Offline OMR Kit" and the six exam/class
 * Question Bank Booklets), not a separate offer invented just for the
 * blog. Two instances render per article (mid-article and end-of-article,
 * see BlogArticle.tsx's split), so the copy stays short enough to not read
 * as a repeated ad block.
 */
export function BlogCtaBanner() {
  return (
    <div className="not-prose my-8 flex flex-col items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-foreground">Practice with the real 2026 board-pattern paper</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Download the Question Bank Booklet for your exam and class, plus a printable OMR sheet you can scan
          and grade at home.
        </p>
      </div>
      <Button asChild className="w-full shrink-0 sm:w-auto">
        <Link href="/store">
          <Download className="h-4 w-4" aria-hidden="true" />
          Get the Sample Papers &amp; OMR Kit
        </Link>
      </Button>
    </div>
  );
}
