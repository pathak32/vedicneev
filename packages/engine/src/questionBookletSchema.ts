/**
 * The contract for one topic-N.json file in the externally-authored
 * question bank (D:\Projects\notes handwritten\questions\{class6,class9}\
 * {en,hi}\topic-N.json — outside this repo). Pure validation/scanning, no
 * I/O — the caller (a packaging script) reads the file and hands this
 * module the parsed JSON.
 *
 * Kept deliberately tolerant of minor key-naming variance (see
 * QUESTION_FIELD_ALIASES) the same way apps/omrtest's documentParser.ts
 * tolerates header variance in uploaded CSVs — this bank was produced
 * across many independent authoring/fix passes, so a rigid single-shape
 * parser would reject otherwise-good files over a renamed key.
 */

export const BOOKLET_OPTION_KEYS = ["A", "B", "C", "D"] as const;
export type BookletOptionKey = (typeof BOOKLET_OPTION_KEYS)[number];

export interface QuestionBookletQuestion {
  questionNumber: number;
  question: string;
  options: Record<BookletOptionKey, string>;
  correctOption: BookletOptionKey;
  explanation: string;
}

export interface QuestionBookletValidationError {
  questionNumber: number | null;
  message: string;
}

export interface QuestionBookletValidationResult {
  ok: boolean;
  questions: QuestionBookletQuestion[];
  errors: QuestionBookletValidationError[];
}

/**
 * Reads an optional human-readable topic title directly off the topic
 * file's own top-level JSON (e.g. `{ "topicTitle": "...", "questions": [...] }`)
 * rather than keeping a third copy of the 72-title-per-class-level list
 * that already lives in seed-study-note-pdfs.ts's CLASS_6_TITLES/
 * CLASS_9_TITLES (that file executes a Prisma seed on import, so it can't
 * safely be imported from a packaging script either). Falls back to a
 * generic "Topic N" label when the file doesn't carry one — every
 * downstream renderer must tolerate that fallback rather than assume a
 * title is always present.
 */
export function extractTopicTitle(raw: unknown, topicNumber: number): string {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const record = raw as Record<string, unknown>;
    const title = record.topicTitle ?? record.title ?? record.name;
    if (typeof title === "string" && title.trim().length > 0) return title;
  }
  return `Topic ${topicNumber}`;
}

const QUESTION_TEXT_ALIASES = ["question", "stem", "text", "questionText"];
const EXPLANATION_ALIASES = ["explanation", "solution", "workedSolution"];
const ANSWER_ALIASES = ["correctOption", "answer", "correctAnswer"];
const NUMBER_ALIASES = ["questionNumber", "number", "no", "qNo"];
const OPTIONS_ALIASES = ["options", "choices"];

function firstStringField(record: Record<string, unknown>, aliases: string[]): string | undefined {
  for (const key of aliases) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return undefined;
}

/** Accepts either `{ A: "...", B: "...", ... }` or `[{ id/label: "A", text: "..." }, ...]`. */
function normalizeOptions(raw: unknown): Record<BookletOptionKey, string> | null {
  if (!raw || typeof raw !== "object") return null;

  if (Array.isArray(raw)) {
    const options: Partial<Record<BookletOptionKey, string>> = {};
    for (const entry of raw) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as Record<string, unknown>;
      const label = String(e.id ?? e.label ?? e.key ?? "").toUpperCase();
      const text = e.text ?? e.value;
      if ((BOOKLET_OPTION_KEYS as readonly string[]).includes(label) && typeof text === "string") {
        options[label as BookletOptionKey] = text;
      }
    }
    return BOOKLET_OPTION_KEYS.every((k) => options[k]) ? (options as Record<BookletOptionKey, string>) : null;
  }

  const record = raw as Record<string, unknown>;
  const options: Partial<Record<BookletOptionKey, string>> = {};
  for (const key of BOOKLET_OPTION_KEYS) {
    const value = record[key] ?? record[key.toLowerCase()];
    if (typeof value === "string") options[key] = value;
  }
  return BOOKLET_OPTION_KEYS.every((k) => options[k]) ? (options as Record<BookletOptionKey, string>) : null;
}

function normalizeAnswer(raw: unknown): BookletOptionKey | null {
  const letter = String(raw ?? "").trim().toUpperCase();
  return (BOOKLET_OPTION_KEYS as readonly string[]).includes(letter) ? (letter as BookletOptionKey) : null;
}

