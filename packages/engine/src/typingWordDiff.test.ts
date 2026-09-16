import { describe, expect, it } from "vitest";

import { diffTypedWords } from "./typingWordDiff";

describe("diffTypedWords", () => {
  it("marks every word correct for a perfect transcription", () => {
    const result = diffTypedWords("the quick brown fox", "the quick brown fox");
    expect(result).toEqual([
      { word: "the", status: "correct" },
      { word: "quick", status: "correct" },
      { word: "brown", status: "correct" },
      { word: "fox", status: "correct" },
    ]);
  });

  it("marks an omitted word as omitted", () => {
    const result = diffTypedWords("the quick brown fox", "the brown fox");
    expect(result).toEqual([
      { word: "the", status: "correct" },
      { word: "quick", status: "omitted" },
      { word: "brown", status: "correct" },
      { word: "fox", status: "correct" },
    ]);
  });

  it("marks a genuine substitution as full", () => {
    const result = diffTypedWords("the quick brown fox", "the slow brown fox");
    expect(result).toEqual([
      { word: "the", status: "correct" },
      { word: "quick", status: "full" },
      { word: "brown", status: "correct" },
      { word: "fox", status: "correct" },
    ]);
  });

  it("marks a punctuation/case-only mismatch as half", () => {
    const result = diffTypedWords("Hello, world.", "hello world");
    expect(result).toEqual([
      { word: "Hello,", status: "half" },
      { word: "world.", status: "half" },
    ]);
  });
});
