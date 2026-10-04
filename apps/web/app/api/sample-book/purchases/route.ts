import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";

// Scoped to the real session (getAuthenticatedUser), not a client-supplied
// phone — this feeds the scan page's product picker, which must only ever
// list books this exact signed-in account actually paid for.
export const dynamic = "force-dynamic";

/**
 * This account's scannable sample-paper-book purchases — a PAID purchase
 * of a MOCK_SERIES product that actually has a file (the sample-paper-book
 * packaging script always sets one; the seeded live-access "Mock Series"
 * row deliberately doesn't, see library/page.tsx's identical fileUrl
 * distinction). Used only to populate /dashboard/scan's dropdown, not as
 * an entitlement check — /api/sample-book/scan re-checks the specific
 * productId itself before scoring anything.
 */
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const purchases = await prisma.purchase.findMany({
    where: {
      userId: user.id,
      status: "PAID",
      product: { productType: "MOCK_SERIES", fileUrl: { not: null } },
    },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    products: purchases.map((p) => ({
      id: p.product.id,
      title: localize(p.product.title as Multilingual, "en"),
    })),
  });
}
