/**
 * Freemium gating for typingtest.vedicneev.com. Pure logic, mirrors the
 * shape of entitlements.ts's AccessResult exactly so callers already
 * familiar with that paywall pattern don't need a second mental model.
 * A user with no TypingSubscription row at all is FREE by default — see
 * TypingSubscription's own schema comment.
 */

export type TypingSubscriptionPlanId = "FREE" | "PRO";
export type TypingSubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface TypingSubscriptionState {
  plan: TypingSubscriptionPlanId;
  status: TypingSubscriptionStatus;
  /** Epoch ms; null means no expiry. */
  validUntil: number | null;
}

/** Free-tier passages a signed-in user may attempt per calendar day before Pro is required. */
export const FREE_DAILY_PASSAGE_LIMIT = 3;

export type TypingAccessReason = "PRO_ACTIVE" | "FREE_TIER_AVAILABLE" | "FREE_TIER_EXHAUSTED";

export interface TypingAccessResult {
  allowed: boolean;
  reason: TypingAccessReason;
  requiresUpgrade: boolean;
}

function isProActive(subscription: TypingSubscriptionState | null, now: number): boolean {
  if (!subscription) return false;
  if (subscription.plan !== "PRO") return false;
  if (subscription.status !== "ACTIVE") return false;
  if (subscription.validUntil !== null && subscription.validUntil <= now) return false;
  return true;
}

/** Can this user start another timed passage today? Pro: always. Free: up to FREE_DAILY_PASSAGE_LIMIT, counted by the caller as today's TypingAttempt rows for this user. */
export function checkTypingPassageAccess(
  subscription: TypingSubscriptionState | null,
  freePassagesUsedToday: number,
  now: number = Date.now()
): TypingAccessResult {
  if (isProActive(subscription, now)) {
    return { allowed: true, reason: "PRO_ACTIVE", requiresUpgrade: false };
  }
  if (freePassagesUsedToday < FREE_DAILY_PASSAGE_LIMIT) {
    return { allowed: true, reason: "FREE_TIER_AVAILABLE", requiresUpgrade: false };
  }
  return { allowed: false, reason: "FREE_TIER_EXHAUSTED", requiresUpgrade: true };
}
