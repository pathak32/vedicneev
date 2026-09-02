import { expect, test } from "@playwright/test";

import { DEFAULT_STUDENT, EXPECTED_RESULTS, cardByTitle, collectPageErrors, signInOnboardAndTakeExam } from "./helpers";

test.describe("Parent Command Center", () => {
  test("renders every guardian metric for a student who has taken a mock test, without errors", async ({ page }) => {
    const pageErrors = collectPageErrors(page);
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await signInOnboardAndTakeExam(page);

    await page.goto("/parent");
    await expect(page.getByRole("heading", { name: "Parent Command Center" })).toBeVisible();

    // Student overview card: real numbers from the attempt just taken.
    await expect(page.getByText("1 test taken")).toBeVisible();
    await expect(page.getByText(EXPECTED_RESULTS.readinessLabel)).toBeVisible();

    // Family Accuracy Overview: aggregated across all children (just the one here).
    const familyCard = cardByTitle(page, "Family Accuracy Overview");
    await expect(familyCard).toBeVisible();
    await expect(familyCard).toContainText(`${EXPECTED_RESULTS.accuracyPercent}%`);
    await expect(familyCard).toContainText(DEFAULT_STUDENT.fullName.split(" ")[0]!);
    await expect(familyCard).toContainText("1 test");

    // Per-student progress chart renders (an SVG bar chart).
    const progressCard = cardByTitle(page, `${DEFAULT_STUDENT.fullName}'s Progress`);
    await expect(progressCard.locator("svg")).toBeVisible();

    // Sectional Strengths & Weaknesses: averaged accuracy per section.
    const strengthsCard = cardByTitle(page, "Sectional Strengths & Weaknesses");
    for (const [section, percent] of Object.entries(EXPECTED_RESULTS.sectionAccuracy)) {
      const row = strengthsCard.getByText(section, { exact: true }).locator("..");
      await expect(row).toContainText(`${percent}%`);
    }

    // Section-Wise Breakdown — Recent Attempts: the one attempt's row carries every section's accuracy plus the overall score.
    const breakdownCard = cardByTitle(page, "Section-Wise Breakdown");
    const attemptRow = breakdownCard.locator("tbody tr");
    await expect(attemptRow).toContainText(`${EXPECTED_RESULTS.sectionAccuracy["Mental Ability"]}%`);
    await expect(attemptRow).toContainText(`${EXPECTED_RESULTS.sectionAccuracy.Arithmetic}%`);
    await expect(attemptRow).toContainText(`${EXPECTED_RESULTS.sectionAccuracy.Language}%`);
    await expect(attemptRow).toContainText(`${EXPECTED_RESULTS.accuracyPercent}%`);

    // Mistake Vault progress widget: unreviewed count matches what was just logged.
    const mistakeCard = cardByTitle(page, "Mistake Vault");
    await expect(mistakeCard).toContainText(`0 of ${EXPECTED_RESULTS.mistakeCount} reviewed`);
    await expect(mistakeCard.getByRole("link", { name: "View Full Mistake Vault" })).toBeVisible();
    await expect(mistakeCard.getByRole("button", { name: "Mark All Reviewed" })).toBeVisible();

    // Subscription & Entitlements: renders cleanly even with no active plan.
    const subscriptionCard = cardByTitle(page, "Subscription & Entitlements");
    await expect(subscriptionCard).toContainText("Free Explorer");
    await expect(subscriptionCard.getByRole("switch")).toBeVisible();
    await expect(subscriptionCard.getByRole("button", { name: "Compare All Plans" })).toBeVisible();

    expect(pageErrors, "no uncaught exceptions while rendering the Parent Command Center").toEqual([]);
    expect(
      consoleErrors.filter((text) => !text.includes("Failed to sync user to database")),
      "no unexpected console errors while rendering the Parent Command Center"
    ).toEqual([]);
  });

  test("marking a mistake reviewed from the Mistake Vault page updates the parent progress widget", async ({ page }) => {
    await signInOnboardAndTakeExam(page);

    await page.goto("/dashboard/mistakes");
    await page.getByRole("button", { name: "Unlock Vedic All-Access", exact: true }).click();
    const paywallDialog = page.getByRole("dialog");
    await paywallDialog.getByRole("button").filter({ hasText: "Vedic All-Access" }).click();
    await page.getByRole("button", { name: "Simulate Successful Payment" }).click();
    const reviewButtons = page.getByRole("button", { name: "Mark Reviewed" });
    await expect(reviewButtons).toHaveCount(EXPECTED_RESULTS.mistakeCount);
    await reviewButtons.first().click();
    // Reviewed mistakes drop out of the default (unreviewed-only) view, so
    // settle on the count shrinking rather than a "Reviewed" label appearing.
    await expect(reviewButtons).toHaveCount(EXPECTED_RESULTS.mistakeCount - 1);

    await page.goto("/parent");
    const mistakeCard = cardByTitle(page, "Mistake Vault");
    await expect(mistakeCard).toContainText(`1 of ${EXPECTED_RESULTS.mistakeCount} reviewed`);

    // All-Access is now active, so the subscription card should reflect that too.
    const subscriptionCard = cardByTitle(page, "Subscription & Entitlements");
    await expect(subscriptionCard).toContainText("Vedic All-Access");
    await expect(subscriptionCard).toContainText("Active");
  });
});
