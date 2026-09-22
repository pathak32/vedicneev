import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";
import { composeLinkedInPost } from "@/lib/linkedin/composePost";
import { publishLinkedInPost, type PublishLinkedInPostResult } from "@/lib/linkedin/linkedinService";

export const dynamic = "force-dynamic";

interface PublishBody {
  id?: string;
}

/**
 * "Publish to LinkedIn" from /admin/content. A real dispatch, not a
 * preview — gated behind the same admin session every other /api/admin/*
 * route requires, even though this route lives outside that path prefix.
 */
export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: PublishBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const block = await prisma.contentBlock.findUnique({ where: { id: body.id } });
  if (!block) return NextResponse.json({ error: "Content block not found." }, { status: 404 });

  if (block.status === "PUBLISHED") {
    return NextResponse.json({ success: true, block, alreadyPublished: true });
  }

  const text = composeLinkedInPost(block);
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN;

  // Same mock-fallback convention as /api/whatsapp/send-report: no real
  // LinkedIn credentials configured in this project yet, so log the exact
  // payload and proceed as if the dispatch succeeded rather than failing
  // the whole admin action.
  const result: PublishLinkedInPostResult =
    accessToken && authorUrn
      ? await publishLinkedInPost(text)
      : (() => {
          // eslint-disable-next-line no-console
          console.info("[mock LinkedIn] Not actually published. Post text:", text);
          return { success: true, postUrn: `urn:li:share:mock${Date.now()}` };
        })();

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "LinkedIn publish failed." }, { status: 502 });
  }

  const updated = await prisma.contentBlock.update({
    where: { id: block.id },
    data: { status: "PUBLISHED", publishedAt: new Date(), linkedinPostUrn: result.postUrn },
  });

  return NextResponse.json({ success: true, block: updated, mock: !accessToken || !authorUrn });
}
