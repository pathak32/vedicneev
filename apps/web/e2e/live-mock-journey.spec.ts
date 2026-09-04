import { expect, test, type Page } from "@playwright/test";

import { cardByTitle, collectPageErrors, selectExamOption, signInAndOnboard } from "./helpers";

/**
 * End-to-end coverage for the dynamically-assembled "live mock" flow added
 * for JNVST/AISSEE/RMS Class 9 lateral entry (see
 * apps/web/app/exam/live/[templateSlug]/page.tsx and
 * apps/web/src/lib/exam/jnvstMockService.ts's generateLiveMockSession).
 * Unlike exam-and-mistake-vault.spec.ts's demo exam, this content is drawn
 * live from the seeded PreviousYearQuestion pool, so the paper's question
 * ORDER is randomized per attempt (assembleJnvstMock shuffles). Every
 * assertion below is written to hold regardless of that order — answers
 * are matched by question content, not by position.
 */

const JNVST9_SLUG = "jnvst-class-9";
const JNVST9_TITLE = "JNVST Class 9 Lateral Entry Selection Test";

/**
 * English content substring → correct option text, for every item seeded in
 * packages/db/prisma/pyq-seed/jnvst-class-9.ts. The pool has exactly 2
 * questions per section (Mathematics/Science/Social Science) against a
 * template quota of 35/35/30, so assembleJnvstMock's shortfall behavior
 * means every one of these 6 items is drawn on every attempt — only their
 * order varies.
 */
const JNVST9_ANSWER_KEY: { contentSubstring: string; correctOptionText: string }[] = [
  { contentSubstring: "2x − 5 = 11", correctOptionText: "8" },
  { contentSubstring: "area of a rectangle", correctOptionText: "84 cm²" },
  { contentSubstring: "renewable source of energy", correctOptionText: "Solar Energy" },
  { contentSubstring: "SI unit of electric current", correctOptionText: "Ampere" },
  { contentSubstring: "Indian National Congress", correctOptionText: "1885" },
  { contentSubstring: "largest fundamental right", correctOptionText: "Right to Equality" },
];

/** The question stem is QuestionCanvas's only <p>, directly under <main> — no accessible role/label distinguishes it, so this is the least brittle way to read it without adding a test-only attribute to production markup. */
function currentQuestionText(page: Page) {
  return page.locator("main p").first();
}

async function answerCurrentQuestionCorrectly(page: Page): Promise<void> {
  const text = (await currentQuestionText(page).textContent()) ?? "";
  const entry = JNVST9_ANSWER_KEY.find((e) => text.includes(e.contentSubstring));
  if (!entry) throw new Error(`No answer-key entry matches the current question: "${text}"`);
  await selectExamOption(page, entry.correctOptionText);
}

/** Parses useTestStore's sessionStorage-persisted state (see apps/web/src/lib/stores/useTestStore.ts) directly, for assertions that need to see the raw persisted values rather than their rendered form. */
async function readTestSessionStorage(page: Page) {
  const raw = await page.evaluate(() => window.sessionStorage.getItem("vedicneev-test-session"));
  expect(raw, "vedicneev-test-session should be present in sessionStorage while an exam is active").not.toBeNull();
  return JSON.parse(raw!).state as {
    overallRemainingSeconds: number;
    remainingSecondsBySection: Record<string, number>;
    currentSectionIndex: number;
    selectedOptions: Record<string, string | undefined>;
    submitted: boolean;
  };
}

test.describe("homepage branding and language switching", () => {
  test("shows VedicNeev branding/metadata and switches the hero text on language selection", async ({ page }) => {
    const pageErrors = collectPageErrors(page);
    await page.goto("/");

    // ── Step 1: branding / metadata ──────────────────────────────────
    await expect(page).toHaveTitle(/Vedic Neev/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /JNVST/);
    await expect(page.getByRole("banner").getByRole("link", { name: "Vedic Neev" })).toBeVisible();
    await expect(page.getByText(/JNVST \| RMS \| AISSEE/)).toBeVisible();

    // ── Step 2: language switch (homepage hero pills) ───────────────
    const englishHeadline = page.getByRole("heading", { name: "Master Government Boarding School Entrances" });
    await expect(englishHeadline).toBeVisible();

    await page.getByRole("button", { name: "ગુજરાતી", exact: true }).click();

    const gujaratiHeadline = page.getByRole("heading", {
      name: "સરકારી નિવાસી શાળા પ્રવેશ પરીક્ષાની સંપૂર્ણ તૈયારી",
    });
    await expect(gujaratiHeadline).toBeVisible();
    await expect(englishHeadline).toBeHidden();

    // The choice persists app-wide (useLanguageStore, localStorage) — a
    // reload should keep showing Gujarati, not silently fall back to English.
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "સરકારી નિવાસી શાળા પ્રવેશ પરીક્ષાની સંપૂર્ણ તૈયારી" })
    ).toBeVisible();

    expect(pageErrors).toEqual([]);
  });
});

