import { NextResponse } from "next/server";
import { prisma, scheduleWeeklySprints } from "@vedicneev/db";

/**
 * Vercel Cron target (see vercel.json's "crons" entry) that keeps National
 * Sprints scheduled without anyone remembering to re-run
 * prisma/seed-sprints.ts by hand — that script's manual-testing-only extra
 * "already active" sprint is deliberately NOT reproduced here; production
 * only ever gets the real next-Sunday schedule. Runs weekly, but calling it
 * more than once in the same week is harmless: scheduleWeeklySprints
 * upserts by (examTemplateId, startTime).
 *
 * Vercel signs its own Cron requests with `Authorization: Bearer
 * ${CRON_SECRET}` when CRON_SECRET is set on the project — this route
 * rejects anything else so it can't be triggered by an arbitrary caller.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured on the server." }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { scheduledCount, nextSunday } = await scheduleWeeklySprints(prisma, new Date());

  return NextResponse.json({ success: true, scheduledCount, nextSunday: nextSunday.toISOString() });
}
