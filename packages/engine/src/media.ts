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
  vedicSpeedHackId: string | null;
  targetExams: string[];
}

export interface MediaFilterOptions {
  mediaType?: MediaType;
  topicId?: string;
  targetExam?: string;
}

export function filterMediaItems(items: MediaItem[], options: MediaFilterOptions = {}): MediaItem[] {
  return items.filter((item) => {
    if (options.mediaType && item.mediaType !== options.mediaType) return false;
    if (options.topicId && item.topicId !== options.topicId) return false;
    if (options.targetExam && !item.targetExams.includes(options.targetExam)) return false;
    return true;
  });
}

export function findMediaItemById(items: MediaItem[], id: string): MediaItem | undefined {
  return items.find((item) => item.id === id);
}

export function findMediaForSpeedHack(items: MediaItem[], vedicSpeedHackId: string): MediaItem[] {
  return items.filter((item) => item.vedicSpeedHackId === vedicSpeedHackId);
}

export function findMediaForTopic(items: MediaItem[], topicId: string): MediaItem[] {
  return items.filter((item) => item.topicId === topicId);
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
