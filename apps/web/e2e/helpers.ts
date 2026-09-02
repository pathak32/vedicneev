import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Shared page-driving helpers and fixture data for the e2e suite.
 *
 * The demo exam (`/exam/demo-jnvst`) is static, checked-in fixture data
 * (apps/web/src/lib/exam/mock-data.ts) — not live content — so the answer
 * plan and every expected value below are derived directly from it and are
 * safe to hard-code. If that fixture ever changes, these must be updated
 * alongside it.
 */

export const DEMO_OTP = "123456";
export const DEFAULT_PHONE = "9876543210";

export interface StudentProfileInput {
  fullName: string;
  targetClass: 5 | 6 | 8 | 9;
  targetExam: "JNVST" | "AISSEE (Sainik School)" | "RMS" | "Elite Private Schools (DPS & similar)";
  language: "English" | "हिन्दी (Hindi)";
  locality: "Rural" | "Urban";
  category: "General" | "OBC" | "SC" | "ST" | "Defense";
}

export const DEFAULT_STUDENT: StudentProfileInput = {
  fullName: "Aarav Sharma",
  targetClass: 6,
  targetExam: "JNVST",
  language: "English",
  locality: "Rural",
  category: "General",
};

/** Signs in via the mock OTP flow (fixed demo code — no real SMS involved). */
export async function signInWithOtp(page: Page, phone: string = DEFAULT_PHONE): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign In" }).click();
  // exact: true matters here — the auth dialog's own title ("Sign in with
  // your mobile number" / "Enter the OTP") is also reachable via getByLabel
  // (it's the dialog's aria-labelledby target), and would otherwise collide
  // with these field labels under default substring matching.
  await page.getByLabel("Mobile number", { exact: true }).fill(phone);
  await page.getByRole("button", { name: "Send OTP" }).click();
  await page.getByLabel("OTP", { exact: true }).fill(DEMO_OTP);
  await page.getByRole("button", { name: "Verify & Continue" }).click();
}

