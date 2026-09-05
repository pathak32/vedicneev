/**
 * Structural verification for a drafted audit JSON file (see the audit/
 * directory's *.json outputs from the drafting agents) — run BEFORE any
 * human content/fact review and BEFORE this content is wired into
 * seed.ts or touches the database. Checks everything that can be verified
 * mechanically; factual accuracy and translation quality still need a
 * human read-through.
 *
 * Usage: npx tsx prisma/topic-seed/audit/_check.ts <file.json> [file2.json ...]
 */
import { readFileSync } from "fs";

interface LangText {
  en: string;
  hi?: string;
}
interface OptionSeed {
  id: string;
  text: LangText;
}
interface Question {
  key: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  content: LangText;
  options: OptionSeed[];
  correctOption: string;
  explanation: LangText;
  distractorAnalysis: Record<string, LangText>;
}
interface AuditFile {
  section: string;
  topicKey: string;
  generatedAt: string;
  questions: Question[];
}

function requireLangText(value: unknown, path: string, errors: string[]): void {
  if (typeof value !== "object" || value === null) {
    errors.push(`${path}: not an object`);
    return;
  }
  const v = value as Record<string, unknown>;
  if (typeof v.en !== "string" || v.en.trim().length === 0) {
    errors.push(`${path}: missing/empty "en"`);
  }
  if (v.hi !== undefined && (typeof v.hi !== "string" || v.hi.trim().length === 0)) {
    errors.push(`${path}: "hi" present but empty`);
  }
  if (v.hi === undefined) {
    errors.push(`${path}: missing "hi" (required for this pass)`);
  }
  for (const lang of ["mr", "bn", "ta", "gu"]) {
    if (v[lang] !== undefined) {
      errors.push(`${path}: unexpected "${lang}" — out of scope for this pass, remove it`);
    }
  }
}

function checkFile(path: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  let raw: string;
  try {
    raw = readFileSync(path, "utf-8");
  } catch (e) {
    return { errors: [`Could not read file: ${(e as Error).message}`], warnings: [] };
  }

  let data: AuditFile;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return { errors: [`Invalid JSON: ${(e as Error).message}`], warnings: [] };
  }

  if (!Array.isArray(data.questions)) {
    return { errors: [`"questions" is not an array`], warnings: [] };
  }

  const qs = data.questions;
  if (qs.length !== 40) {
    errors.push(`Expected exactly 40 questions, got ${qs.length}`);
  }

  const byDiff = { EASY: 0, MEDIUM: 0, HARD: 0 } as Record<string, number>;
  const seenKeys = new Set<string>();
  const allEnglishTexts = new Map<string, string[]>(); // dedup check across the whole file — same wording reused verbatim across questions

  qs.forEach((q, i) => {
    const label = q.key || `#${i + 1}`;

    if (!q.key) errors.push(`${label}: missing "key"`);
    if (seenKeys.has(q.key)) errors.push(`${label}: duplicate key`);
    seenKeys.add(q.key);

    if (!["EASY", "MEDIUM", "HARD"].includes(q.difficulty)) {
      errors.push(`${label}: invalid difficulty "${q.difficulty}"`);
    } else {
      byDiff[q.difficulty] = (byDiff[q.difficulty] ?? 0) + 1;
    }

    requireLangText(q.content, `${label}.content`, errors);
    requireLangText(q.explanation, `${label}.explanation`, errors);

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`${label}: expected exactly 4 options, got ${Array.isArray(q.options) ? q.options.length : "non-array"}`);
      return;
    }

    const ids = q.options.map((o) => o.id);
    const expectedIds = ["a", "b", "c", "d"];
    for (const id of expectedIds) {
      if (!ids.includes(id)) errors.push(`${label}: missing option id "${id}"`);
    }
    if (new Set(ids).size !== ids.length) errors.push(`${label}: duplicate option ids`);

    q.options.forEach((o, oi) => requireLangText(o.text, `${label}.options[${oi}]`, errors));

    const englishTexts = q.options.map((o) => o.text?.en);
    if (new Set(englishTexts).size !== englishTexts.length) {
      errors.push(`${label}: two or more options render the same English text (${JSON.stringify(englishTexts)})`);
    }

    if (!ids.includes(q.correctOption)) {
      errors.push(`${label}: correctOption "${q.correctOption}" does not match any option id`);
    }

    const wrongIds = ids.filter((id) => id !== q.correctOption);
    if (typeof q.distractorAnalysis !== "object" || q.distractorAnalysis === null) {
      errors.push(`${label}: missing distractorAnalysis`);
    } else {
      const daKeys = Object.keys(q.distractorAnalysis);
      const missing = wrongIds.filter((id) => !daKeys.includes(id));
      const extra = daKeys.filter((id) => !wrongIds.includes(id));
      if (missing.length > 0) errors.push(`${label}: distractorAnalysis missing entries for ${JSON.stringify(missing)}`);
      if (extra.length > 0) errors.push(`${label}: distractorAnalysis has unexpected/extra keys ${JSON.stringify(extra)} (correctOption should never be a key)`);
      for (const [k, v] of Object.entries(q.distractorAnalysis)) {
        requireLangText(v, `${label}.distractorAnalysis.${k}`, errors);
      }
    }

    // Cross-question duplicate-content check — flags near-verbatim reuse of a question stem.
    const stem = q.content?.en?.trim();
    if (stem) {
      const bucket = allEnglishTexts.get(stem) ?? [];
      bucket.push(label);
      allEnglishTexts.set(stem, bucket);
    }
  });

  if (byDiff.EASY !== 10) errors.push(`Expected 10 EASY, got ${byDiff.EASY ?? 0}`);
  if (byDiff.MEDIUM !== 15) errors.push(`Expected 15 MEDIUM, got ${byDiff.MEDIUM ?? 0}`);
  if (byDiff.HARD !== 15) errors.push(`Expected 15 HARD, got ${byDiff.HARD ?? 0}`);

  for (const [stem, labels] of allEnglishTexts) {
    if (labels.length > 1) warnings.push(`Duplicate question stem "${stem}" used in: ${labels.join(", ")}`);
  }

  return { errors, warnings };
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: npx tsx prisma/topic-seed/audit/_check.ts <file.json> [file2.json ...]");
  process.exit(1);
}

let anyErrors = false;
for (const file of files) {
  const { errors, warnings } = checkFile(file);
  console.log(`\n=== ${file} ===`);
  if (errors.length === 0) {
    console.log(`OK — structurally valid.`);
  } else {
    anyErrors = true;
    console.log(`${errors.length} ERROR(S):`);
    for (const e of errors) console.log(`  ✗ ${e}`);
  }
  if (warnings.length > 0) {
    console.log(`${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`  ! ${w}`);
  }
}
process.exit(anyErrors ? 1 : 0);
