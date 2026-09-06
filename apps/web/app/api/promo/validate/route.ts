import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

// Read-only preview so the storefront can show "X% off applied" before the
// buyer commits to checkout — never mutates usageCount itself. That only
// happens on a confirmed PAID webhook (see app/api/webhook/payment), so a
// code can be previewed any number of times without inflating attribution.
export const dynamic = "force-dynamic";

interface ValidateBody {
  code?: string;
}

export async function POST(request: Request) {
  let body: ValidateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const code = body.code?.trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "code is required." }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.isActive) {
    return NextResponse.json({ valid: false, error: "This promo code isn't valid." }, { status: 404 });
  }

  return NextResponse.json({
    valid: true,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    influencerName: promo.influencerName,
  });
}
