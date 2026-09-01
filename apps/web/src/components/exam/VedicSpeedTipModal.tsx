"use client";

import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@vedicneev/ui";
import { Lightbulb } from "lucide-react";

import type { LanguageCode, VedicSpeedHack } from "@/lib/exam/types";

export interface VedicSpeedTipModalProps {
  hack: VedicSpeedHack;
  language: LanguageCode;
}

/** Only rendered in Practice Mode for arithmetic questions linked to a Vedic speed shortcut. */
export function VedicSpeedTipModal({ hack, language }: VedicSpeedTipModalProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="lg" className="border-primary/40 text-primary">
          <Lightbulb className="h-4 w-4" />
          Speed Hack Tip
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-xl rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            {hack.title[language]}
          </SheetTitle>
          <SheetDescription className="text-base leading-relaxed text-foreground">
            {hack.description[language]}
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
