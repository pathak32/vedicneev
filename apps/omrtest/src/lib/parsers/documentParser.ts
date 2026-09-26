import mammoth from "mammoth";
// pdf-parse's own package.json main entry runs a debug self-test when
// required directly under some bundler resolution orders — importing the
// inner lib path (its own documented workaround) avoids that entirely.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (data: Buffer) => Promise<{ text: string }>;

import { BUBBLE_OPTIONS, type BubbleOption } from "@vedicneev/engine";

export interface ParsedQuestion {
  questionNumber: number;
  text: string;
  options: Partial<Record<BubbleOption, string>>;
  correctOption: BubbleOption | null;
  /** Anything the parser couldn't confidently determine — surfaced in the UI's editable preview so a human reviews exactly these rows before saving, never silently guessed. */
  warnings: string[];
}

export type ParseDocumentResult = { ok: true; questions: ParsedQuestion[] } | { ok: false; error: string };

const SUPPORTED_DOCX_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const SUPPORTED_PDF_TYPES = new Set(["application/pdf"]);

/**
 * Extracts raw text from an uploaded .docx or .pdf — the one place both
 * format-specific libraries (mammoth, pdf-parse) are used, so
 * normalizeQuestionsFromText below never needs to know which format
 * produced its input.
 */
export async function extractTextFromDocument(buffer: Buffer, contentType: string): Promise<ParseDocumentResult> {
  try {
    let text: string;
    if (SUPPORTED_DOCX_TYPES.has(contentType)) {
      text = (await mammoth.extractRawText({ buffer })).value;
    } else if (SUPPORTED_PDF_TYPES.has(contentType)) {
      text = (await pdfParse(buffer)).text;
    } else {
      return { ok: false, error: `Unsupported file type "${contentType}" — upload a .docx or .pdf.` };
    }
    return { ok: true, questions: normalizeQuestionsFromText(text) };
  } catch (error) {
    return { ok: false, error: `Could not read this file: ${error instanceof Error ? error.message : "unknown error"}` };
  }
}

// Matches a question's own leading number, e.g. "1.", "12)", "Q3.", "Q.4" —
// the split point between one question block and the next. Requires the
// number to start the line (after optional "Q"/whitespace) so a stray
// "4)" inside option or answer text is never mistaken for a new question.
const QUESTION_START_PATTERN = /^\s*(?:Q\.?\s*)?(\d{1,3})[.).:]\s+/i;
// An option line, e.g. "A) foo", "(B) bar", "C. baz", "D:  qux".
const OPTION_LINE_PATTERN = /^\s*[(\[]?([A-Da-d])[).\]:]\s+(.+)$/;
// An answer/key line anywhere in the block, e.g. "Answer: B", "Ans - C", "Correct Option: D".
const ANSWER_LINE_PATTERN = /\b(?:answer|ans|correct(?:\s+option)?|key)\s*[:\-]\s*\(?([A-Da-d])\)?\b/i;

/**
 * A deliberately pattern-based (not ML/NLP) parser for the common
 * "numbered question, lettered options, Answer: X" question-paper shape
 * — the shape this covers well is exactly what most coaching institutes
 * already type their papers in. It will not perfectly parse every
 * possible document layout (multi-column PDFs, images of text, unusual
 * option markers), which is precisely why the upload flow shows an
 * EDITABLE preview before anything is saved rather than trusting this
 * output blindly — every uncertain field is flagged in `warnings`
 * instead of guessed.
 */
export function normalizeQuestionsFromText(rawText: string): ParsedQuestion[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const blocks: { questionNumber: number; lines: string[] }[] = [];
  for (const line of lines) {
    const match = line.match(QUESTION_START_PATTERN);
    if (match) {
      blocks.push({ questionNumber: Number(match[1]), lines: [line.replace(QUESTION_START_PATTERN, "")] });
    } else if (blocks.length > 0) {
      blocks[blocks.length - 1]!.lines.push(line);
    }
    // A line before the first recognized question number is front matter
    // (instructions, a title page) — intentionally dropped.
  }

  return blocks.map((block) => parseQuestionBlock(block.questionNumber, block.lines));
}

function parseQuestionBlock(questionNumber: number, lines: string[]): ParsedQuestion {
  const warnings: string[] = [];
  const options: Partial<Record<BubbleOption, string>> = {};
  const textLines: string[] = [];
  let correctOption: BubbleOption | null = null;

  for (const line of lines) {
    const answerMatch = line.match(ANSWER_LINE_PATTERN);
    if (answerMatch) {
      correctOption = answerMatch[1]!.toUpperCase() as BubbleOption;
      continue;
    }
    const optionMatch = line.match(OPTION_LINE_PATTERN);
    if (optionMatch) {
      const letter = optionMatch[1]!.toUpperCase() as BubbleOption;
      options[letter] = optionMatch[2]!.trim();
      continue;
    }
    textLines.push(line);
  }

  if (textLines.length === 0) warnings.push("No question text detected.");
  const missingOptions = BUBBLE_OPTIONS.filter((opt) => !options[opt]);
  if (missingOptions.length > 0) warnings.push(`Missing option${missingOptions.length > 1 ? "s" : ""}: ${missingOptions.join(", ")}.`);
  if (!correctOption) warnings.push("No answer detected.");

  return {
    questionNumber,
    text: textLines.join(" "),
    options,
    correctOption,
    warnings,
  };
}
