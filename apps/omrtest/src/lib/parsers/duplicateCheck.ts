const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "of", "in", "on", "and", "to", "for", "which", "what", "how",
  "does", "do", "was", "were", "with", "as", "at", "by", "this", "that",
]);

function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return new Set(words);
}

/** Jaccard similarity (0-1) between two texts' normalized word sets. */
function similarity(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const word of setA) if (setB.has(word)) intersection += 1;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export interface ExistingQuestionForDuplicateCheck {
  testBatchId: string;
  batchName: string;
  questionNumber: number;
  text: string;
}

export interface DuplicateMatch {
  questionNumber: number;
  similarity: number;
  matchedBatchName: string;
  matchedTestBatchId: string;
  matchedText: string;
}

const DEFAULT_THRESHOLD = 0.6;

/**
 * A text-similarity duplicate check (normalized word-overlap / Jaccard),
 * NOT a true ML/embedding-based semantic search — this repo has no
 * embeddings model or vector index wired up, and adding one is a real
 * infrastructure decision (provider, cost, latency) beyond this feature's
 * scope. This still catches the common case a coaching institute actually
 * cares about — re-uploading the same or a lightly-reworded question from
 * an earlier test batch — without inventing new external dependencies.
 */
export function findDuplicates(
  newQuestions: { questionNumber: number; text: string }[],
  existingQuestions: ExistingQuestionForDuplicateCheck[],
  threshold: number = DEFAULT_THRESHOLD
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  for (const question of newQuestions) {
    if (!question.text.trim()) continue;
    let best: DuplicateMatch | null = null;
    for (const existing of existingQuestions) {
      const score = similarity(question.text, existing.text);
      if (score >= threshold && (!best || score > best.similarity)) {
        best = {
          questionNumber: question.questionNumber,
          similarity: score,
          matchedBatchName: existing.batchName,
          matchedTestBatchId: existing.testBatchId,
          matchedText: existing.text,
        };
      }
    }
    if (best) matches.push(best);
  }
  return matches;
}
