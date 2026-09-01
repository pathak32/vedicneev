import type { WhatsAppUtilityTemplatePayload } from "@vedicneev/engine";

export interface DispatchResult {
  success: boolean;
  mock: boolean;
  messageId: string | null;
  error?: string;
}

/** Posts a formatted WhatsApp payload to our own /api/whatsapp/send-report route (never calls Meta's API directly from the client — the access token stays server-only). */
export async function dispatchWhatsAppReport(payload: WhatsAppUtilityTemplatePayload): Promise<DispatchResult> {
  try {
    const response = await fetch("/api/whatsapp/send-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as DispatchResult;
    return data;
  } catch (error) {
    return {
      success: false,
      mock: false,
      messageId: null,
      error: error instanceof Error ? error.message : "Network error.",
    };
  }
}
