import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

// Read-only polling endpoint the checkout dialog uses while waiting for
// /api/webhook/payment to flip a Purchase from PENDING to PAID. purchaseIds
// are opaque cuids (not personal data), so a query string is fine here.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("purchaseIds");
  if (!idsParam) {
    return NextResponse.json({ error: "purchaseIds is required." }, { status: 400 });
  }

  const ids = idsParam.split(",").filter(Boolean);
  const purchases = await prisma.purchase.findMany({
    where: { id: { in: ids } },
    select: { id: true, status: true },
  });

  const allPaid = purchases.length > 0 && purchases.every((p) => p.status === "PAID");
  const anyFailed = purchases.some((p) => p.status === "FAILED");

  return NextResponse.json({
    purchases,
    status: allPaid ? "PAID" : anyFailed ? "FAILED" : "PENDING",
  });
}
