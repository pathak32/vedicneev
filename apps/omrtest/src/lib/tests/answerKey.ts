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

export type ParseCompactAnswerKeyResult = { ok: true; storedAnswerKey: StoredAnswerKey } | { ok: false; error: string };

/**
 * Parses the admin UI's fast-entry format — one letter per question, in
 * order, e.g. "BDACB..." for questions 1-5 — into the same StoredAnswerKey
 * shape the DB column holds. Deliberately requires EXACTLY `totalQuestions`
 * characters (no blanks, no partial keys): evaluateOmrSheet
 * (packages/engine/src/omrEvaluator.ts) throws on any scanned question
 * missing an answer-key entry, and every scan always covers questions
 * 1..totalQuestions (see analyzeOmrUpload.ts) — a partial key saved here
 * would only surface as a hard grading crash on the next upload, not a
 * clear validation message at save time.
 */
export function parseCompactAnswerKey(input: string, totalQuestions: number): ParseCompactAnswerKeyResult {
  const normalized = input.trim().toUpperCase().replace(/[\s,]+/g, "");

  if (normalized.length !== totalQuestions) {
    return {
      ok: false,
      error: `Answer key must have exactly ${totalQuestions} letters (one per question) — got ${normalized.length}.`,
    };
  }

  const storedAnswerKey: StoredAnswerKey = {};
  for (let i = 0; i < normalized.length; i++) {
    const letter = normalized[i]!;
    if (!BUBBLE_OPTION_SET.has(letter)) {
      return {
        ok: false,
        error: `Question ${i + 1}: "${letter}" isn't a valid option — use only A, B, C, or D.`,
      };
    }
    storedAnswerKey[String(i + 1)] = letter as BubbleOption;
  }

  return { ok: true, storedAnswerKey };
}
