import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Headphones } from "lucide-react";

import { PodcastGrid } from "@/components/media/PodcastGrid";
import { listMedia } from "@/lib/media/mediaService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Learning & Podcast Hub",
  description: "Audio breakdowns of exam strategy, mistake analysis, and Vedic Math shortcuts.",
};

export default async function PodcastsPage() {
  const items = await listMedia({ mediaType: "AUDIO_POD" });

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
      <Link href="/" className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Home
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Headphones className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Learning &amp; Podcast Hub</h1>
          <p className="text-sm text-muted-foreground">
            Audio breakdowns of exam strategy, mistake analysis, and Vedic Math shortcuts.
          </p>
        </div>
      </div>

      <PodcastGrid items={items} />

      <p className="text-center text-xs text-muted-foreground">
        More episodes are added as new topics are covered — check back for updates.
      </p>
    </main>
  );
}
