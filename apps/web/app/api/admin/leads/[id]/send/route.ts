import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";
import { generateOutreachMessage } from "@/lib/admin/leadOutreach";
import { provisionTrialCreditsForLead } from "@/lib/admin/leadTrialProvisioning";
import { buildTemplateMessagePayload, sendWhatsAppTemplateMessage, type SendTemplateMessageResult } from "@/lib/whatsapp/whatsappService";

export const dynamic = "force-dynamic";

// Same approved-template requirement as WHATSAPP_TEMPLATE_NAME (see
// .env.example) — must already be live in Meta's Marketing category with a
// single body parameter wide enough to carry the full generated outreach
// text. Falls back to the OTP/report template name so a fresh environment
// with only that one configured still exercises the real send path instead
// of forcing mock mode.
const LEAD_TEMPLATE_NAME = process.env.WHATSAPP_LEAD_TEMPLATE_NAME || process.env.WHATSAPP_TEMPLATE_NAME || "coaching_lead_outreach";
const LEAD_TEMPLATE_LANG = (process.env.WHATSAPP_LEAD_TEMPLATE_LANG || process.env.WHATSAPP_TEMPLATE_LANG || "en") as "en" | "hi";

/**
 * "Approve & Send via WhatsApp" — dispatches the personalized outreach
 * message, then on a successful send: bumps the lead to CONTACTED (never
 * downgrades a lead that's already progressed further) and runs the
 * trial-credit provisioning hook exactly once per lead.
 */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const lead = await prisma.coachingLead.findUnique({ where: { id: params.id } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const message = generateOutreachMessage(lead);
  const payload = buildTemplateMessagePayload(lead.phoneNumber, LEAD_TEMPLATE_NAME, [message], LEAD_TEMPLATE_LANG);

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Same mock-fallback convention as /api/whatsapp/send-report: no real
  // Meta credentials configured in this project yet, so log the exact
  // payload and proceed as if the send succeeded rather than failing the
  // whole admin action.
  const sendResult: SendTemplateMessageResult =
    accessToken && phoneNumberId
      ? await sendWhatsAppTemplateMessage(payload)
      : (() => {
          // eslint-disable-next-line no-console
          console.info("[mock WhatsApp] Coaching lead outreach — not actually sent. Payload:", JSON.stringify(payload));
          return { success: true, messageId: `mock_msg_${Date.now()}` };
        })();

  if (!sendResult.success) {
    return NextResponse.json({ error: sendResult.error ?? "WhatsApp send failed." }, { status: 502 });
  }

  const shouldProvision = lead.trialCreditsGrantedAt === null;
  if (shouldProvision) {
    await provisionTrialCreditsForLead(lead);
  }

  const updated = await prisma.coachingLead.update({
    where: { id: lead.id },
    data: {
      status: lead.status === "PENDING" ? "CONTACTED" : lead.status,
      ...(shouldProvision ? { trialCreditsGrantedAt: new Date() } : {}),
    },
  });

  return NextResponse.json({ success: true, lead: updated, messageId: sendResult.messageId, mock: !accessToken || !phoneNumberId });
}
