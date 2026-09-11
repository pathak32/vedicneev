import Link from "next/link";
import { Badge, Button, Card, CardContent } from "@vedicneev/ui";
import { PenSquare } from "lucide-react";

import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";
import { getAllMediaForAdmin } from "@/lib/media/adminQueries";

export const dynamic = "force-dynamic";

const MEDIA_TYPE_LABEL: Record<string, string> = {
  SHORT_VIDEO: "Short Video",
  AUDIO_POD: "Audio Pod",
  CONCEPT_CLINIC: "Concept Clinic",
};

export default async function AdminMediaPage() {
  const items = await getAllMediaForAdmin();
  const bySection = new Map<string, typeof items>();
  for (const item of items) {
    const bucket = bySection.get(item.mediaType) ?? [];
    bucket.push(item);
    bySection.set(item.mediaType, bucket);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
          <p className="text-sm text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</p>
        </div>
        <Button asChild>
          <Link href="/admin/media/new">
            <PenSquare className="h-4 w-4" />
            New Media Item
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No media items yet — create the first one.</p>
      ) : (
        Array.from(bySection.entries()).map(([mediaType, groupItems]) => (
          <section key={mediaType} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {MEDIA_TYPE_LABEL[mediaType] ?? mediaType} ({groupItems.length})
            </h2>
            <div className="flex flex-col gap-2">
              {groupItems.map((item) => {
                const assetUrl = item.mediaType === "AUDIO_POD" ? item.audioUrl : item.videoUrl;
                return (
                  <Card key={item.id}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{localize(item.title as Multilingual, "en")}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          {!assetUrl ? <Badge variant="outline">Draft — no asset URL</Badge> : null}
                          {item.topic ? (
                            <span>
                              {localize(item.topic.section.name as Multilingual, "en")} — {localize(item.topic.name as Multilingual, "en")}
                            </span>
                          ) : null}
                          {item.vedicSpeedHack ? <span>· {localize(item.vedicSpeedHack.title as Multilingual, "en")}</span> : null}
                          {item.targetClass ? <Badge variant="secondary">{item.targetClass === "CLASS_6" ? "Class 6" : "Class 9"}</Badge> : null}
                          {item.targetExams.map((exam) => (
                            <Badge key={exam} variant="secondary">
                              {exam}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/media/${item.id}/edit`}>Edit</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
