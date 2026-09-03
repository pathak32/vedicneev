import { NextResponse } from "next/server";
import { InvalidBatchSizeError, prisma, publishNextDraftBatch } from "@vedicneev/db";

export const dynamic = "force-dynamic";

interface PublishBatchBody {
  count?: number;
}

export async function POST(request: Request) {
  let body: PublishBatchBody = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const result = await publishNextDraftBatch(prisma, body.count);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof InvalidBatchSizeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not publish the batch." }, { status: 500 });
  }
}
