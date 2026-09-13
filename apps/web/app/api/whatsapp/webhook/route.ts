import { NextResponse } from "next/server";

/**
 * Meta WhatsApp Cloud API webhook — GET handles the one-time subscription
 * handshake (Meta calls this when you save the webhook URL in the App
 * Dashboard); POST receives every subsequent event (inbound messages,
 * delivery/read statuses) for the subscribed WABA. Meta retries a POST
 * that doesn't get a fast 2xx, so this always acks quickly and does any
 * further processing (auto-replies, CRM sync, etc.) as a follow-up
 * extension point rather than blocking the response on it.
 */
export const dynamic = "force-dynamic";

const KEYWORD_PATTERNS: Record<string, RegExp> = {
  RMS: /\bRMS\b/i,
  SAINIK: /\bSAINIK\b/i,
  SAMPLE: /\bSAMPLE\b/i,
};

interface IncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
}

interface MessageStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
}

interface WhatsAppWebhookValue {
  messaging_product?: string;
  metadata?: { display_phone_number?: string; phone_number_id?: string };
  contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
  messages?: IncomingMessage[];
  statuses?: MessageStatus[];
}

interface WhatsAppWebhookPayload {
  object?: string;
  entry?: Array<{
    id: string;
    changes?: Array<{ field: string; value: WhatsAppWebhookValue }>;
  }>;
}

/** Meta's one-time subscription handshake — echo back hub.challenge iff hub.verify_token matches our configured secret. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Meta dashboard copy/paste (or a Vercel env var pasted with a trailing
  // newline) is the single most common cause of a token that "looks"
  // right but fails ===. Trim both sides of the comparison rather than
  // requiring byte-exact input.
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim();
  const incomingToken = token?.trim();

  // eslint-disable-next-line no-console
  console.info(
    `[WhatsApp webhook] GET verification attempt — mode=${mode ?? "(missing)"}, ` +
      `token=${incomingToken ? "present" : "(missing)"}, challenge=${challenge ? "present" : "(missing)"}, ` +
      `configuredToken=${verifyToken ? "present" : "(missing)"}.`
  );

  if (!verifyToken) {
    // eslint-disable-next-line no-console
    console.error(
      "[WhatsApp webhook] WHATSAPP_WEBHOOK_VERIFY_TOKEN is not configured in this environment " +
        "(check Vercel → Project Settings → Environment Variables for the environment this deployment " +
        "is running in) — refusing verification."
    );
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  if (mode !== "subscribe") {
    // eslint-disable-next-line no-console
    console.warn(`[WhatsApp webhook] Unexpected hub.mode "${mode}" — Meta always sends "subscribe" for this handshake.`);
    return NextResponse.json({ error: "Verification failed." }, { status: 403 });
  }

  if (!challenge) {
    // eslint-disable-next-line no-console
    console.warn("[WhatsApp webhook] Missing hub.challenge on an otherwise valid verification request.");
    return NextResponse.json({ error: "Verification failed." }, { status: 403 });
  }

  if (incomingToken !== verifyToken) {
    // eslint-disable-next-line no-console
    console.warn(
      `[WhatsApp webhook] Token mismatch — incoming token does not match WHATSAPP_WEBHOOK_VERIFY_TOKEN ` +
        `(lengths: incoming=${incomingToken?.length ?? 0}, configured=${verifyToken.length}). ` +
        "Confirm the verify token pasted into Meta App Dashboard → WhatsApp → Configuration exactly " +
        "matches the value in this deployment's environment variables."
    );
    return NextResponse.json({ error: "Verification failed." }, { status: 403 });
  }

  // Must be a bare text response — Meta rejects a JSON-wrapped challenge.
  return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
}

function matchedKeyword(body: string): string | null {
  for (const [keyword, pattern] of Object.entries(KEYWORD_PATTERNS)) {
    if (pattern.test(body)) return keyword;
  }
  return null;
}

function handleIncomingMessage(message: IncomingMessage, waId: string | undefined) {
  if (message.type !== "text" || !message.text) {
    // eslint-disable-next-line no-console
    console.info(`[WhatsApp webhook] Non-text message from ${message.from} (type: ${message.type}).`);
    return;
  }

  const keyword = matchedKeyword(message.text.body);
  // eslint-disable-next-line no-console
  console.info(
    `[WhatsApp webhook] Message from ${waId ?? message.from}: "${message.text.body}"${
      keyword ? ` (matched keyword: ${keyword})` : ""
    }`
  );

  // Extension point: route `keyword` to auto-reply logic (e.g. dispatch a
  // sample-paper template via sendWhatsAppTemplateMessage in
  // src/lib/whatsapp/whatsappService.ts) once the corresponding templates
  // are approved in Meta Business Manager.
}

function handleStatusUpdate(status: MessageStatus) {
  // eslint-disable-next-line no-console
  console.info(`[WhatsApp webhook] Message ${status.id} to ${status.recipient_id} is now "${status.status}".`);
}

export async function POST(request: Request) {
  let payload: WhatsAppWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (payload.object !== "whatsapp_business_account") {
    return NextResponse.json({ received: true });
  }

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;

      const { value } = change;
      const waId = value.contacts?.[0]?.wa_id;

      for (const message of value.messages ?? []) {
        handleIncomingMessage(message, waId);
      }
      for (const status of value.statuses ?? []) {
        handleStatusUpdate(status);
      }
    }
  }

  return NextResponse.json({ received: true });
}
