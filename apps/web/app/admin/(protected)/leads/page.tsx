import { prisma } from "@vedicneev/db";

import { AdminLeadsManager } from "@/components/admin/AdminLeadsManager";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.coachingLead.findMany({ orderBy: { createdAt: "desc" }, take: 500 });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Coaching Institute Leads</h1>
        <p className="text-sm text-muted-foreground">
          Zero-ad-spend B2B outreach for omrtest.vedicneev.com — {leads.length} prospect
          {leads.length === 1 ? "" : "s"} in the pipeline.
        </p>
      </div>

      <AdminLeadsManager initialLeads={leads} />
    </div>
  );
}
