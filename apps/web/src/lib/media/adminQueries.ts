import { prisma } from "@vedicneev/db";

/** Every MediaItem regardless of publish state, most recently updated first — the admin list view. Mirrors lib/blog/queries.ts's getAllPostsForAdmin shape. */
export function getAllMediaForAdmin() {
  return prisma.mediaItem.findMany({
    include: { topic: { include: { section: true } }, vedicSpeedHack: true },
    orderBy: { updatedAt: "desc" },
  });
}

/** A single MediaItem by id, or null — admin edit route 404s when this is null. */
export function getMediaItemById(id: string) {
  return prisma.mediaItem.findUnique({
    where: { id },
    include: { topic: { include: { section: true } }, vedicSpeedHack: true },
  });
}

/** Every Topic, grouped by section order then topic order — for the edit form's topic picker. */
export function getTopicOptions() {
  return prisma.topic.findMany({
    include: { section: true },
    orderBy: [{ section: { order: "asc" } }, { order: "asc" }],
  });
}

/** Every VedicSpeedHack, alphabetical by key — for the edit form's speed-hack picker. */
export function getSpeedHackOptions() {
  return prisma.vedicSpeedHack.findMany({ orderBy: { key: "asc" } });
}
