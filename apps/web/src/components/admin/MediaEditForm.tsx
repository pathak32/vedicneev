"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@vedicneev/ui";
import { parseMediaEmbedUrl, type MediaType } from "@vedicneev/engine";

import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";

const MEDIA_TYPE_OPTIONS: { value: MediaType; label: string }[] = [
  { value: "SHORT_VIDEO", label: "Short Video" },
  { value: "AUDIO_POD", label: "Audio Pod" },
  { value: "CONCEPT_CLINIC", label: "Concept Clinic" },
];

const EXAM_OPTIONS = ["JNVST", "AISSEE", "RMS", "DPS", "OTHER"] as const;

export interface MediaTopicOption {
  id: string;
  key: string;
  name: Multilingual;
  targetClass: "CLASS_6" | "CLASS_9" | null;
  section: { name: Multilingual };
}

export interface MediaSpeedHackOption {
  id: string;
  key: string;
  title: Multilingual;
}

export interface MediaEditFormValues {
  mediaType: MediaType;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  durationSeconds: number;
  videoUrl: string;
  audioUrl: string;
  thumbnailUrl: string;
  transcriptEn: string;
  transcriptHi: string;
  topicId: string;
  vedicSpeedHackId: string;
  targetClass: "" | "CLASS_6" | "CLASS_9";
  targetExams: string[];
}

export interface MediaEditFormProps {
  mode: "create" | "edit";
  mediaId?: string;
  initialValues?: MediaEditFormValues;
  topics: MediaTopicOption[];
  speedHacks: MediaSpeedHackOption[];
}

const EMPTY_VALUES: MediaEditFormValues = {
  mediaType: "SHORT_VIDEO",
  titleEn: "",
  titleHi: "",
  descriptionEn: "",
  descriptionHi: "",
  durationSeconds: 60,
  videoUrl: "",
  audioUrl: "",
  thumbnailUrl: "",
  transcriptEn: "",
  transcriptHi: "",
  topicId: "",
  vedicSpeedHackId: "",
  targetClass: "",
  targetExams: [],
};

const inputClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
const textareaClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const labelClass = "text-sm font-medium text-foreground";

