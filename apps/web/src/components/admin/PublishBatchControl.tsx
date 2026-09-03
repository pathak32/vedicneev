"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { Rocket } from "lucide-react";

export interface PublishBatchControlProps {
  draftCount: number;
  /** Mirrors DEFAULT_BLOG_PUBLISH_BATCH_SIZE from packages/db/src/blogPublishing.ts — passed in from the server component rather than imported here, since this file is "use client" and @vedicneev/db (Prisma) must never end up in a client bundle. */
  defaultBatchSize: number;
  /** Mirrors MAX_BLOG_PUBLISH_BATCH_SIZE — see defaultBatchSize above. */
  maxBatchSize: number;
}

/**
 * Publishes the next N oldest drafts (round-robin across categories) in
 * one click — the bulk counterpart to each row's individual "Publish Now"
 * button, for driving the daily organic-SEO drip-feed from the admin UI
 * instead of the terminal (`npm run publish:batch --workspace=@vedicneev/db`).
 */
export function PublishBatchControl({ draftCount, defaultBatchSize, maxBatchSize }: PublishBatchControlProps) {
  const router = useRouter();
  const [count, setCount] = useState(Math.min(defaultBatchSize, Math.max(draftCount, 1)));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handlePublish() {
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/blogs/publish-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not publish the batch.");
        return;
      }
      setMessage(
        data.publishedCount > 0
          ? `Published ${data.publishedCount} post${data.publishedCount === 1 ? "" : "s"}.`
          : "Nothing to publish — no drafts remaining."
      );
      router.refresh();
    } catch {
      setMessage("Network error — please try again.");
    } finally {
      setPending(false);
    }
  }

  if (draftCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="batch-count" className="text-sm text-muted-foreground">
        Publish next
      </label>
      <input
        id="batch-count"
        type="number"
        min={1}
        max={Math.min(maxBatchSize, draftCount)}
        value={count}
        onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
        className="h-9 w-16 rounded-md border border-input bg-background px-2 text-sm"
      />
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={handlePublish}>
        <Rocket className="h-3.5 w-3.5" />
        {pending ? "Publishing…" : "Publish Batch"}
      </Button>
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
    </div>
  );
}
