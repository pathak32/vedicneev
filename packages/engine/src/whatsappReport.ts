/**
 * WhatsApp diagnostic-report formatting: builds a Meta Cloud API-compliant
 * Utility template payload plus a plaintext preview, and validates a
 * payload's shape before it's dispatched. Pure formatting — no fetch, no
 * knowledge of access tokens; apps/web's dispatcher owns the actual send.
 */

export type AdmissionChance = "HIGH" | "MODERATE" | "LOW";

export interface TopMistakeTag {
  /** Human-readable label, e.g. "Calculation Gap". */
  label: string;
  count: number;
}

export interface DiagnosticReportForWhatsApp {
  totalMarks: number;
  maxMarks: number;
  accuracyPercent: number;
  admissionChance: AdmissionChance;
  /** Null when the student had no wrong answers to tag. */
  topMistakeTag: TopMistakeTag | null;
  /** Magic link to the full online report — must be an absolute URL (e.g. "https://vedicneev.com/exam/…/results?student=…"). */
  reportUrl: string;
}

export interface StudentProfileForReport {
  fullName: string;
  targetExam: string;
}

export interface WhatsAppTextParameter {
  type: "text";
  text: string;
}

export interface WhatsAppTemplateComponent {
  type: "body" | "button";
  sub_type?: "url";
  index?: string;
  parameters: WhatsAppTextParameter[];
}

export interface WhatsAppUtilityTemplatePayload {
  messaging_product: "whatsapp";
  /** E.164 phone number, digits only (no leading '+'). */
  to: string;
  type: "template";
  template: {
    name: string;
    language: { code: string };
    components: WhatsAppTemplateComponent[];
  };
}

export interface FormattedWhatsAppReport {
  payload: WhatsAppUtilityTemplatePayload;
  plaintextPreview: string;
}

const CHANCE_LABEL: Record<AdmissionChance, string> = {
  HIGH: "High",
  MODERATE: "Moderate",
  LOW: "Low",
};

function scoreLine(report: DiagnosticReportForWhatsApp): string {
  return `${report.totalMarks}/${report.maxMarks} (${report.accuracyPercent.toFixed(0)}%)`;
}

function topMistakeLine(report: DiagnosticReportForWhatsApp, language: "en" | "hi"): string {
  if (!report.topMistakeTag) {
    return language === "hi" ? "कोई गलती दर्ज नहीं हुई" : "No mistakes logged";
  }
  const { label, count } = report.topMistakeTag;
  return language === "hi" ? `${count} ${label}` : `${count} ${label}${count === 1 ? "" : "s"}`;
}

/** Plaintext message body — shared between the template preview and the wa.me share link. */
export function buildWhatsAppPlaintextMessage(
  report: DiagnosticReportForWhatsApp,
  student: StudentProfileForReport,
  language: "en" | "hi" = "en"
): string {
  if (language === "hi") {
    return [
      "📊 वेदिक नींव डायग्नोस्टिक रिपोर्ट",
      `${student.fullName} — ${student.targetExam}`,
      `स्कोर: ${scoreLine(report)}`,
      `चयन संभावना: ${CHANCE_LABEL[report.admissionChance]}`,
      `सुधार का क्षेत्र: ${topMistakeLine(report, language)}`,
      `पूरी रिपोर्ट देखें: ${report.reportUrl}`,
    ].join("\n");
  }

  return [
    "📊 Vedic Neev Diagnostic Report",
    `${student.fullName} — ${student.targetExam}`,
    `Score: ${scoreLine(report)}`,
    `Admission Chance: ${CHANCE_LABEL[report.admissionChance]}`,
    `Top area to improve: ${topMistakeLine(report, language)}`,
    `View full report: ${report.reportUrl}`,
  ].join("\n");
}

/**
 * Builds a Meta Cloud API `/messages` Utility template payload. The
 * template ("diagnostic_report_ready") is assumed pre-approved with a
 * 5-parameter body and a dynamic URL button whose base is configured in
 * the template itself — only the URL's variable suffix is sent here, per
 * Meta's template-button convention.
 */
export function formatWhatsAppDiagnosticPayload(
  report: DiagnosticReportForWhatsApp,
  student: StudentProfileForReport,
  toPhoneE164: string,
  language: "en" | "hi" = "en"
): FormattedWhatsAppReport {
  const url = new URL(report.reportUrl);
  const buttonUrlSuffix = `${url.pathname}${url.search}`.replace(/^\//, "");

  const payload: WhatsAppUtilityTemplatePayload = {
    messaging_product: "whatsapp",
    to: toPhoneE164.replace(/\D/g, ""),
    type: "template",
    template: {
      name: "diagnostic_report_ready",
      language: { code: language },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: student.fullName },
            { type: "text", text: student.targetExam },
            { type: "text", text: scoreLine(report) },
            { type: "text", text: CHANCE_LABEL[report.admissionChance] },
            { type: "text", text: topMistakeLine(report, language) },
          ],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: buttonUrlSuffix }],
        },
      ],
    },
  };

  return { payload, plaintextPreview: buildWhatsAppPlaintextMessage(report, student, language) };
}

export interface PayloadValidationResult {
  valid: boolean;
  errors: string[];
}

/** Validates a payload's shape before dispatch — catches malformed input before it ever reaches the API. */
export function validateWhatsAppPayload(payload: WhatsAppUtilityTemplatePayload): PayloadValidationResult {
  const errors: string[] = [];

  if (payload.messaging_product !== "whatsapp") {
    errors.push("messaging_product must be 'whatsapp'.");
  }
  if (!/^\d{10,15}$/.test(payload.to)) {
    errors.push("to must be a 10-15 digit phone number with no '+' or other punctuation.");
  }
  if (payload.type !== "template") {
    errors.push("type must be 'template'.");
  }
  if (!payload.template?.name) {
    errors.push("template.name is required.");
  }
  if (!payload.template?.language?.code) {
    errors.push("template.language.code is required.");
  }

  const body = payload.template?.components?.find((c) => c.type === "body");
  if (!body || body.parameters.length === 0) {
    errors.push("template.components must include a 'body' component with at least one parameter.");
  } else if (body.parameters.some((p) => !p.text.trim())) {
    errors.push("template body parameters must not be empty strings.");
  }

  const urlButton = payload.template?.components?.find((c) => c.type === "button" && c.sub_type === "url");
  if (urlButton && urlButton.parameters.length === 0) {
    errors.push("a 'button' component with sub_type 'url' must include its URL parameter.");
  }

  return { valid: errors.length === 0, errors };
}
