/**
 * Renders one printable OMR answer sheet as a react-pdf `<Page>`, driven by
 * `@vedicneev/engine`'s `OmrSheetSpec` — the exact same normalized bubble
 * geometry the scanning pipeline (detectFiducialCorners, sampleBubbleFillRatio)
 * already reads, so print and scan can never drift apart (see omr.ts's own
 * module comment on why).
 *
 * Deliberately simpler than the Institute Suite's sheets
 * (apps/omrtest/src/lib/omr/renderInstituteOmrPrintHtml.ts): no roll-number
 * grid, no sheet-token digit grid, no pre-filled set bubble. This sheet is
 * bound into a retail "20 Sample Papers" book, not issued by a teacher to a
 * known roster — a logged-in buyer just tells the app which set they're
 * uploading via a dropdown, so there's nothing here that needs decoding
 * beyond the 4 fiducial corners and the answer bubbles themselves. Build
 * the spec with `generateOmrSheetSpec({ examType, totalQuestions,
 * rollNumberDigits: 0 })` — omitting sheetTokenDigits/setCount already
 * defaults them to 0 (see GenerateOmrSheetSpecParams).
 *
 * Everything is drawn in ONE `<Svg>` (viewBox in real A4 point units, not a
 * normalized 0-1 box) rather than mixing normal-flow Text/View with an
 * absolutely-positioned overlay — a 595×842pt page is far from square, so a
 * naive "0 0 1 1" viewBox would stretch bubbles into ellipses and leaves no
 * ambiguity about stacking order between two different layout systems.
 */
import React from "react";
import { Circle, Document, Line, Page, Rect, Svg, Text as SvgText } from "@react-pdf/renderer";
import type { OmrSheetSpec } from "@vedicneev/engine";

const h = React.createElement;

// A4 at 72pt/inch — matches react-pdf's own `size: "A4"` page dimensions.
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

function px(x: number): number {
  return x * PAGE_WIDTH;
}
function py(y: number): number {
  return y * PAGE_HEIGHT;
}

export interface OmrSheetMeta {
  examLabel: string;
  classLevel: 6 | 9;
  languageLabel: string;
  /** e.g. "Set 7 of 20" */
  setLabel: string;
}

const BUBBLE_RADIUS = 6.5;

/** Just the `<Page>` for one OMR sheet — composed alongside its paper's pages under one `<Document>` by generate-sample-paper-books.mts. */
export function buildOmrSheetPage(meta: OmrSheetMeta, spec: OmrSheetSpec) {
  const fiducialSize = 16;

  const children = [
    // Outer frame, inset to the fiducials' own margin, purely visual.
    h(Rect, {
      key: "frame",
      x: px(0.02),
      y: py(0.02),
      width: px(0.96),
      height: py(0.96),
      fill: "none",
      stroke: "#1f3a93",
      strokeWidth: 1,
    }),

    // Header text.
    h(SvgText, { key: "title", x: px(0.5), y: py(0.055), textAnchor: "middle", fontSize: 15, fontWeight: 700 },
      `${meta.examLabel} Class ${meta.classLevel} — OMR Answer Sheet`),
    h(SvgText, { key: "subtitle", x: px(0.5), y: py(0.075), textAnchor: "middle", fontSize: 10 },
      `${meta.setLabel} · ${meta.languageLabel} · VedicNeev`),
    h(SvgText, { key: "instructions1", x: px(0.5), y: py(0.1), textAnchor: "middle", fontSize: 8.5 },
      "Use a dark pen or pencil. Fill one bubble completely per question. Do not fold this sheet."),
    h(SvgText, { key: "instructions2", x: px(0.5), y: py(0.115), textAnchor: "middle", fontSize: 8.5 },
      "Scored only by scanning: log in at vedicneev.com, select this set, and upload a clear photo of this sheet."),

    // Name / Date lines — for the student's own reference only, not read by the scanner.
    h(Line, { key: "name-line", x1: px(0.08), y1: py(0.16), x2: px(0.5), y2: py(0.16), stroke: "#555", strokeWidth: 0.75 }),
    h(SvgText, { key: "name-label", x: px(0.08), y: py(0.175), fontSize: 8 }, "Name"),
    h(Line, { key: "date-line", x1: px(0.58), y1: py(0.16), x2: px(0.92), y2: py(0.16), stroke: "#555", strokeWidth: 0.75 }),
    h(SvgText, { key: "date-label", x: px(0.58), y: py(0.175), fontSize: 8 }, "Date"),
  ];

  // Fiducial corner markers — must stay solid filled squares; the scanner's
  // detectFiducialCorners looks for the darkest small blob in each quadrant.
  for (const f of spec.fiducials) {
    children.push(
      h(Rect, {
        key: `fiducial-${f.id}`,
        x: px(f.x) - fiducialSize / 2,
        y: py(f.y) - fiducialSize / 2,
        width: fiducialSize,
        height: fiducialSize,
        fill: "#000000",
      })
    );
  }

  // One Q<n> label per question, placed just left of its first (A) bubble.
  const firstBubbleByQuestion = new Map<number, (typeof spec.bubbles)[number]>();
  for (const b of spec.bubbles) {
    if (b.option === "A") firstBubbleByQuestion.set(b.questionNumber, b);
  }
  for (const [qNum, bubble] of firstBubbleByQuestion) {
    children.push(
      h(SvgText, {
        key: `qlabel-${qNum}`,
        x: px(bubble.x) - 14,
        y: py(bubble.y) + 3,
        fontSize: 8,
        textAnchor: "end",
        fontWeight: 700,
      }, `${qNum}.`)
    );
  }

  // The answer bubbles themselves.
  for (const b of spec.bubbles) {
    children.push(
      h(Circle, {
        key: `bubble-${b.questionNumber}-${b.option}`,
        cx: px(b.x),
        cy: py(b.y),
        r: BUBBLE_RADIUS,
        fill: "none",
        stroke: "#000000",
        strokeWidth: 1,
      }),
      h(SvgText, {
        key: `bubble-label-${b.questionNumber}-${b.option}`,
        x: px(b.x),
        y: py(b.y) + 2.5,
        fontSize: 6.5,
        textAnchor: "middle",
      }, b.option)
    );
  }

  return h(
    Page,
    { size: "A4", style: { padding: 0 } },
    h(Svg, { width: "100%", height: "100%", viewBox: `0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}` }, ...children)
  );
}

/** Standalone single-sheet PDF document, for ad-hoc preview/testing. */
export function buildOmrSheetDocument(meta: OmrSheetMeta, spec: OmrSheetSpec) {
  return h(Document, { title: `${meta.examLabel} Class ${meta.classLevel} — OMR Sheet — ${meta.setLabel}` }, buildOmrSheetPage(meta, spec));
}
