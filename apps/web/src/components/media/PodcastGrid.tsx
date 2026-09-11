"use client";

import type { MediaItem } from "@vedicneev/engine";

import { useLanguageStore } from "@/lib/hooks/useLanguageStore";
import { useMediaPlayerStore } from "@/lib/hooks/useMediaPlayerStore";
import { MediaCard } from "./MediaCard";

/** Grid of real AUDIO_POD items — clicking one starts it in the persistent GlobalAudioPlayer mini-player. */
export function PodcastGrid({ items }: { items: MediaItem[] }) {
  const language = useLanguageStore((s) => s.languageCode);
  const play = useMediaPlayerStore((s) => s.play);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No episodes are live yet — check back soon.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} language={language} locked={false} onClick={() => play(item)} />
      ))}
    </div>
  );
}
