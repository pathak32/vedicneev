/**
 * Shared react-pdf font registration + page styling for every PDF-producing
 * script in this directory — extracted from generate-booklet-pdfs.mts
 * (which now imports this instead of defining its own copy) so a second
 * generator (e.g. the question-bank-books packaging script) doesn't have to
 * duplicate the same Noto font wiring and page styles.
 *
 * Non-Latin scripts (hi/mr/bn/gu/ta) need a real font registered with
 * react-pdf — Helvetica (the default) has no glyphs for any of them and
 * would silently render blank boxes.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Font, StyleSheet } from "@react-pdf/renderer";

export type PdfLanguage = "en" | "hi" | "mr" | "bn" | "gu" | "ta";

export const SUPPORTED_PDF_LANGUAGES: readonly PdfLanguage[] = ["en", "hi", "mr", "bn", "gu", "ta"];

export const PDF_LANGUAGE_LABEL: Record<PdfLanguage, string> = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  bn: "Bengali",
  gu: "Gujarati",
  ta: "Tamil",
};

/** Devanagari (hi/mr) shares one script/font; bn/gu/ta each need their own. `null` means Helvetica has real glyphs for this (English only). */
const FONT_FAMILY_BY_LANGUAGE: Record<PdfLanguage, string | null> = {
  en: null,
  hi: "NotoSansDevanagari",
  mr: "NotoSansDevanagari",
  bn: "NotoSansBengali",
  gu: "NotoSansGujarati",
  ta: "NotoSansTamil",
};

const FONTS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "fonts");

const registeredFamilies = new Set<string>();

/** Registers (once per process) and returns the font family name to use for this language — "Helvetica" for English. */
export function registerFontIfNeeded(language: PdfLanguage): string {
  const family = FONT_FAMILY_BY_LANGUAGE[language];
  if (!family) return "Helvetica";

  if (!registeredFamilies.has(family)) {
    Font.register({
      family,
      fonts: [
        { src: path.join(FONTS_DIR, `${family}-Regular.ttf`), fontWeight: "normal" },
        { src: path.join(FONTS_DIR, `${family}-Bold.ttf`), fontWeight: "bold" },
      ],
    });
    registeredFamilies.add(family);
  }
  return family;
}

/**
 * react-pdf's English rendering path uses Helvetica — one of the PDF
 * base-14 fonts, fixed to WinAnsi/Latin-1 encoding. Several characters
 * routine in a maths/science question bank fall outside that encoding
 * entirely and silently render as garbage (a wrong Latin-1 character that
 * happens to share the same byte value, or nothing at all) rather than
 * erroring — confirmed one by one with an isolated render, see this fix's
 * own commit message for the exact before/after. °, ×, ÷, ½ ARE in Latin-1
 * and render correctly; this list is only the ones that don't.
 *
 * Applied to every question/option/explanation string before it reaches a
 * `<Text>`, regardless of language, rather than only for English — simpler
 * than conditionally branching per registered font, and these substitutions
 * read fine in Hindi/other-script documents too.
 */
const PDF_UNSUPPORTED_GLYPHS: [RegExp, string][] = [
  [/₹/g, "Rs. "],
  [/π/g, "pi"],
  [/√/g, "sqrt "],
  [/≈/g, "~="],
  [/≠/g, "!="],
  [/≤/g, "<="],
  [/≥/g, ">="],
  [/∞/g, "infinity"],
];

export function sanitizeForPdf(text: string): string {
  let out = text;
  for (const [pattern, replacement] of PDF_UNSUPPORTED_GLYPHS) out = out.replace(pattern, replacement);
  return out;
}

/**
 * Built as a function (not a module-level constant) because the font
 * family is only known at runtime, resolved via registerFontIfNeeded.
 * Helvetica's built-in bold/italic faces are addressed by suffixing the
 * family name ("Helvetica-Bold"); a custom Noto family instead picks its
 * registered weight via fontWeight, and skips italic entirely — only a
 * Regular+Bold face was registered for each script, so emphasis for those
 * falls back to color/size instead of a missing italic glyph set.
 */
export function buildPdfStyles(fontFamily: string) {
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

export type PdfStyles = ReturnType<typeof buildPdfStyles>;
