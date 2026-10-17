/**
 * Full character-frequency inventory of scanForUnsupportedGlyphs findings
 * across a topic range — unlike package-question-books.mts's dry-run
 * (which truncates to the first ~20 examples and pays the full PDF-render
 * cost even in dry-run mode) or inspect-glyphs.mts (which needs a topic
 * list up front), this aggregates every flagged character by codepoint
 * with a count and one example, across the whole range, in one fast pass.
 * Built to close out the →/−/↔ glyph-fix task in one round instead of
 * discovering new unhandled characters one dry-run at a time.
 *
 * Run with:
 *   npx tsx apps/web/scripts/audit-glyph-inventory.mts [--class=6|9] [--lang=en|hi] [--from=1] [--to=72]
 * Defaults to --class=6 --lang=en --from=1 --to=72. Reads directly from
 * QUESTIONS_ROOT (same env override as the packaging scripts) — no DB, no
 * Supabase, nothing is written or uploaded.
 */
import fs from "node:fs";
import path from "node:path";

import type { validateQuestionBookletTopic, scanForUnsupportedGlyphs, QuestionBookletClassLevel } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { validateQuestionBookletTopic: validateTopic, scanForUnsupportedGlyphs: scanGlyphs } =
  engineRuntime as unknown as typeof import("@vedicneev/engine");

const QUESTIONS_ROOT = process.env.QUESTION_BANK_ROOT || path.join("D:\\Projects\\notes handwritten", "questions");

function parseArgs() {
  const get = (name: string, fallback: string) => {
    const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
    return arg ? arg.split("=")[1]! : fallback;
  };
  const classLevel = Number(get("class", "6")) as QuestionBookletClassLevel;
  const lang = get("lang", "en") as "en" | "hi";
  const from = Number(get("from", "1"));
  const to = Number(get("to", "72"));
  return { classLevel, lang, from, to };
}

function main() {
  const { classLevel, lang, from, to } = parseArgs();
  const byChar = new Map<string, { count: number; example: string; topic: number }>();
  let totalFlags = 0;
  let totalTopics = 0;

  for (let topicNumber = from; topicNumber <= to; topicNumber++) {
    const filePath = path.join(QUESTIONS_ROOT, `class${classLevel}`, lang, `topic-${topicNumber}.json`);
    if (!fs.existsSync(filePath)) continue;
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const { ok, questions } = validateTopic(raw);
    if (!ok) continue;
    totalTopics++;
    const flags = scanGlyphs(questions);
    totalFlags += flags.length;
    for (const f of flags) {
      const existing = byChar.get(f.char);
      if (existing) existing.count++;
      else byChar.set(f.char, { count: 1, example: f.excerpt, topic: topicNumber });
    }
  }

  console.log(`Scanned ${totalTopics} topics (class${classLevel}/${lang}, topics ${from}-${to}). Total flags: ${totalFlags}\n`);
  const sorted = [...byChar.entries()].sort((a, b) => b[1].count - a[1].count);
  for (const [char, { count, example, topic }] of sorted) {
    const codePoint = char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0");
    console.log(`${JSON.stringify(char)}\tU+${codePoint}\tcount=${count}\ttopic-${topic}\t"...${example}..."`);
  }
}

main();
