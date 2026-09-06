"use client";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vedicneev/ui";
import { Check, Landmark, ShieldCheck, Swords } from "lucide-react";

import type { TargetExam } from "@/lib/auth/types";

export interface ExamSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Highlights the currently-selected card, if any. */
  currentExam?: TargetExam | null;
  onSelect: (exam: TargetExam) => void;
}

type SwitchableExam = Extract<TargetExam, "JNVST" | "AISSEE" | "RMS">;

const EXAM_TRACKS: {
  value: SwitchableExam;
  title: string;
  tagline: string;
  description: string;
  icon: typeof Landmark;
}[] = [
  {
    value: "JNVST",
    title: "JNVST",
    tagline: "Jawahar Navodaya Vidyalaya",
    description: "50% weight on Mental Ability, plus Arithmetic and Language sections.",
    icon: Landmark,
  },
  {
    value: "AISSEE",
    title: "AISSEE",
    tagline: "Sainik School Entrance",
    description: "A Math & General Knowledge intensive track, with dedicated Defence awareness content.",
    icon: ShieldCheck,
  },
  {
    value: "RMS",
    title: "RMS",
    tagline: "Rashtriya Military School",
    description: "An even quad-split across Math, Language, GK, and Intelligence, plus Current Affairs.",
    icon: Swords,
  },
];

/**
 * Lets a student pick (or change) their target exam track. Reusable and
 * fully controlled — selecting a card doesn't close the dialog or touch any
 * store itself, that's left to the caller's onSelect (see ExamDropdown.tsx,
 * which wires this to useAuthStore's updateStudent).
 */
export function ExamSelectorModal({ open, onOpenChange, currentExam, onSelect }: ExamSelectorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose your target exam track</DialogTitle>
          <DialogDescription>
            This decides which practice topics and question banks you see — you can change it any time.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-3">
          {EXAM_TRACKS.map((track) => {
            const Icon = track.icon;
            const isActive = currentExam === track.value;
            return (
              <Card
                key={track.value}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(track.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(track.value);
                  }
                }}
                className={cn(
                  "cursor-pointer transition-colors hover:border-primary/60",
                  isActive ? "border-primary bg-primary/5" : ""
                )}
              >
                <CardHeader className="gap-2">
                  <div className="flex items-center justify-between">
                    <Icon className="h-6 w-6 text-primary" />
                    {isActive ? <Check className="h-5 w-5 text-primary" /> : null}
                  </div>
                  <CardTitle className="text-base">{track.title}</CardTitle>
                  <Badge variant="secondary" className="w-fit text-[10px]">
                    {track.tagline}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{track.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
