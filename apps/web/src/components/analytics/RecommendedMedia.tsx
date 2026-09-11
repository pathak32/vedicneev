"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@vedicneev/ui";
import type { AccessResult, MediaItem } from "@vedicneev/engine";
import { Sparkles } from "lucide-react";

import { ConceptClinicPlayer } from "@/components/media/ConceptClinicPlayer";
import { MediaCard } from "@/components/media/MediaCard";
import { SpeedShortsPlayer } from "@/components/media/SpeedShortsPlayer";
import type { TopicAccuracy } from "@/lib/exam/diagnostics";
import type { LanguageCode } from "@/lib/exam/types";
import { useMediaPlayerStore } from "@/lib/hooks/useMediaPlayerStore";

/** This section only ever shows already-fetched, freely browsable catalog items for a student reviewing their own results — no paywall to check here. */
const ALWAYS_ALLOWED: AccessResult = { allowed: true, reason: "ALL_ACCESS", requiresUpgrade: false, suggestedPlans: [] };

export interface RecommendedMediaProps {
  weakTopics: TopicAccuracy[];
  language: LanguageCode;
}

/**
 * "Recommended for you" media strip on the post-test results page — the one
 * integration point requirement #3 (contextual media recommendations) asks
 * for that didn't already exist anywhere (unlike the Mistake Vault's
 * per-question links, which already used the same findMediaForTopic-style
 * matching before this feature). Pulls real media for the student's
 * weakest attempted topics (report.weakTopics, already capped to 3).
 */
export function RecommendedMedia({ weakTopics, language }: RecommendedMediaProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [shortsItem, setShortsItem] = useState<MediaItem | null>(null);
  const [clinicItem, setClinicItem] = useState<MediaItem | null>(null);
  const play = useMediaPlayerStore((s) => s.play);

  useEffect(() => {
    if (weakTopics.length === 0) {
      setItems([]);
      return;
    }
    let cancelled = false;
    Promise.all(
      weakTopics.map((topic) =>
        fetch(`/api/media?topicKey=${encodeURIComponent(topic.key)}`)
          .then((res) => (res.ok ? res.json() : { items: [] }))
          .then((data): MediaItem[] => data.items ?? [])
      )
    ).then((perTopic) => {
      if (cancelled) return;
      const seen = new Set<string>();
      const merged = perTopic.flat().filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)));
      setItems(merged);
    });
    return () => {
      cancelled = true;
    };
  }, [weakTopics]);

  if (weakTopics.length === 0 || items.length === 0) return null;

  function handleSelect(item: MediaItem) {
    if (item.mediaType === "AUDIO_POD") play(item);
    else if (item.mediaType === "SHORT_VIDEO") setShortsItem(item);
    else setClinicItem(item);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} language={language} locked={false} onClick={() => handleSelect(item)} />
          ))}
        </div>
      </CardContent>

      {shortsItem ? (
        <SpeedShortsPlayer
          items={[shortsItem]}
          initialIndex={0}
          language={language}
          onClose={() => setShortsItem(null)}
          getAccess={() => ALWAYS_ALLOWED}
          onConsumePreview={() => {}}
          onUnlockRequested={() => {}}
        />
      ) : null}

      {clinicItem ? (
        <ConceptClinicPlayer
          item={clinicItem}
          language={language}
          open={!!clinicItem}
          onOpenChange={(open) => !open && setClinicItem(null)}
          access={ALWAYS_ALLOWED}
          onUnlockRequested={() => {}}
        />
      ) : null}
    </Card>
  );
}
