/**
 * Generates the real Question Bank Booklet PDFs (JNVST/AISSEE/RMS ×
 * Class 6/9, one language at a time) from the actual seeded question bank —
 * replacing the generic placeholder PDF that seed-store.ts previously
 * pointed every SKU at.
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
 * Language support: pass --lang=<code> (en/hi/mr/bn/gu/ta, default en).
 * A row missing the requested locale falls back to English and is counted
 * in a per-language coverage report printed at the end — regional-language
 * topic-bank coverage is still near-zero as of this script's last update
 * (see packages/db/prisma seed content), so a Bengali/Tamil/Gujarati/
 * Marathi booklet today will legitimately still be mostly-English by
 * volume until that content is authored; this report exists specifically
 * so nobody ships a mislabeled "Bengali Edition" without knowing that.
 * Non-Latin scripts (hi/mr/bn/gu/ta) need a real font registered with
 * react-pdf — see FONTS_BY_LANGUAGE below; Helvetica (the default) has no
 * glyphs for any of them and would silently render blank boxes.
 *
 * Run with: npx tsx apps/web/scripts/generate-booklet-pdfs.mts [--lang=mr]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@vedicneev/db";

const h = React.createElement;

type ExamType = "JNVST" | "AISSEE" | "RMS";
type ClassLevel = 6 | 9;
type ContentClassLevel = "CLASS_6" | "CLASS_9";
type DifficultyBucket = "EASY" | "MEDIUM" | "HARD";
type Language = "en" | "hi" | "mr" | "bn" | "gu" | "ta";

const SUPPORTED_LANGUAGES: readonly Language[] = ["en", "hi", "mr", "bn", "gu", "ta"];

const LANGUAGE_LABEL: Record<Language, string> = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  bn: "Bengali",
  gu: "Gujarati",
  ta: "Tamil",
};

/**
 * Devanagari (hi/mr) shares one script/font; bn/gu/ta each need their own.
 * `null` means "Helvetica has real glyphs for this" (English only).
 */
const FONT_FAMILY_BY_LANGUAGE: Record<Language, string | null> = {
  en: null,
  hi: "NotoSansDevanagari",
  mr: "NotoSansDevanagari",
  bn: "NotoSansBengali",
  gu: "NotoSansGujarati",
  ta: "NotoSansTamil",
};

const FONTS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "fonts");

function registerFontIfNeeded(language: Language): string {
  const family = FONT_FAMILY_BY_LANGUAGE[language];
  if (!family) return "Helvetica";

  Font.register({
    family,
    fonts: [
      { src: path.join(FONTS_DIR, `${family}-Regular.ttf`), fontWeight: "normal" },
      { src: path.join(FONTS_DIR, `${family}-Bold.ttf`), fontWeight: "bold" },
    ],
  });
  return family;
}

function parseLanguageArg(): Language {
  const arg = process.argv.find((a) => a.startsWith("--lang="));
  const value = (arg?.split("=")[1] ?? "en").toLowerCase();
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(value)) return value as Language;
  console.error(`Unknown --lang="${value}" — must be one of: ${SUPPORTED_LANGUAGES.join(", ")}.`);
  process.exit(1);
}

interface BookletQuestion {
  sectionName: string;
  difficulty: DifficultyBucket;
  stem: string;
  options: { label: string; text: string; isCorrect: boolean }[];
  explanation: string | null;
  /** True if any of stem/options/explanation fell back to English because the requested locale was missing on that row. */
  usedFallback: boolean;
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

interface LocalizeResult {
  text: string;
  usedFallback: boolean;
}

/** Reads `json[language]`, falling back to `json.en` (then `fallback`) when the requested locale isn't populated on this row — tracks whether that fallback happened so the caller can roll it into a coverage report. */
function localize(json: unknown, language: Language, fallback: string): LocalizeResult {
  const record = json && typeof json === "object" ? (json as Record<string, unknown>) : null;

  const requested = record?.[language];
  if (typeof requested === "string" && requested.length > 0) {
    return { text: requested, usedFallback: false };
  }

  if (language !== "en") {
    const en = record?.en;
    if (typeof en === "string" && en.length > 0) {
      return { text: en, usedFallback: true };
    }
  }

  return { text: fallback, usedFallback: false };
}

async function loadBookletQuestions(
  exam: ExamType,
  classLevel: ClassLevel,
  contentClass: ContentClassLevel,
  language: Language
) {
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
    const stem = localize(q.content, language, "(see figure)");
    const options = rawOptions.map((o, idx) => {
      const opt = localize(o.text, language, "(figure — see printed booklet)");
      return { label: String.fromCharCode(65 + idx), text: opt.text, isCorrect: o.id === q.correctOption, usedFallback: opt.usedFallback };
    });
    const explanationResult = q.explanation ? localize(q.explanation, language, "") : null;

    pooled.push({
      sectionName: localize(q.topic.section.name, language, q.topic.section.key).text,
      difficulty: q.difficulty,
      stem: stem.text,
      options: options.map(({ usedFallback: _uf, ...o }) => o),
      explanation: explanationResult?.text || null,
      usedFallback: stem.usedFallback || options.some((o) => o.usedFallback) || (explanationResult?.usedFallback ?? false),
    });
  }

