import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";
import { applyPromoDiscount } from "@vedicneev/engine";

import { resolveCheckoutUser } from "@/lib/auth/resolveCheckoutUser";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";
import { createRazorpayOrder } from "@/lib/payments/razorpayServer";

// Creates a Razorpay order and PENDING Purchase row(s) — never cache or
// statically collect this route.
export const dynamic = "force-dynamic";

interface CheckoutBody {
  /** productIds[0] is the primary product a promo code discounts; any further ids are 1-click order-bump add-ons (e.g. the OMR Kit), charged at their own full sellingPrice. */
  productIds?: string[];
  promoCode?: string;
  phone?: string;
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const productIds = body.productIds?.filter((id): id is string => typeof id === "string" && id.length > 0);
  if (!productIds || productIds.length === 0) {
    return NextResponse.json({ error: "productIds must be a non-empty array." }, { status: 400 });
  }

  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "One or more products aren't available." }, { status: 400 });
  }
  const productById = new Map(products.map((p) => [p.id, p]));
  const primaryProductId = productIds[0]!;
  const primaryProduct = productById.get(primaryProductId)!;

  let promo: { id: string; code: string; discountType: "PERCENTAGE" | "FIXED"; discountValue: number } | null = null;
  if (body.promoCode) {
    const code = body.promoCode.trim().toUpperCase();
    const found = await prisma.promoCode.findUnique({ where: { code } });
    if (!found || !found.isActive) {
      return NextResponse.json({ error: "This promo code isn't valid." }, { status: 400 });
    }
    promo = found;
  }

  // Price is derived server-side from the DB rows above, never trusted
  // from the client — a tampered request body can't discount an order.
  const primaryFinalPrice = applyPromoDiscount(primaryProduct.sellingPrice, promo);
  const bumpProducts = productIds.slice(1).map((id) => productById.get(id)!);
  const bumpTotal = bumpProducts.reduce((sum, p) => sum + p.sellingPrice, 0);
  const totalAmountInr = primaryFinalPrice + bumpTotal;

  // A phone (or, once Supabase auth is actually wired up, a signed-in
  // session) resolves to a real user immediately, same as before. With
  // neither, checkout proceeds as a guest — userId stays null until
  // POST /api/checkout/guest-contact links (or creates) a real User after
  // payment succeeds. isSupabaseAuthConfigured() still forces resolution
  // even with no phone, since a Supabase session carries its own identity
  // via cookies, not this body — see resolveCheckoutUser.
  let userId: string | null = null;
  if (isSupabaseAuthConfigured() || body.phone) {
    const userResult = await resolveCheckoutUser(body.phone, true);
    if (!userResult.ok) {
      return NextResponse.json({ error: userResult.error }, { status: userResult.status });
    }
    userId = userResult.user.id;
  }

  try {
    const order = await createRazorpayOrder({
      amountInr: totalAmountInr,
      receipt: `purchase_${Date.now()}`,
    });

    const purchases = await prisma.$transaction([
      prisma.purchase.create({
        data: {
          userId,
          productId: primaryProduct.id,
          amountPaid: primaryFinalPrice,
          promoCodeId: promo?.id ?? null,
          razorpayOrderId: order.orderId,
        },
      }),
      ...bumpProducts.map((p) =>
        prisma.purchase.create({
          data: {
            userId,
            productId: p.id,
            amountPaid: p.sellingPrice,
            razorpayOrderId: order.orderId,
          },
        })
      ),
    ]);

    return NextResponse.json({
      ...order,
      amountInr: totalAmountInr,
      purchaseIds: purchases.map((p) => p.id),
      productIds,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start checkout." },
      { status: 502 }
    );
  }
}
