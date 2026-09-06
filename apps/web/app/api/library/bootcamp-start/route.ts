import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { resolveCheckoutUser } from "@/lib/auth/resolveCheckoutUser";

export const dynamic = "force-dynamic";

interface BootcampStartBody {
  purchaseId?: string;
  phone?: string;
}

/** Sets Purchase.bootcampStartedAt on first visit to the bootcamp card — day 1 unlocks from that moment, not from purchase time, so a student who buys but starts a week later still gets the full 30 days. Idempotent: a purchase that's already started just returns its existing start time unchanged. */
export async function POST(request: Request) {
  let body: BootcampStartBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.purchaseId) {
    return NextResponse.json({ error: "purchaseId is required." }, { status: 400 });
  }

  const userResult = await resolveCheckoutUser(body.phone, false);
  if (!userResult.ok) {
    return NextResponse.json({ error: userResult.error }, { status: userResult.status });
  }

  const purchase = await prisma.purchase.findUnique({ where: { id: body.purchaseId } });
  if (!purchase || purchase.userId !== userResult.user.id || purchase.status !== "PAID") {
    return NextResponse.json({ error: "Purchase not found." }, { status: 404 });
  }

  if (purchase.bootcampStartedAt) {
    return NextResponse.json({ bootcampStartedAt: purchase.bootcampStartedAt.toISOString() });
  }

  const updated = await prisma.purchase.update({
    where: { id: purchase.id },
    data: { bootcampStartedAt: new Date() },
  });

  return NextResponse.json({ bootcampStartedAt: updated.bootcampStartedAt!.toISOString() });
}
