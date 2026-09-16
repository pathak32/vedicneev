import { describe, expect, it } from "vitest";

import { pickDailyPassage } from "./typingDailyPassage";

describe("pickDailyPassage", () => {
  it("returns null for an empty pool", () => {
    expect(pickDailyPassage([], new Date("2026-01-01T00:00:00Z"))).toBeNull();
  });

  it("returns the only passage when the pool has one", () => {
    expect(pickDailyPassage(["a"], new Date("2026-06-15T00:00:00Z"))).toBe("a");
  });

  it("is deterministic for the same day", () => {
    const passages = ["a", "b", "c"];
    const first = pickDailyPassage(passages, new Date("2026-03-10T05:00:00Z"));
    const second = pickDailyPassage(passages, new Date("2026-03-10T23:00:00Z"));
    expect(first).toBe(second);
  });

  it("cycles through the pool as days advance", () => {
    const passages = ["a", "b", "c"];
    const day1 = pickDailyPassage(passages, new Date(Date.UTC(2026, 0, 1)));
    const day2 = pickDailyPassage(passages, new Date(Date.UTC(2026, 0, 2)));
    const day3 = pickDailyPassage(passages, new Date(Date.UTC(2026, 0, 3)));
    const day4 = pickDailyPassage(passages, new Date(Date.UTC(2026, 0, 4)));
    expect([day1, day2, day3]).toEqual(expect.arrayContaining(["a", "b", "c"]));
    expect(day4).toBe(day1);
  });
});
