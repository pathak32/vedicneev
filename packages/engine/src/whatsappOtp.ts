/**
 * WhatsApp-delivered login OTP formatting. Pure — no fetch, no knowledge of
 * access tokens; apps/web/src/lib/auth/whatsappOtpServer.ts owns the
 * actual send and reuses whatsappReport.ts's validateWhatsAppPayload (it's
 * already generic over any WhatsAppUtilityTemplatePayload, not report-specific).
 */
import type { WhatsAppUtilityTemplatePayload } from "./whatsappReport";

/**
 * Builds a Meta Cloud API `/messages` Utility template payload for an OTP
 * send. The template is assumed pre-approved in Meta's Authentication
 * category with a single body parameter (the code) — this project has no
 * way to create/approve that template itself; see the env var docs for
 * WHATSAPP_TEMPLATE_NAME/WHATSAPP_TEMPLATE_LANG. `language` is a plain
 * string (not narrowed to "en" | "hi") since it's driven directly by
 * WHATSAPP_TEMPLATE_LANG and Meta's approved translations for a template
 * aren't limited to those two locales.
 */
export function formatWhatsAppOtpPayload(
  otpCode: string,
  toPhoneE164: string,
  templateName: string,
  language: string = "en"
): WhatsAppUtilityTemplatePayload {
  return {
    messaging_product: "whatsapp",
    to: toPhoneE164.replace(/\D/g, ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: language },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: otpCode }],
        },
      ],
    },
  };
}
