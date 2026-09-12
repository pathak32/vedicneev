/**
 * Seeds National Sprint rows: dual Class 6 + Class 9 tracks for every
 * board (JNVST/AISSEE/RMS) on the next upcoming Sunday, plus one ACTIVE
 * sprint (already open, closing soon) so the feature is immediately
 * exercisable without waiting for a real Sunday. Safe to re-run — matches
 * existing rows by (examTemplateId, startTime), the closest thing to a
 * natural key here.
 *
 * endTime is always derived from the linked ExamTemplate's own
 * durationMinutes, never hardcoded — JNVST Class 6 is a 120-minute paper
 * while every other template here is 150 minutes, so a single shared
 * duration would silently give JNVST-6 participants 30 minutes they were
 * never meant to have.
 */
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The Sunday after today (never today itself, even if today is Sunday) at 12:00 (noon) IST. */
function nextSundayNoonIst(from: Date): Date {
  const shifted = new Date(from.getTime() + IST_OFFSET_MS);
  let daysUntilSunday = (7 - shifted.getUTCDay()) % 7;
  if (daysUntilSunday === 0) daysUntilSunday = 7;
  const istMidnight = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) + daysUntilSunday * DAY_MS;
  const istNoon = istMidnight + 12 * 60 * 60 * 1000;
  return new Date(istNoon - IST_OFFSET_MS);
}

const BOARD_LABEL: Record<string, { en: string; hi: string }> = {
  JNVST: { en: "JNVST", hi: "जेएनवीएसटी" },
  AISSEE: { en: "AISSEE", hi: "एआईएसएसईई" },
  RMS: { en: "RMS", hi: "आरएमएस" },
};

async function upsertSprint(templateSlug: string, startTime: Date) {
  const template = await prisma.examTemplate.findUniqueOrThrow({ where: { slug: templateSlug } });
  const endTime = new Date(startTime.getTime() + template.durationMinutes * 60 * 1000);
  const board = BOARD_LABEL[template.examType] ?? { en: template.examType, hi: template.examType };

  const existing = await prisma.nationalSprint.findFirst({
    where: { examTemplateId: template.id, startTime },
  });
  const data = {
    title: {
      en: `${board.en} Class ${template.classLevel} National Test`,
      hi: `${board.hi} कक्षा ${template.classLevel} राष्ट्रीय परीक्षा`,
    } as Prisma.InputJsonValue,
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
}

// Every board, both class tiers — full Class 6 / Class 9 parity, per
// LIVE_MOCK_TEMPLATE_SLUGS in jnvstMockService.ts (the same 6 templates
// the rest of the live-mock system already knows how to assemble from).
const DUAL_TRACK_TEMPLATE_SLUGS = [
  "jnvst-class-6",
  "jnvst-class-9",
  "aissee-class-6",
  "aissee-class-9",
  "rms-class-6",
  "rms-class-9",
];

async function main() {
  const now = new Date();
  const nextSunday = nextSundayNoonIst(now);

  for (const slug of DUAL_TRACK_TEMPLATE_SLUGS) {
    await upsertSprint(slug, nextSunday);
  }

  // A currently-ACTIVE sprint (JNVST Class 6, since its template is
  // lighter-weight for manual testing) — already open, closes soon.
  await upsertSprint("jnvst-class-6", new Date(now.getTime() - 5 * 60 * 1000));

  console.log(
    `Sprints seeded: ${DUAL_TRACK_TEMPLATE_SLUGS.length} for next Sunday (${nextSunday.toISOString()}) plus 1 active test sprint.`
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
