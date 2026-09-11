/**
 * Media learning catalog: types shared between packages/db's MediaItem
 * model and the client-side catalog, plus pure filtering/lookup helpers.
 * No I/O here — the actual catalog data lives in packages/db's seed and
 * apps/web's mock data, both shaped to this interface.
 */

export type MediaType = "SHORT_VIDEO" | "AUDIO_POD" | "CONCEPT_CLINIC";

export interface MediaBilingualText {
  en: string;
  hi: string;
}

/**
 * Media catalog items are en/hi-only for now (unlike Question content in
 * packages/db, which supports regional languages too) — this accepts a
 * wider language code and falls back to English for anything besides "hi"
 * so callers sharing a single `language` prop with the (regional-aware)
 * exam runner don't need a separate narrower type just for media.
 */
export function localizeMediaText(map: MediaBilingualText, language: string): string {
  return language === "hi" ? map.hi : map.en;
}

export type MediaClassLevel = "CLASS_6" | "CLASS_9";

export interface MediaItem {
  id: string;
  title: MediaBilingualText;
  description: MediaBilingualText;
  mediaType: MediaType;
  durationSeconds: number;
  /** Null when the catalog entry exists but its asset hasn't been uploaded yet. */
  videoUrl: string | null;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  /** Bilingual transcript, mainly for AUDIO_POD's transcript toggle. */
  transcript: MediaBilingualText | null;
  topicId: string | null;
  /** The owning Topic's `key` (e.g. "pattern_completion"), not its DB cuid — findMediaForTopic and the diagnostic engine both identify topics by this stable key, never by topicId. Null exactly when topicId is null. */
  topicKey: string | null;
  vedicSpeedHackId: string | null;
  targetExams: string[];
  /** Already resolved server-side (Topic.targetClass inheritance) — null means "both classes" (exactly like Topic.targetExam's own null-means-agnostic convention), not "unresolved." */
  targetClass: MediaClassLevel | null;
}

export interface MediaFilterOptions {
  mediaType?: MediaType;
  topicId?: string;
  targetExam?: string;
  targetClass?: MediaClassLevel;
}

export function filterMediaItems(items: MediaItem[], options: MediaFilterOptions = {}): MediaItem[] {
  return items.filter((item) => {
    if (options.mediaType && item.mediaType !== options.mediaType) return false;
    if (options.topicId && item.topicId !== options.topicId) return false;
    if (options.targetExam && !item.targetExams.includes(options.targetExam)) return false;
    if (options.targetClass && item.targetClass !== null && item.targetClass !== options.targetClass) return false;
    return true;
  });
}

export function findMediaItemById(items: MediaItem[], id: string): MediaItem | undefined {
  return items.find((item) => item.id === id);
}

export function findMediaForSpeedHack(items: MediaItem[], vedicSpeedHackId: string): MediaItem[] {
  return items.filter((item) => item.vedicSpeedHackId === vedicSpeedHackId);
}

export function findMediaForTopic(items: MediaItem[], topicKey: string): MediaItem[] {
  return items.filter((item) => item.topicKey === topicKey);
}

export function groupMediaByType(items: MediaItem[]): Record<MediaType, MediaItem[]> {
  const grouped: Record<MediaType, MediaItem[]> = {
    SHORT_VIDEO: [],
    AUDIO_POD: [],
    CONCEPT_CLINIC: [],
  };
  for (const item of items) grouped[item.mediaType].push(item);
  return grouped;
}
