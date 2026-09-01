import { describe, expect, it } from "vitest";

import {
  buildWhatsAppPlaintextMessage,
  formatWhatsAppDiagnosticPayload,
  validateWhatsAppPayload,
  type DiagnosticReportForWhatsApp,
  type StudentProfileForReport,
} from "./whatsappReport";

const report: DiagnosticReportForWhatsApp = {
  totalMarks: 9,
  maxMarks: 14,
  accuracyPercent: 64.3,
  admissionChance: "HIGH",
  topMistakeTag: { label: "Calculation Gap", count: 3 },
  reportUrl: "https://vedicneev.com/exam/demo-jnvst/results?student=abc123",
};

const student: StudentProfileForReport = { fullName: "Aarav Sharma", targetExam: "JNVST" };

describe("buildWhatsAppPlaintextMessage", () => {
  it("includes the student's name, exam, score, admission chance, and top mistake tag", () => {
    const message = buildWhatsAppPlaintextMessage(report, student);
    expect(message).toContain("Aarav Sharma");
    expect(message).toContain("JNVST");
    expect(message).toContain("9/14 (64%)");
    expect(message).toContain("High");
    expect(message).toContain("3 Calculation Gaps");
    expect(message).toContain(report.reportUrl);
  });

  it("pluralizes the mistake count correctly for a singular count", () => {
    const single: DiagnosticReportForWhatsApp = { ...report, topMistakeTag: { label: "Concept Gap", count: 1 } };
    const message = buildWhatsAppPlaintextMessage(single, student);
    expect(message).toContain("1 Concept Gap");
    expect(message).not.toContain("1 Concept Gaps");
  });

  it("falls back to a no-mistakes line when topMistakeTag is null", () => {
    const perfect: DiagnosticReportForWhatsApp = { ...report, topMistakeTag: null };
    const message = buildWhatsAppPlaintextMessage(perfect, student);
    expect(message).toContain("No mistakes logged");
  });

  it("renders a Hindi message when language is 'hi'", () => {
    const message = buildWhatsAppPlaintextMessage(report, student, "hi");
    expect(message).toContain("वेदिक नींव डायग्नोस्टिक रिपोर्ट");
    expect(message).toContain("Aarav Sharma");
  });
});

describe("formatWhatsAppDiagnosticPayload", () => {
  it("builds a well-formed Meta Cloud API template payload", () => {
    const { payload } = formatWhatsAppDiagnosticPayload(report, student, "+91 98765-43210");
    expect(payload.messaging_product).toBe("whatsapp");
    expect(payload.to).toBe("919876543210");
    expect(payload.type).toBe("template");
    expect(payload.template.name).toBe("diagnostic_report_ready");
    expect(payload.template.language.code).toBe("en");
  });

  it("puts the 5 expected values into the body component's parameters, in order", () => {
    const { payload } = formatWhatsAppDiagnosticPayload(report, student, "9876543210");
    const body = payload.template.components.find((c) => c.type === "body");
    expect(body?.parameters.map((p) => p.text)).toEqual([
      "Aarav Sharma",
      "JNVST",
      "9/14 (64%)",
      "High",
      "3 Calculation Gaps",
    ]);
  });

  it("carries only the URL's path+query as the button parameter, not the full absolute URL", () => {
    const { payload } = formatWhatsAppDiagnosticPayload(report, student, "9876543210");
    const button = payload.template.components.find((c) => c.type === "button");
    expect(button?.parameters[0]?.text).toBe("exam/demo-jnvst/results?student=abc123");
  });

  it("returns a plaintext preview matching buildWhatsAppPlaintextMessage", () => {
    const { plaintextPreview } = formatWhatsAppDiagnosticPayload(report, student, "9876543210");
    expect(plaintextPreview).toBe(buildWhatsAppPlaintextMessage(report, student, "en"));
  });

  it("produces a payload that passes validateWhatsAppPayload", () => {
    const { payload } = formatWhatsAppDiagnosticPayload(report, student, "9876543210");
    expect(validateWhatsAppPayload(payload)).toEqual({ valid: true, errors: [] });
  });
});

describe("validateWhatsAppPayload", () => {
  const validPayload = formatWhatsAppDiagnosticPayload(report, student, "9876543210").payload;

  it("accepts a well-formed payload", () => {
    expect(validateWhatsAppPayload(validPayload).valid).toBe(true);
  });

  it("rejects a non-'whatsapp' messaging_product", () => {
    const bad = { ...validPayload, messaging_product: "sms" as "whatsapp" };
    const result = validateWhatsAppPayload(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("messaging_product"))).toBe(true);
  });

  it("rejects a 'to' number with a leading '+' or non-digit characters", () => {
    const result = validateWhatsAppPayload({ ...validPayload, to: "+91 98765 43210" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("to"))).toBe(true);
  });

  it("rejects a payload missing the template name", () => {
    const bad = { ...validPayload, template: { ...validPayload.template, name: "" } };
    expect(validateWhatsAppPayload(bad).valid).toBe(false);
  });

  it("rejects a payload whose body component has no parameters", () => {
    const bad = {
      ...validPayload,
      template: {
        ...validPayload.template,
        components: validPayload.template.components.map((c) =>
          c.type === "body" ? { ...c, parameters: [] } : c
        ),
      },
    };
    const result = validateWhatsAppPayload(bad);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("body"))).toBe(true);
  });

  it("rejects a payload with a blank body parameter", () => {
    const bad = {
      ...validPayload,
      template: {
        ...validPayload.template,
        components: validPayload.template.components.map((c) =>
          c.type === "body" ? { ...c, parameters: [{ type: "text" as const, text: "   " }] } : c
        ),
      },
    };
    expect(validateWhatsAppPayload(bad).valid).toBe(false);
  });
});
