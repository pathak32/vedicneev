/**
 * Seeds National Sprint rows: a handful of upcoming Sunday sprints (one
 * per board, Class 9) plus one ACTIVE sprint (already open, closing soon)
 * so the feature is immediately exercisable without waiting for a real
 * Sunday. Safe to re-run — upserts by title[.en], the closest thing to a
 * natural key here.
 */
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Next Sunday (or today, if today is Sunday) at 10:00 IST. */
function nextSundayTenAmIst(from: Date): Date {
  const shifted = new Date(from.getTime() + IST_OFFSET_MS);
  const daysUntilSunday = (7 - shifted.getUTCDay()) % 7;
  const istMidnight = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) + daysUntilSunday * DAY_MS;
  const istTenAm = istMidnight + 10 * 60 * 60 * 1000;
  return new Date(istTenAm - IST_OFFSET_MS);
}

async function upsertSprint(input: {
  titleEn: string;
  titleHi: string;
  templateSlug: string;
  startTime: Date;
  endTime: Date;
}) {
  const template = await prisma.examTemplate.findUniqueOrThrow({ where: { slug: input.templateSlug } });
  const existing = await prisma.nationalSprint.findFirst({
    where: { examTemplateId: template.id, startTime: input.startTime },
  });
  const data = {
    title: { en: input.titleEn, hi: input.titleHi } as Prisma.InputJsonValue,
    examType: template.examType,
    classLevel: template.classLevel,
    examTemplateId: template.id,
    startTime: input.startTime,
    endTime: input.endTime,
  };
  if (existing) {
    await prisma.nationalSprint.update({ where: { id: existing.id }, data });
  } else {
    await prisma.nationalSprint.create({ data });
  }
}

async function main() {
  const now = new Date();
  const nextSunday = nextSundayTenAmIst(now);

  await upsertSprint({
    titleEn: "JNVST Class 9 National Sprint",
    titleHi: "जेएनवीएसटी कक्षा 9 राष्ट्रीय स्प्रिंट",
    templateSlug: "jnvst-class-9",
    startTime: nextSunday,
    endTime: new Date(nextSunday.getTime() + 150 * 60 * 1000),
  });
  await upsertSprint({
    titleEn: "AISSEE Class 9 National Sprint",
    titleHi: "एआईएसएसईई कक्षा 9 राष्ट्रीय स्प्रिंट",
    templateSlug: "aissee-class-9",
    startTime: nextSunday,
    endTime: new Date(nextSunday.getTime() + 150 * 60 * 1000),
  });
  await upsertSprint({
    titleEn: "RMS Class 9 National Sprint",
    titleHi: "आरएमएस कक्षा 9 राष्ट्रीय स्प्रिंट",
    templateSlug: "rms-class-9",
    startTime: nextSunday,
    endTime: new Date(nextSunday.getTime() + 150 * 60 * 1000),
  });

  // A currently-ACTIVE sprint (JNVST Class 6, since its template is
  // lighter-weight for manual testing) — already open, closes in an hour.
  await upsertSprint({
    titleEn: "JNVST Class 6 National Sprint",
    titleHi: "जेएनवीएसटी कक्षा 6 राष्ट्रीय स्प्रिंट",
    templateSlug: "jnvst-class-6",
    startTime: new Date(now.getTime() - 5 * 60 * 1000),
    endTime: new Date(now.getTime() + 60 * 60 * 1000),
  });

  console.log(`Sprints seeded. Next Sunday 10am IST resolves to: ${nextSunday.toISOString()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
