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
 * own commit message for the exact before/after. °, ×, ÷, ½, ¼, ¾, ², ³, ¹
 * and every other character in the Latin-1 Supplement range (U+00A0-00FF)
 * ARE in WinAnsi and render correctly; this list is only the ones that
 * don't — confirmed by scanning the real class6/en + class9/en corpus for
 * every character outside that safe range (arrows, the Unicode minus sign,
 * check/cross marks, set-theory/geometry notation, Greek letters used as
 * variable names, and Unicode super/subscript digits and letters from
 * exponents and chemical formulas).
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
  [/∛/g, "cbrt "],
  [/≈/g, "~="],
  [/≠/g, "!="],
  [/≤/g, "<="],
  [/≥/g, ">="],
  [/∞/g, "infinity"],
  [/−/g, "-"],
  [/→/g, "->"],
  [/↔/g, "<->"],
  [/⇌/g, "<=>"],
  [/⟹/g, "=>"],
  // ↑ is reused for both chemistry's "gas evolved" notation AND plain
  // compass-direction reasoning questions ("Upward (↑)") — a context-free
  // label beats a chemistry-specific phrase that would misfire on the latter.
  [/↑/g, " (up arrow)"],
  [/↓/g, " (down arrow)"],
  [/↖/g, " (up-left arrow)"],
  [/↗/g, " (up-right arrow)"],
  [/↘/g, " (down-right arrow)"],
  [/↙/g, " (down-left arrow)"],
  [/←/g, " (left arrow)"],
  [/✓/g, " (correct)"],
  [/✗/g, " (incorrect)"],
  [/∠/g, "angle "],
  [/⅓/g, "1/3"],
  [/⅔/g, "2/3"],
  [/⅑/g, "1/9"],
  [/∩/g, " intersection "],
  [/∪/g, " union "],
  [/⊆/g, " subset-or-equal-to "],
  [/⊂/g, " subset-of "],
  [/⊃/g, " superset-of "],
  [/∈/g, " is-an-element-of "],
  [/∅/g, "the empty set"],
  [/∥/g, " parallel-to "],
  [/⊥/g, " perpendicular-to "],
  [/∝/g, " proportional-to "],
  [/≅/g, " congruent-to "],
  [/≡/g, " is-equivalent-to "],
  [/θ/g, "theta"],
  [/λ/g, "lambda"],
  [/μ/g, "mu"],
  [/β/g, "beta"],
  [/α/g, "alpha"],
  [/η/g, "eta"],
  [/Δ/g, "delta"],
  [/Γ/g, "Gamma"],
  [/Φ/g, "Phi"],
  [/Ω/g, "Omega"],
  [/Ψ/g, "Psi"],
  [/Η/g, "Eta"],
  // Non-verbal-reasoning shape glyphs (rotation/pattern/odd-one-out
  // questions in the mental_ability topic range) — named by shape and fill
  // so a filled vs. outline version of the same shape stays distinguishable.
  [/★/g, "(filled star)"],
  [/☆/g, "(star)"],
  [/✦/g, "(four-pointed star)"],
  [/♥/g, "(filled heart)"],
  [/♡/g, "(heart)"],
  [/◆/g, "(filled diamond)"],
  [/◇/g, "(diamond)"],
  [/◈/g, "(diamond-in-diamond)"],
  [/◊/g, "(small diamond)"],
  [/●/g, "(filled circle)"],
  [/○/g, "(circle)"],
  [/◯/g, "(large circle)"],
  [/■/g, "(filled square)"],
  [/□/g, "(square)"],
  [/☐/g, "(empty box)"],
  [/▲/g, "(filled triangle, up)"],
  [/△/g, "(triangle, up)"],
  [/▼/g, "(filled triangle, down)"],
  [/▽/g, "(triangle, down)"],
  [/∇/g, "(triangle, down)"],
  [/◀/g, "(filled triangle, left)"],
  [/◁/g, "(triangle, left)"],
  [/▶/g, "(filled triangle, right)"],
  [/▷/g, "(triangle, right)"],
  [/◹/g, "(triangle, upper-right corner)"],
  [/◸/g, "(triangle, upper-left corner)"],
  [/◺/g, "(triangle, lower-left corner)"],
  [/◷/g, "(circle, upper-right quadrant)"],
  [/⌐/g, "(angle shape)"],
  [/⌢/g, "(downward arc)"],
  [/⌣/g, "(upward arc)"],
  [/⌜/g, "(top-left corner bracket)"],
  [/⌝/g, "(top-right corner bracket)"],
  [/⌞/g, "(bottom-left corner bracket)"],
  [/⌟/g, "(bottom-right corner bracket)"],
  [/┌/g, "(top-left corner shape)"],
  [/⌊/g, "floor("],
  [/⌋/g, ")"],
  [/⟨/g, "<"],
  [/⟩/g, ">"],
  [/⊙/g, "(circle-dot)"],
  [/∂/g, "(partial-derivative symbol)"],
  // "Mirror image of a letter" analogy puzzles (topic-31) represented with
  // look-alike characters from other scripts (Cyrillic/IPA/phonetic) that
  // happen to resemble a flipped/rotated Latin letter in SOME fonts — this
  // was always a fragile design even before the PDF-rendering issue (no
  // guarantee a reader's font renders a visual mirror effect either), so a
  // worded label is arguably the more honest fix, not just a workaround.
  // Worth a second look at that topic's content separately from this fix.
  [/Ⅎ/g, "(mirrored F)"],
  [/⅂/g, "(rotated L)"],
  [/⅃/g, "(mirrored L)"],
  [/Ԁ/g, "(mirrored P)"],
  [/Я/g, "(mirrored R)"],
  [/Ǝ/g, "(mirrored E)"],
  [/Ɔ/g, "(mirrored C)"],
  [/ƃ/g, "(rotated b)"],
  [/Ę/g, "(reflected E)"],
  [/Ḃ/g, "(mirrored B)"],
  [/И/g, "(mirrored N)"],
  // Hangul jamo used as arbitrary abstract symbols in the same puzzles
  // (not for Korean meaning) — named by their actual Unicode identity
  // since there's no "visual rotation" meaning to translate at this layer.
  [/ㄱ/g, "(Hangul kiyeok symbol)"],
  [/ㄴ/g, "(Hangul nieun symbol)"],
  [/ㄷ/g, "(Hangul tikeut symbol)"],
  [/ㄹ/g, "(Hangul rieul symbol)"],
  [/€/g, "EUR "],
  [/₨/g, "Rs. "],
  // Combining macron over a decimal digit (repeating-decimal notation,
  // e.g. 0.83̄ meaning "0.83 repeating") — not a standalone glyph, so
  // substituted with a trailing phrase rather than a word in its place.
  [/̄/g, "... (repeating)"],
];

