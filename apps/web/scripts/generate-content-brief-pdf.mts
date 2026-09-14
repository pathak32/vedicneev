/**
 * Renders the Question Bank Brief (the artifact published for handing to
 * Gemini) as a standalone PDF, since the artifact itself isn't a
 * downloadable file — this is a plain-content mirror of the same brief:
 * ground rules, the universal item JSON schema, per-exam/class quotas,
 * and delivery steps.
 *
 * Run with: npx tsx apps/web/scripts/generate-content-brief-pdf.mts [outDir]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

const h = React.createElement;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 48, paddingHorizontal: 44, fontSize: 10.5, fontFamily: "Helvetica", color: "#1a1f27" },
  eyebrow: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#b5540a", letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  lede: { fontSize: 11, color: "#454c58", marginBottom: 10, lineHeight: 1.4 },
  metaRow: { flexDirection: "row", gap: 16, marginBottom: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#dde1e6", borderBottomStyle: "solid" },
  metaItem: { fontSize: 9, color: "#6b7280" },
  h2: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 6, marginTop: 4 },
  intro: { fontSize: 10, color: "#454c58", marginBottom: 10, lineHeight: 1.4 },
  ruleRow: { flexDirection: "row", gap: 10, marginBottom: 7, padding: 8, borderWidth: 1, borderColor: "#dde1e6", borderStyle: "solid", borderRadius: 3 },
  ruleTagDo: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#157f3c", backgroundColor: "#e4f5ea", width: 42, textAlign: "center", paddingVertical: 3, borderRadius: 3 },
  ruleTagDont: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#b3261e", backgroundColor: "#fbe9e7", width: 42, textAlign: "center", paddingVertical: 3, borderRadius: 3 },
  ruleText: { fontSize: 9.5, color: "#454c58", flex: 1, lineHeight: 1.4 },
  ruleBold: { fontFamily: "Helvetica-Bold", color: "#1a1f27" },
  codeBlock: { backgroundColor: "#eef0f3", padding: 12, borderRadius: 4, marginBottom: 8 },
  codeLine: { fontFamily: "Courier", fontSize: 8.5, color: "#1a1f27", lineHeight: 1.5 },
  codeKey: { fontFamily: "Courier", fontSize: 8.5, color: "#b5540a" },
  note: { fontSize: 8.5, color: "#6b7280", marginBottom: 4 },
  table: { marginBottom: 4 },
  tHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#1a1f27", borderBottomStyle: "solid", paddingBottom: 4, marginBottom: 2 },
  tHeadCell: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6b7280", letterSpacing: 0.5 },
  examHead: { backgroundColor: "#fbe8d4", flexDirection: "row", padding: 4, marginTop: 6 },
  examHeadText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1a1f27" },
  sharedNote: { fontSize: 8, fontFamily: "Helvetica-Oblique", color: "#b5540a" },
  tRow: { flexDirection: "row", paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: "#dde1e6", borderBottomStyle: "solid" },
  tCellKey: { fontSize: 9, fontFamily: "Courier", width: 170 },
  tCellNum: { fontSize: 9, width: 90, textAlign: "right" },
  step: { flexDirection: "row", gap: 10, marginBottom: 8, alignItems: "flex-start" },
  stepNum: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#b5540a", width: 16 },
  stepText: { fontSize: 9.5, color: "#454c58", flex: 1, lineHeight: 1.4 },
  footer: { position: "absolute", bottom: 24, left: 44, right: 44, fontSize: 8, color: "#8a929e", borderTopWidth: 0.5, borderTopColor: "#dde1e6", borderTopStyle: "solid", paddingTop: 8 },
});

function ruleRow(tag: "DO" | "DONT", boldLead: string, rest: string) {
  return h(
    View,
    { style: styles.ruleRow, wrap: false },
    h(Text, { style: tag === "DO" ? styles.ruleTagDo : styles.ruleTagDont }, tag === "DO" ? "DO" : "DON'T"),
    h(Text, { style: styles.ruleText }, h(Text, { style: styles.ruleBold }, boldLead), rest)
  );
}

function examHeadRow(label: string, note?: string) {
  return h(
    View,
    { style: styles.examHead, wrap: false },
    h(Text, { style: styles.examHeadText }, label),
    note ? h(Text, { style: [styles.sharedNote, { marginLeft: 6 }] }, note) : null
  );
}

function tRow(key: string, quota: string, target: string) {
  return h(
    View,
    { style: styles.tRow },
    h(Text, { style: styles.tCellKey }, key),
    h(Text, { style: styles.tCellNum }, quota),
    h(Text, { style: styles.tCellNum }, target)
  );
}

function step(n: number, text: string) {
  return h(View, { style: styles.step, wrap: false }, h(Text, { style: styles.stepNum }, `${n}.`), h(Text, { style: styles.stepText }, text));
}

const doc = h(
  Document,
  { title: "Question Bank Brief" },
  h(
    Page,
    { size: "A4", style: styles.page },

    h(Text, { style: styles.eyebrow }, "VEDIC NEEV — CONTENT AUTHORING"),
    h(Text, { style: styles.title }, "Question Bank Brief"),
    h(
      Text,
      { style: styles.lede },
      "Hand this whole document to Gemini as-is. It defines the exact item shape, the quotas each exam/class needs, and the rules that keep new content from repeating what's already failed review once before. Everything comes back to us as unverified drafts — nothing reaches a student until it's checked."
    ),
    h(
      View,
      { style: styles.metaRow },
      h(Text, { style: styles.metaItem }, "Boards: JNVST · AISSEE · RMS"),
      h(Text, { style: styles.metaItem }, "Classes: 6 · 9"),
      h(Text, { style: styles.metaItem }, "Output: JSON only")
    ),

    h(Text, { style: styles.h2 }, "01 — Ground rules"),
    h(Text, { style: styles.intro }, "Every failure we've actually hit in this bank so far traces back to one of these. Follow them exactly."),
    ruleRow(
      "DO",
      "Vary the real content on every single item, ",
      "even within a repeatable question type. A “choose the correctly spelled word” item must use a different target word and different misspellings each time — five items in our existing bank reused the exact same four words and had to be deleted."
    ),
    ruleRow(
      "DO",
      "Write fully original items ",
      "in the authentic style, syllabus, and difficulty of the named exam board — not a transcription of any real past paper, verbatim or paraphrased."
    ),
    ruleRow("DO", "Make every wrong option a plausible distractor ", "— a real mistake a student might make, never an obviously silly filler."),
    ruleRow("DO", "Hold the 40 / 30 / 30 easy / medium / hard split ", "within each section, not just across the paper."),
    ruleRow(
      "DONT",
      "No figures, diagrams, or images. ",
      "Text-only items only — a diagram's correctness can't be reliably checked on our end, so non-verbal-reasoning items are out of scope for this batch."
    ),
    ruleRow("DONT", "No invented GK or current-affairs facts ", "you're not fully confident are true. Skip an uncertain fact rather than guess at one."),
    ruleRow(
      "DONT",
      "No prose, no Markdown, no PDF. ",
      "One JSON array, exactly matching the shape below — anything else has to be re-typed by hand on our end."
    ),

    h(Text, { style: [styles.h2, { marginTop: 14 }] }, "02 — Item shape"),
    h(Text, { style: styles.intro }, "One object per question. Every batch is a JSON array of these — nothing wrapping it, no trailing commentary."),
    h(
      View,
      { style: styles.codeBlock },
      h(Text, { style: styles.codeLine }, [
        h(Text, { style: styles.codeKey, key: "k1" }, "exam"),
        ": \"JNVST\" | \"AISSEE\" | \"RMS\"\n",
        h(Text, { style: styles.codeKey, key: "k2" }, "classLevel"),
        ": 6 | 9\n",
        h(Text, { style: styles.codeKey, key: "k3" }, "sectionKey"),
        ": \"mental_ability\" | \"arithmetic\" | \"language\"\n           | \"mathematics\" | \"science\" | \"social_science\" | \"general_knowledge\"\n",
        h(Text, { style: styles.codeKey, key: "k4" }, "topicHint"),
        ": short free text, e.g. \"Profit and Loss\", \"Analogies\"\n",
        h(Text, { style: styles.codeKey, key: "k5" }, "difficulty"),
        ": \"EASY\" | \"MEDIUM\" | \"HARD\"\n",
        h(Text, { style: styles.codeKey, key: "k6" }, "stem"),
        ": { \"en\": \"...\", \"hi\": \"...\" }\n",
        h(Text, { style: styles.codeKey, key: "k7" }, "options"),
        ": [\n  { \"en\": \"...\", \"hi\": \"...\" },   // exactly 4 — index 0\n  { \"en\": \"...\", \"hi\": \"...\" },   //              index 1\n  { \"en\": \"...\", \"hi\": \"...\" },   //              index 2\n  { \"en\": \"...\", \"hi\": \"...\" }    //              index 3\n]\n",
        h(Text, { style: styles.codeKey, key: "k8" }, "correctOptionIndex"),
        ": 0   // 0-based index into options above\n",
        h(Text, { style: styles.codeKey, key: "k9" }, "explanation"),
        ": { \"en\": \"...\", \"hi\": \"...\" }",
      ])
    ),
    h(Text, { style: styles.note }, "● Every text field needs both en and hi — a missing Hindi translation is treated the same as a missing field."),
    h(Text, { style: styles.note }, "● sectionKey must come from the exact list above, matching the table below for the board/class you're writing."),

    h(Text, { style: [styles.h2, { marginTop: 14 }] }, "03 — Quotas per board and class"),
    h(
      Text,
      { style: styles.intro },
      "One full mock paper needs the Quota column exactly, per section. The Target-for-3-papers column is what to aim for in one batch — write fewer if that's a more manageable session, just say which sections you covered."
    ),
    h(
      View,
      { style: styles.table },
      h(
        View,
        { style: styles.tHead },
        h(Text, { style: [styles.tHeadCell, styles.tCellKey] }, "SECTION KEY"),
        h(Text, { style: [styles.tHeadCell, styles.tCellNum] }, "QUOTA / PAPER"),
        h(Text, { style: [styles.tHeadCell, styles.tCellNum] }, "TARGET (3 PAPERS)")
      ),

      examHeadRow("JNVST — Class 6 · 80 questions / paper"),
      tRow("mental_ability", "40", "120"),
      tRow("arithmetic", "20", "60"),
      tRow("language", "20", "60"),

      examHeadRow("JNVST — Class 9 · 100 questions / paper"),
      tRow("mathematics", "35", "105"),
      tRow("science", "35", "105"),
      tRow("social_science", "30", "90"),

      examHeadRow("AISSEE — Class 6 · 125 questions / paper", "(pool shared with RMS Class 6 — write it once)"),
      tRow("arithmetic", "50", "150"),
      tRow("mental_ability", "25", "75"),
      tRow("language", "25", "75"),
      tRow("general_knowledge", "25", "75"),

      examHeadRow("RMS — Class 6", "(same pool as AISSEE Class 6 above — no separate batch needed)"),

      examHeadRow("AISSEE — Class 9 · 125 questions / paper"),
      tRow("mathematics", "50", "150"),
      tRow("mental_ability", "25", "75"),
      tRow("science", "25", "75"),
      tRow("general_knowledge", "25", "75"),

      examHeadRow("RMS — Class 9 · 125 questions / paper", "(separate pool from AISSEE 9 — write its own batch)"),
      tRow("mathematics", "50", "150"),
      tRow("mental_ability", "25", "75"),
      tRow("science", "25", "75"),
      tRow("general_knowledge", "25", "75")
    ),

    h(Text, { style: [styles.h2, { marginTop: 14 }] }, "04 — Delivery"),
    step(1, "Run one batch at a time — one board, one class. Give Gemini this whole brief plus which row(s) from §03 you want covered."),
    step(2, "Save its output as one .json file per batch, named <exam>-class-<level>-batch-<n>.json — e.g. jnvst-class-6-batch-1.json."),
    step(3, "Upload the file to Claude. It will validate the shape, check every item against the existing bank for accidental duplicates, and load it in as an unverified draft."),
    step(4, "You (or your team) spot-check a sample before anything is published — same review gate the rest of the bank already goes through."),

    h(Text, { style: styles.footer }, "Vedic Neev — Question Bank Brief · reusable across sessions, re-share whenever starting the next batch.")
  )
);

async function main() {
  const outDir = process.argv[2] ?? __dirname;
  fs.mkdirSync(outDir, { recursive: true });
  const buffer = await renderToBuffer(doc);
  const outPath = path.join(outDir, "vedicneev-question-bank-brief.pdf");
  fs.writeFileSync(outPath, buffer);
  console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
