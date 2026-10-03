/**
 * Front-matter page for the "20 Sample Papers" book — explains the
 * scan-to-score mechanic up front (no answer key in this book by design,
 * see generate-sample-paper-books.mts's own header comment) so a buyer
 * isn't surprised by its absence partway through.
 */
import React from "react";
import { Page, Text, View } from "@react-pdf/renderer";
import type { buildPdfStyles } from "./pdfFonts.mjs";

const h = React.createElement;

export function buildCoverPage(
  bookTitle: string,
  examLabel: string,
  classLevel: 6 | 9,
  languageLabel: string,
  setCount: number,
  styles: ReturnType<typeof buildPdfStyles>
) {
  return h(
    Page,
    { size: "A4", style: styles.page },
    h(Text, { style: styles.title }, bookTitle),
    h(Text, { style: styles.subtitle }, `${examLabel} · Class ${classLevel}${languageLabel ? ` · ${languageLabel}` : ""} · VedicNeev`),
    h(
      View,
      { style: { marginTop: 24, display: "flex", flexDirection: "column", gap: 10 } },
      h(Text, { style: { fontSize: 12, fontWeight: 700 } }, "What's inside"),
      h(Text, { style: { fontSize: 10 } }, `${setCount} complete, exam-pattern practice papers — each one a full sitting, not a topic drill.`),
      h(Text, { style: { fontSize: 10 } }, "Every paper is immediately followed by its own blank OMR answer sheet."),

      h(Text, { style: { fontSize: 12, fontWeight: 700, marginTop: 14 } }, "This book has no printed answer key — on purpose"),
      h(Text, { style: { fontSize: 10 } }, "Take a paper under real exam timing, fill the matching OMR sheet with a dark pen or pencil, then:"),
      h(Text, { style: { fontSize: 10, marginLeft: 12 } }, "1. Log in at vedicneev.com with the mobile number you purchased with."),
      h(Text, { style: { fontSize: 10, marginLeft: 12 } }, "2. Select this book and the set number you just attempted."),
      h(Text, { style: { fontSize: 10, marginLeft: 12 } }, "3. Upload a clear, well-lit photo of your filled OMR sheet."),
      h(Text, { style: { fontSize: 10, marginLeft: 12 } }, "4. Get your score and a question-by-question breakdown in seconds — free for buyers of this book."),

      h(Text, { style: { fontSize: 10, marginTop: 14 } },
        "Want deeper practice beyond these 20 sets — unlimited mock tests, the full Mistake Vault, and topic-wise retesting? " +
        "Subscribe to VedicNeev for Rs. 999/year after your first scan."),

      h(Text, { style: { fontSize: 9, marginTop: 18, color: "#666" } },
        "Photograph the sheet flat, in good light, with all 4 corner squares visible — that's what the scanner uses to read it correctly.")
    )
  );
}
