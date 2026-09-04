/**
 * WhatsApp-delivered login OTP formatting. Pure — no fetch, no knowledge of
 * access tokens; apps/web/app/api/auth/whatsapp-otp/route.ts owns the
 * actual send and reuses whatsappReport.ts's validateWhatsAppPayload (it's
 * already generic over any WhatsAppUtilityTemplatePayload, not report-specific).
 */
import type { WhatsAppUtilityTemplatePayload } from "./whatsappReport";

/**
 * Builds a Meta Cloud API `/messages` Utility template payload for an OTP
 * send. The template is assumed pre-approved in Meta's Authentication
 * category with a single body parameter (the code) — this project has no
 * way to create/approve that template itself; see the env var docs for
 * WHATSAPP_OTP_TEMPLATE_NAME.
 */
export function formatWhatsAppOtpPayload(
  otpCode: string,
  toPhoneE164: string,
  templateName: string,
  language: "en" | "hi" = "en"
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
