import { beforeEach, describe, expect, it } from "vitest";

import { DEV_FALLBACK_OTP } from "./mockAuthProvider";
import {
  selectActiveParent,
  selectActiveStudent,
  selectActiveStudents,
  selectNotificationPreferences,
  selectStudentTestHistory,
  selectUnreviewedCarelessCount,
  selectUnreviewedMistakeCount,
  useAuthStore,
} from "./useAuthStore";
import { MAX_STUDENT_PROFILES, type NewStudentInput } from "./types";

const PHONE_A = "9876543210";
const PHONE_B = "9123456780";

const STUDENT: NewStudentInput = {
  fullName: "Aarav Sharma",
  targetExam: "JNVST",
  targetClass: 6,
  languagePreference: "en",
  locality: "RURAL",
  quotaCategory: "GEN",
};

async function signIn(phone: string) {
  await useAuthStore.getState().requestOtp(phone);
  return useAuthStore.getState().verifyOtp(DEV_FALLBACK_OTP);
}

beforeEach(() => {
  useAuthStore.setState({
    accounts: {},
    activePhone: null,
    activeStudentId: null,
    testHistory: [],
    mistakeLog: [],
    notificationPreferencesByParentId: {},
    pendingOtpPhone: null,
    otpError: null,
    otpSending: false,
    otpVerifying: false,
  });
});

describe("requestOtp", () => {
  it("rejects an invalid phone number and does not set a pending OTP", async () => {
    const result = await useAuthStore.getState().requestOtp("12345");
    expect(result.success).toBe(false);
    expect(useAuthStore.getState().pendingOtpPhone).toBeNull();
  });

  it("accepts a valid 10-digit Indian mobile number", async () => {
    const result = await useAuthStore.getState().requestOtp(PHONE_A);
    expect(result.success).toBe(true);
    expect(useAuthStore.getState().pendingOtpPhone).toBe(PHONE_A);
  });
});

describe("verifyOtp", () => {
  it("rejects an incorrect code", async () => {
    await useAuthStore.getState().requestOtp(PHONE_A);
    const result = await useAuthStore.getState().verifyOtp("000000");
    expect(result.success).toBe(false);
    expect(useAuthStore.getState().activePhone).toBeNull();
  });

  it("signs in a brand-new phone number as a new user with zero students", async () => {
    const result = await signIn(PHONE_A);
    expect(result.success).toBe(true);
    expect(result.isNewUser).toBe(true);
    const state = useAuthStore.getState();
    expect(state.activePhone).toBe(PHONE_A);
    expect(selectActiveStudents(state)).toEqual([]);
    expect(selectActiveParent(state)?.phone).toBe(PHONE_A);
  });

  it("recognizes a returning phone number as an existing user", async () => {
    await signIn(PHONE_A);
    useAuthStore.getState().signOut();
    const result = await signIn(PHONE_A);
    expect(result.isNewUser).toBe(false);
  });
});

describe("addStudent / profile cap", () => {
  it("throws when adding a student while signed out", () => {
    expect(() => useAuthStore.getState().addStudent(STUDENT)).toThrow();
  });

  it("adds a student and makes it active when none was active before", async () => {
    await signIn(PHONE_A);
    const student = useAuthStore.getState().addStudent(STUDENT);
    const state = useAuthStore.getState();
    expect(selectActiveStudents(state)).toHaveLength(1);
    expect(state.activeStudentId).toBe(student.id);
  });

  it(`enforces a maximum of ${MAX_STUDENT_PROFILES} student profiles`, async () => {
    await signIn(PHONE_A);
    for (let i = 0; i < MAX_STUDENT_PROFILES; i++) {
      useAuthStore.getState().addStudent({ ...STUDENT, fullName: `Child ${i}` });
    }
    expect(selectActiveStudents(useAuthStore.getState())).toHaveLength(MAX_STUDENT_PROFILES);
    expect(() => useAuthStore.getState().addStudent(STUDENT)).toThrow();
  });
});

describe("updateStudent", () => {
  it("patches an existing student's fields", async () => {
    await signIn(PHONE_A);
    const student = useAuthStore.getState().addStudent(STUDENT);
    useAuthStore.getState().updateStudent(student.id, { fullName: "Renamed", targetClass: 8 });
    const updated = selectActiveStudents(useAuthStore.getState()).find((s) => s.id === student.id);
    expect(updated?.fullName).toBe("Renamed");
    expect(updated?.targetClass).toBe(8);
  });
});

