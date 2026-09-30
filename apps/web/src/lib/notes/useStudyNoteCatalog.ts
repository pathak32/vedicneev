"use client";

import { useEffect, useState } from "react";
import type { StudyNoteTopicPdf } from "@vedicneev/engine";

/** Fetches the study-note-PDF catalog once and hands it to callers that run findStudyNoteForTopic against it — mirrors useMediaCatalog.ts exactly. */
export function useStudyNoteCatalog(): StudyNoteTopicPdf[] {
  const [items, setItems] = useState<StudyNoteTopicPdf[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/study-notes")
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
