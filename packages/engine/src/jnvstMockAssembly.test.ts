import { describe, expect, it } from "vitest";

import { assembleJnvstMock, type PyqPoolItem, type SectionBlueprint } from "./jnvstMockAssembly";

const JNVST_BLUEPRINT: SectionBlueprint[] = [
  { sectionKey: "mental_ability", questionCount: 40 },
  { sectionKey: "arithmetic", questionCount: 20 },
  { sectionKey: "language", questionCount: 20 },
];

function makePool(counts: Record<"mental_ability" | "arithmetic" | "language", number>): PyqPoolItem[] {
  const pool: PyqPoolItem[] = [];
  for (const [sectionKey, count] of Object.entries(counts) as [PyqPoolItem["sectionKey"], number][]) {
    for (let i = 0; i < count; i += 1) pool.push({ id: `${sectionKey}-${i}`, sectionKey });
  }
  return pool;
}

/** Deterministic, non-shuffling stand-in RNG for order-sensitive assertions. */
const noShuffle = () => 0;

describe("assembleJnvstMock", () => {
  it("draws exactly 40/20/20 when the pool exactly matches the blueprint", () => {
    const pool = makePool({ mental_ability: 40, arithmetic: 20, language: 20 });
    const result = assembleJnvstMock(pool, JNVST_BLUEPRINT);

    expect(result.warnings).toEqual([]);
    expect(result.sections.find((s) => s.sectionKey === "mental_ability")?.questionIds).toHaveLength(40);
    expect(result.sections.find((s) => s.sectionKey === "arithmetic")?.questionIds).toHaveLength(20);
    expect(result.sections.find((s) => s.sectionKey === "language")?.questionIds).toHaveLength(20);
  });

  it("draws a smaller, non-repeating subset when the pool is larger than the quota", () => {
    const pool = makePool({ mental_ability: 100, arithmetic: 50, language: 50 });
    const result = assembleJnvstMock(pool, JNVST_BLUEPRINT);

    expect(result.warnings).toEqual([]);
    const maIds = result.sections.find((s) => s.sectionKey === "mental_ability")!.questionIds;
    expect(maIds).toHaveLength(40);
    expect(new Set(maIds).size).toBe(40); // no duplicates within the section
  });

  it("takes everything available and warns when the pool is short of the quota", () => {
    const pool = makePool({ mental_ability: 12, arithmetic: 20, language: 20 });
    const result = assembleJnvstMock(pool, JNVST_BLUEPRINT);

    const ma = result.sections.find((s) => s.sectionKey === "mental_ability")!;
    expect(ma.questionIds).toHaveLength(12);
    expect(result.warnings).toEqual([
      "mental_ability: only 12 of 40 required questions were available in the PYQ pool.",
    ]);
  });

  it("never repeats a question id within one assembled paper", () => {
    const pool = makePool({ mental_ability: 40, arithmetic: 20, language: 20 });
    const result = assembleJnvstMock(pool, JNVST_BLUEPRINT);

    const allIds = result.sections.flatMap((s) => s.questionIds);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it("is deterministic for a fixed RNG (regression guard for the shuffle implementation)", () => {
    const pool = makePool({ mental_ability: 5, arithmetic: 0, language: 0 });
    const blueprint: SectionBlueprint[] = [{ sectionKey: "mental_ability", questionCount: 3 }];

    const result = assembleJnvstMock(pool, blueprint, noShuffle);
    expect(result.sections[0]!.questionIds).toEqual(["mental_ability-1", "mental_ability-2", "mental_ability-3"]);
  });

  it("returns an empty section with a warning when a section has no pool coverage at all", () => {
    const pool = makePool({ mental_ability: 40, arithmetic: 0, language: 20 });
    const result = assembleJnvstMock(pool, JNVST_BLUEPRINT);

    const arithmetic = result.sections.find((s) => s.sectionKey === "arithmetic")!;
    expect(arithmetic.questionIds).toEqual([]);
    expect(result.warnings).toContain(
      "arithmetic: only 0 of 20 required questions were available in the PYQ pool."
    );
  });
});
