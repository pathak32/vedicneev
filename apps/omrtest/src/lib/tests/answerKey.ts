import { BUBBLE_OPTIONS, type BubbleOption, type OmrAnswerKeyEntry } from "@vedicneev/engine";

const BUBBLE_OPTION_SET = new Set<string>(BUBBLE_OPTIONS);

/**
 * TestBatch.answerKey's on-disk shape — keyed by question number string,
 * e.g. { "1": "B", "2": "D" }. Deliberately the same convention
 * packages/db's OfflineMockSession.answerKey already uses (see that
 * model's comment), rather than inventing a second shape: both are "the
 * frozen key for one printed set", just scoped to an institute batch
 * instead of a single offline mock session.
 */
export type StoredAnswerKey = Record<string, BubbleOption>;

/**
 * Parses TestBatch.answerKey's Json column into the
 * OmrAnswerKeyEntry[]/evaluateOmrSheet expects — TestBatch.answerKey is
 * nullable (an institute can generate sheets before the key is finalized,
 * see that column's own comment), so this returns null rather than
 * throwing when it hasn't been set yet.
 */
export function parseStoredAnswerKey(raw: unknown): OmrAnswerKeyEntry[] | null {
  if (raw === null || raw === undefined || typeof raw !== "object" || Array.isArray(raw)) return null;

  const entries: OmrAnswerKeyEntry[] = [];
  for (const [questionNumberKey, value] of Object.entries(raw as Record<string, unknown>)) {
    const questionNumber = Number(questionNumberKey);
    if (!Number.isInteger(questionNumber) || questionNumber < 1) continue;
    if (typeof value !== "string" || !BUBBLE_OPTION_SET.has(value)) continue;
    entries.push({ questionNumber, correctOption: value as BubbleOption });
  }
  return entries.length > 0 ? entries : null;
}
