/**
 * Renders one printable OMR answer sheet as a react-pdf `<Page>`, driven by
 * `@vedicneev/engine`'s `OmrSheetSpec` — the exact same normalized bubble
 * geometry the scanning pipeline (detectFiducialCorners, sampleBubbleFillRatio)
 * already reads, so print and scan can never drift apart (see omr.ts's own
 * module comment on why).
 *
 * Deliberately simpler than the Institute Suite's sheets
 * (apps/omrtest/src/lib/omr/renderInstituteOmrPrintHtml.ts) in one respect:
 * no sheet-token digit grid and no pre-filled set bubble, since a logged-in
 * buyer picks their set from a dropdown rather than having it decoded from
 * the image. It DOES carry a roll number, pre-bubbled with a randomly
 * generated number per set — purely for exam-day realism (a student
 * practicing without ever filling a roll number grid is missing part of
 * what real exam day feels like), not read by the scanner for anything.
 *
 * Everything is drawn in ONE `<Svg>` (viewBox in real A4 point units, not a
 * normalized 0-1 box) rather than mixing normal-flow Text/View with an
 * absolutely-positioned overlay — a 595×842pt page is far from square, so a
 * naive "0 0 1 1" viewBox would stretch bubbles into ellipses and leaves no
 * ambiguity about stacking order between two different layout systems.
 */
import React from "react";
import { Circle, Page, Rect, Svg, Text as SvgText } from "@react-pdf/renderer";
import type { OmrSheetSpec } from "@vedicneev/engine";

import { footer } from "./mockPaperDocument.mjs";

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

/**
 * @react-pdf/renderer's SVGTextProps type (node_modules/@react-pdf/types/svg.d.ts)
 * doesn't declare `fontSize`/`fontWeight` at all, even though the renderer
 * demonstrably honors both at runtime (verified visually — see this
 * product's commit history) — a type-definition gap in the library itself,
 * not a real runtime restriction. This thin wrapper is the one place that
 * cast lives, instead of scattering `as any` through every call site below.
 */
function svgText(props: { key: string; x: number; y: number; fontSize: number; fontWeight?: number; textAnchor?: "start" | "middle" | "end" }, text: string) {
  return h(SvgText, props as unknown as React.ComponentProps<typeof SvgText>, text);
}

export interface OmrSheetMeta {
  examLabel: string;
  classLevel: 6 | 9;
  languageLabel: string;
  /** e.g. "Set 7 of 20" */
  setLabel: string;
  /** Pre-printed AND pre-bubbled on this sheet — see this module's header comment on why. */
  rollNumber: string;
}

const BUBBLE_RADIUS = 6.5;

/** Generates a random roll number of the given length, e.g. randomRollNumber(6) -> "482917". Leading zero is fine — it's a demo identifier, not a real allotment. */
export function randomRollNumber(digits: number): string {
  let s = "";
  for (let i = 0; i < digits; i++) s += Math.floor(Math.random() * 10).toString();
  return s;
}

/** Just the `<Page>` for one OMR sheet — composed alongside its paper's pages under one `<Document>` by generate-sample-paper-books.mts. */
export function buildOmrSheetPage(meta: OmrSheetMeta, spec: OmrSheetSpec) {
  const fiducialSize = 16;

  const children: React.ReactElement[] = [
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

    // Right column: exam identity (mirrors the roll-number column's left-side layout).
    svgText({ key: "title", x: px(0.73), y: py(0.075), textAnchor: "middle", fontSize: 13, fontWeight: 700 }, `${meta.examLabel} Class ${meta.classLevel}`),
    svgText({ key: "title2", x: px(0.73), y: py(0.09), textAnchor: "middle", fontSize: 11, fontWeight: 700 }, "OMR Answer Sheet"),
    svgText({ key: "subtitle", x: px(0.73), y: py(0.108), textAnchor: "middle", fontSize: 9 }, `${meta.setLabel} · ${meta.languageLabel} · VedicNeev`),
    svgText({ key: "name-label", x: px(0.52), y: py(0.13), fontSize: 8 }, "Name:"),
    h(Rect, { key: "name-line", x: px(0.57), y: py(0.124), width: px(0.37), height: 0.5, fill: "#555555" }),
    svgText({ key: "date-label", x: px(0.52), y: py(0.145), fontSize: 8 }, "Date:"),
    h(Rect, { key: "date-line", x: px(0.57), y: py(0.139), width: px(0.37), height: 0.5, fill: "#555555" }),

    // Instructions band, full width, below both header columns.
    svgText({ key: "instructions1", x: px(0.5), y: py(0.215), textAnchor: "middle", fontSize: 8 }, "Use a dark pen or pencil. Fill one bubble completely per question. Do not fold this sheet."),
    svgText({ key: "instructions2", x: px(0.5), y: py(0.228), textAnchor: "middle", fontSize: 8 }, "Scored only by scanning: log in at vedicneev.com, select this set, and upload a clear photo of this sheet."),
  ];

  // Left column: ROLL NUMBER label + printed digits, in ONE line squeezed into
  // the fiducial-margin band (y 0.02-0.06) — deliberately above, not
  // overlapping, generateOmrSheetSpec's own rollNumberGrid (which the engine
  // hardcodes to start at y=0.06 for its 10 value-rows per digit); printing
  // a label/box row inside that same 0.06-0.2 span visually collided with
  // the bubbles themselves (confirmed — see this fix's own commit).
  const rollDigits = meta.rollNumber.split("");
  const rollGridLeft = 0.06;
  children.push(
    svgText(
      { key: "rollno-label", x: px(rollGridLeft), y: py(0.045), fontSize: 9, fontWeight: 700 },
      `ROLL NUMBER:  ${rollDigits.join("  ")}`
    )
  );
  // The roll-number bubble grid itself, from the spec — pre-filled solid for the digit matching this sheet's roll number, outline for every other digit at that column.
  const rollNumberSet = new Set(rollDigits.map((d, i) => `${i}-${d}`));
  for (const entry of spec.rollNumberGrid) {
    const isFilled = rollNumberSet.has(`${entry.digitIndex}-${entry.value}`);
    children.push(
      h(Circle, {
        key: `rollgrid-${entry.digitIndex}-${entry.value}`,
        cx: px(entry.x),
        cy: py(entry.y),
        r: 4.5,
        fill: isFilled ? "#000000" : "none",
        stroke: "#000000",
        strokeWidth: 0.75,
      })
    );
  }

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
      svgText({
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
      svgText({
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
    h(Svg, { width: "100%", height: "100%", viewBox: `0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}` }, ...children),
    footer(meta.examLabel, meta.classLevel)
  );
}
