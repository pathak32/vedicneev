import { prisma } from "@vedicneev/db";

export interface ExportedQuestion {
  source: "TOPIC_BANK" | "PYQ";
  id: string;
  key: string;
  examBoard: string;
  classLevel: "6" | "9";
  section: string;
  topic: string | null;
  difficulty: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D" | "";
  explanation: string;
}

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

/**
 * Lenient text extraction — this export exists specifically so an admin
 * can spot malformed/miskeyed rows, so a bad field must show up clearly
 * (e.g. "(missing)") for review, never throw and abort the whole export
 * the way asMultilingual/asExamOption (questionHydration.ts) deliberately
 * do for the real exam-rendering path.
 */
function safeText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "en" in value) {
    const en = (value as Record<string, unknown>).en;
    if (typeof en === "string") return en;
  }
  return "(missing)";
}

function safeOptionText(rawOptions: unknown, index: number): string {
  if (!Array.isArray(rawOptions)) return "(missing)";
  const option = rawOptions[index];
  if (option === undefined) return "(missing)";
  if (typeof option === "object" && option !== null && "text" in option) {
    return safeText((option as Record<string, unknown>).text);
  }
  return safeText(option);
}

/**
 * Every seeded question, from both sources, normalized to one flat audit
 * row — see admin/questions/page.tsx and api/admin/questions/export for
 * the two ways this gets surfaced. Read-only; deliberately tolerant of
 * malformed rows (see safeText above) since surfacing exactly those rows
 * is the point of this feature.
 */
export async function getAllQuestionsForExport(): Promise<ExportedQuestion[]> {
  const [questions, pyqQuestions] = await Promise.all([
    prisma.question.findMany({ include: { topic: { include: { section: true } } }, orderBy: { key: "asc" } }),
    prisma.previousYearQuestion.findMany({ include: { section: true }, orderBy: { key: "asc" } }),
  ]);

  const topicBankRows: ExportedQuestion[] = questions.map((q) => {
    const options = q.options as unknown[];
    const correctIndex = Array.isArray(options)
      ? options.findIndex((o) => typeof o === "object" && o !== null && (o as Record<string, unknown>).id === q.correctOption)
      : -1;
    const examBoard = q.targetExam ?? q.topic.targetExam ?? "ANY";
    const classLevel = q.targetClass ?? q.topic.targetClass ?? "CLASS_6";

    return {
      source: "TOPIC_BANK",
      id: q.id,
      key: q.key,
      examBoard,
      classLevel: classLevel === "CLASS_9" ? "9" : "6",
      section: safeText(q.topic.section.name),
      topic: safeText(q.topic.name),
      difficulty: q.difficulty,
      questionText: safeText(q.content),
      optionA: safeOptionText(options, 0),
      optionB: safeOptionText(options, 1),
      optionC: safeOptionText(options, 2),
      optionD: safeOptionText(options, 3),
      correctAnswer: correctIndex >= 0 && correctIndex < 4 ? OPTION_LETTERS[correctIndex] ?? "" : "",
      explanation: q.explanation ? safeText(q.explanation) : "",
    };
  });

  const pyqRows: ExportedQuestion[] = pyqQuestions.map((q) => {
    const options = q.optionsJson as unknown[];
    return {
      source: "PYQ",
      id: q.id,
      key: q.key,
      examBoard: q.examType,
      classLevel: q.classLevel === 9 ? "9" : "6",
      section: safeText(q.section.name),
      topic: null,
      difficulty: q.difficulty,
      questionText: safeText(q.questionJson),
      optionA: safeOptionText(options, 0),
      optionB: safeOptionText(options, 1),
      optionC: safeOptionText(options, 2),
      optionD: safeOptionText(options, 3),
      correctAnswer: q.correctAnswer >= 0 && q.correctAnswer < 4 ? OPTION_LETTERS[q.correctAnswer] ?? "" : "",
      explanation: safeText(q.explanation),
    };
  });

  return [...topicBankRows, ...pyqRows];
}

/** Minimal CSV serializer for this flat, all-string-column shape — quote-escapes fields containing a comma/quote/newline. No library needed for ~13 columns. */
export function questionsToCsv(rows: ExportedQuestion[]): string {
  const headers: (keyof ExportedQuestion)[] = [
    "source",
    "id",
    "key",
    "examBoard",
    "classLevel",
    "section",
    "topic",
    "difficulty",
    "questionText",
    "optionA",
    "optionB",
    "optionC",
    "optionD",
    "correctAnswer",
    "explanation",
  ];

  function csvCell(value: unknown): string {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvCell(row[h])).join(","));
  }
  return lines.join("\n");
}
