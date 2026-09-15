import { describe, expect, it } from "vitest";

import { checkTypingPassageAccess, FREE_DAILY_PASSAGE_LIMIT } from "./typingEntitlements";

describe("checkTypingPassageAccess", () => {
  it("allows a free user under today's limit", () => {
    const result = checkTypingPassageAccess(null, 0);
    expect(result).toEqual({ allowed: true, reason: "FREE_TIER_AVAILABLE", requiresUpgrade: false });
  });

  it("blocks a free user who has used up today's limit", () => {
    const result = checkTypingPassageAccess(null, FREE_DAILY_PASSAGE_LIMIT);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("FREE_TIER_EXHAUSTED");
  });

  it("always allows an active Pro subscriber regardless of usage", () => {
    const subscription = { plan: "PRO" as const, status: "ACTIVE" as const, validUntil: null };
    const result = checkTypingPassageAccess(subscription, 99);
    expect(result).toEqual({ allowed: true, reason: "PRO_ACTIVE", requiresUpgrade: false });
  });

  it("falls back to the free tier once a Pro subscription has expired", () => {
    const subscription = { plan: "PRO" as const, status: "ACTIVE" as const, validUntil: 1000 };
    const result = checkTypingPassageAccess(subscription, FREE_DAILY_PASSAGE_LIMIT, 2000);
    expect(result.allowed).toBe(false);
  });

  it("falls back to the free tier once a Pro subscription is cancelled", () => {
    const subscription = { plan: "PRO" as const, status: "CANCELLED" as const, validUntil: null };
    const result = checkTypingPassageAccess(subscription, 0);
    expect(result.reason).toBe("FREE_TIER_AVAILABLE");
  });
});
