import { prisma } from "@vedicneev/db";

import { AdminLeadsManager } from "@/components/admin/AdminLeadsManager";

export const dynamic = "force-dynamic";

/**
 * How many sheets each lead has actually graded in the OMR app, found by
 * matching the lead's phone to an institute admin's account. This is what
 * tells you a pilot has really tried it, so the feedback request lands at
 * the right moment.
 */
async function getGradedSheetsByLead(leads: { id: string; phoneNumber: string }[]): Promise<Record<string, number>> {
  const users = await prisma.user.findMany({
    where: { phone: { in: leads.map((l) => l.phoneNumber) } },
    select: { phone: true, instituteAdmin: { select: { instituteId: true } } },
  });

  const instituteByPhone = new Map(users.flatMap((u) => (u.instituteAdmin ? [[u.phone, u.instituteAdmin.instituteId] as const] : [])));
  const instituteIds = Array.from(new Set(instituteByPhone.values()));

  const counts = new Map(
    await Promise.all(
      instituteIds.map(
        async (instituteId) =>
          [instituteId, await prisma.omrUpload.count({ where: { status: "GRADED", testBatch: { instituteId } } })] as const
      )
    )
  );

  const byLead: Record<string, number> = {};
  for (const lead of leads) {
    const instituteId = instituteByPhone.get(lead.phoneNumber);
    if (instituteId) byLead[lead.id] = counts.get(instituteId) ?? 0;
  }
  return byLead;
}

export default async function AdminLeadsPage() {
  const leads = await prisma.coachingLead.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  const [gradedByLead, feedback] = await Promise.all([
    getGradedSheetsByLead(leads),
    prisma.pilotFeedback.findMany({ where: { leadId: { in: leads.map((l) => l.id) } }, select: { leadId: true, status: true } }),
  ]);

  const feedbackStatusByLead: Record<string, string> = {};
  for (const f of feedback) if (f.leadId) feedbackStatusByLead[f.leadId] = f.status;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Coaching Institute Leads</h1>
        <p className="text-sm text-muted-foreground">
          Zero-ad-spend B2B outreach for omrtest.vedicneev.com. {leads.length} prospect
          {leads.length === 1 ? "" : "s"} in the pipeline.
        </p>
      </div>

      <AdminLeadsManager initialLeads={leads} gradedByLead={gradedByLead} feedbackStatusByLead={feedbackStatusByLead} />
    </div>
  );
}
