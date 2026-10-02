import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { normalizeLeadPhone } from "@/lib/admin/leadOutreach";

export const dynamic = "force-dynamic";

interface InterestBody {
  instituteName?: string;
  directorName?: string;
  city?: string;
  district?: string;
  state?: string;
  phoneNumber?: string;
  details?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  // Honeypot: a real visitor never sees or fills this field.
  website?: string;
}

const MAX = { name: 120, place: 80, details: 500, utm: 60 };

function clean(value: string | undefined, max: number): string {
  return (value ?? "").trim().slice(0, max);
}

/**
 * Public sign-up from /for-institutes. Creates a CoachingLead in PENDING —
 * deliberately NOT auto-provisioning the 10 trial credits: that still
 * happens only when an admin approves the lead in /admin/leads, so a form
 * spammer can't mint Institute rows or credits.
 */
export async function POST(request: Request) {
  let body: InterestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Bots that fill every field get a silent success and nothing is stored.
  if (body.website) return NextResponse.json({ success: true });

  const instituteName = clean(body.instituteName, MAX.name);
  const directorName = clean(body.directorName, MAX.name);
  const city = clean(body.city, MAX.place);
  const district = clean(body.district, MAX.place);
  const state = clean(body.state, MAX.place);
  const phoneNumber = normalizeLeadPhone(clean(body.phoneNumber, 20));
  const details = clean(body.details, MAX.details);

  if (!instituteName || !directorName || !city || !state) {
    return NextResponse.json({ error: "Please fill in institute name, your name, city and state." }, { status: 400 });
  }
  if (!/^91[6-9]\d{9}$/.test(phoneNumber)) {
    return NextResponse.json({ error: "Please enter a valid 10-digit WhatsApp number." }, { status: 400 });
  }

  const tags = [clean(body.utmSource, MAX.utm), clean(body.utmMedium, MAX.utm), clean(body.utmCampaign, MAX.utm)].filter(Boolean);
  const source = tags.length > 0 ? tags.join(" / ") : "website";

  // Same number submitted twice is one lead, not two. The visitor still
  // sees success, so the form never reveals which numbers are already known.
  const existing = await prisma.coachingLead.findFirst({ where: { phoneNumber } });
  if (existing) return NextResponse.json({ success: true });

  await prisma.coachingLead.create({
    data: {
      instituteName,
      directorName,
      city,
      district,
      state,
      phoneNumber,
      notes: details ? `From /for-institutes: ${details}` : "From /for-institutes",
      source,
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
