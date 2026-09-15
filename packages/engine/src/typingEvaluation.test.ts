import { describe, expect, it } from "vitest";

import { evaluateTypingAttempt } from "./typingEvaluation";

const PASSAGE = "The quick brown fox jumps over the lazy dog near the river bank.";

describe("evaluateTypingAttempt", () => {
  it("scores a perfect transcription with zero mistakes and full accuracy", () => {
    const result = evaluateTypingAttempt(PASSAGE, PASSAGE, 60);

    expect(result.fullMistakes).toBe(0);
    expect(result.halfMistakes).toBe(0);
    expect(result.accuracyPercent).toBe(100);
    expect(result.netSpeedWpm).toBe(result.grossSpeedWpm);
    expect(result.keyDepressions).toBe(PASSAGE.length);
  });

  it("counts an omitted word as one full mistake", () => {
    const typed = "The quick brown fox over the lazy dog near the river bank.";
    const result = evaluateTypingAttempt(PASSAGE, typed, 60);

    expect(result.fullMistakes).toBe(1);
    expect(result.halfMistakes).toBe(0);
  });

  it("counts a genuine word substitution as one full mistake", () => {
    const typed = "The quick brown fox leaps over the lazy dog near the river bank.";
    const result = evaluateTypingAttempt(PASSAGE, typed, 60);

    expect(result.fullMistakes).toBe(1);
    expect(result.halfMistakes).toBe(0);
  });

  it("counts a punctuation-only mismatch as one half mistake", () => {
    const typed = "The quick brown fox jumps over the lazy dog near the river bank";
    const result = evaluateTypingAttempt(PASSAGE, typed, 60);

    expect(result.fullMistakes).toBe(0);
    expect(result.halfMistakes).toBe(1);
    expect(result.accuracyPercent).toBeGreaterThan(90);
    expect(result.accuracyPercent).toBeLessThan(100);
  });

  it("counts a case-only mismatch as one half mistake", () => {
    const typed = "The quick brown fox jumps over the lazy DOG near the river bank.";
    const result = evaluateTypingAttempt(PASSAGE, typed, 60);

    expect(result.fullMistakes).toBe(0);
    expect(result.halfMistakes).toBe(1);
  });

  it("never returns a negative net speed even when mistakes outweigh gross speed", () => {
    const typed = "wrong wrong wrong";
    const result = evaluateTypingAttempt(PASSAGE, typed, 60);

    expect(result.netSpeedWpm).toBeGreaterThanOrEqual(0);
  });

  it("floors elapsed time at 1 second to avoid a divide-by-zero blowup", () => {
    const result = evaluateTypingAttempt(PASSAGE, PASSAGE, 0);

    expect(Number.isFinite(result.grossSpeedWpm)).toBe(true);
    expect(result.grossSpeedWpm).toBeGreaterThan(0);
  });
});
