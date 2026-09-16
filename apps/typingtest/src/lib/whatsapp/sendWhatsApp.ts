import type { WhatsAppUtilityTemplatePayload } from "@vedicneev/engine";

/**
 * App-local copy of apps/web/src/lib/whatsapp/whatsappService.ts's Meta
 * Graph API sender — same app-local-duplication convention already used for
 * phoneFormat.ts/resolveDbUser.ts in this app, since this is a separate
 * Vercel Project with its own env vars (WHATSAPP_ACCESS_TOKEN /
 * WHATSAPP_PHONE_NUMBER_ID must be attached here too, reusing the same
 * Meta values apps/web already has — see DEPLOYMENT.md).
 */

const GRAPH_API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";

export interface SendTemplateMessageResult {
  success: boolean;
  messageId: string | null;
  error?: string;
}

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
