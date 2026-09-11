import { MediaEditForm } from "@/components/admin/MediaEditForm";
import { getSpeedHackOptions, getTopicOptions } from "@/lib/media/adminQueries";
import type { Multilingual } from "@/lib/exam/types";

export const dynamic = "force-dynamic";

export default async function NewMediaItemPage() {
  const [topics, speedHacks] = await Promise.all([getTopicOptions(), getSpeedHackOptions()]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-16">
      <h1 className="text-2xl font-bold text-foreground">New Media Item</h1>
      <MediaEditForm
        mode="create"
        topics={topics.map((t) => ({
          id: t.id,
          key: t.key,
          name: t.name as Multilingual,
          targetClass: t.targetClass,
          section: { name: t.section.name as Multilingual },
        }))}
        speedHacks={speedHacks.map((h) => ({ id: h.id, key: h.key, title: h.title as Multilingual }))}
      />
    </div>
  );
}
