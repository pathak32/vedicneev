import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

// Writes contact info onto already-created Purchase rows — never cache or
// statically collect this route.
export const dynamic = "force-dynamic";

interface GuestContactBody {
  purchaseIds?: string[];
  email?: string;
  phone?: string;
}

/**
 * Collects contact info right after a guest checkout succeeds (see
 * StoreCheckoutDialog's "success" step) — the frictionless-purchase flow's
 * whole point is that this is asked for *after* payment, not before. If
 * `phone` matches an existing User, the purchases are linked to that real
 * account (userId set) instead of staying bare guest rows; otherwise they
 * just get guestEmail/guestPhone recorded for follow-up.
 */
export async function POST(request: Request) {
  let body: GuestContactBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const purchaseIds = body.purchaseIds?.filter((id): id is string => typeof id === "string" && id.length > 0);
  if (!purchaseIds || purchaseIds.length === 0) {
    return NextResponse.json({ error: "purchaseIds must be a non-empty array." }, { status: 400 });
  }
  const email = body.email?.trim() || null;
  const phone = body.phone?.trim() || null;
  if (!email && !phone) {
    return NextResponse.json({ error: "email or phone is required." }, { status: 400 });
  }

  const purchases = await prisma.purchase.findMany({ where: { id: { in: purchaseIds } }, select: { id: true } });
  if (purchases.length !== purchaseIds.length) {
    return NextResponse.json({ error: "One or more purchases weren't found." }, { status: 404 });
  }

  const existingUser = phone ? await prisma.user.findUnique({ where: { phone } }) : null;

  await prisma.purchase.updateMany({
    where: { id: { in: purchaseIds } },
    data: {
      guestEmail: email,
      guestPhone: phone,
      ...(existingUser ? { userId: existingUser.id } : {}),
    },
  });

  return NextResponse.json({ success: true, linkedToExistingUser: Boolean(existingUser) });
}
