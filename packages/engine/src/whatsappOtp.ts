/**
 * WhatsApp-delivered login OTP formatting. Pure — no fetch, no knowledge of
 * access tokens; apps/web/src/lib/auth/whatsappOtpServer.ts owns the
 * actual send and reuses whatsappReport.ts's validateWhatsAppPayload (it's
 * already generic over any WhatsAppUtilityTemplatePayload, not report-specific).
 */
import type { WhatsAppTemplateComponent, WhatsAppUtilityTemplatePayload } from "./whatsappReport";

/**
 * "NONE" (default) sends only the body component, matching a plain
 * Authentication template with no button. Meta's WhatsApp Manager UI
 * defaults new Authentication templates to including a one-tap button,
 * though, and a body-only payload against a template that actually has one
 * of these buttons is a common cause of error #131008 ("Required parameter
 * is missing") — the button component itself is a separate required entry
 * in `components`, not something the body parameter satisfies. "COPY_CODE"
 * appends the button Meta's "Copy Code" button type expects; "URL" appends
 * the button shape for a one-tap autofill/link button. Which one (if any)
 * a given template needs is decided in Meta Business Manager, not here —
 * see WHATSAPP_TEMPLATE_BUTTON_TYPE in the env var docs.
 */
export type WhatsAppOtpButtonType = "NONE" | "COPY_CODE" | "URL";

function otpButtonComponent(otpCode: string, buttonType: WhatsAppOtpButtonType): WhatsAppTemplateComponent | null {
  switch (buttonType) {
    case "COPY_CODE":
      return {
        type: "button",
        sub_type: "copy_code",
        index: "0",
        parameters: [{ type: "coupon_code", coupon_code: otpCode }],
      };
    case "URL":
      return {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [{ type: "text", text: otpCode }],
      };
    case "NONE":
      return null;
  }
}

/**
 * Builds a Meta Cloud API `/messages` Utility template payload for an OTP
 * send. The template is assumed pre-approved in Meta's Authentication
 * category with a single body parameter (the code) — this project has no
 * way to create/approve that template itself; see the env var docs for
 * WHATSAPP_TEMPLATE_NAME/WHATSAPP_TEMPLATE_LANG. `language` is a plain
 * string (not narrowed to "en" | "hi") since it's driven directly by
 * WHATSAPP_TEMPLATE_LANG and Meta's approved translations for a template
 * aren't limited to those two locales. `buttonType` mirrors
 * WHATSAPP_TEMPLATE_BUTTON_TYPE — see otpButtonComponent above.
 */
export function formatWhatsAppOtpPayload(
  otpCode: string,
  toPhoneE164: string,
  templateName: string,
  language: string = "en",
  buttonType: WhatsAppOtpButtonType = "NONE"
): WhatsAppUtilityTemplatePayload {
  const button = otpButtonComponent(otpCode, buttonType);

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
        ...(button ? [button] : []),
      ],
    },
  };
}
