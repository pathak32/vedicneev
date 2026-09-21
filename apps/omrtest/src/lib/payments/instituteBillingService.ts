import { prisma } from "@vedicneev/db";
import { CREDIT_TOPUP_BUNDLES, INSTITUTE_SUBSCRIPTION_PERIOD_MS, INSTITUTE_TIER_CONFIG, type PaidInstituteTier } from "@vedicneev/engine";

/**
 * The two ways a captured payment updates an institute's billing state —
 * called from BOTH app/api/razorpay/verify-payment (the client's own
 * post-checkout confirmation) and app/api/webhook/payment (the
 * server-to-server safety net for a tab closed/reloaded mid-checkout), so
 * whichever channel fires first does the write and the other is a no-op.
 * Kept here as shared functions (rather than duplicated inline in each
 * route, the way apps/web's two Subscription-creation call sites are)
 * specifically so the two entry points can't drift apart on what "apply
 * this payment" actually means.
 */

/** Idempotent: returns false (no write) if this exact payment was already applied to this institute's subscription. */
export async function applyInstituteSubscriptionPayment(input: {
  instituteId: string;
  tier: PaidInstituteTier;
  orderId: string;
  paymentId: string;
}): Promise<boolean> {
  const existing = await prisma.instituteSubscription.findUnique({ where: { instituteId: input.instituteId } });
  if (existing?.razorpayPaymentId === input.paymentId) return false;

  const tierConfig = INSTITUTE_TIER_CONFIG[input.tier];
  const now = new Date();
  const periodFields = {
    tier: input.tier,
    monthlyCreditGrant: tierConfig.monthlyCreditGrant,
    currentPeriodStart: now,
    currentPeriodEnd: new Date(now.getTime() + INSTITUTE_SUBSCRIPTION_PERIOD_MS),
    status: "ACTIVE" as const,
    razorpayOrderId: input.orderId,
    razorpayPaymentId: input.paymentId,
  };

  await prisma.instituteSubscription.upsert({
    where: { instituteId: input.instituteId },
    create: { instituteId: input.instituteId, ...periodFields },
    update: periodFields,
  });
  return true;
}

/** Idempotent: returns false (no write) if a ledger row for this exact payment already exists. */
export async function applyInstituteCreditTopup(input: {
  instituteId: string;
  topupId: string;
  orderId: string;
  paymentId: string;
}): Promise<boolean> {
  const existing = await prisma.instituteCreditLedger.findFirst({ where: { razorpayPaymentId: input.paymentId } });
  if (existing) return false;

  const bundle = CREDIT_TOPUP_BUNDLES[input.topupId];
  if (!bundle) return false;

  await prisma.instituteCreditLedger.create({
    data: {
      instituteId: input.instituteId,
      delta: bundle.credits,
      reason: "TOPUP_PURCHASE",
      razorpayOrderId: input.orderId,
      razorpayPaymentId: input.paymentId,
    },
  });
  return true;
}
