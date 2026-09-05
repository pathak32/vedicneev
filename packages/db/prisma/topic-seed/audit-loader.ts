import type { GeneratedQuestion, LangText, OptionSeed } from "./types";

/** Shape of one question exactly as written in packages/db/prisma/topic-seed/audit/*.json. */
export interface AuditFile {
  section: string;
  topicKey: string;
  generatedAt: string;
  questions: GeneratedQuestion[];
}

/**
 * Re-validates a human-signed-off audit JSON file (packages/db/prisma/
 * topic-seed/audit/*.json) at seed time — the same structural checks
 * audit/_check.ts runs standalone, run again here so a hand-authored file
 * can never silently reach the database with a defect, even after
 * sign-off. Throws with every problem found (not just the first) if
 * anything is wrong; returns the questions ready for fromGenerated()
 * otherwise.
 */
export function loadAuditQuestions(file: AuditFile, expectedTotal = 40): GeneratedQuestion[] {
  const errors: string[] = [];
  const qs = file.questions;

  if (qs.length !== expectedTotal) {
    errors.push(`${file.section}: expected exactly ${expectedTotal} questions, got ${qs.length}`);
  }

  const byDiff = { EASY: 0, MEDIUM: 0, HARD: 0 } as Record<string, number>;
  const seenKeys = new Set<string>();

  for (const q of qs) {
    const label = `${file.section}/${q.key || "<no key>"}`;

    if (!q.key) errors.push(`${label}: missing key`);
    if (seenKeys.has(q.key)) errors.push(`${label}: duplicate key`);
    seenKeys.add(q.key);

    if (!["EASY", "MEDIUM", "HARD"].includes(q.difficulty)) {
      errors.push(`${label}: invalid difficulty "${q.difficulty}"`);
    } else {
      byDiff[q.difficulty] = (byDiff[q.difficulty] ?? 0) + 1;
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`${label}: expected exactly 4 options`);
      continue;
    }
    const ids = q.options.map((o: OptionSeed) => o.id);
    if (new Set(ids).size !== 4 || !["a", "b", "c", "d"].every((id) => ids.includes(id))) {
      errors.push(`${label}: option ids must be exactly a,b,c,d`);
    }
    const englishTexts = q.options.map((o: OptionSeed) => o.text?.en);
    if (new Set(englishTexts).size !== 4) {
      errors.push(`${label}: two or more options render the same English text (${JSON.stringify(englishTexts)})`);
    }
    if (!ids.includes(q.correctOption)) {
      errors.push(`${label}: correctOption "${q.correctOption}" not among option ids`);
    }

    const wrongIds = ids.filter((id) => id !== q.correctOption);
    const daKeys = Object.keys(q.distractorAnalysis ?? {});
    const missing = wrongIds.filter((id) => !daKeys.includes(id));
    const extra = daKeys.filter((id) => !wrongIds.includes(id));
    if (missing.length > 0) errors.push(`${label}: distractorAnalysis missing ${JSON.stringify(missing)}`);
    if (extra.length > 0) errors.push(`${label}: distractorAnalysis has unexpected keys ${JSON.stringify(extra)}`);

    for (const [field, value] of [
      ["content", q.content],
      ["explanation", q.explanation],
    ] as [string, LangText][]) {
      if (!value?.en) errors.push(`${label}.${field}: missing "en"`);
      if (!value?.hi) errors.push(`${label}.${field}: missing "hi"`);
    }
  }

  if (byDiff.EASY !== 10) errors.push(`${file.section}: expected 10 EASY, got ${byDiff.EASY ?? 0}`);
  if (byDiff.MEDIUM !== 15) errors.push(`${file.section}: expected 15 MEDIUM, got ${byDiff.MEDIUM ?? 0}`);
  if (byDiff.HARD !== 15) errors.push(`${file.section}: expected 15 HARD, got ${byDiff.HARD ?? 0}`);

  if (errors.length > 0) {
    throw new Error(`Audit file "${file.section}" failed re-validation at seed time:\n${errors.join("\n")}`);
  }

  return qs;
}
