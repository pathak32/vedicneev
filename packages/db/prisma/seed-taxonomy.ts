import { PrismaClient, type ExamType } from "@prisma/client";

const prisma = new PrismaClient();

// A starter taxonomy for the Navodaya-family entrance exams this product
// serves (JNVST/AISSEE/RMS) — deliberately the same subject/subsection
// shape across all three boards, since their aptitude syllabi overlap
// heavily at this level. An institute never edits these directly; this
// seed is meant to be extended over time (re-running it is safe — every
// write is an upsert keyed by the same natural key the schema's own
// @@unique constraints use).
const EXAM_BOARDS: ExamType[] = ["JNVST", "AISSEE", "RMS"];

const TAXONOMY: Record<string, string[]> = {
  Mathematics: [
    "Fractions & Decimals",
    "Percentage",
    "Simplification",
    "Profit & Loss",
    "Ratio & Proportion",
    "Speed/Time/Distance",
    "Area & Perimeter",
    "LCM & HCF",
  ],
  Intelligence: [
    "Coding-Decoding",
    "Pattern Completion",
    "Odd One Out",
    "Mirror & Water Images",
    "Analogy",
    "Series Completion",
  ],
  Language: ["Reading Comprehension", "Grammar & Usage", "Vocabulary", "Sentence Correction"],
  "General Knowledge": ["Science & Environment", "History & Civics", "Geography", "Current Affairs"],
};

async function main() {
  console.log("Seeding Subject/Subsection taxonomy...");

  for (const examBoard of EXAM_BOARDS) {
    for (const [subjectName, subsectionNames] of Object.entries(TAXONOMY)) {
      const subject = await prisma.subject.upsert({
        where: { examBoard_name: { examBoard, name: subjectName } },
        update: {},
        create: { examBoard, name: subjectName },
      });

      for (const subsectionName of subsectionNames) {
        await prisma.subsection.upsert({
          where: { subjectId_name: { subjectId: subject.id, name: subsectionName } },
          update: {},
          create: { subjectId: subject.id, name: subsectionName },
        });
      }

      console.log(`  ✔ ${examBoard} · ${subjectName} (${subsectionNames.length} subsections)`);
    }
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
