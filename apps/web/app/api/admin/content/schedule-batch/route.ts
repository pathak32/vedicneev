import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

interface BatchBody {
  startDate?: string;
  times?: string[];
}

/** Default daily slots, IST — two posts per day. */
const DEFAULT_TIMES = ["09:00", "17:00"];

/**
 * Spreads every DRAFT/APPROVED block across consecutive days, one slot per
 * entry in `times` per day, starting on `startDate` (YYYY-MM-DD, IST). Blocks
 * alternate between the two brands so a day's two posts aren't the same
 * brand when both have drafts left. Nothing is posted here — the
 * /api/cron/publish-linkedin cron picks each block up when its slot arrives.
 */
export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: BatchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const times = body.times?.length ? body.times : DEFAULT_TIMES;
  if (!body.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.startDate)) {
    return NextResponse.json({ error: "startDate (YYYY-MM-DD) is required." }, { status: 400 });
  }
  if (times.some((t) => !/^\d{2}:\d{2}$/.test(t))) {
    return NextResponse.json({ error: "times must be HH:mm strings." }, { status: 400 });
  }

  const drafts = await prisma.contentBlock.findMany({
    where: { status: { in: ["DRAFT", "APPROVED"] } },
    orderBy: { createdAt: "asc" },
  });
  if (drafts.length === 0) return NextResponse.json({ error: "No draft blocks to schedule." }, { status: 400 });

  const mind = drafts.filter((b) => b.brand === "VEDIC_MIND");
  const neev = drafts.filter((b) => b.brand === "VEDIC_NEEV");
  const ordered: typeof drafts = [];
  while (mind.length || neev.length) {
    const m = mind.shift();
    if (m) ordered.push(m);
    const n = neev.shift();
    if (n) ordered.push(n);
  }

  // Walk day by day through the daily slots, skipping any slot already in the
  // past (e.g. scheduling at 2 PM with a 9:00 AM slot) so a block is never
  // scheduled for a time that has already gone by.
  const now = Date.now();
  const sortedTimes = [...times].sort();
  const slots: { block: (typeof ordered)[number]; scheduledFor: Date }[] = [];
  for (let dayOffset = 0; slots.length < ordered.length && dayOffset < 366; dayOffset++) {
    // Plain calendar-date arithmetic in UTC, then re-attached to the IST offset below.
    const day = new Date(`${body.startDate}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() + dayOffset);
    const istDate = day.toISOString().slice(0, 10);
    for (const time of sortedTimes) {
      if (slots.length >= ordered.length) break;
      const scheduledFor = new Date(`${istDate}T${time}:00+05:30`);
      if (scheduledFor.getTime() <= now) continue;
      const block = ordered[slots.length];
      if (!block) break;
      slots.push({ block, scheduledFor });
    }
  }

  await prisma.$transaction(
    slots.map(({ block, scheduledFor }) =>
      prisma.contentBlock.update({ where: { id: block.id }, data: { status: "SCHEDULED", scheduledFor } })
    )
  );

  return NextResponse.json({
    success: true,
    scheduled: slots.length,
    firstSlot: slots[0]?.scheduledFor.toISOString(),
    lastSlot: slots[slots.length - 1]?.scheduledFor.toISOString(),
  });
}
