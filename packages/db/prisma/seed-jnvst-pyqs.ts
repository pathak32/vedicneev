/**
 * Seeds the Previous-Year-Question practice bank (see
 * packages/db/prisma/pyq-seed/ for the actual content, one file per
 * board/class/cohort — originally JNVST Class 6 only, now also JNVST/
 * AISSEE/RMS Class 9). Separate from the main prisma/seed.ts on purpose —
 * this bank is large and independent of the rest of the seed data, so it
 * can be re-run on its own while iterating on PYQ content without
 * re-running the whole seed script.
 *
 * Depends on prisma/seed.ts having already run at least once: it looks up
 * every Section.key referenced by pyq-seed content (not a fixed list —
 * new boards/classes can introduce new sections) and skips (with a
 * warning, not a crash) any item whose section isn't found yet.
 *
 * Each item carries its own examType/classLevel (defaulting to JNVST/6
 * for the original Class 6 files, which predate those fields) — this
 * script no longer assumes JNVST Class 6 for everything it upserts.
 *
 * Upserts by `key` (packages/db/prisma/schema.prisma's
 * PreviousYearQuestion.key) — safe to re-run; editing an item's content in
 * pyq-seed/ and re-seeding updates the live row instead of duplicating it.
 */
import { ExamType, Prisma, PrismaClient } from "@prisma/client";

import { pyqSeedItems } from "./pyq-seed";

const prisma = new PrismaClient();

async function main() {
  const sectionKeys = [...new Set(pyqSeedItems.map((item) => item.sectionKey))];
  const sections = await prisma.section.findMany({ where: { key: { in: sectionKeys } } });
  const sectionIdByKey = new Map(sections.map((s) => [s.key, s.id]));

  let newCount = 0;
  let skippedCount = 0;

  for (const item of pyqSeedItems) {
    const sectionId = sectionIdByKey.get(item.sectionKey);
    if (!sectionId) {
      console.warn(`Skipping ${item.key} — section "${item.sectionKey}" not found. Run "npm run db:seed" first.`);
      skippedCount += 1;
      continue;
    }

    const data = {
      examType: (item.examType ?? "JNVST") as ExamType,
      year: item.year,
      classLevel: item.classLevel ?? 6,
      sectionId,
      questionJson: item.questionJson as unknown as Prisma.InputJsonValue,
      optionsJson: item.optionsJson as unknown as Prisma.InputJsonValue,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation as unknown as Prisma.InputJsonValue,
      difficulty: item.difficulty,
    };

    const result = await prisma.previousYearQuestion.upsert({
      where: { key: item.key },
      update: data,
      create: { key: item.key, ...data },
    });
    if (result.createdAt.getTime() === result.updatedAt.getTime()) newCount += 1;
  }

  console.log(
    `PYQ bank: ${pyqSeedItems.length} processed, ${newCount} newly created` +
      (skippedCount > 0 ? `, ${skippedCount} skipped (missing section)` : "") +
      "."
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
