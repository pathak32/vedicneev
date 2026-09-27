/**
 * Step 1 of the content-expansion plan: proves the ConceptNote pipeline on
 * ONE real topic — "Fractions & Decimals" (JNVST Class 6, arithmetic
 * section) — before scaling to every topic across Navodaya/RMS/Sainik
 * School. Each row below is one SUB-concept within that topic (not one
 * blended note per topic), grounded directly in the real Question rows
 * already tagged to it (40 questions, verified via a live DB query before
 * writing this content — every worked example numbers below is a real
 * question from that set, not invented).
 *
 * Every row is created as DRAFT — nothing here reaches a student until a
 * teammate reviews and publishes it (see ConceptNote.status's own comment).
 *
 * Idempotent: re-running upserts on (topicId, subConceptKey), safe to
 * re-run after editing content below.
 *
 * Run: npx tsx packages/db/prisma/seed-concept-notes-fractions.ts
 */
import { prisma } from "../src/index";

const TOPIC_NAME_EN = "Fractions & Decimals";

interface ConceptNoteSeed {
  subConceptKey: string;
  title: string;
  explanation: string;
  workedExample: string;
  commonMistake: string;
}

const NOTES: ConceptNoteSeed[] = [
  {
    subConceptKey: "adding-subtracting-like-fractions",
    title: "Adding & Subtracting Like Fractions",
    explanation:
      "When two fractions share the same denominator, add or subtract only the numerators — the denominator never changes. This is the base every other fraction operation builds on.",
    workedExample: "6/13 − 2/13 = (6 − 2)/13 = 4/13. The denominator stays 13; only the top numbers are subtracted.",
    commonMistake:
      "Subtracting or adding the denominators too (writing 4/26 instead of 4/13). The denominator only changes when the fractions start with DIFFERENT denominators and need a common one first.",
  },
  {
    subConceptKey: "converting-fractions-to-decimals",
    title: "Converting Fractions to Decimals",
    explanation:
      "A fraction converts to a decimal by dividing the numerator by the denominator. Fractions whose denominator is a factor of 10, 100, or 1000 (like 4, 20, 25) convert to clean, terminating decimals.",
    workedExample: "7/20 → divide 7 by 20 = 0.35. Or scale up: 7/20 = 35/100 = 0.35.",
    commonMistake:
      "Dividing the denominator by the numerator instead of the other way round, or misplacing the decimal point by one digit when the numerator is smaller than the denominator.",
  },
  {
    subConceptKey: "multiplying-fractions",
    title: "Multiplying Fractions",
    explanation:
      "Multiply numerator by numerator and denominator by denominator directly — no common denominator needed. Simplify (cancel common factors) before multiplying to keep the numbers small.",
    workedExample: "5/6 × 2/5 — cancel the 5s first: 1/6 × 2/1 = 2/6 = 1/3.",
    commonMistake:
      "Finding a common denominator first, like for addition — multiplication never needs one. Cross-multiplying (a technique for comparing fractions) is also a common mix-up here.",
  },
  {
    subConceptKey: "comparing-fractions",
    title: "Comparing Fractions — Which Is Largest",
    explanation:
      "To compare fractions with different denominators, convert them all to one common denominator (or all to decimals) before comparing the numerators.",
    workedExample:
      "Compare 5/6, 2/3, 1/2, 3/10 — common denominator 30 gives 25/30, 20/30, 15/30, 9/30. Largest is 5/6.",
    commonMistake:
      "Comparing numerators or denominators alone without converting first — assuming a bigger denominator automatically means a bigger fraction.",
  },
  {
    subConceptKey: "dividing-fractions",
    title: "Dividing Fractions",
    explanation: "Dividing by a fraction means multiplying by its reciprocal — flip the second fraction, then multiply.",
    workedExample: "2/3 ÷ 4/9 = 2/3 × 9/4 = 18/12 = 3/2.",
    commonMistake:
      "Flipping the FIRST fraction instead of the second, or dividing numerators and denominators straight across the way multiplication works.",
  },
  {
    subConceptKey: "fraction-word-problems",
    title: "Fraction Word Problems — \"How Many Are Left\"",
    explanation:
      "Find the fraction of the total that's REMAINING (1 minus the used fraction), then multiply that remaining fraction by the total.",
    workedExample: "80 marbles, 2/5 used → remaining fraction = 1 − 2/5 = 3/5. Marbles left = 3/5 × 80 = 48.",
    commonMistake:
      "Multiplying the total by the USED fraction instead of the remaining one, or forgetting to subtract from 1 first and answering how many were used instead of how many are left.",
  },
  {
    subConceptKey: "decimal-to-fraction-simplest-form",
    title: "Converting Decimals to Fractions (Simplest Form)",
    explanation:
      "Write the decimal over the matching power of 10 for its number of decimal places, then simplify by dividing both parts by their HCF.",
    workedExample: "0.36 = 36/100 → HCF(36, 100) = 4 → 9/25.",
    commonMistake:
      "Leaving the fraction unsimplified (answering 36/100 instead of 9/25), or using the wrong power of 10 for the number of decimal digits.",
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
        body: {
          en: {
            explanation: note.explanation,
            workedExample: note.workedExample,
            commonMistake: note.commonMistake,
          },
        },
      },
      create: {
        topicId: topic.id,
        subConceptKey: note.subConceptKey,
        title: { en: note.title },
        body: {
          en: {
            explanation: note.explanation,
            workedExample: note.workedExample,
            commonMistake: note.commonMistake,
          },
        },
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
