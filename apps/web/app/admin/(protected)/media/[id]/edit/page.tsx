import { notFound } from "next/navigation";

import { MediaEditForm } from "@/components/admin/MediaEditForm";
import type { Multilingual } from "@/lib/exam/types";
import { getMediaItemById, getSpeedHackOptions, getTopicOptions } from "@/lib/media/adminQueries";

export const dynamic = "force-dynamic";

export default async function EditMediaItemPage({ params }: { params: { id: string } }) {
  const [item, topics, speedHacks] = await Promise.all([getMediaItemById(params.id), getTopicOptions(), getSpeedHackOptions()]);
  if (!item) notFound();

  const title = item.title as Multilingual;
  const description = item.description as Multilingual;
  const transcript = item.transcript as Multilingual | null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-16">
      <h1 className="text-2xl font-bold text-foreground">Edit Media Item</h1>
      <MediaEditForm
        mode="edit"
        mediaId={item.id}
        initialValues={{
          mediaType: item.mediaType,
          titleEn: title.en ?? "",
          titleHi: title.hi ?? "",
          descriptionEn: description.en ?? "",
          descriptionHi: description.hi ?? "",
          durationSeconds: item.durationSeconds,
          videoUrl: item.videoUrl ?? "",
          audioUrl: item.audioUrl ?? "",
          thumbnailUrl: item.thumbnailUrl ?? "",
          transcriptEn: transcript?.en ?? "",
          transcriptHi: transcript?.hi ?? "",
          topicId: item.topicId ?? "",
          vedicSpeedHackId: item.vedicSpeedHackId ?? "",
          targetClass: item.targetClass ?? "",
          targetExams: item.targetExams,
        }}
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
