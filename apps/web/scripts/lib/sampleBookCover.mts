/**
 * Front-matter and back-matter pages for the "20 Sample Papers" book.
 * Front: explains the scan-to-score mechanic up front (no answer key in
 * this book by design, see generate-sample-paper-books.mts's own header
 * comment) and prints the exam's real pattern (sections/marks/duration) so
 * a buyer knows exactly what they're practicing for. Back: a single closing
 * page about VedicNeev — placed as the very LAST page of the book, by
 * explicit product decision, rather than repeated after every paper.
 */
import React from "react";
import { Page, Text, View } from "@react-pdf/renderer";
import type { buildPdfStyles } from "./pdfFonts.mjs";
import type { ExamPattern } from "./mockPaperSelection.mjs";
import { footer } from "./mockPaperDocument.mjs";

const h = React.createElement;
const BANNER_COLOR = "#1f3a93";

export function buildCoverPage(
  bookTitle: string,
  examLabel: string,
  classLevel: 6 | 9,
  languageLabel: string,
  setCount: number,
  pattern: ExamPattern,
  styles: ReturnType<typeof buildPdfStyles>
) {
  const totalQuestions = pattern.sections.reduce((sum, s) => sum + s.count, 0);
  const totalMarks = pattern.sections.reduce((sum, s) => sum + s.count * s.marksEach, 0);

  return h(
    Page,
    { size: "A4", style: styles.page },
    h(
      View,
      { style: { backgroundColor: BANNER_COLOR, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 10, borderRadius: 3 } },
      h(Text, { style: { color: "#ffffff", fontSize: 16, fontWeight: 700 } }, bookTitle),
      h(Text, { style: { color: "#dbe9f7", fontSize: 10, marginTop: 2 } }, `${examLabel} · Class ${classLevel}${languageLabel ? ` · ${languageLabel}` : ""} · VedicNeev`)
    ),

    h(Text, { style: { fontSize: 12, fontWeight: 700, marginTop: 6 } }, "Exam pattern this book follows"),
    // No fontStyle: "italic" here — the registered Devanagari face (pdfFonts.mts)
    // only has Regular/Bold, no italic, and react-pdf hard-fails rendering
    // (rather than falling back) when a style requests a weight/style
    // combination that isn't registered for the active font family. Confirmed
    // live: this line crashed RMS/UPSS's Hindi book (both patternIsEstimated)
    // while JNVST/AISSEE's Hindi books (not estimated, line never rendered)
    // were unaffected. Color carries the same "caution" emphasis instead,
    // matching buildPdfStyles' own emphasis-falls-back-to-color convention.
    pattern.patternIsEstimated
      ? h(Text, { style: { fontSize: 8.5, color: "#a3781b", marginTop: 2, marginBottom: 4 } },
          "Best available estimate of the real pattern, not yet confirmed against an official notification — see this book's product notes.")
      : null,
    h(
      View,
      { style: { marginTop: 4, marginBottom: 10, border: "1pt solid #c3d4e3", borderRadius: 3 } },
      h(
        View,
        { style: { flexDirection: "row", backgroundColor: "#dbe9f7", paddingVertical: 4, paddingHorizontal: 6 } },
        h(Text, { style: { flex: 2, fontSize: 9, fontWeight: 700 } }, "Section"),
        h(Text, { style: { flex: 1, fontSize: 9, fontWeight: 700, textAlign: "center" } }, "Questions"),
        h(Text, { style: { flex: 1, fontSize: 9, fontWeight: 700, textAlign: "center" } }, "Marks/Q"),
        h(Text, { style: { flex: 1, fontSize: 9, fontWeight: 700, textAlign: "center" } }, "Total")
      ),
      ...pattern.sections.map((s, i) =>
        h(
          View,
          { key: s.section, style: { flexDirection: "row", paddingVertical: 3, paddingHorizontal: 6, backgroundColor: i % 2 === 0 ? "#ffffff" : "#f5f8fb" } },
          h(Text, { style: { flex: 2, fontSize: 9 } }, s.label),
          h(Text, { style: { flex: 1, fontSize: 9, textAlign: "center" } }, String(s.count)),
          h(Text, { style: { flex: 1, fontSize: 9, textAlign: "center" } }, String(s.marksEach)),
          h(Text, { style: { flex: 1, fontSize: 9, textAlign: "center" } }, String(s.count * s.marksEach))
        )
      ),
      h(
        View,
        { style: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 6, borderTop: "1pt solid #c3d4e3" } },
        h(Text, { style: { flex: 2, fontSize: 9, fontWeight: 700 } }, "Total"),
        h(Text, { style: { flex: 1, fontSize: 9, fontWeight: 700, textAlign: "center" } }, String(totalQuestions)),
        h(Text, { style: { flex: 1, fontSize: 9, textAlign: "center" } }, ""),
        h(Text, { style: { flex: 1, fontSize: 9, fontWeight: 700, textAlign: "center" } }, String(totalMarks))
      )
    ),
    h(
      View,
      { style: { flexDirection: "row", marginBottom: 14 } },
      h(Text, { style: { marginRight: 16, fontSize: 9, color: "#555555" } }, `Duration: ${pattern.durationMinutes} min`),
      h(Text, { style: { fontSize: 9, color: "#555555" } }, pattern.negativeMarking ? "Negative marking applies" : "No negative marking")
    ),

    h(
      View,
      { style: { display: "flex", flexDirection: "column", gap: 10 } },
      h(Text, { style: { fontSize: 12, fontWeight: 700 } }, "What's inside"),
      h(Text, { style: { fontSize: 10 } }, `${setCount} complete, exam-pattern practice papers — each one a full sitting, not a topic drill.`),
      h(Text, { style: { fontSize: 10 } }, "Every paper is immediately followed by its own OMR answer sheet, with a roll number already filled in for exam-day practice."),

      h(Text, { style: { fontSize: 12, fontWeight: 700, marginTop: 10 } }, "This book has no printed answer key — on purpose"),
      h(Text, { style: { fontSize: 10 } }, "Take a paper under real exam timing, fill the matching OMR sheet with a dark pen or pencil, then:"),
      h(Text, { style: { fontSize: 10, marginLeft: 12 } }, "1. Log in at vedicneev.com with the WhatsApp number you purchased with."),
      h(Text, { style: { fontSize: 10, marginLeft: 12 } }, "2. Select this book and the set number you just attempted."),
      h(Text, { style: { fontSize: 10, marginLeft: 12 } }, "3. Upload a clear, well-lit photo of your filled OMR sheet."),
      h(Text, { style: { fontSize: 10, marginLeft: 12 } }, "4. Get your score and a question-by-question breakdown in seconds — free for buyers of this book."),

      h(Text, { style: { fontSize: 10, marginTop: 10 } },
        "Want deeper practice beyond these sets — unlimited mock tests, the full Mistake Vault, and topic-wise retesting? " +
        "Subscribe to VedicNeev for Rs. 999/year after your first scan."),

      h(Text, { style: { fontSize: 9, marginTop: 14, color: "#666" } },
        "Photograph the sheet flat, in good light, with all 4 corner squares visible — that's what the scanner uses to read it correctly.")
    ),
    footer(examLabel, classLevel)
  );
}