test.describe("live mock catalog", () => {
  test("/exam/live lists every seeded template with its real question/marks/duration counts", async ({ page }) => {
    await page.goto("/exam/live");
    await expect(page.getByRole("heading", { name: "Live Mock Tests" })).toBeVisible();

    for (const title of [
      "JNVST Class 6 Selection Test",
      JNVST9_TITLE,
      "AISSEE Class 9 (Sainik School) Lateral Entry Exam",
      "RMS Class 9 Lateral Entry Exam",
    ]) {
      await expect(cardByTitle(page, title)).toBeVisible();
    }

    const jnvst9Card = cardByTitle(page, JNVST9_TITLE);
    await expect(jnvst9Card).toContainText("100 questions");
    await expect(jnvst9Card).toContainText("100 marks");
    await expect(jnvst9Card).toContainText("150 min");
    await expect(jnvst9Card.getByRole("link", { name: "Start Mock" })).toHaveAttribute(
      "href",
      `/exam/live/${JNVST9_SLUG}`
    );
  });
});

test.describe("full JNVST Class 9 live mock journey", () => {
  test("launch → answer → switch section/language → reload persistence → submit → results", async ({ page }) => {
    const pageErrors = collectPageErrors(page);

    // ── Step 3: sign in, onboard, open the catalog, launch the session ──
    await signInAndOnboard(page);
    await page.goto("/exam/live");
    await cardByTitle(page, JNVST9_TITLE).getByRole("link", { name: "Start Mock" }).click();

    await expect(page.getByRole("heading", { name: JNVST9_TITLE })).toBeVisible();
    const tabs = ["Mathematics", "Science", "Social Science"];
    for (const tab of tabs) {
      await expect(page.getByRole("tab", { name: tab, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("timer")).toBeVisible();

    // ── Step 4a: interact with QuestionCanvas — answer the first question ──
    const firstQuestionText = (await currentQuestionText(page).textContent()) ?? "";
    await answerCurrentQuestionCorrectly(page);
    // Selecting an option is reflected immediately, before any navigation.
    const selectedRadio = page.getByRole("radio", { checked: true });
    await expect(selectedRadio).toBeVisible();

    // ── Step 4b: switch language via the exam runner's dropdown, verify
    // the question text actually changes (content is drawn live from the
    // DB, so its order is random — assert "changed", not a hardcoded string) ──
    await page.getByRole("button", { name: "Change language" }).click();
    await page.getByRole("menuitemradio", { name: "ગુજરાતી (Gujarati)" }).click();
    await expect(page.getByRole("button", { name: "Change language" })).toContainText("ગુજરાતી (Gujarati)");
    const gujaratiText = (await currentQuestionText(page).textContent()) ?? "";
    expect(gujaratiText).not.toBe(firstQuestionText);
    expect(gujaratiText.length).toBeGreaterThan(0);
    // The previously selected option is still selected — only the display
    // language changed, per ExamHeader.changeLanguage's own contract.
    await expect(selectedRadio).toBeVisible();

    // Switch back to English so the rest of this test's content-substring
    // matching against JNVST9_ANSWER_KEY keeps working.
    await page.getByRole("button", { name: "Change language" }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();
    await expect(currentQuestionText(page)).toHaveText(firstQuestionText);

    // ── Step 4c: switch sections explicitly, verify state survives the round trip ──
    await page.getByRole("tab", { name: "Science", exact: true }).click();
    await expect(page.getByRole("tab", { name: "Science", exact: true })).toHaveAttribute("aria-selected", "true");
    const scienceQuestionText = (await currentQuestionText(page).textContent()) ?? "";
    expect(scienceQuestionText).not.toBe(firstQuestionText);

    await page.getByRole("tab", { name: "Mathematics", exact: true }).click();
    await expect(page.getByRole("tab", { name: "Mathematics", exact: true })).toHaveAttribute("aria-selected", "true");
    await expect(currentQuestionText(page)).toHaveText(firstQuestionText);
    // The answer selected before switching away is still there.
    await expect(page.getByRole("radio", { checked: true })).toBeVisible();

    // ── Step 5: reload and assert full restoration from sessionStorage ──
    const beforeReload = await readTestSessionStorage(page);
    expect(beforeReload.submitted).toBe(false);
    expect(Object.values(beforeReload.selectedOptions).some(Boolean)).toBe(true);

    await page.reload();

    await expect(page.getByRole("heading", { name: JNVST9_TITLE })).toBeVisible();
    // Still on the same section, with the same question's answer restored.
    await expect(page.getByRole("tab", { name: "Mathematics", exact: true })).toHaveAttribute("aria-selected", "true");
    await expect(currentQuestionText(page)).toHaveText(firstQuestionText);
    await expect(page.getByRole("radio", { checked: true })).toBeVisible();

    const afterReload = await readTestSessionStorage(page);
    expect(afterReload.selectedOptions).toEqual(beforeReload.selectedOptions);
    expect(afterReload.currentSectionIndex).toBe(beforeReload.currentSectionIndex);
    // The countdown only ever moves forward across a reload (never resets,
    // never jumps backwards) and the gap here is a couple of seconds at
    // most — a generous 30s tolerance keeps this from flaking under load
    // without masking a real "timer didn't restore" regression.
    expect(afterReload.overallRemainingSeconds).toBeLessThanOrEqual(beforeReload.overallRemainingSeconds);
    expect(afterReload.overallRemainingSeconds).toBeGreaterThan(beforeReload.overallRemainingSeconds - 30);

    // ── Step 6: answer everything else and submit ──────────────────────
    // "Save & Next" carries across section boundaries on its own (same
    // behavior verified for the demo exam in exam-and-mistake-vault.spec.ts),
    // so this one loop finishes all 3 sections regardless of draw order.
    for (let i = 0; i < JNVST9_ANSWER_KEY.length - 1; i++) {
      await page.getByRole("button", { name: "Save & Next" }).click();
      await answerCurrentQuestionCorrectly(page);
    }

    await page.getByRole("button", { name: "Submit Exam" }).click();
    await expect(page.getByText(`Answered: ${JNVST9_ANSWER_KEY.length}`)).toBeVisible();
    await page.getByRole("button", { name: "Submit", exact: true }).click();

    await page.waitForURL(/\/exam\/jnvst-class-9-live-mock-\d+\/results/);
    await expect(page.getByText(`${JNVST9_ANSWER_KEY.length} / ${JNVST9_ANSWER_KEY.length}`, { exact: true })).toBeVisible();
    // Every section (and the overall score) reads 100% since every question
    // was answered correctly — several "100%" nodes are expected on this
    // page (ScoreHero's overall figure plus one per section in
    // SectionBreakdown), so just assert at least one is showing rather than
    // picking one arbitrarily by DOM position.
    await expect(page.getByText("100%", { exact: true }).first()).toBeVisible();

    expect(pageErrors).toEqual([]);
  });
});

test.describe("other Class 9 boards launch correctly", () => {
  test("AISSEE Class 9 generalizes to its own 4-section template", async ({ page }) => {
    await signInAndOnboard(page);
    await page.goto("/exam/live");
    await cardByTitle(page, "AISSEE Class 9 (Sainik School) Lateral Entry Exam")
      .getByRole("link", { name: "Start Mock" })
      .click();

    await expect(page.getByRole("heading", { name: "AISSEE Class 9 (Sainik School) Lateral Entry Exam" })).toBeVisible();
    for (const tab of ["Mathematics", "Mental Ability", "Science", "General Knowledge"]) {
      await expect(page.getByRole("tab", { name: tab })).toBeVisible();
    }
    // Sectional time budget for Mathematics on this template is 60 minutes.
    await expect(page.getByRole("timer")).toContainText("1:00:0");
  });
});