export function MediaEditForm({ mode, mediaId, initialValues, topics, speedHacks }: MediaEditFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<MediaEditFormValues>(initialValues ?? EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof MediaEditFormValues>(key: K, value: MediaEditFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleExam(exam: string) {
    setValues((v) => ({
      ...v,
      targetExams: v.targetExams.includes(exam) ? v.targetExams.filter((e) => e !== exam) : [...v.targetExams, exam],
    }));
  }

  const selectedTopic = topics.find((t) => t.id === values.topicId) ?? null;
  const embedPreview = useMemo(() => (values.videoUrl.trim() ? parseMediaEmbedUrl(values.videoUrl.trim()) : null), [values.videoUrl]);
  const showsVideo = values.mediaType === "SHORT_VIDEO" || values.mediaType === "CONCEPT_CLINIC";
  const showsAudio = values.mediaType === "AUDIO_POD";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const url = mode === "create" ? "/api/admin/media" : `/api/admin/media/${mediaId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaType: values.mediaType,
          titleEn: values.titleEn,
          titleHi: values.titleHi,
          descriptionEn: values.descriptionEn,
          descriptionHi: values.descriptionHi,
          durationSeconds: values.durationSeconds,
          videoUrl: showsVideo ? values.videoUrl : null,
          audioUrl: showsAudio ? values.audioUrl : null,
          thumbnailUrl: values.thumbnailUrl,
          transcriptEn: values.transcriptEn,
          transcriptHi: values.transcriptHi,
          topicId: values.topicId || null,
          vedicSpeedHackId: values.vedicSpeedHackId || null,
          targetExams: values.targetExams,
          targetClass: values.targetClass || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save the media item.");
        return;
      }
      router.push("/admin/media");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="media-type" className={labelClass}>
          Media Type
        </label>
        <select
          id="media-type"
          value={values.mediaType}
          onChange={(e) => update("mediaType", e.target.value as MediaType)}
          className={inputClass}
        >
          {MEDIA_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-title-en" className={labelClass}>
            Title (English)
          </label>
          <input id="media-title-en" value={values.titleEn} onChange={(e) => update("titleEn", e.target.value)} required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-title-hi" className={labelClass}>
            Title (Hindi) <span className="font-normal text-muted-foreground">— optional, falls back to English</span>
          </label>
          <input id="media-title-hi" value={values.titleHi} onChange={(e) => update("titleHi", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-desc-en" className={labelClass}>
            Description (English)
          </label>
          <textarea
            id="media-desc-en"
            value={values.descriptionEn}
            onChange={(e) => update("descriptionEn", e.target.value)}
            required
            rows={2}
            className={textareaClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-desc-hi" className={labelClass}>
            Description (Hindi) <span className="font-normal text-muted-foreground">— optional</span>
          </label>
          <textarea id="media-desc-hi" value={values.descriptionHi} onChange={(e) => update("descriptionHi", e.target.value)} rows={2} className={textareaClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:w-48">
        <label htmlFor="media-duration" className={labelClass}>
          Duration (seconds)
        </label>
        <input
          id="media-duration"
          type="number"
          min={1}
          value={values.durationSeconds}
          onChange={(e) => update("durationSeconds", Number(e.target.value))}
          required
          className={inputClass}
        />
      </div>

      {showsVideo ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-video-url" className={labelClass}>
            Video URL <span className="font-normal text-muted-foreground">— a YouTube or Vimeo link</span>
          </label>
          <input
            id="media-video-url"
            value={values.videoUrl}
            onChange={(e) => update("videoUrl", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
          />
          {values.videoUrl.trim() ? (
            embedPreview ? (
              <div className="aspect-video w-full max-w-md overflow-hidden rounded-md border border-border">
                <iframe
                  src={embedPreview.embedUrl}
                  title="Video preview"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-xs text-destructive">This doesn&apos;t look like a valid YouTube or Vimeo URL.</p>
            )
          ) : null}
        </div>
      ) : null}

      {showsAudio ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-audio-url" className={labelClass}>
            Audio URL <span className="font-normal text-muted-foreground">— a direct link to a hosted mp3/m4a file</span>
          </label>
          <input
            id="media-audio-url"
            value={values.audioUrl}
            onChange={(e) => update("audioUrl", e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
          {values.audioUrl.trim() ? <audio controls src={values.audioUrl.trim()} className="w-full max-w-md" /> : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="media-thumbnail-url" className={labelClass}>
          Thumbnail URL <span className="font-normal text-muted-foreground">— optional</span>
        </label>
        <input id="media-thumbnail-url" value={values.thumbnailUrl} onChange={(e) => update("thumbnailUrl", e.target.value)} className={inputClass} />
        {values.thumbnailUrl.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-pasted external URL, not a local asset next/image can optimize
          <img src={values.thumbnailUrl.trim()} alt="" className="h-24 w-40 rounded-md border border-border object-cover" />
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-transcript-en" className={labelClass}>
            Transcript (English) <span className="font-normal text-muted-foreground">— optional</span>
          </label>
          <textarea id="media-transcript-en" value={values.transcriptEn} onChange={(e) => update("transcriptEn", e.target.value)} rows={3} className={textareaClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-transcript-hi" className={labelClass}>
            Transcript (Hindi) <span className="font-normal text-muted-foreground">— optional</span>
          </label>
          <textarea id="media-transcript-hi" value={values.transcriptHi} onChange={(e) => update("transcriptHi", e.target.value)} rows={3} className={textareaClass} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-topic" className={labelClass}>
            Topic <span className="font-normal text-muted-foreground">— optional</span>
          </label>
          <select id="media-topic" value={values.topicId} onChange={(e) => update("topicId", e.target.value)} className={inputClass}>
            <option value="">None</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {localize(topic.section.name, "en")} — {localize(topic.name, "en")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-speed-hack" className={labelClass}>
            Vedic Speed Hack <span className="font-normal text-muted-foreground">— optional</span>
          </label>
          <select id="media-speed-hack" value={values.vedicSpeedHackId} onChange={(e) => update("vedicSpeedHackId", e.target.value)} className={inputClass}>
            <option value="">None</option>
            {speedHacks.map((hack) => (
              <option key={hack.id} value={hack.id}>
                {localize(hack.title, "en")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:w-64">
        <label htmlFor="media-class" className={labelClass}>
          Class Level
        </label>
        <select id="media-class" value={values.targetClass} onChange={(e) => update("targetClass", e.target.value as MediaEditFormValues["targetClass"])} className={inputClass}>
          <option value="">{selectedTopic ? "Inherit from topic" : "Both classes"}</option>
          <option value="CLASS_6">Class 6 only</option>
          <option value="CLASS_9">Class 9 only</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={labelClass}>Exam Boards</span>
        <div className="flex flex-wrap gap-3">
          {EXAM_OPTIONS.map((exam) => (
            <label key={exam} className="flex items-center gap-1.5 text-sm text-foreground">
              <input type="checkbox" checked={values.targetExams.includes(exam)} onChange={() => toggleExam(exam)} className="h-4 w-4" />
              {exam}
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">No boards checked means every exam board can see this item.</p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : mode === "create" ? "Create Media Item" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/media")}>
          Cancel
        </Button>
        {mode === "edit" ? (
          <Button
            type="button"
            variant="outline"
            className="ml-auto text-destructive hover:text-destructive"
            disabled={submitting}
            onClick={async () => {
              if (!window.confirm("Delete this media item? This can't be undone.")) return;
              setSubmitting(true);
              const res = await fetch(`/api/admin/media/${mediaId}`, { method: "DELETE" });
              if (res.ok) {
                router.push("/admin/media");
                router.refresh();
              } else {
                setError("Could not delete the media item.");
                setSubmitting(false);
              }
            }}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
