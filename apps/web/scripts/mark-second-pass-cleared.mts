/**
 * Safely adds topics to _review/SECOND_PASS_CLEARED.json, the human
 * content-review gate that package-question-books.mts and
 * mockPaperSelection.mts both check before a topic is eligible for
 * packaging/selling (see their own ClearedEntry/SECOND_PASS_CLEARED_PATH).
 *
 * This script does NOT replace the review itself — it only records the
 * outcome of a review you've already done. Before marking a topic, it
 * re-validates the topic file structurally and checks it for known
 * defects (self-correction artifacts; unsupported glyphs for English) as
 * a safety net against marking something broken as cleared — it is NOT a
 * substitute for a human actually reading the questions.
 *
 * Run with:
 *   npx tsx apps/web/scripts/mark-second-pass-cleared.mts --class=9 --lang=hi --topics=1,2,3
 *   npx tsx apps/web/scripts/mark-second-pass-cleared.mts --class=9 --lang=en --topics=1-10   (ranges work too)
 *
 * Idempotent: re-running with topics already cleared is a no-op for
 * those topics. Merges into the existing manifest rather than
 * overwriting it — other classLevel/language entries are untouched.
 */
import fs from "node:fs";
import path from "node:path";

import type { validateQuestionBookletTopic, scanForSelfCorrectionArtifacts, scanForUnsupportedGlyphs, QuestionBookletClassLevel } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { validateQuestionBookletTopic: validateTopic, scanForSelfCorrectionArtifacts: scanArtifacts, scanForUnsupportedGlyphs: scanGlyphs } =
  engineRuntime as unknown as typeof import("@vedicneev/engine");

const QUESTIONS_ROOT = process.env.QUESTION_BANK_ROOT || path.join("D:\\Projects\\notes handwritten", "questions");
const MANIFEST_PATH = path.join(QUESTIONS_ROOT, "_review", "SECOND_PASS_CLEARED.json");

interface ClearedEntry {
  classLevel: number;
  language: string;
  topics: number[];
}

function parseArgs() {
  const get = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
  const classLevel = Number(get("class") ?? "6") as QuestionBookletClassLevel;
  const lang = (get("lang") ?? "en") as "en" | "hi";
  const topicsArg = get("topics");
  if (!topicsArg) throw new Error("--topics=1,2,3 or --topics=1-10 is required");
  const topics = new Set<number>();
  for (const part of topicsArg.split(",")) {
    if (part.includes("-")) {
      const [from, to] = part.split("-").map(Number);
      for (let t = from!; t <= to!; t++) topics.add(t);
    } else {
      topics.add(Number(part));
    }
  }
  return { classLevel, lang, topics: [...topics].sort((a, b) => a - b) };
}

function main() {
  const { classLevel, lang, topics } = parseArgs();
  const toClear: number[] = [];
  const skipped: { topic: number; reason: string }[] = [];

  for (const topicNumber of topics) {
    const filePath = path.join(QUESTIONS_ROOT, `class${classLevel}`, lang, `topic-${topicNumber}.json`);
    if (!fs.existsSync(filePath)) {
      skipped.push({ topic: topicNumber, reason: "file not found" });
      continue;
    }
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const { ok, questions, errors } = validateTopic(raw);
    if (!ok) {
      skipped.push({ topic: topicNumber, reason: `structural errors: ${errors.map((e) => e.message).join("; ")}` });
      continue;
    }
    const artifacts = scanArtifacts(questions);
    if (artifacts.length > 0) {
      skipped.push({ topic: topicNumber, reason: `${artifacts.length} self-correction artifact(s) — fix the source file first` });
      continue;
    }
    if (lang === "en") {
      const glyphs = scanGlyphs(questions);
      if (glyphs.length > 0) {
        skipped.push({ topic: topicNumber, reason: `${glyphs.length} unsupported-glyph flag(s) — fix the source file first` });
        continue;
      }
    }
    toClear.push(topicNumber);
  }

  if (skipped.length > 0) {
    console.log("NOT marked cleared (automated safety checks failed — these still need fixing, not just a human read-through):");
    for (const s of skipped) console.log(`  topic-${s.topic}: ${s.reason}`);
  }

  if (toClear.length === 0) {
    console.log("\nNothing to mark cleared.");
    return;
  }

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  const manifest: { cleared: ClearedEntry[] } = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"))
    : { cleared: [] };

  let entry = manifest.cleared.find((e) => e.classLevel === classLevel && e.language === lang);
  if (!entry) {
    entry = { classLevel, language: lang, topics: [] };
    manifest.cleared.push(entry);
  }
  const before = new Set(entry.topics);
  const newlyAdded = toClear.filter((t) => !before.has(t));
  entry.topics = [...new Set([...entry.topics, ...toClear])].sort((a, b) => a - b);

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  console.log(`\nclass${classLevel}/${lang}: ${entry.topics.length} topics now cleared (${newlyAdded.length} newly added this run: ${newlyAdded.join(", ") || "none"}).`);
  console.log(`Manifest updated at: ${MANIFEST_PATH}`);
}

main();
