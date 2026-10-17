/**
 * react-pdf Document builders for the full-corpus Question Bank Booklet
 * product (per-topic PDFs + a compiled per-exam/class/language master
 * book) — built from the externally-authored, quality-fix-verified
 * topic-N.json corpus (see questionBookletSchema.ts in @vedicneev/engine
 * for that file's contract). Uses React.createElement directly rather
 * than JSX, matching generate-booklet-pdfs.mts's convention for a
 * script-only .mts/.ts file (no JSX pragma configured for this context).
 */
import React from "react";
import { Document, Link, Page, Text, View } from "@react-pdf/renderer";
import type { QuestionBookletQuestion } from "@vedicneev/engine";

import { buildPdfStyles, sanitizeForPdf } from "./pdfFonts.mjs";

const h = React.createElement;

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=in.vedicmindai.app";

/** Brand footer (site + app links) rendered on every page, including the cover, via `fixed`. */
function brandFooter(styles: ReturnType<typeof buildPdfStyles>) {
  return h(
    View,
    { style: styles.footerBrand, fixed: true },
    h(Text, null, "vedicneev.com  •  omrtest.vedicneev.com  •  vedicmindai.in  •  App: "),
    h(Link, { src: PLAY_STORE_URL, style: styles.footerBrandLink }, "VedicMindAi on Google Play")
  );
}

const DIFFICULTY_LABEL = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" } as const;

export interface BookletTopicSection {
  topicNumber: number;
  topicTitle: string;
  questions: QuestionBookletQuestion[];
}

function questionBlock(q: QuestionBookletQuestion, displayNumber: number, styles: ReturnType<typeof buildPdfStyles>) {
  return h(
    View,
    { key: displayNumber, style: styles.questionBlock, wrap: false },
    h(Text, { style: styles.questionStem }, `Q${displayNumber}. ${sanitizeForPdf(q.question)}`),
    q.difficulty ? h(Text, { style: styles.difficultyTag }, `[${DIFFICULTY_LABEL[q.difficulty]}]`) : null,
    ...(["A", "B", "C", "D"] as const).map((label) =>
      h(
        View,
        { key: label, style: styles.option },
        h(Text, { style: [styles.optionLabel, q.correctOption === label ? styles.optionCorrect : undefined] }, `${label}.`),
        h(
          Text,
          { style: q.correctOption === label ? styles.optionCorrect : undefined },
          `${sanitizeForPdf(q.options[label])}${q.correctOption === label ? "  (Correct)" : ""}`
        )
      )
    ),
    h(Text, { style: styles.explanation }, `Explanation: ${sanitizeForPdf(q.explanation)}`)
  );
}

