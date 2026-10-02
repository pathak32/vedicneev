import { describe, expect, it } from "vitest";

import { isTopicInExamSyllabus, sectionKeyForTopic, topicNumbersForExam } from "./questionBookletCatalog";

// One assertion per boundary from seed-study-note-pdfs.ts's CLASS_6_RANGES/
// CLASS_9_RANGES (the verified source of truth for this numbering) — every
// (from, to, sectionKey) triple gets its first/last topic checked, so a
// future transcription slip in this file's own copy of those ranges fails
// a test instead of silently mis-filtering a syllabus.
describe("sectionKeyForTopic", () => {
  it("matches every Class 6 range boundary", () => {
    const expectations: [number, number, string][] = [
      [1, 7, "mental_ability"],
      [8, 12, "arithmetic"],
      [13, 20, "language"],
      [21, 24, "general_knowledge"],
      [25, 39, "mental_ability"],
      [40, 60, "arithmetic"],
      [61, 69, "general_knowledge"],
      [70, 72, "arithmetic"],
    ];
    for (const [from, to, sectionKey] of expectations) {
      expect(sectionKeyForTopic(6, from)).toBe(sectionKey);
      expect(sectionKeyForTopic(6, to)).toBe(sectionKey);
    }
  });

  it("matches every Class 9 range boundary", () => {
    const expectations: [number, number, string][] = [
      [1, 12, "mental_ability"],
      [13, 48, "mathematics"],
      [49, 58, "language"],
      [59, 69, "science"],
      [70, 72, "social_science"],
    ];
    for (const [from, to, sectionKey] of expectations) {
      expect(sectionKeyForTopic(9, from)).toBe(sectionKey);
      expect(sectionKeyForTopic(9, to)).toBe(sectionKey);
    }
  });

  it("rejects an out-of-range topic number", () => {
    expect(() => sectionKeyForTopic(6, 73)).toThrow();
    expect(() => sectionKeyForTopic(6, 0)).toThrow();
  });
});

describe("isTopicInExamSyllabus", () => {
  it("excludes GK/Science/Social-Science topics for JNVST only", () => {
    expect(isTopicInExamSyllabus("JNVST", 6, 22)).toBe(false); // general_knowledge
    expect(isTopicInExamSyllabus("JNVST", 9, 65)).toBe(false); // science
    expect(isTopicInExamSyllabus("JNVST", 9, 71)).toBe(false); // social_science
    expect(isTopicInExamSyllabus("RMS", 6, 22)).toBe(true);
    expect(isTopicInExamSyllabus("AISSEE", 9, 65)).toBe(true);
    expect(isTopicInExamSyllabus("UPSS", 9, 71)).toBe(true);
  });

  it("includes every non-GK topic for every exam", () => {
    expect(isTopicInExamSyllabus("JNVST", 6, 1)).toBe(true);
    expect(isTopicInExamSyllabus("JNVST", 9, 13)).toBe(true);
  });

  it("topicNumbersForExam drops exactly the excluded topics, keeps the rest in order", () => {
    const jnvst6 = topicNumbersForExam("JNVST", 6);
    expect(jnvst6).not.toContain(21);
    expect(jnvst6).not.toContain(69);
    expect(jnvst6.length).toBe(72 - 4 - 9); // minus 21-24, minus 61-69
    expect(jnvst6).toEqual([...jnvst6].sort((a, b) => a - b));

    const rms6 = topicNumbersForExam("RMS", 6);
    expect(rms6.length).toBe(72);
  });
});
