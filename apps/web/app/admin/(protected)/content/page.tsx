import { prisma } from "@vedicneev/db";

import { AdminContentLibraryManager } from "@/components/admin/AdminContentLibraryManager";

export const dynamic = "force-dynamic";

export default async function AdminContentLibraryPage() {
  const blocks = await prisma.contentBlock.findMany({ orderBy: { createdAt: "desc" }, take: 500 });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Content Library</h1>
        <p className="text-sm text-muted-foreground">
          Founder-voice social copy for Vedic Mind AI and VedicNeev — {blocks.length} block{blocks.length === 1 ? "" : "s"}.
        </p>
      </div>

      <AdminContentLibraryManager initialBlocks={blocks} />
    </div>
  );
}
