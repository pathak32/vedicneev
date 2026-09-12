import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";
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

  // QA bypass — re-checks getAuthenticatedAdmin() directly rather than
  // trusting the client's own /api/test-mode/status answer, since this is
  // real money-relevant data (product ownership). Every active product is
  // returned as if already paid for, with no real Purchase row needed, so
  // an admin can click through the whole Digital Knowledge Hub library
  // without a real transaction.
  if (await getAuthenticatedAdmin()) {
    const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({
      purchases: products.map((product) => ({
        id: `bypass-${product.id}`,
        status: "PAID" as const,
        amountPaid: product.sellingPrice,
        bootcampStartedAt: null,
        createdAt: product.createdAt.toISOString(),
        product: {
          id: product.id,
          title: localize(product.title as Multilingual, "en"),
          description: localize(product.description as Multilingual, "en"),
          productType: product.productType,
          targetExam: product.targetExam,
          targetClass: product.targetClass,
          fileUrl: product.fileUrl,
        },
      })),
    });
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
