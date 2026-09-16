import { describe, expect, it } from "vitest";

import {
  buildWhatsAppTypingScorecardMessage,
  formatWhatsAppTypingScorecardPayload,
  type TypingScorecardForWhatsApp,
} from "./typingWhatsappScorecard";

const scorecard: TypingScorecardForWhatsApp = {
  examName: "RRB NTPC — English",
  grossSpeedWpm: 42.4,
  netSpeedWpm: 38.1,
  accuracyPercent: 96.2,
  fullMistakes: 2,
  halfMistakes: 3,
};

describe("buildWhatsAppTypingScorecardMessage", () => {
  it("includes the exam name, speeds, accuracy, and mistake counts", () => {
    const message = buildWhatsAppTypingScorecardMessage(scorecard);
    expect(message).toContain("RRB NTPC — English");
    expect(message).toContain("38 wpm");
    expect(message).toContain("42 wpm");
    expect(message).toContain("96%");
    expect(message).toContain("2 full, 3 half");
  });

  it("renders a Hindi variant", () => {
    const message = buildWhatsAppTypingScorecardMessage(scorecard, "hi");
    expect(message).toContain("टाइपिंग स्कोरकार्ड");
  });
});

describe("formatWhatsAppTypingScorecardPayload", () => {
  it("builds a well-formed template payload with digits-only phone", () => {
    const payload = formatWhatsAppTypingScorecardPayload(scorecard, "+91 98765 43210");
    expect(payload.to).toBe("919876543210");
    expect(payload.template.name).toBe("typing_scorecard_ready");
    const body = payload.template.components.find((c) => c.type === "body");
    expect(body?.parameters).toHaveLength(5);
    expect(body?.parameters[0]).toEqual({ type: "text", text: "RRB NTPC — English" });
  });

  it("maps parameters 1-5 to Target Exam / Net Speed / Gross Speed / Accuracy / Total Mistakes in order", () => {
    const payload = formatWhatsAppTypingScorecardPayload(scorecard, "9876543210");
    const body = payload.template.components.find((c) => c.type === "body");
    expect(body?.parameters).toEqual([
      { type: "text", text: "RRB NTPC — English" }, // Target Exam
      { type: "text", text: "38" }, // Net Speed
      { type: "text", text: "42" }, // Gross Speed
      { type: "text", text: "96" }, // Accuracy
      { type: "text", text: "5" }, // Total Mistakes (2 full + 3 half)
    ]);
  });
});
