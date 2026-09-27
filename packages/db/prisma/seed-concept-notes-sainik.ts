/**
 * Sainik School (AISSEE) Class 6 pass of the content-expansion plan. Like
 * RMS, Sainik School shares almost its whole taxonomy with JNVST (Mental
 * Ability, Speed Calculation, Grammar, general GK are exam-agnostic Topic
 * rows, already covered by seed-concept-notes-jnvst.ts) — this covers the
 * one topic genuinely specific to it: "Sainik School GK".
 *
 * Every sub-concept is grounded in that topic's real 40 tagged questions
 * (pulled and read in full before writing this content) — a broader
 * general-knowledge mix (basic science, geography, history, and
 * defense/gallantry-award hierarchy) distinct from RMS's own
 * current-affairs-flavored topic, which is why the two aren't merged.
 *
 * All DRAFT — nothing reaches a student until reviewed and published at
 * /admin/concept-notes. Idempotent, safe to re-run.
 *
 * Run: npx tsx packages/db/prisma/seed-concept-notes-sainik.ts
 */
import { prisma } from "../src/index";

interface ConceptNoteSeed {
  subConceptKey: string;
  title: string;
  explanation: string;
  workedExample: string;
  commonMistake: string;
}

const TOPIC_NAME_EN = "Sainik School GK";

const NOTES: ConceptNoteSeed[] = [
  {
    subConceptKey: "human-body-and-basic-science",
    title: "Human Body & Basic Science",
    explanation:
      "Know basic human body facts (bone count, heart chambers, blood cell types, organ functions) and basic physical science (states of matter, simple machines, photosynthesis).",
    workedExample: "The adult human skeleton has 206 bones, and the heart has 4 chambers.",
    commonMistake:
      "Confusing which blood cell type does what — white blood cells fight infection, red blood cells carry oxygen, platelets help clotting.",
  },
  {
    subConceptKey: "indian-geography",
    title: "Indian Geography",
    explanation:
      "Know India's geographic superlatives (largest/smallest states, longest rivers) and major landmarks (mountain ranges, special territories).",
    workedExample: "Rajasthan is India's largest state by area, while Goa is the smallest.",
    commonMistake:
      "Confusing the longest river FLOWING WITHIN India (the Ganga) with a different river, or mixing up which range divides North from South India (the Vindhyas, not the Himalayas).",
  },
  {
    subConceptKey: "indian-history-and-freedom-struggle",
    title: "Indian History & Freedom Struggle",
    explanation:
      "Know key facts about ancient Indian civilizations, Mughal-era monuments, and the freedom struggle's major figures and events.",
    workedExample:
      "India gained independence from British rule in 1947, and Mahatma Gandhi is popularly known as the \"Father of the Nation.\"",
    commonMistake:
      "Mixing up historical figures' famous quotes — e.g. confusing Subhas Chandra Bose's \"Give me blood, and I shall give you freedom\" with a different freedom fighter's words.",
  },
  {
    subConceptKey: "defense-military-and-gallantry-awards",
    title: "Defense, Military & Gallantry Awards",
    explanation:
      "Know India's armed forces structure, key training institutions (NDA, IMA), and the ranking order of gallantry awards for wartime and peacetime bravery.",
    workedExample:
      "The Param Vir Chakra (PVC) is India's highest wartime gallantry award; the Ashoka Chakra is the equivalent highest honour for bravery shown OFF the battlefield.",
    commonMistake:
      "Treating all gallantry awards as equally ranked (there's a clear hierarchy: Param Vir Chakra > Maha Vir Chakra > Vir Chakra for wartime bravery), and mixing up NDA's location (Pune) with IMA's (Dehradun).",
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
