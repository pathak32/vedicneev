import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";
import { normalizeLeadPhone } from "@/lib/admin/leadOutreach";

export const dynamic = "force-dynamic";

interface LeadInput {
  instituteName?: string;
  directorName?: string;
  city?: string;
  state?: string;
  district?: string;
  phoneNumber?: string;
  notes?: string;
}

interface CreateBody {
  lead?: LeadInput;
  leads?: LeadInput[];
}

function validate(input: LeadInput): string | null {
  if (!input.instituteName?.trim()) return "Institute name is required.";
  if (!input.directorName?.trim()) return "Director name is required.";
  if (!input.city?.trim()) return "City is required.";
  if (!input.state?.trim()) return "State is required.";
  if (!input.district?.trim()) return "District is required.";
  if (!input.phoneNumber?.replace(/\D/g, "")) return "Phone number is required.";
  return null;
}

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const leads = await prisma.coachingLead.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return NextResponse.json({ success: true, leads });
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: CreateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // A single {lead} add or a bulk {leads: [...]} import both land here —
  // the admin UI's "Add Lead" dialog and its "Bulk Import" dialog post to
  // the same endpoint rather than needing two separate routes.
  const inputs = body.leads ?? (body.lead ? [body.lead] : []);
  if (inputs.length === 0) return NextResponse.json({ error: "No lead data provided." }, { status: 400 });

  for (const input of inputs) {
    const validationError = validate(input);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const created = await prisma.coachingLead.createMany({
      data: inputs.map((input) => ({
        instituteName: input.instituteName!.trim(),
        directorName: input.directorName!.trim(),
        city: input.city!.trim(),
        state: input.state!.trim(),
        district: input.district!.trim(),
        phoneNumber: normalizeLeadPhone(input.phoneNumber!),
        notes: input.notes?.trim() || null,
      })),
    });

    const leads = await prisma.coachingLead.findMany({ orderBy: { createdAt: "desc" }, take: created.count });
    return NextResponse.json({ success: true, leads }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Could not create the lead(s)." }, { status: 500 });
    }
    throw error;
  }
}
