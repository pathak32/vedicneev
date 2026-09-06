import type { ExamOption, FigureMetadata, Multilingual } from "./types";

/**
 * Shared defensive-parsing helpers for Prisma `Json` columns that should be
 * shaped like Multilingual / ExamOption[] / FigureMetadata but aren't
 * type-checked as such by Prisma. Pulled out of jnvstMockService.ts and
 * topicPracticeService.ts (which both hydrate the same Question/
 * PreviousYearQuestion rows into ExamQuestion) into their own module so
 * those two files can import from here instead of from each other — they
 * used to import asMultilingual one-directionally, but jnvstMockService.ts's
 * Question-bank mock-assembly path (AISSEE/RMS Class 6) needs
 * asExamOption/asFigureMetadata too, which would have made the import a
 * cycle.
 */

/** A malformed row (bad seed data, manual DB edit) fails loudly here instead of rendering as `undefined` deep inside the exam player. */
export function asMultilingual(value: unknown, context: string): Multilingual {
  if (
    typeof value === "object" &&
    value !== null &&
    "en" in value &&
    typeof (value as Record<string, unknown>).en === "string"
  ) {
    return value as Multilingual;
  }
  throw new Error(`Expected multilingual JSON with an "en" key for ${context}, got: ${JSON.stringify(value)}`);
}

/** Same reasoning as asMultilingual — Question.options is a `Json` column shaped `{ id, text?, imageUrl? }[]` (see packages/db/prisma/schema.prisma), not type-checked by Prisma. */
export function asExamOption(raw: unknown, context: string): ExamOption {
  if (typeof raw !== "object" || raw === null || typeof (raw as Record<string, unknown>).id !== "string") {
    throw new Error(`Expected an option with a string "id" for ${context}, got: ${JSON.stringify(raw)}`);
  }
  const o = raw as Record<string, unknown>;
  const option: ExamOption = { id: o.id as string };
  if (o.text !== undefined) option.text = asMultilingual(o.text, `${context} text`);
  if (typeof o.imageUrl === "string") option.imageUrl = o.imageUrl;
  return option;
}

/** Same reasoning — Question.figureMetadata is a `Json` column shaped `{ type: "svg"|"image", markup?, url?, transform? }` (see packages/db/prisma/schema.prisma), not type-checked by Prisma. */
export function asFigureMetadata(raw: unknown, context: string): FigureMetadata {
  const type = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>).type : undefined;
  if (type !== "svg" && type !== "image") {
    throw new Error(`Expected figureMetadata with type "svg" or "image" for ${context}, got: ${JSON.stringify(raw)}`);
  }
  return raw as FigureMetadata;
}
