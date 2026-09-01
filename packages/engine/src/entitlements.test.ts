import { describe, expect, it } from "vitest";

import {
  checkExamAccess,
  checkMistakeVaultAccess,
  checkOmrScannerAccess,
  checkSpeedHackClinicAccess,
  FREE_MOCK_TEST_LIMIT,
  type ParentSubscription,
} from "./entitlements";

const NOW = new Date("2026-01-01T00:00:00.000Z").getTime();
const FUTURE = NOW + 30 * 24 * 60 * 60 * 1000;
const PAST = NOW - 24 * 60 * 60 * 1000;

const activeExamPassJnvst: ParentSubscription = {
  plan: "EXAM_PASS",
  targetExam: "JNVST",
  status: "ACTIVE",
  validUntil: FUTURE,
};

const activeAllAccess: ParentSubscription = {
  plan: "VEDIC_ALL_ACCESS",
  targetExam: null,
  status: "ACTIVE",
  validUntil: FUTURE,
};

describe("checkExamAccess", () => {
  it("allows the free mock test when none has been used yet", () => {
    const result = checkExamAccess(null, "JNVST", 0, NOW);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe("FREE_TIER_AVAILABLE");
  });

  it(`denies access once the free tier's ${FREE_MOCK_TEST_LIMIT} test(s) are used`, () => {
    const result = checkExamAccess(null, "JNVST", FREE_MOCK_TEST_LIMIT, NOW);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("FREE_TIER_EXHAUSTED");
    expect(result.requiresUpgrade).toBe(true);
    expect(result.suggestedPlans).toEqual(["EXAM_PASS", "VEDIC_ALL_ACCESS"]);
  });

  it("allows an Exam Pass holder to take their matching exam unlimited times", () => {
    const result = checkExamAccess(activeExamPassJnvst, "JNVST", 99, NOW);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe("EXAM_PASS_MATCH");
  });

  it("denies an Exam Pass holder access to a different exam (even with free tries left)", () => {
    const result = checkExamAccess(activeExamPassJnvst, "AISSEE", 0, NOW);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("EXAM_PASS_WRONG_EXAM");
  });

  it("allows Vedic All-Access to take any exam unlimited times", () => {
    expect(checkExamAccess(activeAllAccess, "JNVST", 99, NOW).allowed).toBe(true);
    expect(checkExamAccess(activeAllAccess, "AISSEE", 99, NOW).allowed).toBe(true);
    expect(checkExamAccess(activeAllAccess, "RMS", 99, NOW).allowed).toBe(true);
  });

  it("falls back to the free tier when a subscription has expired by date, even if status still says ACTIVE", () => {
    const staleActive: ParentSubscription = { ...activeExamPassJnvst, validUntil: PAST };
    const result = checkExamAccess(staleActive, "JNVST", 0, NOW);
    expect(result.reason).toBe("FREE_TIER_AVAILABLE");
  });

  it("falls back to the free tier when a subscription's status is EXPIRED", () => {
    const expired: ParentSubscription = { ...activeExamPassJnvst, status: "EXPIRED" };
    const result = checkExamAccess(expired, "JNVST", 0, NOW);
    expect(result.reason).toBe("FREE_TIER_AVAILABLE");
  });

  it("falls back to the free tier when a subscription's status is CANCELLED", () => {
    const cancelled: ParentSubscription = { ...activeAllAccess, status: "CANCELLED" };
    const result = checkExamAccess(cancelled, "JNVST", 0, NOW);
    expect(result.reason).toBe("FREE_TIER_AVAILABLE");
  });

  it("a subscription with no expiry (validUntil null) never lapses by date", () => {
    const lifetime: ParentSubscription = { ...activeAllAccess, validUntil: null };
    expect(checkExamAccess(lifetime, "JNVST", 0, NOW).allowed).toBe(true);
  });
});

describe("checkOmrScannerAccess", () => {
  it("denies the OMR scanner on the free tier, even with free mock tests remaining", () => {
    const result = checkOmrScannerAccess(null, "JNVST", NOW);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("REQUIRES_EXAM_PASS_OR_ALL_ACCESS");
  });

  it("allows the OMR scanner for an Exam Pass holder's matching exam", () => {
    expect(checkOmrScannerAccess(activeExamPassJnvst, "JNVST", NOW).allowed).toBe(true);
  });

  it("denies the OMR scanner for an Exam Pass holder's non-matching exam", () => {
    expect(checkOmrScannerAccess(activeExamPassJnvst, "AISSEE", NOW).allowed).toBe(false);
  });

  it("allows the OMR scanner for any exam on Vedic All-Access", () => {
    expect(checkOmrScannerAccess(activeAllAccess, "RMS", NOW).allowed).toBe(true);
  });
});

describe("checkMistakeVaultAccess / checkSpeedHackClinicAccess", () => {
  it("denies detailed Mistake Vault solutions on the free tier", () => {
    const result = checkMistakeVaultAccess(null, NOW);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("REQUIRES_ALL_ACCESS");
    expect(result.suggestedPlans).toEqual(["VEDIC_ALL_ACCESS"]);
  });

  it("denies detailed Mistake Vault solutions even for an Exam Pass holder", () => {
    expect(checkMistakeVaultAccess(activeExamPassJnvst, NOW).allowed).toBe(false);
  });

  it("allows detailed Mistake Vault solutions only for Vedic All-Access", () => {
    expect(checkMistakeVaultAccess(activeAllAccess, NOW).allowed).toBe(true);
  });

  it("gates the speed-hack clinic identically to the Mistake Vault", () => {
    expect(checkSpeedHackClinicAccess(null, NOW).allowed).toBe(false);
    expect(checkSpeedHackClinicAccess(activeExamPassJnvst, NOW).allowed).toBe(false);
    expect(checkSpeedHackClinicAccess(activeAllAccess, NOW).allowed).toBe(true);
  });
});