describe("profile switching", () => {
  it("switches the active student among siblings under the same account", async () => {
    await signIn(PHONE_A);
    const first = useAuthStore.getState().addStudent({ ...STUDENT, fullName: "First Child" });
    const second = useAuthStore.getState().addStudent({ ...STUDENT, fullName: "Second Child" });

    // Adding a second child should not steal focus from the first.
    expect(useAuthStore.getState().activeStudentId).toBe(first.id);

    useAuthStore.getState().setActiveStudentId(second.id);
    expect(selectActiveStudent(useAuthStore.getState())?.id).toBe(second.id);

    useAuthStore.getState().setActiveStudentId(first.id);
    expect(selectActiveStudent(useAuthStore.getState())?.id).toBe(first.id);
  });

  it("ignores an id that doesn't belong to the current account", async () => {
    await signIn(PHONE_A);
    const student = useAuthStore.getState().addStudent(STUDENT);
    useAuthStore.getState().setActiveStudentId("not-a-real-id");
    expect(useAuthStore.getState().activeStudentId).toBe(student.id);
  });

  it("keeps each phone account's students fully isolated from the other", async () => {
    await signIn(PHONE_A);
    const studentA = useAuthStore.getState().addStudent({ ...STUDENT, fullName: "Account A Child" });

    useAuthStore.getState().signOut();
    await signIn(PHONE_B);
    const studentB = useAuthStore.getState().addStudent({ ...STUDENT, fullName: "Account B Child" });

    // While signed in as B, A's student must not be visible or selectable.
    const stateAsB = useAuthStore.getState();
    expect(selectActiveStudents(stateAsB).map((s) => s.id)).toEqual([studentB.id]);
    useAuthStore.getState().setActiveStudentId(studentA.id);
    expect(useAuthStore.getState().activeStudentId).toBe(studentB.id); // unchanged — rejected

    // Switching back to A restores exactly A's data.
    useAuthStore.getState().signOut();
    await signIn(PHONE_A);
    const stateAsA = useAuthStore.getState();
    expect(selectActiveStudents(stateAsA).map((s) => s.id)).toEqual([studentA.id]);
  });

  it("preserves student profiles across sign-out and sign-back-in on the same phone", async () => {
    await signIn(PHONE_A);
    useAuthStore.getState().addStudent(STUDENT);
    useAuthStore.getState().signOut();

    expect(useAuthStore.getState().activePhone).toBeNull();
    expect(useAuthStore.getState().activeStudentId).toBeNull();

    await signIn(PHONE_A);
    expect(selectActiveStudents(useAuthStore.getState())).toHaveLength(1);
  });
});

describe("test history", () => {
  it("records and filters attempts by student", async () => {
    await signIn(PHONE_A);
    const student = useAuthStore.getState().addStudent(STUDENT);

    useAuthStore.getState().recordTestResult({
      studentId: student.id,
      examId: "demo-jnvst",
      examName: "JNVST Demo",
      totalMarks: 10,
      maxMarks: 14,
      accuracyPercent: 71,
      percentile: 65,
      submittedAt: Date.now(),
      sectionBreakdown: [{ sectionKey: "arithmetic", sectionName: "Arithmetic", accuracyPercent: 80 }],
    });

    const history = selectStudentTestHistory(useAuthStore.getState(), student.id);
    expect(history).toHaveLength(1);
    expect(history[0]?.totalMarks).toBe(10);
    expect(history[0]?.sectionBreakdown[0]?.sectionKey).toBe("arithmetic");

    expect(selectStudentTestHistory(useAuthStore.getState(), "someone-else")).toHaveLength(0);
  });
});

describe("mistake log", () => {
  it("logs mistakes and counts only the unreviewed ones for a student", async () => {
    await signIn(PHONE_A);
    const student = useAuthStore.getState().addStudent(STUDENT);

    useAuthStore.getState().logMistakes([
      { studentId: student.id, examId: "demo-jnvst", testHistoryEntryId: "th1", questionId: "q1", questionNumber: 1, mistakeTag: "CARELESS_RUSHED", createdAt: Date.now() },
      { studentId: student.id, examId: "demo-jnvst", testHistoryEntryId: "th1", questionId: "q2", questionNumber: 2, mistakeTag: "CONCEPT_GAP", createdAt: Date.now() },
    ]);

    expect(selectUnreviewedMistakeCount(useAuthStore.getState(), student.id)).toBe(2);
    expect(selectUnreviewedCarelessCount(useAuthStore.getState(), student.id)).toBe(1);

    useAuthStore.getState().markAllMistakesReviewed(student.id);
    expect(selectUnreviewedMistakeCount(useAuthStore.getState(), student.id)).toBe(0);
  });
});

describe("notification preferences", () => {
  it("defaults to instant scorecard on, others off, and patches individually", async () => {
    await signIn(PHONE_A);
    const parentId = useAuthStore.getState().accounts[PHONE_A]!.parent.id;

    const defaults = selectNotificationPreferences(useAuthStore.getState(), parentId);
    expect(defaults).toEqual({ instantScorecard: true, weeklyDigest: false, dailyTip: false });

    useAuthStore.getState().updateNotificationPreferences(parentId, { weeklyDigest: true });
    const updated = selectNotificationPreferences(useAuthStore.getState(), parentId);
    expect(updated).toEqual({ instantScorecard: true, weeklyDigest: true, dailyTip: false });
  });
});
