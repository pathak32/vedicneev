/**
 * Assembles a mock paper (any board/class — JNVST Class 6's 40/20/20
 * blueprint, JNVST/AISSEE/RMS Class 9, or any future combination) from a
 * pool of Previous-Year-Question bank items, matching the exam's section
 * blueprint. Pure logic — no Prisma, no I/O — so it's unit-testable in
 * isolation and reused identically by
 * apps/web/src/lib/exam/jnvstMockService.ts (the caller that actually
 * fetches the pool and the blueprint from the database) without
 * duplicating the selection rules.
 */

import { shuffled } from "./random";

/** A Section.key value (packages/db/prisma/schema.prisma) — open-ended, not a fixed union, since different boards/classes introduce different sections. */
export type JnvstSectionKey = string;

export interface PyqPoolItem {
  id: string;
  sectionKey: JnvstSectionKey;
}

export interface SectionBlueprint {
  sectionKey: JnvstSectionKey;
  /** How many questions this section needs for a complete paper. */
  questionCount: number;
}

export interface AssembledSection {
  sectionKey: JnvstSectionKey;
  /** Ids drawn from the pool, in the order the paper should present them. */
  questionIds: string[];
}

export interface AssembleJnvstMockResult {
  sections: AssembledSection[];
  /**
   * Non-fatal notices — e.g. a section's pool didn't have enough items to
   * fill its blueprint quota, so that section came back short. The caller
   * decides whether a short paper is still launchable; this function never
   * pads a shortfall with duplicates or invents questions to hide it.
   */
  warnings: string[];
}

export interface AssembleJnvstMockOptions {
  /**
   * Ids this same student has already been served for this exam template
   * (any prior attempt, submitted or not) — see
   * apps/web/src/lib/exam/jnvstMockService.ts's rotation wiring. When set,
   * each section draws from its NOT-recently-served items first, only
   * falling back to recently-served ones to fill a section's quota once
   * the fresh subset runs out — so a student sees genuinely new questions
   * for as long as the pool allows, and only ever repeats once every item
   * in a section has already been shown at least once. Omitted (or an
   * empty set) reproduces the exact prior behavior — a plain random draw
   * across the whole pool, no preference either way.
   */
  recentlyServedIds?: ReadonlySet<string>;
}

/**
 * Draws a random, non-repeating subset per section from `pool`, sized to
 * each entry in `blueprint`. If a section's pool is smaller than its quota,
 * every available item for that section is used and a warning is added —
 * the result is never silently short by less than what was actually
 * available, and never repeats a question within the same paper.
 */
export function assembleJnvstMock(
  pool: PyqPoolItem[],
  blueprint: SectionBlueprint[],
  rng: () => number = Math.random,
  options: AssembleJnvstMockOptions = {}
): AssembleJnvstMockResult {
  const recentlyServedIds = options.recentlyServedIds;
  const poolBySection = new Map<JnvstSectionKey, PyqPoolItem[]>();
  for (const item of pool) {
    const bucket = poolBySection.get(item.sectionKey);
    if (bucket) bucket.push(item);
    else poolBySection.set(item.sectionKey, [item]);
  }

  const sections: AssembledSection[] = [];
  const warnings: string[] = [];

  for (const section of blueprint) {
    const available = poolBySection.get(section.sectionKey) ?? [];

    let drawn: PyqPoolItem[];
    if (recentlyServedIds && recentlyServedIds.size > 0) {
      const fresh = available.filter((item) => !recentlyServedIds.has(item.id));
      const stale = available.filter((item) => recentlyServedIds.has(item.id));
      const drawnFresh = shuffled(fresh, rng).slice(0, section.questionCount);
      const stillNeeded = section.questionCount - drawnFresh.length;
      drawn = stillNeeded > 0 ? [...drawnFresh, ...shuffled(stale, rng).slice(0, stillNeeded)] : drawnFresh;
    } else {
      drawn = shuffled(available, rng).slice(0, section.questionCount);
    }

    if (drawn.length < section.questionCount) {
      warnings.push(
        `${section.sectionKey}: only ${drawn.length} of ${section.questionCount} required questions were available in the PYQ pool.`
      );
    }

    sections.push({ sectionKey: section.sectionKey, questionIds: drawn.map((item) => item.id) });
  }

  return { sections, warnings };
}
