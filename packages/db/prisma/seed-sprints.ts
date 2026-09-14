/**
 * Manual/local re-seed of National Sprint rows: reuses
 * packages/db/src/sprintScheduling.ts's scheduleWeeklySprints for the real
 * dual Class 6 + Class 9 tracks on the next upcoming Sunday (the same
 * function apps/web/app/api/cron/seed-sprints/route.ts's Vercel Cron calls
 * in production), then adds one extra ACTIVE sprint (already open, closing
 * soon) so the feature is immediately exercisable locally without waiting
 * for a real Sunday — that extra sprint is a manual-testing convenience
 * only, deliberately not part of the shared/production scheduling function.
 * Safe to re-run — scheduleWeeklySprints matches existing rows by
 * (examTemplateId, startTime), the closest thing to a natural key here.
 */
import { PrismaClient } from "@prisma/client";
import { scheduleWeeklySprints } from "../src/sprintScheduling";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const { scheduledCount, nextSunday } = await scheduleWeeklySprints(prisma, now);

  // A currently-ACTIVE sprint (JNVST Class 6, since its template is
  // lighter-weight for manual testing) — already open, closes soon.
  const template = await prisma.examTemplate.findUniqueOrThrow({ where: { slug: "jnvst-class-6" } });
  const startTime = new Date(now.getTime() - 5 * 60 * 1000);
  const endTime = new Date(startTime.getTime() + template.durationMinutes * 60 * 1000);
  const existing = await prisma.nationalSprint.findFirst({ where: { examTemplateId: template.id, startTime } });
  const data = {
    title: { en: "JNVST Class 6 National Test", hi: "जेएनवीएसटी कक्षा 6 राष्ट्रीय परीक्षा" },
    examType: template.examType,
    classLevel: template.classLevel,
    examTemplateId: template.id,
    startTime,
    endTime,
  };
  if (existing) {
    await prisma.nationalSprint.update({ where: { id: existing.id }, data });
  } else {
    await prisma.nationalSprint.create({ data });
  }

  console.log(`Sprints seeded: ${scheduledCount} for next Sunday (${nextSunday.toISOString()}) plus 1 active test sprint.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
