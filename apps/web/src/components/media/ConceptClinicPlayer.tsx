"use client";

import Link from "next/link";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vedicneev/ui";
import { localizeMediaText, parseMediaEmbedUrl } from "@vedicneev/engine";
import type { AccessResult, MediaItem } from "@vedicneev/engine";
import { GraduationCap, Lock, Sparkles } from "lucide-react";

import type { LanguageCode } from "@/lib/exam/types";

export interface ConceptClinicPlayerProps {
  item: MediaItem;
  language: LanguageCode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  access: AccessResult;
  onUnlockRequested: () => void;
}

/** Real playback via a YouTube/Vimeo iframe, mounted only while the dialog is open (closing it unmounts the iframe, which stops playback with no provider JS API needed). */
export function ConceptClinicPlayer({
  item,
  language,
  open,
  onOpenChange,
  access,
  onUnlockRequested,
}: ConceptClinicPlayerProps) {
  const embed = item.videoUrl ? parseMediaEmbedUrl(item.videoUrl) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            {localizeMediaText(item.title, language)}
          </DialogTitle>
          <DialogDescription>{localizeMediaText(item.description, language)}</DialogDescription>
        </DialogHeader>

        {!access.allowed ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-gradient-to-br from-primary/20 to-muted p-8 text-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Concept clinics are part of Vedic All-Access.</p>
            <Button type="button" onClick={onUnlockRequested}>
              Unlock with All-Access
            </Button>
          </div>
        ) : open && embed ? (
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <iframe
              src={embed.embedUrl}
              title={localizeMediaText(item.title, language)}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-gradient-to-br from-primary/20 to-muted p-8 text-center">
            <Sparkles className="h-8 w-8 text-primary" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">This clinic&apos;s video isn&apos;t available yet.</p>
          </div>
        )}

        {access.allowed ? (
          <Button asChild variant="outline">
            <Link href="/exam/demo-jnvst?mode=practice">Try Practice Question</Link>
          </Button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
