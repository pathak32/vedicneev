/**
 * Structural verification for a drafted PYQ audit JSON file (see the
 * audit/ directory's *.json outputs) — run BEFORE any human content/fact
 * review and BEFORE this content is wired into a pyq-seed/*.ts file or
 * touches the database. Checks everything that can be verified
 * mechanically; factual accuracy and translation quality still need a
 * human read-through. Mirrors packages/db/prisma/topic-seed/audit/_check.ts,
 * adapted for PreviousYearQuestion's positional-answer shape (correctAnswer
 * is a 0-3 index into optionsJson, not an option-"id" string) instead of
 * Question's shape.
 *
 * Usage: npx tsx prisma/pyq-seed/audit/_check.ts <file.json> [file2.json ...]
 */
import { readFileSync } from "fs";

interface LangText {
  en: string;
  hi?: string;
}
interface PyqQuestion {
  key: string;
  year: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionJson: LangText;
  optionsJson: LangText[];
  correctAnswer: number;
  explanation: LangText;
  distractorAnalysis?: Record<string, LangText>;
}
interface AuditFile {
  examType: string;
  classLevel: number;
  sectionKey: string;
  generatedAt: string;
  questions: PyqQuestion[];
}

const VALID_YEARS = [2022, 2023, 2024, 2025, 2026];

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
}

function checkFile(path: string, expectedTotal: number): { errors: string[]; warnings: string[] } {
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
  if (qs.length !== expectedTotal) {
    errors.push(`Expected exactly ${expectedTotal} questions, got ${qs.length}`);
  }

  const seenKeys = new Set<string>();
  const yearCounts = new Map<number, number>();
  const allEnglishStems = new Map<string, string[]>();

  qs.forEach((q, i) => {
    const label = q.key || `#${i + 1}`;

    if (!q.key) errors.push(`${label}: missing "key"`);
    if (seenKeys.has(q.key)) errors.push(`${label}: duplicate key`);
    seenKeys.add(q.key);

    if (!VALID_YEARS.includes(q.year)) {
      errors.push(`${label}: year "${q.year}" is not one of ${JSON.stringify(VALID_YEARS)}`);
    } else {
      yearCounts.set(q.year, (yearCounts.get(q.year) ?? 0) + 1);
    }

    if (!["EASY", "MEDIUM", "HARD"].includes(q.difficulty)) {
      errors.push(`${label}: invalid difficulty "${q.difficulty}"`);
    }

    requireLangText(q.questionJson, `${label}.questionJson`, errors);
    requireLangText(q.explanation, `${label}.explanation`, errors);

    if (!Array.isArray(q.optionsJson) || q.optionsJson.length !== 4) {
      errors.push(`${label}: expected exactly 4 optionsJson entries, got ${Array.isArray(q.optionsJson) ? q.optionsJson.length : "non-array"}`);
      return;
    }
    q.optionsJson.forEach((o, oi) => requireLangText(o, `${label}.optionsJson[${oi}]`, errors));

    const englishTexts = q.optionsJson.map((o) => o?.en);
    if (new Set(englishTexts).size !== englishTexts.length) {
      errors.push(`${label}: two or more options render the same English text (${JSON.stringify(englishTexts)})`);
    }

    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3) {
      errors.push(`${label}: correctAnswer "${q.correctAnswer}" must be an integer 0-3`);
    }

    if (q.distractorAnalysis !== undefined) {
      const wrongIndices = [0, 1, 2, 3].filter((idx) => idx !== q.correctAnswer).map(String);
      const daKeys = Object.keys(q.distractorAnalysis);
      const missing = wrongIndices.filter((idx) => !daKeys.includes(idx));
      const extra = daKeys.filter((idx) => !wrongIndices.includes(idx));
      if (missing.length > 0) errors.push(`${label}: distractorAnalysis missing entries for ${JSON.stringify(missing)}`);
      if (extra.length > 0) errors.push(`${label}: distractorAnalysis has unexpected/extra keys ${JSON.stringify(extra)} (correctAnswer's own index should never be a key)`);
      for (const [k, v] of Object.entries(q.distractorAnalysis)) {
        requireLangText(v, `${label}.distractorAnalysis.${k}`, errors);
      }
    } else {
      errors.push(`${label}: missing distractorAnalysis`);
    }

    const stem = q.questionJson?.en?.trim();
    if (stem) {
      const bucket = allEnglishStems.get(stem) ?? [];
      bucket.push(label);
      allEnglishStems.set(stem, bucket);
    }
  });

  for (const year of VALID_YEARS) {
    if (!yearCounts.has(year)) warnings.push(`No questions tagged for year ${year} — expected roughly even coverage across 2022-2026.`);
  }

  for (const [stem, labels] of allEnglishStems) {
    if (labels.length > 1) warnings.push(`Duplicate question stem "${stem}" used in: ${labels.join(", ")}`);
  }

  return { errors, warnings };
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: npx tsx prisma/pyq-seed/audit/_check.ts <file.json> [file2.json ...] [--expect=N]");
  process.exit(1);
}

const expectFlag = args.find((a) => a.startsWith("--expect="));
const expectedTotal = expectFlag ? Number(expectFlag.split("=")[1]) : 25;
const files = args.filter((a) => !a.startsWith("--expect="));

let anyErrors = false;
for (const file of files) {
  const { errors, warnings } = checkFile(file, expectedTotal);
  console.log(`\n=== ${file} (expecting ${expectedTotal}) ===`);
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
