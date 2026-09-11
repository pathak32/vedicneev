"use client";

import { useEffect, useState } from "react";
import type { MediaItem } from "@vedicneev/engine";

/**
 * Fetches the full public media catalog once and hands it to callers that
 * need to run client-side filtering (findMediaForSpeedHack/findMediaForTopic
 * from @vedicneev/engine) against it — the real-data replacement for the
 * old static `mediaCatalog` import from lib/media/mock-data.ts (deleted).
 * Fetched once per mounting component, not per rendered card/row, so a
 * list of N mistakes doesn't fire N requests.
 */
export function useMediaCatalog(): MediaItem[] {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/media")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return items;
}
