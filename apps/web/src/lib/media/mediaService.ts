import { prisma, type ContentClassLevel, type ExamType, type MediaType } from "@vedicneev/db";
import type { MediaBilingualText, MediaItem as EngineMediaItem } from "@vedicneev/engine";

import { asMultilingual } from "../exam/questionHydration";

/** MediaBilingualText requires both `en` and `hi`, unlike the app's own Multilingual (hi optional) — fall back to English so callers never see an empty Hindi string. */
function asMediaBilingual(value: unknown, context: string): MediaBilingualText {
  const parsed = asMultilingual(value, context);
  return { en: parsed.en, hi: parsed.hi ?? parsed.en };
}

export interface ListMediaOptions {
  mediaType?: MediaType;
  /** A Topic.key string (e.g. "pattern_completion"), matching how the diagnostic/exam layer identifies topics elsewhere — NOT a raw topicId cuid. */
  topicKey?: string;
  vedicSpeedHackId?: string;
  targetExam?: ExamType;
  targetClass?: ContentClassLevel;
}

/**
 * Real-data counterpart to apps/web/src/lib/media/mock-data.ts (now
 * deleted) — the public /api/media route this backs is read-only and
 * requires no auth, same as /api/practice. Only "published" items (their
 * relevant asset URL is set) are ever returned here; the admin dashboard's
 * own queries (lib/media/adminQueries.ts) see drafts too.
 */
export async function listMedia(options: ListMediaOptions = {}): Promise<EngineMediaItem[]> {
  let topicId: string | undefined;
  if (options.topicKey) {
    const topic = await prisma.topic.findFirst({ where: { key: options.topicKey } });
    if (!topic) return [];
    topicId = topic.id;
  }

  const items = await prisma.mediaItem.findMany({
    where: {
      mediaType: options.mediaType,
      topicId,
      vedicSpeedHackId: options.vedicSpeedHackId,
      targetExams: options.targetExam ? { has: options.targetExam } : undefined,
    },
    include: { topic: true },
    orderBy: { createdAt: "desc" },
  });

  return items
    // Published gate: AUDIO_POD needs audioUrl, everything else (video-backed
    // SHORT_VIDEO/CONCEPT_CLINIC) needs videoUrl — a mediaType-aware check,
    // not "either URL is set," so e.g. a SHORT_VIDEO row with only an
    // audioUrl filled in (a half-finished admin draft) never surfaces here
    // with no video to actually show.
    .filter((item) => (item.mediaType === "AUDIO_POD" ? item.audioUrl !== null : item.videoUrl !== null))
    .map(
      (item): EngineMediaItem => ({
        id: item.id,
        title: asMediaBilingual(item.title, `MediaItem ${item.id} title`),
        description: asMediaBilingual(item.description, `MediaItem ${item.id} description`),
        mediaType: item.mediaType,
        durationSeconds: item.durationSeconds,
        videoUrl: item.videoUrl,
        audioUrl: item.audioUrl,
        thumbnailUrl: item.thumbnailUrl,
        transcript: item.transcript ? asMediaBilingual(item.transcript, `MediaItem ${item.id} transcript`) : null,
        topicId: item.topicId,
        topicKey: item.topic?.key ?? null,
        vedicSpeedHackId: item.vedicSpeedHackId,
        targetExams: item.targetExams,
        // "Inherits from owning Topic" when topicId is set (itself
        // null-means-CLASS_6); null (agnostic/"both classes") when there's
        // no topic to inherit from — see the field's own doc comment in
        // schema.prisma. filterMediaItems treats a null targetClass as
        // matching any requested class, same as Topic.targetExam's own
        // null-means-agnostic convention elsewhere in this codebase.
        targetClass: item.targetClass ?? (item.topicId ? item.topic?.targetClass ?? "CLASS_6" : null),
      })
    )
    .filter((item) => !options.targetClass || item.targetClass === null || item.targetClass === options.targetClass);
}
