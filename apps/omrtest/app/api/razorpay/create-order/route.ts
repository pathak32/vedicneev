import { NextResponse } from "next/server";
import { CREDIT_TOPUP_BUNDLES, INSTITUTE_TIER_CONFIG, type PaidInstituteTier } from "@vedicneev/engine";

import { getInstituteSession } from "@/lib/institute/session";
import { createRazorpayOrder } from "@/lib/payments/razorpayServer";

// Reads the request's cookie jar via getInstituteSession — never prerenderable.
export const dynamic = "force-dynamic";

interface CreateOrderBody {
  kind?: "subscription" | "credit_topup";
  tier?: string;
  topupId?: string;
}

export async function POST(request: Request) {
  const session = await getInstituteSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: CreateOrderBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.kind === "subscription") {
    const tier = body.tier as PaidInstituteTier | undefined;
    if (!tier || !(tier in INSTITUTE_TIER_CONFIG)) {
      return NextResponse.json({ error: "tier must be STARTER or GROWTH." }, { status: 400 });
    }
    const plan = INSTITUTE_TIER_CONFIG[tier];

    try {
      const order = await createRazorpayOrder({
        amountInr: plan.priceInr,
        receipt: `inst_sub_${session.institute.id}_${Date.now()}`,
        // Echoed back on the payment entity — the webhook's only way to
        // know which institute/tier this was for (see
        // instituteBillingService.ts). All values must be strings.
        notes: { kind: "institute_subscription", instituteId: session.institute.id, tier },
      });
      return NextResponse.json({ ...order, kind: "subscription", tier, amountInr: plan.priceInr });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to create order." },
        { status: 502 }
      );
    }
  }

  if (body.kind === "credit_topup") {
    const bundle = body.topupId ? CREDIT_TOPUP_BUNDLES[body.topupId] : undefined;
    if (!bundle) {
      return NextResponse.json({ error: "Invalid topupId." }, { status: 400 });
    }

    try {
      const order = await createRazorpayOrder({
        amountInr: bundle.priceInr,
        receipt: `inst_topup_${session.institute.id}_${Date.now()}`,
        notes: { kind: "institute_credit_topup", instituteId: session.institute.id, topupId: bundle.id },
      });
      return NextResponse.json({
        ...order,
        kind: "credit_topup",
        topupId: bundle.id,
        credits: bundle.credits,
        amountInr: bundle.priceInr,
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to create order." },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ error: "kind must be 'subscription' or 'credit_topup'." }, { status: 400 });
}