/**
 * Validates one topic file's parsed JSON (expected shape: an array of
 * question objects, or `{ questions: [...] }`). Every row is checked
 * independently and collected into `errors` — a single malformed question
 * never aborts validation of the rest, so a packaging run gets a complete
 * error report in one pass instead of one error at a time.
 */
export function validateQuestionBookletTopic(raw: unknown): QuestionBookletValidationResult {
  const errors: QuestionBookletValidationError[] = [];
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as Record<string, unknown>).questions)
      ? ((raw as Record<string, unknown>).questions as unknown[])
      : null;

  if (!list) {
    return { ok: false, questions: [], errors: [{ questionNumber: null, message: "Expected a JSON array of questions, or an object with a `questions` array." }] };
  }

  const questions: QuestionBookletQuestion[] = [];
  list.forEach((entry, index) => {
    const fallbackNumber = index + 1;
    if (!entry || typeof entry !== "object") {
      errors.push({ questionNumber: fallbackNumber, message: "Not a JSON object." });
      return;
    }
    const record = entry as Record<string, unknown>;
    const questionNumber = (() => {
      for (const key of NUMBER_ALIASES) {
        const value = record[key];
        if (typeof value === "number") return value;
      }
      return fallbackNumber;
    })();

    const question = firstStringField(record, QUESTION_TEXT_ALIASES);
    if (!question) {
      errors.push({ questionNumber, message: "Missing question text." });
      return;
    }

    const options = normalizeOptions(record[OPTIONS_ALIASES[0]!] ?? record[OPTIONS_ALIASES[1]!]);
    if (!options) {
      errors.push({ questionNumber, message: "Missing or incomplete options (need all of A/B/C/D)." });
      return;
    }

    let correctOption: BookletOptionKey | null = null;
    for (const key of ANSWER_ALIASES) {
      correctOption = normalizeAnswer(record[key]);
      if (correctOption) break;
    }
    if (!correctOption) {
      errors.push({ questionNumber, message: "Missing or invalid correctOption (must be one of A/B/C/D)." });
      return;
    }

    const explanation = firstStringField(record, EXPLANATION_ALIASES);
    if (!explanation) {
      errors.push({ questionNumber, message: "Missing explanation." });
      return;
    }

    questions.push({ questionNumber, question, options, correctOption, explanation });
  });

  return { ok: errors.length === 0, questions, errors };
}

export interface SelfCorrectionArtifact {
  questionNumber: number;
  matchedPhrase: string;
  excerpt: string;
}

// The literal failure signature the quality audit found: the model solves
// the question, then visibly second-guesses itself mid-explanation and
// ships the wrong option. These phrases are the textual residue of that
// self-correction — a genuine explanation reads as a single settled
// derivation and never needs to say any of this about itself.
const SELF_CORRECTION_PHRASES = [
  "wait,",
  "wait —",
  "wait--",
  "let me reconsider",
  "let me recheck",
  "let me recompute",
  "let me re-check",
  "on second thought",
  "actually, the correct",
  "actually, i",
  "i made an error",
  "i made a mistake",
  "correcting myself",
  "correction:",
  "hold on,",
  "oops,",
  "that's not right",
  "that is not right",
  "let me redo",
];

/**
 * Flags explanations containing a self-correction phrase — a necessary but
 * not sufficient signal (it catches the known artifact pattern; it cannot
 * confirm an explanation is otherwise correct). Every flagged question
 * must go to human/agent re-verification before the booklet ships —
 * packaging should refuse to proceed past unscanned or unresolved flags
 * rather than silently shipping them (zero error tolerance).
 */
export function scanForSelfCorrectionArtifacts(questions: QuestionBookletQuestion[]): SelfCorrectionArtifact[] {
  const found: SelfCorrectionArtifact[] = [];
  for (const q of questions) {
    const haystack = q.explanation.toLowerCase();
    for (const phrase of SELF_CORRECTION_PHRASES) {
      const index = haystack.indexOf(phrase);
      if (index !== -1) {
        const start = Math.max(0, index - 30);
        const end = Math.min(q.explanation.length, index + phrase.length + 30);
        found.push({ questionNumber: q.questionNumber, matchedPhrase: phrase, excerpt: q.explanation.slice(start, end) });
        break; // one flag per question is enough to route it to review
      }
    }
  }
  return found;
}