/**
 * Unicode superscript characters (exponents, e.g. aᵐ⁺ⁿ, 4⁻¹) collapsed to
 * an ASCII "^(...)" marker — kept distinct from a plain digit so "exponent"
 * meaning survives the substitution. ¹²³ are included here too (so a mixed
 * run like "⁻¹" groups correctly instead of splitting into "^(-)" + a
 * stray literal "¹"), but a run made ENTIRELY of ¹/²/³ is left untouched
 * below — those three are in the Latin-1 Supplement range and already
 * render correctly as literal superscripts, same as °/×/÷.
 */
const SUPERSCRIPT_CHAR_MAP: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "⁺": "+", "⁻": "-", "⁽": "(", "⁾": ")", "ⁿ": "n",
  "ᵃ": "a", "ᵏ": "k", "ᵒ": "o", "ᵖ": "p", "ʸ": "y", "ˣ": "x", "ʳ": "r", "ᵐ": "m",
};
const SUPERSCRIPT_SAFE_ALONE = new Set(["¹", "²", "³"]);
const SUPERSCRIPT_RUN = new RegExp(`[${Object.keys(SUPERSCRIPT_CHAR_MAP).join("")}]+`, "g");

/**
 * Unicode subscript characters (chemical formulas like H₂O, variable
 * indices like SP₁, and angle-notation subscripts like θᵢ/θᵣ for angle of
 * incidence/reflection) collapsed to plain ASCII digits/letters with no
 * marker — unlike exponents, a subscripted chemical formula or indexed
 * variable reads perfectly normally in plain ASCII ("H2O", "SP1", "θi/θr").
 * ᵢ/ᵣ here (U+1D62/U+1D63, Latin Subscript Modifier Letters) are visually
 * close to but a different codepoint from the superscript ʳ etc. above —
 * confirmed against the real corpus, not assumed.
 */
const SUBSCRIPT_CHAR_MAP: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
  "₊": "+", "₋": "-", "ₙ": "n", "ᵢ": "i", "ᵣ": "r",
};
const SUBSCRIPT_RUN = new RegExp(`[${Object.keys(SUBSCRIPT_CHAR_MAP).join("")}]+`, "g");

export function sanitizeForPdf(text: string): string {
  let out = text;
  for (const [pattern, replacement] of PDF_UNSUPPORTED_GLYPHS) out = out.replace(pattern, replacement);
  out = out.replace(SUPERSCRIPT_RUN, (run) => {
    const chars = [...run];
    if (chars.every((c) => SUPERSCRIPT_SAFE_ALONE.has(c))) return run;
    return `^(${chars.map((c) => SUPERSCRIPT_CHAR_MAP[c] ?? "").join("")})`;
  });
  out = out.replace(SUBSCRIPT_RUN, (run) => [...run].map((c) => SUBSCRIPT_CHAR_MAP[c] ?? "").join(""));
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