/** Completes the 3-step "add a student" onboarding flow, ending back on the home page. */
export async function completeOnboarding(page: Page, student: StudentProfileInput = DEFAULT_STUDENT): Promise<void> {
  await page.waitForURL("**/onboarding");

  await expect(page.getByRole("heading", { name: "Child & Grade" })).toBeVisible();
  await page.getByLabel("Child's full name", { exact: true }).fill(student.fullName);
  await page.getByRole("button", { name: `Class ${student.targetClass}`, exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();

  await expect(page.getByRole("heading", { name: "Exam & Language" })).toBeVisible();
  await page.getByRole("button", { name: student.targetExam, exact: true }).click();
  await page.getByRole("button", { name: student.language, exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();

  await expect(page.getByRole("heading", { name: "Quota & Category" })).toBeVisible();
  await page.getByRole("button", { name: student.locality, exact: true }).click();
  await page.getByRole("button", { name: student.category, exact: true }).click();
  await page.getByRole("button", { name: "Finish Setup" }).click();

  await page.waitForURL("/");
  await expect(page.getByText(`Ready for ${student.fullName}`)).toBeVisible();
}

/** Signs in and onboards one student in a single call — the common entry point for tests that don't care about the individual steps. */
export async function signInAndOnboard(page: Page, options?: { phone?: string; student?: StudentProfileInput }): Promise<void> {
  await signInWithOtp(page, options?.phone);
  await completeOnboarding(page, options?.student);
}

export interface AnsweredQuestion {
  /** Visible option text — unique per question in the demo bank, so a substring match is unambiguous. */
  optionText: string;
  isCorrect: boolean;
}

/**
 * One entry per question, in exam order (5 Mental Ability, 5 Arithmetic, 4
 * Language — 14 total), deliberately mixing correct and incorrect answers
 * across every section so the resulting score, section breakdown, and
 * Mistake Vault are all non-trivial and independently verifiable:
 *   - 10 correct / 4 incorrect → 10/14 marks, 71% accuracy, 84th percentile
 *   - Mental Ability 3/5 (60%), Arithmetic 4/5 (80%), Language 3/4 (75%)
 *   - Mistakes: 2 in Mental Ability, 1 in Arithmetic, 1 in Language
 */
export const EXAM_ANSWER_PLAN: AnsweredQuestion[] = [
  // Mental Ability
  { optionText: "32", isCorrect: true }, // Q1: missing number in 2,4,8,16,?,64 → correct
  { optionText: "I", isCorrect: true }, // Q2: missing letter A,C,E,G,? → correct
  { optionText: "162", isCorrect: false }, // Q3: 3,9,27,81,? → correct is 243, we pick 162
  { optionText: "Carrot", isCorrect: true }, // Q4: odd one out → correct
  { optionText: "0°", isCorrect: false }, // Q5: rotating triangle → correct is 270°, we pick 0°
  // Arithmetic
  { optionText: "495", isCorrect: true }, // Q1: 45×11 → correct
  { optionText: "4225", isCorrect: true }, // Q2: 65² → correct
  { optionText: "9406", isCorrect: false }, // Q3: 98×97 → correct is 9506, we pick 9406
  { optionText: "10608", isCorrect: true }, // Q4: 102×104 → correct
  { optionText: "413", isCorrect: true }, // Q5: 1000−587 → correct
  // Language
  { optionText: "Joyful", isCorrect: true }, // Q1: synonym of Happy → correct
  { optionText: "Courageous", isCorrect: false }, // Q2: antonym of Brave → correct is Cowardly, we pick Courageous
  { optionText: "goes", isCorrect: true }, // Q3: "She ___ to school" → correct
  { optionText: "Receive", isCorrect: true }, // Q4: correctly spelled word → correct
];

export const EXPECTED_RESULTS = {
  totalMarks: 10,
  maxMarks: 14,
  marksLabel: "10 / 14",
  accuracyPercent: 71,
  percentile: 84,
  mistakeCount: 4,
  readinessLabel: "High Readiness",
  sectionAccuracy: {
    "Mental Ability": 60,
    Arithmetic: 80,
    Language: 75,
  },
} as const;

export interface ExpectedMistake {
  subject: "Mental Ability" | "Arithmetic" | "Language";
  /** A substring of the question's content, unique enough to identify it. */
  questionSubstring: string;
}

/** The 4 questions EXAM_ANSWER_PLAN answers incorrectly, in exam order. */
export const EXPECTED_MISTAKES: ExpectedMistake[] = [
  { subject: "Mental Ability", questionSubstring: "3, 9, 27, 81" },
  { subject: "Mental Ability", questionSubstring: "triangle rotating" },
  { subject: "Arithmetic", questionSubstring: "98 × 97" },
  { subject: "Language", questionSubstring: "antonym of 'Brave'" },
];

/**
 * Selects an answer option on the currently displayed exam question by its
 * visible text. Matches exactly (not a substring filter): options are
 * rendered as "<letter><text><index>" with no separator in the accessible
 * name, so e.g. a plain substring match on "0°" would also match "270°".
 */
export async function selectExamOption(page: Page, optionText: string): Promise<void> {
  await page
    .getByRole("radio")
    .filter({ has: page.getByText(optionText, { exact: true }) })
    .click();
}

/**
 * Answers every question per `plan` (in order, letting "Save & Next" carry
 * across section boundaries exactly as a real student's flow would), then
 * submits. Assumes the exam player for `/exam/demo-jnvst` is already loaded.
 */
export async function answerAndSubmitExam(page: Page, plan: AnsweredQuestion[] = EXAM_ANSWER_PLAN): Promise<void> {
  await page.waitForURL("**/exam/demo-jnvst");

  for (let i = 0; i < plan.length; i++) {
    await selectExamOption(page, plan[i]!.optionText);
    if (i < plan.length - 1) {
      await page.getByRole("button", { name: "Save & Next" }).click();
    }
  }

  await page.getByRole("button", { name: "Submit Exam" }).click();
  await expect(page.getByText(`Answered: ${plan.length}`)).toBeVisible();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await page.waitForURL("**/exam/demo-jnvst/results");
}

/** Signs in, onboards, then takes and submits the demo exam per `plan` — the full setup for tests that just need a graded attempt on record. */
export async function signInOnboardAndTakeExam(
  page: Page,
  options?: { phone?: string; student?: StudentProfileInput; plan?: AnsweredQuestion[] }
): Promise<void> {
  await signInAndOnboard(page, options);
  await page.getByRole("link", { name: "Start a mock test" }).click();
  await answerAndSubmitExam(page, options?.plan);
}

/**
 * Scopes to the `<Card>` containing a `CardTitle` heading with this text.
 * Several dashboard/parent widgets repeat the same section names and
 * percentages (e.g. "Mental Ability" appears in more than one card), so
 * assertions on their content need to be scoped to one card at a time
 * rather than searched for globally.
 */
export function cardByTitle(page: Page, title: string | RegExp): Locator {
  return page.getByRole("heading", { name: title }).locator("../..");
}

/**
 * Registers a listener for uncaught exceptions on the page and returns the
 * accumulating array — call `expect(errors).toEqual([])` at the point(s) in
 * a test where "renders without errors" needs to hold true.
 */
export function collectPageErrors(page: Page): Error[] {
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));
  return errors;
}