/** One topic's own standalone PDF — the granular per-topic artifact (e.g. for future Mistake Vault remediation linking). */
export function buildTopicDocument(
  classLevel: 6 | 9,
  topic: BookletTopicSection,
  fontFamily: string,
  styles: ReturnType<typeof buildPdfStyles>
) {
  return h(
    Document,
    { title: `Class ${classLevel} — ${topic.topicTitle}` },
    h(
      Page,
      { size: "A4", style: styles.page },
      h(Text, { style: styles.title }, `Class ${classLevel} — Topic ${topic.topicNumber}: ${topic.topicTitle}`),
      h(Text, { style: styles.subtitle }, `${topic.questions.length} questions with full worked solutions.`),
      ...topic.questions.map((q, i) => questionBlock(q, i + 1, styles)),
      brandFooter(styles),
      h(Text, {
        style: styles.pageNumber,
        render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`,
        fixed: true,
      })
    )
  );
}

export interface CompiledBookMeta {
  examLabel: string;
  classLevel: 6 | 9;
  languageLabel: string;
  /** Set when this book is one volume of a larger split (see splitting logic in the packaging script) — appended to the title/filename. */
  volumeLabel?: string;
}

export interface CompiledBookTocOptions {
  /**
   * Called once per topic, during layout, with the page number that
   * topic's heading actually landed on within THIS volume's document
   * (page 1 = this volume's own cover page). react-pdf only exposes a
   * page number at the point in the document being laid out — there is
   * no built-in way to look ahead from the cover and ask "what page will
   * topic 37 start on?". Collect it here on a first, throwaway render
   * pass, then pass the result back in as `topicPageMap` on a second real
   * pass so the cover's table of contents can print real page numbers.
   */
  onTopicPage?: (topicNumber: number, pageNumber: number) => void;
  /** Topic number -> page number within this volume, from a prior pass's onTopicPage calls. When provided, the cover prints a real page-numbered table of contents instead of a plain topic list. */
  topicPageMap?: Map<number, number>;
}

/** The compiled master book for one (exam, class, language) — every syllabus-eligible topic's questions, in topic order, as one document. */
export function buildCompiledBookDocument(
  meta: CompiledBookMeta,
  topics: BookletTopicSection[],
  styles: ReturnType<typeof buildPdfStyles>,
  tocOptions: CompiledBookTocOptions = {}
) {
  const totalQuestions = topics.reduce((sum, t) => sum + t.questions.length, 0);
  const volumeSuffix = meta.volumeLabel ? ` — ${meta.volumeLabel}` : "";
  const title = `${meta.examLabel} Class ${meta.classLevel} Question Bank${meta.languageLabel ? ` (${meta.languageLabel})` : ""}${volumeSuffix}`;
  const { onTopicPage, topicPageMap } = tocOptions;

  return h(
    Document,
    { title },
    h(
      Page,
      { size: "A4", style: styles.page, bookmark: "Cover & Table of Contents" },
      h(Text, { style: styles.title }, title),
      h(
        Text,
        { style: styles.subtitle },
        "Verified practice questions covering the full exam syllabus, topic by topic, with complete worked solutions."
      ),
      h(
        View,
        { style: styles.metaRow },
        h(Text, { style: styles.metaItem }, `Topics: ${topics.length}`),
        h(Text, { style: styles.metaItem }, `Total Questions: ${totalQuestions}`)
      ),
      h(Text, { style: styles.coverTopicsLabel }, "Table of Contents:"),
      ...topics.map((t) =>
        h(
          View,
          { key: `toc-${t.topicNumber}`, style: styles.tocRow },
          h(Text, { style: styles.tocTopic }, `${t.topicNumber}. ${t.topicTitle}`),
          h(
            Text,
            { style: styles.tocPage },
            topicPageMap ? `Page ${topicPageMap.get(t.topicNumber) ?? "?"}` : ""
          )
        )
      ),
      ...topics.flatMap((topic) => [
        h(
          Text,
          {
            key: `heading-${topic.topicNumber}`,
            style: styles.sectionHeading,
            break: true,
            bookmark: `${topic.topicNumber}. ${topic.topicTitle}`,
            render: ({ pageNumber }: { pageNumber: number }) => {
              onTopicPage?.(topic.topicNumber, pageNumber);
              return `Topic ${topic.topicNumber}: ${topic.topicTitle} (${topic.questions.length} questions)`;
            },
          }
        ),
        ...topic.questions.map((q, i) => questionBlock(q, i + 1, styles)),
      ]),
      brandFooter(styles),
      h(Text, {
        style: styles.pageNumber,
        render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`,
        fixed: true,
      })
    )
  );
}

/**
 * Splits a compiled book's topic list into N roughly equal-question-count
 * volumes, never cutting a topic's own questions across two volumes (same
 * "topic-boundary-safe" rule upload-split-study-notes.mts documents for the
 * study-notes product's split books). The packaging script decides how
 * many volumes are needed from the rendered byte size of the whole book;
 * this just does the grouping once that count is known.
 */
export function splitTopicsIntoVolumes(topics: BookletTopicSection[], volumeCount: number): BookletTopicSection[][] {
  if (volumeCount <= 1) return [topics];
  const totalQuestions = topics.reduce((sum, t) => sum + t.questions.length, 0);
  const targetPerVolume = totalQuestions / volumeCount;

  const volumes: BookletTopicSection[][] = [];
  let current: BookletTopicSection[] = [];
  let currentCount = 0;
  for (const topic of topics) {
    current.push(topic);
    currentCount += topic.questions.length;
    if (currentCount >= targetPerVolume && volumes.length < volumeCount - 1) {
      volumes.push(current);
      current = [];
      currentCount = 0;
    }
  }
  if (current.length > 0) volumes.push(current);
  return volumes;
}
