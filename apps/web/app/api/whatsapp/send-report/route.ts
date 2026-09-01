import { NextResponse } from "next/server";
import { validateWhatsAppPayload, type WhatsAppUtilityTemplatePayload } from "@vedicneev/engine";

/**
 * Real WhatsApp Cloud API integration point. No WHATSAPP_ACCESS_TOKEN /
 * WHATSAPP_PHONE_NUMBER_ID are configured in this project, so every call
 * here takes the mock branch: it validates and logs the exact payload
 * server-side and returns a clearly `mock: true` response instead of
 * calling Meta's Graph API. Setting both env vars is a drop-in change —
 * no code here needs to change.
 */

const GRAPH_API_VERSION = "v20.0";

export async function POST(request: Request) {
  let payload: WhatsAppUtilityTemplatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, mock: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateWhatsAppPayload(payload);
  if (!validation.valid) {
    return NextResponse.json(
      { success: false, mock: false, error: validation.errors.join(" ") },
      { status: 400 }
    );
  }

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    // eslint-disable-next-line no-console
    console.info("[mock WhatsApp] No WHATSAPP_ACCESS_TOKEN configured — not actually sent. Payload:", JSON.stringify(payload));
    return NextResponse.json({
      success: true,
      mock: true,
      messageId: `mock_msg_${Date.now()}`,
    });
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
      return NextResponse.json(
        { success: false, mock: false, error: data?.error?.message ?? "WhatsApp API error." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, mock: false, messageId: data?.messages?.[0]?.id ?? null });
  } catch (error) {
    return NextResponse.json(
      { success: false, mock: false, error: error instanceof Error ? error.message : "Failed to send." },
      { status: 502 }
    );
  }
}
