/**
 * Generates 3 full-length sample papers per exam template (JNVST/AISSEE/RMS
 * × Class 6/9, 18 papers total) via the same assembly path a real
 * student's live mock takes (generateLiveMockSession), THEN registers each
 * one as a real, scannable OfflineMockSession (registerOfflineMockSession)
 * and renders a matching printable OMR bubble sheet — so every question
 * paper PDF and its OMR sheet PDF share one serial code, and the serial
 * code is what /api/omr/grade actually uses to look up the frozen answer
 * key when a filled sheet is later scanned.
 *
 * Each paper is an independent random draw (matches how a live mock varies
 * attempt to attempt), and each gets its OWN serial code — these are 18
 * genuinely distinct registered sets, not 3 reused papers.
 *
 * Outputs to <scratchpad>/sample-papers/ (NOT apps/web/public — these
 * include full answer keys and shouldn't ship to the live site):
 *   <slug>-paper-<n>-question-paper.pdf
 *   <slug>-paper-<n>-omr-sheet.pdf
 *
 * Run with: npx tsx apps/web/scripts/generate-sample-papers.mts [outDir]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { BubbleOption, OmrSheetSpec } from "@vedicneev/engine";
// Named ESM exports from @vedicneev/engine don't statically resolve under
// this file's strict ESM (.mts) mode — cjs-module-lexer can't see through
// its chained `export * from "./foo"` re-exports, so Node falls back to
// putting everything under the default export instead. Runtime-only
// workaround; the `import type` above keeps full type safety.
import engineRuntime from "@vedicneev/engine";
const { generateOmrSheetSpec } = engineRuntime as unknown as typeof import("@vedicneev/engine");

import { generateLiveMockSession, LIVE_MOCK_TEMPLATE_SLUGS } from "../src/lib/exam/jnvstMockService";
import { registerOfflineMockSession } from "../src/lib/exam/offlineOmrService";
import { localize } from "../src/lib/exam/localize";
import type { ExamSessionData, ExamType } from "../src/lib/exam/types";

const h = React.createElement;
const PAPERS_PER_TEMPLATE = 3;

const SLUG_EXAM_TYPE: Record<string, ExamType> = {
  "jnvst-class-6": "JNVST",
  "jnvst-class-9": "JNVST",
  "aissee-class-6": "AISSEE",
  "aissee-class-9": "AISSEE",
  "rms-class-6": "RMS",
  "rms-class-9": "RMS",
};
const SLUG_CLASS_LEVEL: Record<string, number> = {
  "jnvst-class-6": 6,
  "jnvst-class-9": 9,
  "aissee-class-6": 6,
  "aissee-class-9": 9,
  "rms-class-6": 6,
  "rms-class-9": 9,
};

function en(json: unknown, fallback: string): string {
  if (json && typeof json === "object" && "en" in (json as Record<string, unknown>)) {
    const v = (json as Record<string, unknown>).en;
    if (typeof v === "string" && v.length > 0) return v;
  }
  return fallback;
}

// ── Question paper PDF (unchanged style from the earlier booklet/paper generators) ──

const paperStyles = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#555555", marginBottom: 10 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  metaItem: { marginRight: 16, marginBottom: 2, color: "#555555" },
  serialBanner: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#92400e",
    backgroundColor: "#fffbeb",
    padding: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderStyle: "solid",
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
    borderBottomStyle: "solid",
  },
  questionBlock: { marginBottom: 10 },
  questionStem: { fontFamily: "Helvetica-Bold", marginBottom: 4 },
  difficultyTag: { fontSize: 8, color: "#92400e" },
  option: { flexDirection: "row", marginBottom: 2, paddingLeft: 10 },
  optionCorrect: { color: "#065f46", fontFamily: "Helvetica-Bold" },
  optionLabel: { width: 16 },
  explanation: { marginTop: 4, marginLeft: 10, fontSize: 9, color: "#444444", fontFamily: "Helvetica-Oblique" },
  figureNote: { marginTop: 4, marginLeft: 10, fontSize: 8, color: "#92400e" },
  pageNumber: { position: "absolute", bottom: 20, left: 0, right: 40, textAlign: "right", fontSize: 8, color: "#888888" },
});

function buildPaperDocument(templateName: string, paperNumber: number, serialCode: string, session: ExamSessionData) {
  const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

  return h(
    Document,
    { title: `${templateName} — Sample Paper ${paperNumber} (${serialCode})` },
    h(
      Page,
      { size: "A4", style: paperStyles.page },
      h(Text, { style: paperStyles.title }, `${templateName} — Sample Paper ${paperNumber}`),
      h(Text, { style: paperStyles.subtitle }, "Full-length sample paper with answer key, drawn from the live question bank."),
      h(
        Text,
        { style: paperStyles.serialBanner },
        `OMR Set Serial: ${serialCode} — use the matching "${serialCode}-omr-sheet.pdf" to bubble and scan this exact paper.`
      ),
      h(
        View,
        { style: paperStyles.metaRow },
        h(Text, { style: paperStyles.metaItem }, `Total Marks: ${Object.keys(session.questionsById).length}`),
        h(Text, { style: paperStyles.metaItem }, `Duration: ${Math.round(session.totalDurationSeconds / 60)} min`),
        h(Text, { style: paperStyles.metaItem }, `Negative Marking: ${session.negativeMarkingRatio}`)
      ),
      ...session.sections.map((section) =>
        h(
          View,
          { key: section.key },
          h(Text, { style: paperStyles.sectionHeading }, `${localize(section.name, "en")} (${section.questionIds.length} questions)`),
          ...section.questionIds.map((qid, i) => {
            const q = session.questionsById[qid]!;
            const hasFigure = Boolean(q.figureMetadata?.markup || q.figureMetadata?.url);
            return h(
              View,
              { key: qid, style: paperStyles.questionBlock, wrap: false },
              h(Text, { style: paperStyles.questionStem }, `Q${i + 1}. ${en(q.content, "(see figure)")}`),
              h(Text, { style: paperStyles.difficultyTag }, q.difficulty),
              hasFigure
                ? h(Text, { style: paperStyles.figureNote }, "[Figure omitted in this text sample — view online for the diagram.]")
                : null,
              ...q.options.map((o, oi) =>
                h(
                  View,
                  { key: o.id, style: paperStyles.option },
                  h(
                    Text,
                    { style: [paperStyles.optionLabel, o.id === q.correctOption ? paperStyles.optionCorrect : undefined] },
                    `${OPTION_LABELS[oi] ?? oi}.`
                  ),
                  h(
                    Text,
                    { style: o.id === q.correctOption ? paperStyles.optionCorrect : undefined },
                    `${en(o.text, o.imageUrl ? "(figure option)" : "")}${o.id === q.correctOption ? "  (Correct)" : ""}`
                  )
                )
              ),
              q.explanation ? h(Text, { style: paperStyles.explanation }, `Explanation: ${en(q.explanation, "")}`) : null
            );
          })
        )
      ),
      h(Text, {
        style: paperStyles.pageNumber,
        render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`,
        fixed: true,
      })
    )
  );
}

// ── OMR sheet PDF — mirrors renderOmrPrintHtml.ts's layout (same normalized spec, same visual structure), just drawn directly as a PDF instead of print-from-HTML. ──

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const MM_TO_PT = 2.8346;

const omrStyles = StyleSheet.create({
  page: { padding: 0 },
  sheet: { position: "relative", width: A4_WIDTH_PT, height: A4_HEIGHT_PT },
  fiducial: { position: "absolute", width: 10 * MM_TO_PT, height: 10 * MM_TO_PT, backgroundColor: "#000000" },
  serial: { position: "absolute", left: "5%", top: "1%", fontSize: 11, fontFamily: "Helvetica-Bold" },
  header: {
    position: "absolute",
    left: "5%",
    top: "2.5%",
    width: "90%",
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  metaBox: { position: "absolute", left: "54%", top: "6%", width: "40%", fontSize: 8 },
  metaLine: { marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#000000", borderBottomStyle: "solid", paddingBottom: 2 },
  rollLabel: { position: "absolute", left: "6%", top: "5%", fontSize: 8, fontFamily: "Helvetica-Bold" },
  rollBubble: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 0.75,
    borderColor: "#000000",
    borderStyle: "solid",
    alignItems: "center",
    justifyContent: "center",
  },
  rollBubbleText: { fontSize: 5 },
  qLabel: { position: "absolute", fontSize: 7, fontFamily: "Helvetica-Bold" },
  bubble: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 0.75,
    borderColor: "#000000",
    borderStyle: "solid",
    alignItems: "center",
    justifyContent: "center",
    transform: "translate(-4.5pt, -4.5pt)",
  },
  bubbleText: { fontSize: 5 },
});

function buildOmrSheetDocument(spec: OmrSheetSpec, serialCode: string, examLabel: string, classLevel: number) {
  const bubblesByQuestion = new Map<number, typeof spec.bubbles>();
  for (const bubble of spec.bubbles) {
    const list = bubblesByQuestion.get(bubble.questionNumber) ?? [];
    list.push(bubble);
    bubblesByQuestion.set(bubble.questionNumber, list);
  }

  const rollByDigit = new Map<number, typeof spec.rollNumberGrid>();
  for (const cell of spec.rollNumberGrid) {
    const list = rollByDigit.get(cell.digitIndex) ?? [];
    list.push(cell);
    rollByDigit.set(cell.digitIndex, list);
  }

  return h(
    Document,
    { title: `${examLabel} OMR Sheet — ${serialCode}` },
    h(
      Page,
      { size: "A4", style: omrStyles.page },
      h(
        View,
        { style: omrStyles.sheet },
        ...spec.fiducials.map((f) =>
          h(View, {
            key: f.id,
            style: [omrStyles.fiducial, { left: `${f.x * 100}%`, top: `${f.y * 100}%`, transform: "translate(-50%, -50%)" }],
          })
        ),
        h(Text, { style: omrStyles.serial }, `Serial: ${serialCode}`),
        h(Text, { style: omrStyles.header }, `${examLabel} — Class ${classLevel} — OMR Answer Sheet`),
        h(
          View,
          { style: omrStyles.metaBox },
          h(Text, { style: omrStyles.metaLine }, "Roll Number: ____________________"),
          h(Text, { style: omrStyles.metaLine }, "Candidate Name: ____________________"),
          h(Text, {}, `Set Serial: ${serialCode}`)
        ),
        h(Text, { style: omrStyles.rollLabel }, "Roll Number (bubble each digit)"),
        ...Array.from(rollByDigit.entries()).flatMap(([, cells]) =>
          cells.map((cell) =>
            h(
              View,
              {
                key: `roll-${cell.digitIndex}-${cell.value}`,
                style: [omrStyles.rollBubble, { left: `${cell.x * 100}%`, top: `${cell.y * 100}%`, transform: "translate(-50%, -50%)" }],
              },
              h(Text, { style: omrStyles.rollBubbleText }, String(cell.value))
            )
          )
        ),
        ...Array.from(bubblesByQuestion.entries()).flatMap(([questionNumber, bubbles]) => {
          const optionA = bubbles.find((b) => b.option === "A")!;
          return [
            h(
              Text,
              {
                key: `qlabel-${questionNumber}`,
                style: [omrStyles.qLabel, { left: `${(optionA.x - 0.055) * 100}%`, top: `${optionA.y * 100 - 1}%` }],
              },
              String(questionNumber)
            ),
            ...bubbles.map((b) =>
              h(
                View,
                {
                  key: `bubble-${questionNumber}-${b.option}`,
                  style: [omrStyles.bubble, { left: `${b.x * 100}%`, top: `${b.y * 100}%` }],
                },
                h(Text, { style: omrStyles.bubbleText }, b.option)
              )
            ),
          ];
        })
      )
    )
  );
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const outDir = process.argv[2] ?? path.join(__dirname, "..", "..", "..", "sample-papers-output");
  fs.mkdirSync(outDir, { recursive: true });

  for (const slug of LIVE_MOCK_TEMPLATE_SLUGS) {
    const examType = SLUG_EXAM_TYPE[slug]!;
    const classLevel = SLUG_CLASS_LEVEL[slug]!;

    for (let paperNumber = 1; paperNumber <= PAPERS_PER_TEMPLATE; paperNumber++) {
      const result = await generateLiveMockSession(slug);
      if ("error" in result) {
        console.warn(`${slug} paper ${paperNumber}: ${result.error} — skipping.`);
        continue;
      }
      const { session, warnings } = result;
      if (warnings.length > 0) console.warn(`${slug} paper ${paperNumber} warnings: ${warnings.join(" | ")}`);

      // Flatten questionIds across sections in print order — this becomes
      // the OfflineMockSession's frozen question order, matching exactly
      // how the question paper PDF below numbers Q1..Qn across sections.
      const orderedQuestionIds = session.sections.flatMap((s) => s.questionIds);
      const answerKey: Record<string, BubbleOption> = {};
      orderedQuestionIds.forEach((qid, index) => {
        const q = session.questionsById[qid]!;
        const upper = q.correctOption.toUpperCase();
        answerKey[String(index + 1)] = (["A", "B", "C", "D"].includes(upper) ? upper : "A") as BubbleOption;
      });

      const registered = await registerOfflineMockSession({
        examType,
        classLevel,
        questionIds: orderedQuestionIds,
        answerKey,
      });
      if ("error" in registered) {
        console.warn(`${slug} paper ${paperNumber}: failed to register OMR session — ${registered.error}`);
        continue;
      }
      const serialCode = registered.session.serialCode;

      const templateName = localize(session.templateName, "en");
      const paperBuffer = await renderToBuffer(buildPaperDocument(templateName, paperNumber, serialCode, session));
      const paperFilename = `${slug}-paper-${paperNumber}-question-paper.pdf`;
      fs.writeFileSync(path.join(outDir, paperFilename), paperBuffer);

      const omrSpec = generateOmrSheetSpec({
        examType: examType === "DPS" ? "OTHER" : examType,
        totalQuestions: orderedQuestionIds.length,
      });
      const omrBuffer = await renderToBuffer(buildOmrSheetDocument(omrSpec, serialCode, templateName, classLevel));
      const omrFilename = `${slug}-paper-${paperNumber}-omr-sheet.pdf`;
      fs.writeFileSync(path.join(outDir, omrFilename), omrBuffer);

      console.log(`${slug} paper ${paperNumber}: serial=${serialCode} questions=${orderedQuestionIds.length} -> ${paperFilename}, ${omrFilename}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
