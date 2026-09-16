/**
 * Word-by-word diff for the Sentence X-Ray results viewer — reuses
 * typingEvaluation.ts's own LCS alignment (computeExactMatches) rather than
 * re-implementing it, so the X-Ray's word-level annotations can never drift
 * out of sync with the actual fullMistakes/halfMistakes counts a candidate
 * was graded on.
 */

import { computeExactMatches, normalizeForComparison, tokenizeTypingText } from "./typingEvaluation";

export type WordDiffStatus = "correct" | "full" | "half" | "omitted";

export interface WordDiffEntry {
  word: string;
  status: WordDiffStatus;
}

/** Annotates one gap between two exact-match anchors (or the passage boundaries) — mirrors typingEvaluation.ts's classifyGap, but emits per-word entries instead of just counts. */
function diffGap(targetGap: string[], typedGap: string[]): WordDiffEntry[] {
  const pairCount = Math.min(targetGap.length, typedGap.length);
  const entries: WordDiffEntry[] = [];

  for (let k = 0; k < pairCount; k++) {
    const isHalf = normalizeForComparison(targetGap[k]!) === normalizeForComparison(typedGap[k]!);
    entries.push({ word: targetGap[k]!, status: isHalf ? "half" : "full" });
  }

  // Leftover target words beyond the paired-up count were never typed at
  // all (an omission); leftover typed words are extra insertions with no
  // target word to attach to, so they aren't represented in this
  // target-text-anchored view (evaluateTypingAttempt still counts them).
  for (let k = pairCount; k < targetGap.length; k++) {
    entries.push({ word: targetGap[k]!, status: "omitted" });
  }

  return entries;
}

/**
 * Returns the target passage's words, each annotated with how the
 * candidate typed it — the data source for a word-by-word colored diff
 * viewer. `omitted` (typed nothing for that word) is distinct from `full`
 * (typed something, but wrong) internally, though a UI may render both the
 * same red if it only wants 3 colors.
 */
export function diffTypedWords(targetText: string, typedText: string): WordDiffEntry[] {
  const targetWords = tokenizeTypingText(targetText);
  const typedWords = tokenizeTypingText(typedText);
  const matches = computeExactMatches(targetWords, typedWords);

  const entries: WordDiffEntry[] = [];
  let prevI = 0;
  let prevJ = 0;

  for (const [i, j] of matches) {
    entries.push(...diffGap(targetWords.slice(prevI, i), typedWords.slice(prevJ, j)));
    entries.push({ word: targetWords[i]!, status: "correct" });
    prevI = i + 1;
    prevJ = j + 1;
  }

  entries.push(...diffGap(targetWords.slice(prevI), typedWords.slice(prevJ)));

  return entries;
}
