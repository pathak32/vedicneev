/**
 * Official government-exam-style typing grading. Pure logic — no I/O — so
 * the API route just persists whatever this returns. Word = 5 key
 * depressions including spaces (the standard convention these exams use);
 * a matched word that differs only in case/punctuation is a half mistake,
 * an omitted/inserted/genuinely-substituted word is a full mistake.
 */

const KEY_DEPRESSIONS_PER_WORD = 5;

// Strips ASCII punctuation plus the Devanagari danda/double-danda (। ॥),
// since Hindi-layout passages use those where English uses a period.
const PUNCTUATION_PATTERN = /[.,!?;:'"()[\]{}\-–—।॥]/g;

export interface TypingEvaluationResult {
  grossSpeedWpm: number;
  netSpeedWpm: number;
  accuracyPercent: number;
  fullMistakes: number;
  halfMistakes: number;
  keyDepressions: number;
}

function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function normalizeForComparison(word: string): string {
  return word.toLowerCase().replace(PUNCTUATION_PATTERN, "");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Longest-common-subsequence backbone of exact-match words, as aligned (targetIndex, typedIndex) pairs in increasing order. */
function computeExactMatches(target: string[], typed: string[]): Array<[number, number]> {
  const n = target.length;
  const m = typed.length;
  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i]![j] =
        target[i - 1] === typed[j - 1] ? dp[i - 1]![j - 1]! + 1 : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
    }
  }

  const matches: Array<[number, number]> = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (target[i - 1] === typed[j - 1]) {
      matches.push([i - 1, j - 1]);
      i--;
      j--;
    } else if (dp[i - 1]![j]! >= dp[i]![j - 1]!) {
      i--;
    } else {
      j--;
    }
  }
  matches.reverse();
  return matches;
}

/** Classifies one unmatched target/typed word run between two exact-match anchors (or the passage boundaries). */
function classifyGap(targetGap: string[], typedGap: string[]): { fullMistakes: number; halfMistakes: number } {
  const pairCount = Math.min(targetGap.length, typedGap.length);
  let fullMistakes = 0;
  let halfMistakes = 0;

  for (let k = 0; k < pairCount; k++) {
    if (normalizeForComparison(targetGap[k]!) === normalizeForComparison(typedGap[k]!)) {
      halfMistakes++;
    } else {
      fullMistakes++;
    }
  }
  // Whichever side has leftover words beyond the paired-up count is a pure
  // omission (leftover target words) or insertion (leftover typed words) —
  // always a full mistake, never a half one.
  fullMistakes += Math.abs(targetGap.length - typedGap.length);

  return { fullMistakes, halfMistakes };
}

function diffWords(targetWords: string[], typedWords: string[]): { fullMistakes: number; halfMistakes: number } {
  const matches = computeExactMatches(targetWords, typedWords);
  let fullMistakes = 0;
  let halfMistakes = 0;
  let prevI = 0;
  let prevJ = 0;

  for (const [i, j] of matches) {
    const gap = classifyGap(targetWords.slice(prevI, i), typedWords.slice(prevJ, j));
    fullMistakes += gap.fullMistakes;
    halfMistakes += gap.halfMistakes;
    prevI = i + 1;
    prevJ = j + 1;
  }

  const tail = classifyGap(targetWords.slice(prevI), typedWords.slice(prevJ));
  fullMistakes += tail.fullMistakes;
  halfMistakes += tail.halfMistakes;

  return { fullMistakes, halfMistakes };
}

/**
 * Grades one attempt against its source passage. `timeTakenSeconds` is
 * floored at 1 so a near-instant submit can't divide by zero / blow up the
 * speed figures.
 */
export function evaluateTypingAttempt(
  targetText: string,
  typedText: string,
  timeTakenSeconds: number
): TypingEvaluationResult {
  const targetWords = tokenize(targetText);
  const typedWords = tokenize(typedText);
  const { fullMistakes, halfMistakes } = diffWords(targetWords, typedWords);

  const keyDepressions = typedText.length;
  const minutes = Math.max(timeTakenSeconds, 1) / 60;

  const grossSpeedWpm = keyDepressions / KEY_DEPRESSIONS_PER_WORD / minutes;
  const mistakePenaltyWpm = (fullMistakes + halfMistakes / 2) / minutes;
  const netSpeedWpm = Math.max(0, grossSpeedWpm - mistakePenaltyWpm);

  const totalTargetWords = targetWords.length;
  const accuracyPercent =
    totalTargetWords === 0
      ? 100
      : clamp(((totalTargetWords - fullMistakes - halfMistakes) / totalTargetWords) * 100, 0, 100);

  return {
    grossSpeedWpm: round2(grossSpeedWpm),
    netSpeedWpm: round2(netSpeedWpm),
    accuracyPercent: round2(accuracyPercent),
    fullMistakes,
    halfMistakes,
    keyDepressions,
  };
}
