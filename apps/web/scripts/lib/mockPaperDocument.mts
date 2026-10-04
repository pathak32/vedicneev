/**
 * react-pdf Document builder for a mock exam paper — sectioned exactly like
 * the real exam (e.g. AISSEE's Language / Mathematics / Intelligence /
 * General Knowledge, each with its own question count and marks-per-
 * question), not a flat undifferentiated list — so what a student practices
 * on actually resembles exam day. See lib/mockPaperSelection.mts's
 * EXAM_PATTERNS for where each exam's real section blueprint comes from.
 *
 * This is a different product from the per-topic/compiled Question Bank
 * booklets (questionBookletDocument.mts): that one is an exhaustive
 * reference organized by topic; this one is a single sittable paper.
 */
import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { BuiltSection } from "./mockPaperSelection.mjs";

import { buildPdfStyles, sanitizeForPdf } from "./pdfFonts.mjs";

const h = React.createElement;

/** Same banner palette the handwritten-notes PDFs cycle through, reused here so every VedicNeev PDF product reads as one family. */
const BANNER_COLORS = ["#c0522b", "#1f3a93", "#1e7a4a", "#7a3a9e", "#a3781b", "#1b7a7a"];

export interface MockPaperMeta {
  examLabel: string;
  classLevel: 6 | 9;
  languageLabel: string;
  durationMinutes: number;
  negativeMarking: boolean;
  totalMarks: number;
  totalQuestions: number;
  /** e.g. "Set 7 of 20" — included in the title when a paper is one of several numbered sets. */
  setLabel?: string;
  /** Printed on the paper for exam-day realism — the matching OMR sheet carries the same number, pre-bubbled. */
  rollNumber: string;
}

const FOOTER_TEXT = "VedicNeev Exclusive  ·  www.vedicneev.com  ·  www.VedicMindAi.in  ·  Available on Play Store";

/** Exported for reuse by omrSheetDocument.mts, so every page in the combined book — paper or OMR sheet — shares the exact same footer. */
export function footer(examLabel: string, classLevel: 6 | 9) {
  return h(
    Text,
    {
      style: { position: "absolute", bottom: 16, left: 40, right: 40, fontSize: 7.5, color: "#666666", textAlign: "center" },
      render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
        `${examLabel} · Class ${classLevel}  —  ${FOOTER_TEXT}  —  Page ${pageNumber} of ${totalPages}`,
      fixed: true,
    }
  );
}

function headerBlock(meta: MockPaperMeta) {
  const title = `${meta.examLabel} Class ${meta.classLevel} — Sample Mock Paper${meta.setLabel ? ` — ${meta.setLabel}` : ""}${meta.languageLabel ? ` (${meta.languageLabel})` : ""}`;
  return [
    h(Text, { key: "title", style: { fontSize: 15, marginBottom: 3, fontWeight: 700 } }, title),
    h(Text, { key: "subtitle", style: { fontSize: 9, color: "#555555", marginBottom: 8 } }, "VedicNeev — practice paper. Not an official exam document."),
    h(
      View,
      { key: "namerow", style: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6, borderBottom: "1pt solid #ccc", paddingBottom: 6 } },
      h(Text, { style: { fontSize: 9 } }, "Name: _______________________________"),
      h(Text, { style: { fontSize: 9 } }, `Roll No.: ${meta.rollNumber}`),
      h(Text, { style: { fontSize: 9 } }, "Date: __________")
    ),
    h(
      View,
      { key: "metarow", style: { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 } },
      h(Text, { style: { marginRight: 16, marginBottom: 2, color: "#555555", fontSize: 9 } }, `Total Questions: ${meta.totalQuestions}`),
      h(Text, { style: { marginRight: 16, marginBottom: 2, color: "#555555", fontSize: 9 } }, `Total Marks: ${meta.totalMarks}`),
      h(Text, { style: { marginRight: 16, marginBottom: 2, color: "#555555", fontSize: 9 } }, `Duration: ${meta.durationMinutes} min`),
      h(Text, { style: { marginBottom: 2, color: "#555555", fontSize: 9 } }, meta.negativeMarking ? "Negative marking applies" : "No negative marking")
    ),
  ];
}

