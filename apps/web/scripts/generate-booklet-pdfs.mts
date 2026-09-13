/**
 * Generates the 6 real Question Bank Booklet PDFs (JNVST/AISSEE/RMS ×
 * Class 6/9) from the actual seeded question bank — replacing the generic
 * placeholder PDF that seed-store.ts previously pointed every SKU at.
 *
 * Each booklet draws a deterministic 40-30-30 (easy/medium/hard) sample
 * PER SECTION, targeting BOOKLET_SIZE_TARGET (500) questions overall, from
 * whatever real content exists for that exam/class: the Question bank
 * (topic-tagged) plus published PreviousYearQuestion rows. When a section
 * doesn't yet have enough reviewed content to hit its share of that
 * target, this prints a "[shortfall]" warning and ships what's actually
 * available rather than padding the booklet with fabricated questions —
 * treat those warnings as a content-authoring backlog, not a bug here.
 *
 * Run with: npx tsx apps/web/scripts/generate-booklet-pdfs.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@vedicneev/db";

const h = React.createElement;

type ExamType = "JNVST" | "AISSEE" | "RMS";
type ClassLevel = 6 | 9;
type ContentClassLevel = "CLASS_6" | "CLASS_9";
type DifficultyBucket = "EASY" | "MEDIUM" | "HARD";

interface BookletQuestion {
  sectionName: string;
  difficulty: DifficultyBucket;
  stem: string;
  options: { label: string; text: string; isCorrect: boolean }[];
  explanation: string | null;
}

const COMBOS: { exam: ExamType; classLevel: ClassLevel; contentClass: ContentClassLevel; examLabel: string }[] = [
  { exam: "JNVST", classLevel: 6, contentClass: "CLASS_6", examLabel: "JNVST" },
  { exam: "JNVST", classLevel: 9, contentClass: "CLASS_9", examLabel: "JNVST" },
  { exam: "AISSEE", classLevel: 6, contentClass: "CLASS_6", examLabel: "AISSEE (Sainik School)" },
  { exam: "AISSEE", classLevel: 9, contentClass: "CLASS_9", examLabel: "AISSEE (Sainik School)" },
  { exam: "RMS", classLevel: 6, contentClass: "CLASS_6", examLabel: "RMS" },
  { exam: "RMS", classLevel: 9, contentClass: "CLASS_9", examLabel: "RMS" },
];

// Target: 500+ questions per booklet, with the 40-30-30 easy/medium/hard
// split applied PER SECTION (not just overall) — each section pulls up to
// its own even share of BOOKLET_SIZE_TARGET, in a 40/30/30 ratio, capped
// by whatever real content actually exists for that section. When the
// live question bank doesn't yet have 500+ real, reviewed questions for a
// given exam/class, this deliberately ships fewer rather than padding the
// booklet with fabricated or unreviewed content — see the shortfall
// warnings logged below, which is the signal to add more seed content
// rather than raise this cap.
const BOOKLET_SIZE_TARGET = 500;

function sectionTarget(sectionCount: number): Record<DifficultyBucket, number> {
  const perSection = Math.ceil(BOOKLET_SIZE_TARGET / Math.max(sectionCount, 1));
  return {
    EASY: Math.round(perSection * 0.4),
    MEDIUM: Math.round(perSection * 0.3),
    HARD: Math.round(perSection * 0.3),
  };
}

function en(json: unknown, fallback: string): string {
  if (json && typeof json === "object" && "en" in (json as Record<string, unknown>)) {
    const v = (json as Record<string, unknown>).en;
    if (typeof v === "string" && v.length > 0) return v;
  }
  return fallback;
}

async function loadBookletQuestions(exam: ExamType, classLevel: ClassLevel, contentClass: ContentClassLevel) {
  const questionRows = await prisma.question.findMany({
    where: {
      OR: [{ targetExam: null }, { targetExam: exam }],
      topic: { OR: [{ targetExam: null }, { targetExam: exam }] },
      AND: [
        {
          OR: [
            { targetClass: contentClass },
            { targetClass: null, topic: { targetClass: contentClass } },
            { targetClass: null, topic: { targetClass: null } },
          ],
        },
      ],
    },
    include: { topic: { include: { section: true } } },
    orderBy: [{ topicId: "asc" }, { key: "asc" }],
  });

  const pyqRows = await prisma.previousYearQuestion.findMany({
    where: { examType: exam, classLevel, reviewStatus: "PUBLISHED" },
    include: { section: true },
    orderBy: [{ sectionId: "asc" }, { key: "asc" }],
  });

  const pooled: BookletQuestion[] = [];

  for (const q of questionRows) {
    const rawOptions = q.options as { id?: string; text?: unknown }[];
    pooled.push({
      sectionName: en(q.topic.section.name, q.topic.section.key),
      difficulty: q.difficulty,
      stem: en(q.content, "(see figure)"),
      options: rawOptions.map((o, idx) => ({
        label: String.fromCharCode(65 + idx),
        text: en(o.text, "(figure — see printed booklet)"),
        isCorrect: o.id === q.correctOption,
      })),
      explanation: q.explanation ? en(q.explanation, "") || null : null,
    });
  }

  for (const q of pyqRows) {
    const optionTexts = q.optionsJson as unknown[];
    pooled.push({
      sectionName: en(q.section.name, q.section.key),
      difficulty: q.difficulty,
      stem: en(q.questionJson, "(see figure)"),
      options: optionTexts.map((t, idx) => ({
        label: String.fromCharCode(65 + idx),
        text: en(t, ""),
        isCorrect: idx === q.correctAnswer,
      })),
      explanation: en(q.explanation, "") || null,
    });
  }

  // Deterministic sample: keep the stable (section, key) order already
  // applied by the two queries above. Group by section first, then slice
  // each section's own difficulty buckets to its 40-30-30 target, so the
  // strictly-per-section distribution the spec calls for actually holds
  // even when one section has far more/less content than another.
  const bySection = new Map<string, Record<DifficultyBucket, BookletQuestion[]>>();
  for (const q of pooled) {
    const bucket = bySection.get(q.sectionName) ?? { EASY: [], MEDIUM: [], HARD: [] };
    bucket[q.difficulty].push(q);
    bySection.set(q.sectionName, bucket);
  }

  const target = sectionTarget(bySection.size);
  const selected: BookletQuestion[] = [];

  for (const [sectionName, byDifficulty] of bySection) {
    const easy = byDifficulty.EASY.slice(0, target.EASY);
    const medium = byDifficulty.MEDIUM.slice(0, target.MEDIUM);
    const hard = byDifficulty.HARD.slice(0, target.HARD);
    const sectionTotal = easy.length + medium.length + hard.length;
    const sectionWanted = target.EASY + target.MEDIUM + target.HARD;
    if (sectionTotal < sectionWanted) {
      console.warn(
        `  [shortfall] "${sectionName}": ${sectionTotal}/${sectionWanted} questions available ` +
          `(easy ${easy.length}/${target.EASY}, medium ${medium.length}/${target.MEDIUM}, hard ${hard.length}/${target.HARD}) — ` +
          "needs more reviewed content in the question bank / PYQ pool to hit the 40-30-30 target."
      );
    }
    selected.push(...easy, ...medium, ...hard);
  }

  return selected;
}

const styles = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#555555", marginBottom: 10 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  metaItem: { marginRight: 16, marginBottom: 2, color: "#555555" },
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
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 40,
    textAlign: "right",
    fontSize: 8,
    color: "#888888",
  },
});

function buildBookletDocument(examLabel: string, classLevel: ClassLevel, questions: BookletQuestion[]) {
  const bySection = new Map<string, BookletQuestion[]>();
  for (const q of questions) {
    const bucket = bySection.get(q.sectionName) ?? [];
    bucket.push(q);
    bySection.set(q.sectionName, bucket);
  }
  const counts = questions.reduce(
    (acc, q) => ({ ...acc, [q.difficulty]: acc[q.difficulty] + 1 }),
    { EASY: 0, MEDIUM: 0, HARD: 0 } as Record<DifficultyBucket, number>
  );

  return h(
    Document,
    { title: `${examLabel} Class ${classLevel} Question Bank Booklet` },
    h(
      Page,
      { size: "A4", style: styles.page },
      h(Text, { style: styles.title }, `${examLabel} Class ${classLevel} Question Bank Booklet`),
      h(
        Text,
        { style: styles.subtitle },
        "Real practice questions from the VedicNeev question bank, with full worked solutions."
      ),
      h(
        View,
        { style: styles.metaRow },
        h(Text, { style: styles.metaItem }, `Total Questions: ${questions.length}`),
        h(Text, { style: styles.metaItem }, `Easy: ${counts.EASY}`),
        h(Text, { style: styles.metaItem }, `Medium: ${counts.MEDIUM}`),
        h(Text, { style: styles.metaItem }, `Hard: ${counts.HARD}`)
      ),
      ...Array.from(bySection.entries()).map(([sectionName, sectionQuestions]) =>
        h(
          View,
          { key: sectionName },
          h(Text, { style: styles.sectionHeading }, `${sectionName} (${sectionQuestions.length} questions)`),
          ...sectionQuestions.map((q, i) =>
            h(
              View,
              { key: i, style: styles.questionBlock, wrap: false },
              h(Text, { style: styles.questionStem }, `Q${i + 1}. ${q.stem}`),
              h(Text, { style: styles.difficultyTag }, q.difficulty),
              ...q.options.map((o) =>
                h(
                  View,
                  { key: o.label, style: styles.option },
                  h(Text, { style: [styles.optionLabel, o.isCorrect ? styles.optionCorrect : undefined] }, `${o.label}.`),
                  h(Text, { style: o.isCorrect ? styles.optionCorrect : undefined }, `${o.text}${o.isCorrect ? "  (Correct)" : ""}`)
                )
              ),
              q.explanation ? h(Text, { style: styles.explanation }, `Explanation: ${q.explanation}`) : null
            )
          )
        )
      ),
      h(Text, {
        style: styles.pageNumber,
        render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
          `Page ${pageNumber} of ${totalPages}`,
        fixed: true,
      })
    )
  );
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const outDir = path.join(__dirname, "..", "public", "booklets");
  fs.mkdirSync(outDir, { recursive: true });

  for (const { exam, classLevel, contentClass, examLabel } of COMBOS) {
    const questions = await loadBookletQuestions(exam, classLevel, contentClass);
    if (questions.length === 0) {
      console.warn(`No real content found for ${exam} Class ${classLevel} — skipping.`);
      continue;
    }
    const buffer = await renderToBuffer(buildBookletDocument(examLabel, classLevel, questions));
    const filename = `${exam.toLowerCase()}-class-${classLevel}-question-bank-booklet.pdf`;
    fs.writeFileSync(path.join(outDir, filename), buffer);
    console.log(`${exam} Class ${classLevel}: wrote ${filename} (${questions.length} questions)`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
