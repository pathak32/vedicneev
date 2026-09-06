import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { resolveCheckoutUser } from "@/lib/auth/resolveCheckoutUser";
import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";

// Phone is personal data — accepted in a POST body, never a query string.
export const dynamic = "force-dynamic";

interface LibraryBody {
  phone?: string;
}

export async function POST(request: Request) {
  let body: LibraryBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Read-only lookup (createIfMissing: false) — viewing a library must
  // never silently create a User row for a phone that's never checked out.
  const userResult = await resolveCheckoutUser(body.phone, false);
  if (!userResult.ok) {
    // A not-found phone just means "no purchases yet," not an error the UI
    // needs to surface — an empty library is a valid, expected state.
    if (userResult.status === 404) return NextResponse.json({ purchases: [] });
    return NextResponse.json({ error: userResult.error }, { status: userResult.status });
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId: userResult.user.id, status: { in: ["PAID", "PENDING"] } },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    purchases: purchases.map((p) => ({
      id: p.id,
      status: p.status,
      amountPaid: p.amountPaid,
      bootcampStartedAt: p.bootcampStartedAt ? p.bootcampStartedAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      product: {
        id: p.product.id,
        title: localize(p.product.title as Multilingual, "en"),
        description: localize(p.product.description as Multilingual, "en"),
        productType: p.product.productType,
        targetExam: p.product.targetExam,
        targetClass: p.product.targetClass,
        fileUrl: p.product.fileUrl,
      },
    })),
  });
}
