/**
 * WhatsApp typing-scorecard formatting for typingtest.vedicneev.com — same
 * pure formatting / no-fetch split as whatsappReport.ts (that file's
 * WhatsAppUtilityTemplatePayload/WhatsAppTextParameter types are reused
 * verbatim here rather than redefined, since the payload shape is identical
 * regardless of which product built it).
 */

import type { WhatsAppUtilityTemplatePayload } from "./whatsappReport";

export interface TypingScorecardForWhatsApp {
  examName: string;
  grossSpeedWpm: number;
  netSpeedWpm: number;
  accuracyPercent: number;
  fullMistakes: number;
  halfMistakes: number;
}

/** Plaintext message body — shared between a template preview and any wa.me share link. */
export function buildWhatsAppTypingScorecardMessage(
  scorecard: TypingScorecardForWhatsApp,
  language: "en" | "hi" = "en"
): string {
  const netSpeed = `${scorecard.netSpeedWpm.toFixed(0)} wpm`;
  const grossSpeed = `${scorecard.grossSpeedWpm.toFixed(0)} wpm`;
  const accuracy = `${scorecard.accuracyPercent.toFixed(0)}%`;
  const mistakes = `${scorecard.fullMistakes} full, ${scorecard.halfMistakes} half`;

  if (language === "hi") {
    return [
      "⌨️ वेदिक नींव टाइपिंग स्कोरकार्ड",
      scorecard.examName,
      `नेट स्पीड: ${netSpeed} (ग्रॉस: ${grossSpeed})`,
      `सटीकता: ${accuracy}`,
      `गलतियाँ: ${mistakes}`,
    ].join("\n");
  }

  return [
    "⌨️ Vedic Neev Typing Scorecard",
    scorecard.examName,
    `Net Speed: ${netSpeed} (Gross: ${grossSpeed})`,
    `Accuracy: ${accuracy}`,
    `Mistakes: ${mistakes}`,
  ].join("\n");
}

/**
 * Builds a Meta Cloud API `/messages` Utility template payload. The
 * approved "typing_scorecard_ready" template's 5 body variables, in order,
 * are: {{1}} Target Exam, {{2}} Net Speed, {{3}} Gross Speed, {{4}}
 * Accuracy, {{5}} Total Mistakes — this function only formats the payload
 * to match that exact order/shape, it doesn't create the template.
 */
export function formatWhatsAppTypingScorecardPayload(
  scorecard: TypingScorecardForWhatsApp,
  toPhoneE164: string,
  language: "en" | "hi" = "en"
): WhatsAppUtilityTemplatePayload {
  const totalMistakes = scorecard.fullMistakes + scorecard.halfMistakes;

  return {
    messaging_product: "whatsapp",
    to: toPhoneE164.replace(/\D/g, ""),
    type: "template",
    template: {
      name: "typing_scorecard_ready",
      language: { code: language },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: scorecard.examName }, // {{1}} Target Exam
            { type: "text", text: scorecard.netSpeedWpm.toFixed(0) }, // {{2}} Net Speed — plain number; template body supplies the "wpm" unit
            { type: "text", text: scorecard.grossSpeedWpm.toFixed(0) }, // {{3}} Gross Speed — plain number; template body supplies the "wpm" unit
            { type: "text", text: scorecard.accuracyPercent.toFixed(0) }, // {{4}} Accuracy — plain number; template body supplies the "%" unit
            { type: "text", text: String(totalMistakes) }, // {{5}} Total Mistakes
          ],
        },
      ],
    },
  };
}