  for (const q of pyqRows) {
    const optionTexts = q.optionsJson as unknown[];
    const stem = localize(q.questionJson, language, "(see figure)");
    const options = optionTexts.map((t, idx) => {
      const opt = localize(t, language, "");
      return { label: String.fromCharCode(65 + idx), text: opt.text, isCorrect: idx === q.correctAnswer, usedFallback: opt.usedFallback };
    });
    const explanationResult = localize(q.explanation, language, "");

    pooled.push({
      sectionName: localize(q.section.name, language, q.section.key).text,
      difficulty: q.difficulty,
      stem: stem.text,
      options: options.map(({ usedFallback: _uf, ...o }) => o),
      explanation: explanationResult.text || null,
      usedFallback: stem.usedFallback || options.some((o) => o.usedFallback) || explanationResult.usedFallback,
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

/**
 * Built as a function (not a module-level constant) because the font
 * family depends on --lang, resolved at runtime via registerFontIfNeeded.
 * Helvetica's built-in bold/italic faces are addressed by suffixing the
 * family name ("Helvetica-Bold"); a custom Noto family instead picks its
 * registered weight via fontWeight, and skips italic entirely — only a
 * Regular+Bold face was registered for each script (see
 * FONT_FAMILY_BY_LANGUAGE), so emphasis for those falls back to color/size
 * instead of a missing italic glyph set.
 */
function buildStyles(fontFamily: string) {
  const isCustomFont = fontFamily !== "Helvetica";
  const bold = isCustomFont ? { fontFamily, fontWeight: "bold" as const } : { fontFamily: "Helvetica-Bold" };
  const emphasis = isCustomFont
    ? { fontFamily, color: "#444444" as const }
    : { fontFamily: "Helvetica-Oblique", color: "#444444" as const };

  return StyleSheet.create({
    page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 40, fontSize: 10, fontFamily },
    title: { fontSize: 16, marginBottom: 4, ...bold },
    subtitle: { fontSize: 10, color: "#555555", marginBottom: 10 },
    metaRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
    metaItem: { marginRight: 16, marginBottom: 2, color: "#555555" },
    sectionHeading: {
      fontSize: 12,
      marginTop: 14,
      marginBottom: 8,
      paddingBottom: 3,
      borderBottomWidth: 1,
      borderBottomColor: "#d4d4d4",
      borderBottomStyle: "solid",
      ...bold,
    },
    questionBlock: { marginBottom: 10 },
    questionStem: { marginBottom: 4, ...bold },
    difficultyTag: { fontSize: 8, color: "#92400e" },
    option: { flexDirection: "row", marginBottom: 2, paddingLeft: 10 },
    optionCorrect: { color: "#065f46", ...bold },
    optionLabel: { width: 16 },
    explanation: { marginTop: 4, marginLeft: 10, fontSize: 9, ...emphasis },
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
}

function buildBookletDocument(
  examLabel: string,
  classLevel: ClassLevel,
  language: Language,
  questions: BookletQuestion[],
  styles: ReturnType<typeof buildStyles>
) {
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
  const languageSuffix = language === "en" ? "" : ` (${LANGUAGE_LABEL[language]} Edition)`;

  return h(
    Document,
    { title: `${examLabel} Class ${classLevel} Question Bank Booklet${languageSuffix}` },
    h(
      Page,
      { size: "A4", style: styles.page },
      h(Text, { style: styles.title }, `${examLabel} Class ${classLevel} Question Bank Booklet${languageSuffix}`),
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
  const language = parseLanguageArg();
  const fontFamily = registerFontIfNeeded(language);
  const styles = buildStyles(fontFamily);

  console.log(`Generating booklets in ${LANGUAGE_LABEL[language]} (--lang=${language})...`);

  const outDir = path.join(__dirname, "..", "public", "booklets");
  fs.mkdirSync(outDir, { recursive: true });

  for (const { exam, classLevel, contentClass, examLabel } of COMBOS) {
    const questions = await loadBookletQuestions(exam, classLevel, contentClass, language);
    if (questions.length === 0) {
      console.warn(`No real content found for ${exam} Class ${classLevel} — skipping.`);
      continue;
    }
    const buffer = await renderToBuffer(buildBookletDocument(examLabel, classLevel, language, questions, styles));
    const langSuffix = language === "en" ? "" : `-${language}`;
    const filename = `${exam.toLowerCase()}-class-${classLevel}-question-bank-booklet${langSuffix}.pdf`;
    fs.writeFileSync(path.join(outDir, filename), buffer);

    const fallbackCount = questions.filter((q) => q.usedFallback).length;
    const coverageNote =
      language === "en"
        ? ""
        : fallbackCount === 0
          ? " — full native-language coverage"
          : ` — ${fallbackCount}/${questions.length} questions (${Math.round((fallbackCount / questions.length) * 100)}%) fell back to English (no ${language} translation yet)`;
    console.log(`${exam} Class ${classLevel}: wrote ${filename} (${questions.length} questions)${coverageNote}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
