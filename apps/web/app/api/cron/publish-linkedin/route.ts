import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { composeLinkedInPost } from "@/lib/linkedin/composePost";
import { publishLinkedInPost } from "@/lib/linkedin/linkedinService";

/**
 * Vercel Cron target (see vercel.json) that posts SCHEDULED content blocks
 * whose scheduledFor time has arrived. Unlike the manual /api/linkedin/publish
 * route, there is deliberately NO mock fallback here: with no LinkedIn
 * credentials configured it publishes nothing and leaves every block
 * SCHEDULED, so an unattended run can never mark a post PUBLISHED that
 * never actually went out.
 *
 * Posts at most MAX_PER_RUN blocks per invocation; a failed post stays
 * SCHEDULED and is retried on the next run.
 */
export const dynamic = "force-dynamic";

const MAX_PER_RUN = 1;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured on the server." }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!process.env.LINKEDIN_ACCESS_TOKEN || !process.env.LINKEDIN_AUTHOR_URN) {
    return NextResponse.json({ success: false, published: 0, error: "LinkedIn credentials not configured — nothing posted." });
  }

  const due = await prisma.contentBlock.findMany({
    where: { status: "SCHEDULED", scheduledFor: { lte: new Date() } },
    orderBy: { scheduledFor: "asc" },
    take: MAX_PER_RUN,
  });

  const results: { id: string; ok: boolean; error?: string }[] = [];
  for (const block of due) {
    const result = await publishLinkedInPost(composeLinkedInPost(block));
    if (!result.success) {
      results.push({ id: block.id, ok: false, error: result.error });
      continue;
    }
    await prisma.contentBlock.update({
      where: { id: block.id },
      data: { status: "PUBLISHED", publishedAt: new Date(), linkedinPostUrn: result.postUrn },
    });
    results.push({ id: block.id, ok: true });
  }

  return NextResponse.json({ success: true, published: results.filter((r) => r.ok).length, results });
}
