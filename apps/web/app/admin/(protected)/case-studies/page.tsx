import { prisma } from "@vedicneev/db";

import { AdminCaseStudiesManager } from "@/components/admin/AdminCaseStudiesManager";

export const dynamic = "force-dynamic";

export default async function AdminCaseStudiesPage() {
  const items = await prisma.pilotFeedback.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pilot Feedback &amp; Case Studies</h1>
        <p className="text-sm text-muted-foreground">
          Real answers from institutes that tried a batch. Only responses with consent can become a public case study, and only
          in their own words.
        </p>
      </div>

      <AdminCaseStudiesManager initialItems={items} />
    </div>
  );
}