function sectionBanner(section: BuiltSection, index: number) {
  const color = BANNER_COLORS[index % BANNER_COLORS.length];
  return h(
    View,
    { key: `banner-${section.section}`, style: { backgroundColor: color, paddingVertical: 5, paddingHorizontal: 10, marginTop: 12, marginBottom: 6, borderRadius: 3 }, wrap: false },
    h(Text, { style: { color: "#ffffff", fontSize: 11, fontWeight: 700 } },
      `${section.label}  —  ${section.questions.length} questions  ·  ${section.marksEach} mark${section.marksEach === 1 ? "" : "s"} each  ·  ${section.questions.length * section.marksEach} marks`)
  );
}

function questionBlock(q: BuiltSection["questions"][number], displayNumber: number, styles: ReturnType<typeof buildPdfStyles>) {
  return h(
    View,
    { key: displayNumber, style: styles.questionBlock, wrap: false },
    h(Text, { style: styles.questionStem }, `${displayNumber}. ${sanitizeForPdf(q.question)}`),
    ...(["A", "B", "C", "D"] as const).map((label) =>
      h(
        View,
        { key: label, style: styles.option },
        h(Text, { style: styles.optionLabel }, `${label}.`),
        h(Text, {}, sanitizeForPdf(q.options[label]))
      )
    )
  );
}

/** Just the `<Page>` for a question paper, sectioned per the exam's real blueprint — no answers or explanations, matching a real exam paper. react-pdf paginates this single `<Page>`'s overflowing content across as many physical output pages as the content needs on its own; composing several of these under one `<Document>` (generate-sample-paper-books.mts) works the same way standalone rendering already did. */
export function buildMockPaperPage(meta: MockPaperMeta, sections: BuiltSection[], styles: ReturnType<typeof buildPdfStyles>) {
  let displayNumber = 0;
  const body: React.ReactNode[] = [...headerBlock(meta)];
  sections.forEach((section, i) => {
    body.push(sectionBanner(section, i));
    for (const q of section.questions) {
      displayNumber++;
      body.push(questionBlock(q, displayNumber, styles));
    }
  });

  return h(Page, { size: "A4", style: styles.page }, ...body, footer(meta.examLabel, meta.classLevel));
}

/** The question paper itself, as a standalone single-paper PDF document (generate-mock-papers.mts's free giveaway product). */
export function buildMockPaperDocument(meta: MockPaperMeta, sections: BuiltSection[], styles: ReturnType<typeof buildPdfStyles>) {
  const title = `${meta.examLabel} Class ${meta.classLevel} — Sample Mock Paper${meta.setLabel ? ` — ${meta.setLabel}` : ""}${meta.languageLabel ? ` (${meta.languageLabel})` : ""}`;
  return h(Document, { title }, buildMockPaperPage(meta, sections, styles));
}

/** The answer key — a separate document (or the caller can concatenate pages) so the paper itself never leaks answers when shared alone. Only used by the free-giveaway product; the sellable sample-paper-book deliberately has no answer key at all (see generate-sample-paper-books.mts). */
export function buildMockPaperAnswerKeyDocument(meta: MockPaperMeta, sections: BuiltSection[], styles: ReturnType<typeof buildPdfStyles>) {
  const title = `${meta.examLabel} Class ${meta.classLevel} — Sample Mock Paper: Answer Key${meta.setLabel ? ` — ${meta.setLabel}` : ""}${meta.languageLabel ? ` (${meta.languageLabel})` : ""}`;
  let displayNumber = 0;
  const body: React.ReactNode[] = [h(Text, { key: "title", style: { fontSize: 15, marginBottom: 8, fontWeight: 700 } }, title)];
  for (const section of sections) {
    for (const q of section.questions) {
      displayNumber++;
      body.push(
        h(
          View,
          { key: displayNumber, style: { marginBottom: 10 }, wrap: false },
          h(Text, { style: { marginBottom: 4, fontWeight: 700 } }, `${displayNumber}. Correct answer: ${q.correctOption}`),
          h(Text, { style: { marginTop: 4, marginLeft: 10, fontSize: 9, fontStyle: "italic" } }, sanitizeForPdf(q.explanation))
        )
      );
    }
  }
  return h(Document, { title }, h(Page, { size: "A4", style: styles.page }, ...body, footer(meta.examLabel, meta.classLevel)));
}
