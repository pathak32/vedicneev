import type { WhatsAppUtilityTemplatePayload } from "@vedicneev/engine";

/**
 * Reusable Meta Graph API sender for approved WhatsApp template messages
 * (scorecard-ready notifications, sample-paper delivery links, etc.) — the
 * fetch-and-auth counterpart to packages/engine's pure payload formatters
 * (formatWhatsAppDiagnosticPayload, formatWhatsAppOtpPayload). Reads
 * WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID at call time rather than
 * module load so a missing config fails the individual send, not the
 * whole route.
 */

const GRAPH_API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";

export interface SendTemplateMessageResult {
  success: boolean;
  messageId: string | null;
  error?: string;
}

/** Builds an approved-template payload with plain-text body parameters — e.g. a sample-paper link or scorecard summary. */
export function buildTemplateMessagePayload(
  toPhoneE164: string,
  templateName: string,
  bodyParams: string[],
  languageCode: "en" | "hi" = "en"
): WhatsAppUtilityTemplatePayload {
  return {
    messaging_product: "whatsapp",
    to: toPhoneE164.replace(/\D/g, ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: "body",
          parameters: bodyParams.map((text) => ({ type: "text", text })),
        },
      ],
    },
  };
}

/**
 * Sends an approved template message via Meta's Graph API
 * (`/{phoneNumberId}/messages`). Returns a result object rather than
 * throwing on failure — callers (webhook auto-replies, scorecard delivery)
 * decide whether a failed send should surface to the user or just log.
 */
export async function sendWhatsAppTemplateMessage(
  payload: WhatsAppUtilityTemplatePayload
): Promise<SendTemplateMessageResult> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return {
      success: false,
      messageId: null,
      error: "WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID not configured.",
    };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      return { success: false, messageId: null, error: data?.error?.message ?? "WhatsApp API error." };
    }

    return { success: true, messageId: data?.messages?.[0]?.id ?? null };
  } catch (error) {
    return {
      success: false,
      messageId: null,
      error: error instanceof Error ? error.message : "Failed to send.",
    };
  }
}
