import { expect, test } from "@playwright/test";

import {
  EXPECTED_MISTAKES,
  EXPECTED_RESULTS,
  answerAndSubmitExam,
  collectPageErrors,
  signInAndOnboard,
} from "./helpers";

test.describe("taking the mock exam", () => {
  test("submitting produces the expected score, accuracy, and section breakdown", async ({ page }) => {
    const pageErrors = collectPageErrors(page);

    await signInAndOnboard(page);
    await page.getByRole("link", { name: "Start a mock test" }).click();
    await answerAndSubmitExam(page);

    await expect(page.getByText(EXPECTED_RESULTS.marksLabel, { exact: true })).toBeVisible();
    await expect(page.getByText(`${EXPECTED_RESULTS.accuracyPercent}%`, { exact: true })).toBeVisible();
    await expect(page.getByText(`${EXPECTED_RESULTS.percentile}th`, { exact: true })).toBeVisible();

    for (const [section, percent] of Object.entries(EXPECTED_RESULTS.sectionAccuracy)) {
      const sectionCell = page.getByText(section, { exact: true }).locator("..");
      await expect(sectionCell).toContainText(`${percent}%`);
    }

    expect(pageErrors).toEqual([]);
  });

  test("the Mistake Vault badge reflects every missed question and is gated behind All-Access", async ({ page }) => {
    await signInAndOnboard(page);
    await page.getByRole("link", { name: "Start a mock test" }).click();
    await answerAndSubmitExam(page);

    const openVaultButton = page.getByRole("button", { name: /open mistake vault/i });
    await expect(openVaultButton).toContainText(String(EXPECTED_RESULTS.mistakeCount));

    // A fresh student is on the Free Explorer plan — detailed Mistake Vault
    // solutions require Vedic All-Access, so this should paywall, not open the list.
    await openVaultButton.click();
    await expect(page.getByRole("heading", { name: "Unlock detailed Mistake Vault solutions" })).toBeVisible();
  });
});

test.describe("Mistake Vault (dedicated page)", () => {
  test("lists every missed question, filters correctly by subject, and supports per-item review", async ({ page }) => {
    await signInAndOnboard(page);
    await page.getByRole("link", { name: "Start a mock test" }).click();
    await answerAndSubmitExam(page);

    await page.goto("/dashboard/mistakes");
    await expect(
      page.getByText(`${EXPECTED_RESULTS.mistakeCount} mistakes across 1 attempt`)
    ).toBeVisible();

    // Unlock via the mock Razorpay checkout — no real payment gateway is involved in the demo.
    await page.getByRole("button", { name: "Unlock Vedic All-Access", exact: true }).click();
    const paywallDialog = page.getByRole("dialog");
    await expect(paywallDialog).toBeVisible();
    await paywallDialog.getByRole("button").filter({ hasText: "Vedic All-Access" }).click();
    await page.getByRole("button", { name: "Simulate Successful Payment" }).click();
    await expect(page.getByText("Detailed solutions are part of Vedic All-Access")).toBeHidden();

    // Every missed question is present, correctly attributed to its subject.
    for (const mistake of EXPECTED_MISTAKES) {
      await expect(page.getByText(mistake.questionSubstring)).toBeVisible();
    }

    // Filtering by subject narrows the list to just that subject's mistakes.
    await page.getByRole("button", { name: "Mental Ability (2)" }).click();
    await expect(page.getByText("3, 9, 27, 81")).toBeVisible();
    await expect(page.getByText("triangle rotating")).toBeVisible();
    await expect(page.getByText("98 × 97")).toBeHidden();
    await expect(page.getByText("antonym of 'Brave'")).toBeHidden();
    await page.getByRole("button", { name: "All Subjects" }).click();

    // Marking one reviewed removes it from the default (unreviewed-only) view...
    const reviewButtons = page.getByRole("button", { name: "Mark Reviewed" });
    const initialCount = await reviewButtons.count();
    await reviewButtons.first().click();
    await expect(page.getByRole("button", { name: "Mark Reviewed" })).toHaveCount(initialCount - 1);

    // ...and reappears, marked Reviewed, once "show reviewed" is switched on.
    await page.getByRole("switch").click();
    await expect(page.getByRole("button", { name: "Reviewed", exact: true })).toBeVisible();
  });
});
