import { describe, expect, it } from "vitest";

import {
  filterMediaItems,
  findMediaForSpeedHack,
  findMediaForTopic,
  findMediaItemById,
  groupMediaByType,
  type MediaItem,
} from "./media";

function makeItem(overrides: Partial<MediaItem> & Pick<MediaItem, "id" | "mediaType">): MediaItem {
  return {
    title: { en: overrides.id, hi: overrides.id },
    description: { en: "", hi: "" },
    durationSeconds: 60,
    videoUrl: null,
    audioUrl: null,
    thumbnailUrl: null,
    transcript: null,
    topicId: null,
    topicKey: null,
    vedicSpeedHackId: null,
    targetExams: ["JNVST"],
    targetClass: null,
    ...overrides,
  };
}

const items: MediaItem[] = [
  makeItem({ id: "short-1", mediaType: "SHORT_VIDEO", topicId: "t-speed", topicKey: "speed_calculation", vedicSpeedHackId: "hack-11" }),
  makeItem({
    id: "short-2",
    mediaType: "SHORT_VIDEO",
    topicId: "t-pattern",
    topicKey: "pattern_completion",
    targetExams: ["JNVST", "RMS"],
    targetClass: "CLASS_6",
  }),
  makeItem({ id: "pod-1", mediaType: "AUDIO_POD", topicId: "t-speed", topicKey: "speed_calculation", vedicSpeedHackId: "hack-11" }),
  makeItem({ id: "pod-2", mediaType: "AUDIO_POD", topicId: "t-grammar", topicKey: "grammar", targetExams: ["AISSEE"] }),
  makeItem({ id: "clinic-1", mediaType: "CONCEPT_CLINIC", topicId: "t-speed", topicKey: "speed_calculation" }),
  makeItem({
    id: "clinic-2",
    mediaType: "CONCEPT_CLINIC",
    topicId: "t-series",
    topicKey: "number_series",
    targetExams: ["JNVST", "RMS"],
    targetClass: "CLASS_9",
  }),
];

describe("filterMediaItems", () => {
  it("returns everything when no filters are given", () => {
    expect(filterMediaItems(items)).toHaveLength(6);
  });

  it("filters by mediaType", () => {
    const result = filterMediaItems(items, { mediaType: "AUDIO_POD" });
    expect(result.map((i) => i.id)).toEqual(["pod-1", "pod-2"]);
  });

  it("filters by topicId", () => {
    const result = filterMediaItems(items, { topicId: "t-speed" });
    expect(result.map((i) => i.id)).toEqual(["short-1", "pod-1", "clinic-1"]);
  });

  it("filters by targetExam", () => {
    const result = filterMediaItems(items, { targetExam: "AISSEE" });
    expect(result.map((i) => i.id)).toEqual(["pod-2"]);
  });

  it("combines multiple filters (AND semantics)", () => {
    const result = filterMediaItems(items, { mediaType: "SHORT_VIDEO", topicId: "t-pattern" });
    expect(result.map((i) => i.id)).toEqual(["short-2"]);
  });

  it("filters by targetClass, treating a null item as agnostic (matches any class)", () => {
    const result = filterMediaItems(items, { targetClass: "CLASS_9" });
    expect(result.map((i) => i.id)).toEqual(["short-1", "pod-1", "pod-2", "clinic-1", "clinic-2"]);
  });

  it("excludes an item explicitly scoped to the other class", () => {
    const result = filterMediaItems(items, { targetClass: "CLASS_6" });
    expect(result.map((i) => i.id)).not.toContain("clinic-2");
    expect(result.map((i) => i.id)).toContain("short-2");
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterMediaItems(items, { topicId: "no-such-topic" })).toEqual([]);
  });
});

describe("findMediaItemById", () => {
  it("finds an existing item", () => {
    expect(findMediaItemById(items, "clinic-2")?.id).toBe("clinic-2");
  });

  it("returns undefined for a missing id", () => {
    expect(findMediaItemById(items, "missing")).toBeUndefined();
  });
});

describe("findMediaForSpeedHack", () => {
  it("finds every item linked to a given Vedic speed hack, across media types", () => {
    const result = findMediaForSpeedHack(items, "hack-11");
    expect(result.map((i) => i.id).sort()).toEqual(["pod-1", "short-1"]);
  });

  it("returns an empty array for a hack nothing links to", () => {
    expect(findMediaForSpeedHack(items, "hack-nonexistent")).toEqual([]);
  });
});

describe("findMediaForTopic", () => {
  it("finds every item linked to a given topic, across media types", () => {
    const result = findMediaForTopic(items, "speed_calculation");
    expect(result.map((i) => i.id)).toEqual(["short-1", "pod-1", "clinic-1"]);
  });
});

describe("groupMediaByType", () => {
  it("buckets every item under its media type, preserving order", () => {
    const grouped = groupMediaByType(items);
    expect(grouped.SHORT_VIDEO.map((i) => i.id)).toEqual(["short-1", "short-2"]);
    expect(grouped.AUDIO_POD.map((i) => i.id)).toEqual(["pod-1", "pod-2"]);
    expect(grouped.CONCEPT_CLINIC.map((i) => i.id)).toEqual(["clinic-1", "clinic-2"]);
  });

  it("produces empty (not missing) buckets for a type with no items", () => {
    const grouped = groupMediaByType(items.filter((i) => i.mediaType !== "AUDIO_POD"));
    expect(grouped.AUDIO_POD).toEqual([]);
  });
});
