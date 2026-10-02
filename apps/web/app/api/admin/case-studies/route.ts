import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";
import { generateFeedbackRequestMessage, generateFeedbackToken } from "@/lib/admin/caseStudy";

export const dynamic = "force-dynamic";

function siteOrigin(request: Request): string {
  return (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
}

/**
 * Creates (or returns the existing) feedback request for a lead and hands
 * back the private link plus the ready-to-send WhatsApp message. Nothing is
 * sent from here: the admin sends it from their own WhatsApp.
 */
export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: { leadId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.leadId) return NextResponse.json({ error: "leadId is required." }, { status: 400 });

  const lead = await prisma.coachingLead.findUnique({ where: { id: body.leadId } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const feedback =
    (await prisma.pilotFeedback.findFirst({ where: { leadId: lead.id }, orderBy: { createdAt: "desc" } })) ??
    (await prisma.pilotFeedback.create({
      data: {
        token: generateFeedbackToken(),
        leadId: lead.id,
        instituteName: lead.instituteName,
        contactName: lead.directorName,
        state: lead.state,
      },
    }));

  const link = `${siteOrigin(request)}/feedback/${feedback.token}`;
  const message = generateFeedbackRequestMessage(lead, link);
  const whatsappUrl = `https://wa.me/${lead.phoneNumber}?text=${encodeURIComponent(message)}`;

  return NextResponse.json({ success: true, feedback, link, message, whatsappUrl });
}
