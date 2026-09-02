import { expect, test } from "@playwright/test";

import { DEFAULT_STUDENT, completeOnboarding, signInWithOtp } from "./helpers";

test.describe("sign-in and onboarding", () => {
  test("signs in with the demo OTP and lands on onboarding as a new user", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Sign In" }).click();

    await page.getByLabel("Mobile number", { exact: true }).fill("9876543210");
    await page.getByRole("button", { name: "Send OTP" }).click();

    // The demo tells the tester the code outright — asserting on that copy
    // doubles as a check that the mock OTP provider is still wired up.
    await expect(page.getByText("In this demo, the code is always")).toBeVisible();

    await page.getByLabel("OTP", { exact: true }).fill("123456");
    await page.getByRole("button", { name: "Verify & Continue" }).click();

    await page.waitForURL("**/onboarding");
    await expect(page.getByRole("heading", { name: "Add a student profile" })).toBeVisible();
  });

  test("rejects an incorrect OTP before accepting the correct one", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.getByLabel("Mobile number", { exact: true }).fill("9876543211");
    await page.getByRole("button", { name: "Send OTP" }).click();

    await page.getByLabel("OTP", { exact: true }).fill("000000");
    await page.getByRole("button", { name: "Verify & Continue" }).click();
    await expect(page.getByText(/incorrect otp/i)).toBeVisible();

    // Still on the OTP step — correcting it should succeed without restarting the flow.
    await page.getByLabel("OTP", { exact: true }).fill("123456");
    await page.getByRole("button", { name: "Verify & Continue" }).click();
    await page.waitForURL("**/onboarding");
  });

  test("completes onboarding and reaches the ready-to-test home screen", async ({ page }) => {
    await signInWithOtp(page);
    await completeOnboarding(page);

    await expect(
      page.getByText(`Ready for ${DEFAULT_STUDENT.fullName} · ${DEFAULT_STUDENT.targetExam}, Class ${DEFAULT_STUDENT.targetClass}`)
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Start a mock test" })).toBeVisible();
  });
});
