/**
 * react-pdf Document builder for a mock exam paper — a single shuffled,
 * proportionally-sampled set of questions laid out like a real timed paper
 * (sequential numbering, no topic headings), with an answer key on its own
 * page at the end. This is a different product from the per-topic/compiled
 * Question Bank booklets (questionBookletDocument.mts): that one is an
 * exhaustive reference organized by topic; this one is a single sittable
 * paper meant to be given away (e.g. as a social-media lead magnet), so it
 * mimics what a student would actually face on exam day.
 */
import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { QuestionBookletQuestion } from "@vedicneev/engine";

import { buildPdfStyles } from "./pdfFonts.mjs";

const h = React.createElement;

export interface MockPaperQuestion extends QuestionBookletQuestion {
  /** Which syllabus topic this question was drawn from, for the answer key's reference only. */
  topicNumber: number;
}

export interface MockPaperMeta {
  examLabel: string;
  classLevel: 6 | 9;
  languageLabel: string;
  totalMarks: number;
  durationMinutes: number;
}

function questionBlock(q: MockPaperQuestion, displayNumber: number, styles: ReturnType<typeof buildPdfStyles>) {
  return h(
    View,
    { key: displayNumber, style: styles.questionBlock, wrap: false },
    h(Text, { style: styles.questionStem }, `${displayNumber}. ${q.question}`),
    ...(["A", "B", "C", "D"] as const).map((label) =>
      h(
        View,
        { key: label, style: styles.option },
        h(Text, { style: styles.optionLabel }, `${label}.`),
        h(Text, {}, q.options[label])
      )
    )
  );
}

/** The question paper itself — no answers or explanations shown, matching a real exam paper. */
export function buildMockPaperDocument(meta: MockPaperMeta, questions: MockPaperQuestion[], styles: ReturnType<typeof buildPdfStyles>) {
  const title = `${meta.examLabel} Class ${meta.classLevel} — Sample Mock Paper${meta.languageLabel ? ` (${meta.languageLabel})` : ""}`;

  return h(
    Document,
    { title },
    h(
      Page,
      { size: "A4", style: styles.page },
      h(Text, { style: styles.title }, title),
      h(Text, { style: styles.subtitle }, "VedicNeev — practice paper. Not an official exam document."),
      h(
        View,
        { style: styles.metaRow },
        h(Text, { style: styles.metaItem }, `Total Questions: ${questions.length}`),
        h(Text, { style: styles.metaItem }, `Total Marks: ${meta.totalMarks}`),
        h(Text, { style: styles.metaItem }, `Duration: ${meta.durationMinutes} min`)
      ),
      ...questions.map((q, i) => questionBlock(q, i + 1, styles)),
      h(Text, {
        style: styles.pageNumber,
        render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`,
        fixed: true,
      })
    )
  );
}

/** The answer key — a separate document (or the caller can concatenate pages) so the paper itself never leaks answers when shared alone. */
export function buildMockPaperAnswerKeyDocument(meta: MockPaperMeta, questions: MockPaperQuestion[], styles: ReturnType<typeof buildPdfStyles>) {
  const title = `${meta.examLabel} Class ${meta.classLevel} — Sample Mock Paper: Answer Key${meta.languageLabel ? ` (${meta.languageLabel})` : ""}`;

  return h(
    Document,
    { title },
    h(
      Page,
      { size: "A4", style: styles.page },
      h(Text, { style: styles.title }, title),
      ...questions.map((q, i) =>
        h(
          View,
          { key: i, style: styles.questionBlock, wrap: false },
          h(Text, { style: styles.questionStem }, `${i + 1}. Correct answer: ${q.correctOption}`),
          h(Text, { style: styles.explanation }, q.explanation)
        )
      ),
      h(Text, {
        style: styles.pageNumber,
        render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`,
        fixed: true,
      })
    )
  );
}
