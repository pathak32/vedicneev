/**
 * Heuristic audit for a real product-quality complaint confirmed against the
 * live UPSS Class 6 Set 1 sample paper: several questions filed under the
 * "Intelligence"/Mental Ability section (sectionKeyForTopic's
 * "mental_ability" bucket) read as straight Mathematics computation rather
 * than reasoning (Q78 "area of the missing square component", Q90 "What is
 * 3³ equal to?", Q94 an HCF word problem — none of these require any
 * reasoning skill beyond applying a formula, unlike the legitimate
 * mirror/rotation/series/coding-decoding/blood-relation questions filling
 * the rest of that section).
 *
 * Section assignment is a static topic-NUMBER range
 * (questionBookletCatalog.ts's CLASS_6_RANGES/CLASS_9_RANGES), not
 * content-based — so a topic can be correctly ranged as "mental_ability" and
 * still contain individual questions that are, in substance, Mathematics.
 * This script can't settle that call (only a human reading the question
 * can); it flags LIKELY candidates so a manual review pass has a short list
 * instead of needing to re-read the entire mental_ability pool by hand.
 *
 * Run with:
 *   npx tsx apps/web/scripts/audit-reasoning-content.mts [--class=6|9] [--lang=en|hi]
 * Defaults to --class=6 --lang=en (the flagged product). Reads directly from
 * QUESTIONS_ROOT (same env override as the packaging scripts) — no DB, no
 * Supabase, nothing is written or uploaded.
 */
import fs from "node:fs";
import path from "node:path";

import type { validateQuestionBookletTopic, QuestionBookletClassLevel } from "@vedicneev/engine";
import engineRuntime from "@vedicneev/engine";
const { validateQuestionBookletTopic: validateTopic, sectionKeyForTopic } =
  engineRuntime as unknown as typeof import("@vedicneev/engine");

const QUESTIONS_ROOT = process.env.QUESTION_BANK_ROOT || path.join("D:\\Projects\\notes handwritten", "questions");

function parseArgs() {
  const get = (name: string, fallback: string) => {
    const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
    return arg ? arg.split("=")[1]! : fallback;
  };
  const classLevel = Number(get("class", "6")) as QuestionBookletClassLevel;
  const lang = get("lang", "en") as "en" | "hi";
  return { classLevel, lang };
}

// Giveaway signs of a straight computation/word-problem, the kind of content
// that belongs in Arithmetic/Mathematics rather than Intelligence.
const MATH_GIVEAWAY_PATTERNS: RegExp[] = [
  /\bprofit\b/i,
  /\bloss\b/i,
  /\bselling price\b/i,
  /\bcost price\b/i,
  /\bsimple interest\b/i,
  /\bcompound interest\b/i,
  /\bper annum\b/i,
  /\barea of\b/i,
  /\bperimeter of\b/i,
  /\bvolume of\b/i,
  /\bhcf\b/i,
  /\blcm\b/i,
  /\bdiscount\b/i,
  /\baverage of\b/i,
  /\bsquare root of\b/i,
  /\bcube (of|root)\b/i,
  /\bsum of (the )?first \d+ terms\b/i,
  /\bcommon difference\b/i,
  /\brate of interest\b/i,
  /what is \d+(\.\d+)?\s*[³²]/i,
  /\bwhat is \d+%/i,
  /\bequal to\?\s*$/i, // "What is 3³ equal to?" — fact-recall computation, no reasoning step
  /\bwithout wastage\b/i, // HCF word problems phrased in plain English, no "HCF" literal
  /\blongest (possible )?length\b/i,
  /\bequal pieces\b/i,
];

// Legitimate reasoning framings that can still contain numbers/shapes/words
// matching the list above (e.g. a "find the missing term" series question
// contains numbers but IS the reasoning skill, not incidental to it) — a
// match here suppresses the flag even if a math-giveaway pattern also hit.
const REASONING_WHITELIST_PATTERNS: RegExp[] = [
  /\bmirror\b/i,
  /\breflection\b/i,
  /\brotat/i,
  /\bfold/i,
  /\bclock\b/i,
  /\bdirection\b/i,
  /\brelation\b/i,
  /\bcod(ed|ing)[- ]?decod/i,
  /\banalog(y|ies)\b/i,
  /\bodd one out\b/i,
  /\bdoes not belong\b/i,
  /\bmissing (term|figure|number)\b/i,
  /\bnext (term|figure|number)\b/i,
  /\bpattern\b/i,
  /\btessellation\b/i,
  /\bjigsaw\b/i,
  /\bvertices\b/i,
  /\bletter\b.*\brotated\b/i,
  /\bgroup\b/i,
];

interface Flag {
  topicNumber: number;
  questionNumber: number;
  matchedPattern: string;
  question: string;
}

function auditTopic(classLevel: QuestionBookletClassLevel, lang: "en" | "hi", topicNumber: number): Flag[] {
  const filePath = path.join(QUESTIONS_ROOT, `class${classLevel}`, lang, `topic-${topicNumber}.json`);
  if (!fs.existsSync(filePath)) return [];
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const { ok, questions } = validateTopic(raw);
  if (!ok) return [];

  const flags: Flag[] = [];
  for (const q of questions) {
    const whitelisted = REASONING_WHITELIST_PATTERNS.some((p) => p.test(q.question));
    if (whitelisted) continue;
    const match = MATH_GIVEAWAY_PATTERNS.find((p) => p.test(q.question));
    if (match) flags.push({ topicNumber, questionNumber: q.questionNumber, matchedPattern: match.source, question: q.question });
  }
  return flags;
}

function main() {
  const { classLevel, lang } = parseArgs();
  const mentalAbilityTopics: number[] = [];
  for (let topicNumber = 1; topicNumber <= 72; topicNumber++) {
    if (sectionKeyForTopic(classLevel, topicNumber) === "mental_ability") mentalAbilityTopics.push(topicNumber);
  }

  console.log(`Auditing ${mentalAbilityTopics.length} "mental_ability"-ranged topic(s) for class ${classLevel} (${lang}): ${mentalAbilityTopics.join(", ")}`);
  console.log("This is a HEURISTIC first pass only — every flag below still needs a human read before deciding to move/rewrite it.\n");

  const allFlags: Flag[] = [];
  for (const topicNumber of mentalAbilityTopics) {
    allFlags.push(...auditTopic(classLevel, lang, topicNumber));
  }

  if (allFlags.length === 0) {
    console.log("No likely-math questions found in the Intelligence/Mental Ability pool by this heuristic.");
    return;
  }

  console.log(`${allFlags.length} likely-math question(s) flagged for review:\n`);
  for (const f of allFlags) {
    console.log(`  topic-${f.topicNumber}.json Q${f.questionNumber} (matched /${f.matchedPattern}/)`);
    console.log(`    "${f.question}"\n`);
  }
}

main();
