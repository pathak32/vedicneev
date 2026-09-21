/**
 * Pricing configuration for apps/omrtest's institutional billing — pure
 * data, no I/O, mirroring entitlements.ts's PLAN_CONFIG convention so it's
 * safe to unit test and reuse from any layer (API route or client UI)
 * without duplication. Prices/credit grants below are a first-pass
 * business figure, not a confirmed rate card — update here (the single
 * source both checkout and the billing UI read from) when real pricing is
 * decided; nothing else needs to change.
 */

export type PaidInstituteTier = "STARTER" | "GROWTH";

export interface InstituteTierConfig {
  tier: PaidInstituteTier;
  label: string;
  priceInr: number;
  tagline: string;
  /** Scans granted per 30-day period at this tier. */
  monthlyCreditGrant: number;
  features: string[];
}

/** How long one paid period lasts after a successful charge, in ms — this is a one-time-Order-per-period charge (see InstituteSubscription's schema comment), not a Razorpay recurring mandate, so nothing auto-renews; the institute checks out again for the next period. */
export const INSTITUTE_SUBSCRIPTION_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

export const INSTITUTE_TIER_CONFIG: Record<PaidInstituteTier, InstituteTierConfig> = {
  STARTER: {
    tier: "STARTER",
    label: "Starter",
    priceInr: 4999,
    tagline: "For a single branch running regular batches",
    monthlyCreditGrant: 300,
    features: ["300 scan credits included per month", "Full analytics & Mistake Vault", "WhatsApp scorecards"],
  },
  GROWTH: {
    tier: "GROWTH",
    label: "Growth",
    priceInr: 11999,
    tagline: "For multi-branch academies scaling up",
    monthlyCreditGrant: 1000,
    features: [
      "1,000 scan credits included per month",
      "Everything in Starter",
      "Priority support through peak exam season",
    ],
  },
};

export interface CreditTopupBundle {
  id: string;
  credits: number;
  priceInr: number;
}

/** Credits never expire (see InstituteCreditLedger's schema comment) — a top-up is a flat one-time purchase, independent of the subscription tier's own monthly grant. Bundle sizes match the existing marketing copy (PricingTiers.tsx's "500, 1,000, or 2,000 scans"). */
export const CREDIT_TOPUP_BUNDLES: Record<string, CreditTopupBundle> = {
  TOPUP_500: { id: "TOPUP_500", credits: 500, priceInr: 3999 },
  TOPUP_1000: { id: "TOPUP_1000", credits: 1000, priceInr: 6999 },
  TOPUP_2000: { id: "TOPUP_2000", credits: 2000, priceInr: 11999 },
};
