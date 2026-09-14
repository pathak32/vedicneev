import type { Prisma, PrismaClient } from "@prisma/client";

/**
 * Schedules the recurring dual-track (Class 6 + Class 9) National Sprints
 * for every board (JNVST/AISSEE/RMS) on the next upcoming Sunday. Shared by
 * prisma/seed-sprints.ts (manual/local re-seeding) and
 * apps/web/app/api/cron/seed-sprints/route.ts (the Vercel Cron that keeps
 * this running in production without anyone remembering to re-run the seed
 * script by hand) so the two never drift apart.
 *
 * Deliberately excludes the standalone seed script's extra "already-active,
 * closing soon" JNVST Class 6 test sprint — that's a manual-testing
 * convenience for local/demo use, not something production should keep
 * fabricating for real visitors every week.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The Sunday after `from` (never `from` itself, even if `from` is already a Sunday) at 12:00 (noon) IST. */
export function nextSundayNoonIst(from: Date): Date {
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

// Every board, both class tiers — full Class 6 / Class 9 parity, per
// LIVE_MOCK_TEMPLATE_SLUGS in jnvstMockService.ts (the same 6 templates
// the rest of the live-mock system already knows how to assemble from).
export const DUAL_TRACK_TEMPLATE_SLUGS = [
  "jnvst-class-6",
  "jnvst-class-9",
  "aissee-class-6",
  "aissee-class-9",
  "rms-class-6",
  "rms-class-9",
];

async function upsertSprint(prisma: PrismaClient, templateSlug: string, startTime: Date): Promise<void> {
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

export interface ScheduleWeeklySprintsResult {
  scheduledCount: number;
  nextSunday: Date;
}

/**
 * Upserts all 6 dual-track sprints for the next upcoming Sunday relative to
 * `now`. Idempotent — matches existing rows by (examTemplateId, startTime),
 * so calling this more than once in the same week just re-confirms the same
 * rows instead of duplicating them.
 */
export async function scheduleWeeklySprints(prisma: PrismaClient, now: Date): Promise<ScheduleWeeklySprintsResult> {
  const nextSunday = nextSundayNoonIst(now);
  for (const slug of DUAL_TRACK_TEMPLATE_SLUGS) {
    await upsertSprint(prisma, slug, nextSunday);
  }
  return { scheduledCount: DUAL_TRACK_TEMPLATE_SLUGS.length, nextSunday };
}
