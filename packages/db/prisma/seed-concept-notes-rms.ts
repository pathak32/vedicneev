/**
 * RMS (Rashtriya Military School) Class 6 pass of the content-expansion
 * plan. RMS shares almost its entire taxonomy with JNVST (Mental Ability,
 * Speed Calculation, Averages/Ratio/Percentage, Grammar, General
 * Awareness are all exam-agnostic Topic rows — see Topic.targetExam's own
 * comment) — those already got concept notes in
 * seed-concept-notes-jnvst.ts, so this script only covers the ONE topic
 * genuinely specific to RMS: "RMS Current Affairs".
 *
 * Every sub-concept below is grounded in that topic's real 40 tagged
 * questions (pulled and read in full before writing this content) — it's
 * broader than pure current-events: national symbols, defense/military
 * institutions, and Constitution facts, which is why it splits into 5
 * sub-concepts rather than one blended "current affairs" note.
 *
 * All DRAFT — nothing reaches a student until reviewed and published at
 * /admin/concept-notes. Idempotent, safe to re-run.
 *
 * Run: npx tsx packages/db/prisma/seed-concept-notes-rms.ts
 */
import { prisma } from "../src/index";

interface ConceptNoteSeed {
  subConceptKey: string;
  title: string;
  explanation: string;
  workedExample: string;
  commonMistake: string;
}

const TOPIC_NAME_EN = "RMS Current Affairs";

const NOTES: ConceptNoteSeed[] = [
  {
    subConceptKey: "national-days-and-observances",
    title: "National Days & Observances",
    explanation:
      "Key Indian national days are each tied to a specific historical event — Independence Day (freedom from British rule), Republic Day (the Constitution coming into force), and various days honoring people or the armed forces.",
    workedExample:
      "Gandhi Jayanti (2 October) marks Mahatma Gandhi's birth anniversary, distinct from Independence Day (15 August), which marks freedom itself.",
    commonMistake:
      "Mixing up 15 August, 26 January, and 2 October — each marks a different event (freedom, the Constitution taking effect, a person's birthday), not the same thing.",
  },
  {
    subConceptKey: "national-symbols-and-emblems",
    title: "National Symbols & Emblems",
    explanation:
      "India's flag, anthem, and song each have specific, exact facts worth knowing precisely — colors, ratios, counts, and their authors.",
    workedExample: "The Ashoka Chakra on the flag has 24 spokes, and the flag's length-to-height ratio is 3:2.",
    commonMistake:
      "Confusing the National Anthem (\"Jana Gana Mana\" by Rabindranath Tagore) with the National Song (\"Vande Mataram\" by Bankim Chandra Chattopadhyay) — two different works by two different writers.",
  },
  {
    subConceptKey: "defense-and-military-institutions",
    title: "Defense & Military Institutions",
    explanation:
      "Know the key institutions that train India's armed forces cadets — the NDA (trains all three services together), RIMC (feeds into NDA), and how Rashtriya Military Schools/Sainik Schools connect to NDA entry.",
    workedExample:
      "The National Defence Academy is located near Pune and trains cadets for the Army, Navy, and Air Force together — a detail worth knowing precisely since students are preparing for a related exam.",
    commonMistake: "Mixing up NDA (near Pune) with RIMC (Dehradun) — both prepare students for military careers, but at different stages and locations.",
  },
  {
    subConceptKey: "the-constitution-of-india",
    title: "The Constitution of India",
    explanation:
      "Know the Constitution's key facts — when it was adopted vs. when it came into force, the Preamble's opening words, and which amendments added which changes.",
    workedExample:
      "The Constitution was ADOPTED on 26 November 1949 but came INTO FORCE on 26 January 1950 — two separate milestones, which is why India marks both Constitution Day and Republic Day.",
    commonMistake:
      "Treating \"adopted\" and \"came into force\" as the same date, when the Constitution actually has two separate days for these two events.",
  },
  {
    subConceptKey: "recent-national-current-affairs",
    title: "Recent National Current Affairs",
    explanation:
      "Stay current on major recent national developments — space missions, administrative reorganizations, and renamed institutions.",
    workedExample:
      "Chandrayaan-3 achieved a soft landing near the Moon's SOUTH POLE in August 2023 — a first for any country, and a frequently-asked recent-affairs fact.",
    commonMistake:
      "Assuming \"current affairs\" only means very recent news — some tested facts (like the 2019 J&K reorganization) are a few years old but still commonly asked as recent history.",
  },
];

async function main() {
  const topic = await prisma.topic.findFirst({ where: { name: { path: ["en"], equals: TOPIC_NAME_EN } } });
  if (!topic) throw new Error(`Topic "${TOPIC_NAME_EN}" not found.`);

  for (const note of NOTES) {
    await prisma.conceptNote.upsert({
      where: { topicId_subConceptKey: { topicId: topic.id, subConceptKey: note.subConceptKey } },
      update: {
        title: { en: note.title },
        body: { en: { explanation: note.explanation, workedExample: note.workedExample, commonMistake: note.commonMistake } },
      },
      create: {
        topicId: topic.id,
        subConceptKey: note.subConceptKey,
        title: { en: note.title },
        body: { en: { explanation: note.explanation, workedExample: note.workedExample, commonMistake: note.commonMistake } },
        status: "DRAFT",
      },
    });
    console.log("upserted:", note.subConceptKey);
  }

  console.log(`\nDone — ${NOTES.length} DRAFT concept notes for "${TOPIC_NAME_EN}".`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