/** The very last page of the book — one closing page about VedicNeev (mission + what's built so far + what's next), not repeated per paper, by explicit product decision. */
export function buildClosingPage(examLabel: string, classLevel: 6 | 9, styles: ReturnType<typeof buildPdfStyles>) {
  return h(
    Page,
    { size: "A4", style: styles.page },
    h(
      View,
      { style: { backgroundColor: BANNER_COLOR, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14, borderRadius: 3 } },
      h(Text, { style: { color: "#ffffff", fontSize: 16, fontWeight: 700 } }, "About VedicNeev")
    ),

    h(Text, { style: { fontSize: 11, fontWeight: 700, marginBottom: 4 } }, "Our mission"),
    h(Text, { style: { fontSize: 10, marginBottom: 14 } },
      "VedicNeev exists to make serious competitive-exam preparation — JNVST, RMS, AISSEE, UPSS, and beyond — " +
      "affordable and genuinely effective for every student, in English and in their own language, " +
      "whether they're preparing from a big city or a small town."),

    h(Text, { style: { fontSize: 11, fontWeight: 700, marginBottom: 4 } }, "What we've built so far"),
    h(Text, { style: { fontSize: 10, marginBottom: 2 } }, "• Complete handwritten-style notes, topic by topic, for every major exam board."),
    h(Text, { style: { fontSize: 10, marginBottom: 2 } }, "• A full verified question bank, organized by topic, for deep practice."),
    h(Text, { style: { fontSize: 10, marginBottom: 2 } }, "• This book — real exam-pattern sample papers with OMR scan-and-score."),
    h(Text, { style: { fontSize: 10, marginBottom: 14 } }, "• The Mistake Vault — tracks exactly where you lose marks, so you fix the real gaps, not just repeat practice."),

    h(Text, { style: { fontSize: 11, fontWeight: 700, marginBottom: 4 } }, "Coming soon"),
    h(Text, { style: { fontSize: 10, marginBottom: 2 } }, "• Live, timed mock tests with instant all-India comparison."),
    h(Text, { style: { fontSize: 10, marginBottom: 2 } }, "• More exam boards and more regional languages."),
    h(Text, { style: { fontSize: 10, marginBottom: 14 } }, "• Deeper Vedic Mind AI integration for faster mental math."),

    h(Text, { style: { fontSize: 10, marginTop: 6 } },
      "Scan the OMR sheet from any paper in this book to see your score — and from there, explore everything above."),

    h(
      View,
      { style: { marginTop: 20, alignItems: "center" } },
      h(Text, { style: { fontSize: 11, fontWeight: 700 } }, "www.vedicneev.com  ·  www.VedicMindAi.in"),
      h(Text, { style: { fontSize: 9, color: "#555555", marginTop: 2 } }, "Available on the Play Store")
    ),
    footer(examLabel, classLevel)
  );
}
