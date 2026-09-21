import { NextResponse } from "next/server";
import { prisma, type Subscription } from "@vedicneev/db";
import type { EntitlementExamType, PaidPlanId } from "@vedicneev/engine";

import { createSupabaseServerClient, isSupabaseAuthConfigured, resolveDbUser, toAppPhone } from "@vedicneev/auth";

import type { SubscriptionStatusResponse } from "@/lib/payments/types";

// Reads the request's cookie jar (Supabase auth) / a query param, and hits
// the DB — never cache or statically collect this route.
export const dynamic = "force-dynamic";

/**
 * The server-side reconciliation endpoint CheckoutFlow.tsx's diagnosis
 * called for: useSubscriptionStore's localStorage mirror is the only thing
 * every entitlement check (checkPracticeAccess, checkMistakeVaultAccess,
 * paywalls) actually reads. If that mirror is never written — the browser
 * closed or reloaded between Razorpay's success callback and
 * verify-payment finishing — a customer whose payment DID verify and DID
 * write a real Subscription row sees "Buy Now" again forever, because
 * nothing ever asks the database. This route is that ask: a client-side
 * SubscriptionReconciler (src/components/payments/SubscriptionReconciler.tsx)
 * calls it once per session for a signed-in user and merges the result back
 * into the store when the DB has an active subscription the store doesn't.
 */
export async function GET(request: Request) {
  let dbUser: { id: string } | null = null;

  if (isSupabaseAuthConfigured()) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    if (authUser?.phone) {
      dbUser = await resolveDbUser({ id: authUser.id, phone: toAppPhone(authUser.phone) });
    }
  } else {
    const phone = new URL(request.url).searchParams.get("phone");
    if (phone) {
      // Read-only lookup, unlike verify-payment's upsert — a user who has
      // never paid has no Subscription row to find either way, so there's
      // nothing to gain from creating one here.
      dbUser = await prisma.user.findUnique({ where: { phone }, select: { id: true } });
    }
  }

  if (!dbUser) {
    return NextResponse.json<SubscriptionStatusResponse>({ subscription: null });
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      parentId: dbUser.id,
      status: "ACTIVE",
      OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json<SubscriptionStatusResponse>({
    subscription: subscription ? toVerifiedSubscription(subscription) : null,
  });
}

/** Same narrowing as verify-payment's toVerifiedSubscription — this route only ever surfaces a currently-ACTIVE row, which by construction is EXAM_PASS or VEDIC_ALL_ACCESS, never FREE_EXPLORER. */
function toVerifiedSubscription(row: Subscription) {
  return {
    id: row.id,
    parentId: row.parentId,
    plan: row.plan as PaidPlanId,
    targetExam: row.targetExam as EntitlementExamType | null,
    amountPaid: row.amountPaid,
    razorpayOrderId: row.razorpayOrderId ?? "",
    razorpayPaymentId: row.razorpayPaymentId ?? "",
    validUntil: (row.validUntil ?? new Date()).toISOString(),
  };
}
