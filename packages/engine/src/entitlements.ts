/**
 * Pricing configuration and entitlement rules for the subscription paywall.
 * Pure logic — no I/O, no knowledge of Razorpay or the database — so it's
 * safe to unit test exhaustively and reuse from any layer (API route,
 * client store, or a future server action) without duplication.
 */

export type SubscriptionPlanId = "FREE_EXPLORER" | "EXAM_PASS" | "VEDIC_ALL_ACCESS";
export type PaidPlanId = Exclude<SubscriptionPlanId, "FREE_EXPLORER">;
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";
export type EntitlementExamType = "JNVST" | "AISSEE" | "RMS" | "DPS";

export interface ParentSubscription {
  plan: SubscriptionPlanId;
  /** Null for FREE_EXPLORER (n/a) and VEDIC_ALL_ACCESS (all exams included). */
  targetExam: EntitlementExamType | null;
  status: SubscriptionStatus;
  /** Epoch ms; null means no expiry. */
  validUntil: number | null;
}

export interface PlanConfig {
  id: SubscriptionPlanId;
  name: string;
  priceInr: number;
  tagline: string;
  features: string[];
  /** Only meaningful for FREE_EXPLORER. */
  freeMockTestLimit?: number;
}

export const FREE_MOCK_TEST_LIMIT = 1;

export const PLAN_CONFIG: Record<SubscriptionPlanId, PlanConfig> = {
  FREE_EXPLORER: {
    id: "FREE_EXPLORER",
    name: "Free Explorer",
    priceInr: 0,
    tagline: "Try before you commit",
    freeMockTestLimit: FREE_MOCK_TEST_LIMIT,
    features: ["1 free full-length mock test", "Basic score summary", "Speed-hack previews"],
  },
  EXAM_PASS: {
    id: "EXAM_PASS",
    name: "Exam Pass",
    priceInr: 599,
    tagline: "Full prep for one exam",
    features: [
      "Unlimited mock tests for your chosen exam",
      "OMR scanner for that exam",
      "Full diagnostic reports",
    ],
  },
  VEDIC_ALL_ACCESS: {
    id: "VEDIC_ALL_ACCESS",
    name: "Vedic All-Access",
    priceInr: 1499,
    tagline: "Everything, every exam, every child",
    features: [
      "Unlimited mock tests across all exams",
      "OMR scanner for every exam",
      "Full Mistake Vault remediation",
      "Vedic speed-math clinics",
      "Covers all student sub-profiles",
    ],
  },
};

function isSubscriptionActive(
  subscription: ParentSubscription | null,
  now: number
): subscription is ParentSubscription {
  if (!subscription) return false;
  if (subscription.status !== "ACTIVE") return false;
  if (subscription.validUntil !== null && subscription.validUntil <= now) return false;
  return true;
}

export type AccessReason =
  | "ALL_ACCESS"
  | "EXAM_PASS_MATCH"
  | "EXAM_PASS_WRONG_EXAM"
  | "FREE_TIER_AVAILABLE"
  | "FREE_TIER_EXHAUSTED"
  | "REQUIRES_EXAM_PASS_OR_ALL_ACCESS"
  | "REQUIRES_ALL_ACCESS";

export interface AccessResult {
  allowed: boolean;
  reason: AccessReason;
  requiresUpgrade: boolean;
  /** Plans that would unlock this — for the paywall's call-to-action. */
  suggestedPlans: PaidPlanId[];
}

function allow(reason: AccessReason): AccessResult {
  return { allowed: true, reason, requiresUpgrade: false, suggestedPlans: [] };
}

function deny(reason: AccessReason, suggestedPlans: PaidPlanId[]): AccessResult {
  return { allowed: false, reason, requiresUpgrade: true, suggestedPlans };
}

/**
 * Can this parent start/take a mock test for `targetExam`?
 * - Vedic All-Access: always.
 * - Exam Pass: only for the exam it was purchased for.
 * - Otherwise (no plan, expired, cancelled, or a non-matching Exam Pass
 *   with no free attempts left): falls back to the Free Explorer allowance.
 */
export function checkExamAccess(
  subscription: ParentSubscription | null,
  targetExam: EntitlementExamType,
  freeMockTestsUsed: number,
  now: number = Date.now()
): AccessResult {
  if (isSubscriptionActive(subscription, now)) {
    if (subscription.plan === "VEDIC_ALL_ACCESS") return allow("ALL_ACCESS");
    if (subscription.plan === "EXAM_PASS") {
      if (subscription.targetExam === targetExam) return allow("EXAM_PASS_MATCH");
      return deny("EXAM_PASS_WRONG_EXAM", ["EXAM_PASS", "VEDIC_ALL_ACCESS"]);
    }
  }

  if (freeMockTestsUsed < FREE_MOCK_TEST_LIMIT) return allow("FREE_TIER_AVAILABLE");
  return deny("FREE_TIER_EXHAUSTED", ["EXAM_PASS", "VEDIC_ALL_ACCESS"]);
}

/** Can this parent use the OMR scanner for `targetExam`? (Exam Pass for that exam, or All-Access — no free tier.) */
export function checkOmrScannerAccess(
  subscription: ParentSubscription | null,
  targetExam: EntitlementExamType,
  now: number = Date.now()
): AccessResult {
  if (isSubscriptionActive(subscription, now)) {
    if (subscription.plan === "VEDIC_ALL_ACCESS") return allow("ALL_ACCESS");
    if (subscription.plan === "EXAM_PASS" && subscription.targetExam === targetExam) {
      return allow("EXAM_PASS_MATCH");
    }
  }
  return deny("REQUIRES_EXAM_PASS_OR_ALL_ACCESS", ["EXAM_PASS", "VEDIC_ALL_ACCESS"]);
}

/** Full Mistake Vault remediation (detailed solutions) — Vedic All-Access only. */
export function checkMistakeVaultAccess(
  subscription: ParentSubscription | null,
  now: number = Date.now()
): AccessResult {
  if (isSubscriptionActive(subscription, now) && subscription.plan === "VEDIC_ALL_ACCESS") {
    return allow("ALL_ACCESS");
  }
  return deny("REQUIRES_ALL_ACCESS", ["VEDIC_ALL_ACCESS"]);
}

/** Vedic speed-math clinics — Vedic All-Access only. */
export function checkSpeedHackClinicAccess(
  subscription: ParentSubscription | null,
  now: number = Date.now()
): AccessResult {
  if (isSubscriptionActive(subscription, now) && subscription.plan === "VEDIC_ALL_ACCESS") {
    return allow("ALL_ACCESS");
  }
  return deny("REQUIRES_ALL_ACCESS", ["VEDIC_ALL_ACCESS"]);
}
